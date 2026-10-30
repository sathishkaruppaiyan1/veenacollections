<?php
/**
 * Plugin Name: Veena Stripe Direct Checkout
 * Description: Sends WooCommerce checkout straight to Stripe-hosted Checkout (checkout.stripe.com), always collects billing address, shipping address and phone, and marks the order paid (return URL + webhook).
 * Version: 1.1.0
 * Author: The Veena Collections
 */

if (!defined('ABSPATH')) exit;

/* =========================================================================
 *  CONFIG  —  fill these in
 * ========================================================================= */

// Your Stripe SECRET key (roll the old one first in the Stripe dashboard).
// This stays server-side and is never sent to the browser.
define('VEENA_STRIPE_SECRET', 'sk_live_REPLACE_WITH_YOUR_ROLLED_SECRET_KEY');

// Stripe webhook signing secret (whsec_...). Create a webhook endpoint in the Stripe
// dashboard pointing to  https://<your-wp-domain>/wp-json/veena-stripe/v1/webhook
// listening for the event  checkout.session.completed  (and checkout.session.async_payment_succeeded).
// With it, the address/phone are saved and the order is marked paid even if the
// customer closes the tab before returning to the store.
define('VEENA_STRIPE_WEBHOOK_SECRET', 'whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET');

// The origin where your static storefront (the dist build) is served.
// No trailing slash.  e.g. https://theveenacollections.com
define('VEENA_STOREFRONT_URL', 'https://theveenacollections.com');

// Countries Stripe will let the customer ship to (ISO 3166-1 alpha-2).
// Used when WooCommerce is not restricted to a short list of shipping countries.
define('VEENA_STRIPE_SHIP_COUNTRIES', ['IN', 'US', 'GB', 'CA', 'AU', 'AE', 'SG', 'MY', 'DE', 'FR']);

/* ========================================================================= */

add_action('rest_api_init', function () {
    register_rest_route('veena-stripe/v1', '/session', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'veena_create_stripe_session',
    ]);
    register_rest_route('veena-stripe/v1', '/return', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'veena_stripe_return',
    ]);
    register_rest_route('veena-stripe/v1', '/webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'veena_stripe_webhook',
    ]);
});

/** Minimal Stripe REST helper (no SDK needed). */
function veena_stripe_api($path, $params = [], $method = 'POST') {
    $url  = 'https://api.stripe.com/v1/' . $path;
    $args = [
        'method'  => $method,
        'timeout' => 30,
        'headers' => [
            'Authorization' => 'Bearer ' . VEENA_STRIPE_SECRET,
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ],
    ];
    if ($method === 'POST') {
        $args['body'] = http_build_query($params);
    } elseif (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    $res = wp_remote_request($url, $args);
    if (is_wp_error($res)) return null;
    return json_decode(wp_remote_retrieve_body($res), true);
}

/** Country codes offered on Stripe's shipping-address step. */
function veena_stripe_ship_countries() {
    $codes = VEENA_STRIPE_SHIP_COUNTRIES;
    if (function_exists('WC') && WC()->countries) {
        $wc = array_keys(WC()->countries->get_shipping_countries());
        // Only trust WooCommerce when the store limits shipping to a short list;
        // "ship to all countries" includes codes Stripe rejects.
        if (!empty($wc) && count($wc) <= 50) $codes = $wc;
    }
    return array_values(array_unique(array_map('strtoupper', $codes)));
}

/** POST /wp-json/veena-stripe/v1/session?order_id=..&order_key=..  -> { url } */
function veena_create_stripe_session(WP_REST_Request $req) {
    $order_id  = absint($req->get_param('order_id'));
    $order_key = sanitize_text_field($req->get_param('order_key'));

    $order = wc_get_order($order_id);
    if (!$order || !hash_equals($order->get_order_key(), $order_key)) {
        return new WP_REST_Response(['error' => 'Invalid order'], 400);
    }
    if ($order->is_paid()) {
        return new WP_REST_Response(['error' => 'Order already paid'], 400);
    }
    if ($order->get_total() <= 0 || count($order->get_items()) === 0) {
        return new WP_REST_Response(['error' => 'Order is empty or has a zero total'], 400);
    }

    $currency = strtolower($order->get_currency());
    // One line item for the exact order total — avoids any itemisation/rounding mismatch.
    $params = [
        'mode'                 => 'payment',
        'success_url'          => add_query_arg(
            ['order_id' => $order_id, 'session_id' => '{CHECKOUT_SESSION_ID}'],
            rest_url('veena-stripe/v1/return')
        ),
        'cancel_url'           => VEENA_STOREFRONT_URL . '/?view=checkout&payment=cancelled',
        'client_reference_id'  => (string) $order_id,
        'metadata[order_id]'   => (string) $order_id,
        // Address + phone are mandatory on every payment: Stripe cannot be submitted without them.
        'billing_address_collection'       => 'required',
        'phone_number_collection[enabled]' => 'true',
        'line_items[0][quantity]'                          => 1,
        'line_items[0][price_data][currency]'              => $currency,
        'line_items[0][price_data][unit_amount]'           => (int) round($order->get_total() * 100),
        'line_items[0][price_data][product_data][name]'    => 'Order #' . $order->get_order_number(),
    ];

    // Shipping (delivery) address — always required.
    foreach (veena_stripe_ship_countries() as $i => $cc) {
        $params["shipping_address_collection[allowed_countries][$i]"] = $cc;
    }

    $email = $order->get_billing_email();
    if (is_email($email)) {
        $params['customer_email'] = $email;
    }

    $session = veena_stripe_api('checkout/sessions', $params, 'POST');
    if (!$session || empty($session['url'])) {
        return new WP_REST_Response(['error' => 'Stripe session failed', 'detail' => $session], 502);
    }

    $order->update_meta_data('_veena_stripe_session', $session['id']);
    $order->save();

    return ['url' => $session['url']];
}

/**
 * Copy the contact, billing address and shipping address Stripe collected onto the order.
 * Safe to call more than once (return URL and webhook both call it).
 */
function veena_apply_session_to_order($order, $session) {
    $cd   = $session['customer_details'] ?? [];
    $addr = $cd['address'] ?? [];
    // API versions before 2025-03 use shipping_details, newer use collected_information.shipping_details.
    $ship = $session['collected_information']['shipping_details'] ?? ($session['shipping_details'] ?? []);

    if (!empty($cd['name'])) {
        $parts = explode(' ', trim($cd['name']), 2);
        $order->set_billing_first_name($parts[0]);
        $order->set_billing_last_name($parts[1] ?? '');
    }
    if (!empty($cd['email'])) $order->set_billing_email($cd['email']);
    if (!empty($cd['phone'])) {
        $order->set_billing_phone($cd['phone']);
        $order->set_shipping_phone($cd['phone']);
    }
    if (!empty($addr)) {
        $order->set_billing_address_1($addr['line1'] ?? '');
        $order->set_billing_address_2($addr['line2'] ?? '');
        $order->set_billing_city($addr['city'] ?? '');
        $order->set_billing_state($addr['state'] ?? '');
        $order->set_billing_postcode($addr['postal_code'] ?? '');
        $order->set_billing_country($addr['country'] ?? '');
    }

    // Deliver to the shipping address the customer entered; fall back to billing.
    $s_addr = $ship['address'] ?? $addr;
    $s_name = $ship['name'] ?? ($cd['name'] ?? '');
    if (!empty($s_addr)) {
        $parts = explode(' ', trim($s_name), 2);
        $order->set_shipping_first_name($parts[0] ?? '');
        $order->set_shipping_last_name($parts[1] ?? '');
        $order->set_shipping_address_1($s_addr['line1'] ?? '');
        $order->set_shipping_address_2($s_addr['line2'] ?? '');
        $order->set_shipping_city($s_addr['city'] ?? '');
        $order->set_shipping_state($s_addr['state'] ?? '');
        $order->set_shipping_postcode($s_addr['postal_code'] ?? '');
        $order->set_shipping_country($s_addr['country'] ?? '');
    }
}

/** Verify the payment, store address/phone, mark paid. Returns true if the session is paid. */
function veena_finalize_order($order, $session) {
    if (!$order || !$session || ($session['payment_status'] ?? '') !== 'paid') return false;
    if (!$order->is_paid()) {
        veena_apply_session_to_order($order, $session);
        $order->payment_complete($session['payment_intent'] ?? '');
        $order->add_order_note('Paid via Stripe Checkout (session ' . ($session['id'] ?? '') . ').');
        $order->save();
    }
    return true;
}

/** GET return URL from Stripe -> verify payment, mark order paid, bounce to storefront. */
function veena_stripe_return(WP_REST_Request $req) {
    $order_id   = absint($req->get_param('order_id'));
    $session_id = sanitize_text_field($req->get_param('session_id'));
    $order      = wc_get_order($order_id);
    $session    = $session_id ? veena_stripe_api('checkout/sessions/' . $session_id, [], 'GET') : null;

    // Only trust a session that belongs to this order.
    if ($order && $session && ($session['client_reference_id'] ?? '') === (string) $order_id
        && veena_finalize_order($order, $session)) {
        wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=thank-you&order_paid=' . $order_id);
        exit;
    }

    wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=checkout&payment=failed');
    exit;
}

/** POST webhook from Stripe -> same finalisation, independent of the customer's browser. */
function veena_stripe_webhook(WP_REST_Request $req) {
    $payload = $req->get_body();
    $header  = $req->get_header('stripe-signature');

    // Verify signature: header = t=TIMESTAMP,v1=HMAC_SHA256(secret, "TIMESTAMP.payload")
    $t = '';
    $sigs = [];
    foreach (explode(',', (string) $header) as $part) {
        $kv = explode('=', trim($part), 2);
        if (count($kv) !== 2) continue;
        if ($kv[0] === 't') $t = $kv[1];
        if ($kv[0] === 'v1') $sigs[] = $kv[1];
    }
    $expected = hash_hmac('sha256', $t . '.' . $payload, VEENA_STRIPE_WEBHOOK_SECRET);
    $valid = false;
    foreach ($sigs as $s) {
        if (hash_equals($expected, $s)) { $valid = true; break; }
    }
    if (!$t || !$valid || abs(time() - (int) $t) > 600) {
        return new WP_REST_Response(['error' => 'Bad signature'], 400);
    }

    $event = json_decode($payload, true);
    $type  = $event['type'] ?? '';
    if (in_array($type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
        $session  = $event['data']['object'] ?? [];
        $order_id = absint($session['client_reference_id'] ?? 0);
        $order    = $order_id ? wc_get_order($order_id) : null;
        veena_finalize_order($order, $session);
    }
    return ['received' => true];
}
