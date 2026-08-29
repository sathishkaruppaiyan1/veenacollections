<?php
/**
 * Plugin Name: Veena Stripe Direct Checkout
 * Description: Sends WooCommerce checkout straight to Stripe-hosted Checkout (checkout.stripe.com) and marks the order paid when the customer returns.
 * Version: 1.0.0
 * Author: The Veena Collections
 */

if (!defined('ABSPATH')) exit;

/* =========================================================================
 *  CONFIG  —  fill these in
 * ========================================================================= */

// Your Stripe SECRET key (roll the old one first in the Stripe dashboard).
// This stays server-side and is never sent to the browser.
define('VEENA_STRIPE_SECRET', 'sk_live_REPLACE_WITH_YOUR_ROLLED_SECRET_KEY');

// The origin where your static storefront (the dist build) is served.
// No trailing slash.  e.g. https://theveenacollections.com
define('VEENA_STOREFRONT_URL', 'https://theveenacollections.com');

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
        // We skip the on-site billing form, so let Stripe collect contact + address.
        'billing_address_collection'       => 'required',
        'phone_number_collection[enabled]' => 'true',
        'line_items[0][quantity]'                          => 1,
        'line_items[0][price_data][currency]'              => $currency,
        'line_items[0][price_data][unit_amount]'           => (int) round($order->get_total() * 100),
        'line_items[0][price_data][product_data][name]'    => 'Order #' . $order->get_order_number(),
    ];

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

/** GET return URL from Stripe -> verify payment, mark order paid, bounce to storefront. */
function veena_stripe_return(WP_REST_Request $req) {
    $order_id   = absint($req->get_param('order_id'));
    $session_id = sanitize_text_field($req->get_param('session_id'));
    $order      = wc_get_order($order_id);
    $session    = $session_id ? veena_stripe_api('checkout/sessions/' . $session_id, [], 'GET') : null;

    if ($order && $session && ($session['payment_status'] ?? '') === 'paid') {
        if (!$order->is_paid()) {
            // Save the contact + address Stripe collected back onto the order.
            $cd   = $session['customer_details'] ?? [];
            $addr = $cd['address'] ?? [];
            if (!empty($cd)) {
                if (!empty($cd['name'])) {
                    $parts = explode(' ', trim($cd['name']), 2);
                    $order->set_billing_first_name($parts[0]);
                    $order->set_billing_last_name($parts[1] ?? '');
                }
                if (!empty($cd['email'])) $order->set_billing_email($cd['email']);
                if (!empty($cd['phone'])) $order->set_billing_phone($cd['phone']);
                if (!empty($addr)) {
                    $order->set_billing_address_1($addr['line1'] ?? '');
                    $order->set_billing_address_2($addr['line2'] ?? '');
                    $order->set_billing_city($addr['city'] ?? '');
                    $order->set_billing_state($addr['state'] ?? '');
                    $order->set_billing_postcode($addr['postal_code'] ?? '');
                    $order->set_billing_country($addr['country'] ?? '');
                    // Ship to the same address.
                    $order->set_shipping_first_name($order->get_billing_first_name());
                    $order->set_shipping_last_name($order->get_billing_last_name());
                    $order->set_shipping_address_1($addr['line1'] ?? '');
                    $order->set_shipping_address_2($addr['line2'] ?? '');
                    $order->set_shipping_city($addr['city'] ?? '');
                    $order->set_shipping_state($addr['state'] ?? '');
                    $order->set_shipping_postcode($addr['postal_code'] ?? '');
                    $order->set_shipping_country($addr['country'] ?? '');
                }
            }
            $order->payment_complete($session['payment_intent'] ?? '');
            $order->add_order_note('Paid via Stripe Checkout (session ' . $session_id . ').');
            $order->save();
        }
        wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=thank-you&order_paid=' . $order_id);
        exit;
    }

    wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=checkout&payment=failed');
    exit;
}
