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
// TIP: define it in wp-config.php instead (define('VEENA_STRIPE_SECRET', 'sk_live_...');)
// and plugin updates will never overwrite it.
if (!defined('VEENA_STRIPE_SECRET')) define('VEENA_STRIPE_SECRET', 'sk_live_REPLACE_WITH_YOUR_ROLLED_SECRET_KEY');

// Stripe webhook signing secret (whsec_...). Create a webhook endpoint in the Stripe
// dashboard pointing to  https://<your-wp-domain>/wp-json/veena-stripe/v1/webhook
// listening for the events  checkout.session.completed, checkout.session.async_payment_succeeded
// and checkout.session.expired  (the last one cancels orders that were never paid).
// With it, the address/phone are saved and the order is marked paid even if the
// customer closes the tab before returning to the store.
if (!defined('VEENA_STRIPE_WEBHOOK_SECRET')) define('VEENA_STRIPE_WEBHOOK_SECRET', 'whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET');

// The origin where your static storefront (the dist build) is served.
// No trailing slash.  e.g. https://theveenacollections.com
if (!defined('VEENA_STOREFRONT_URL')) define('VEENA_STOREFRONT_URL', 'https://theveenacollections.com');

// Countries Stripe will let the customer ship to (ISO 3166-1 alpha-2).
// Used when WooCommerce is not restricted to a short list of shipping countries.
if (!defined('VEENA_STRIPE_SHIP_COUNTRIES')) define('VEENA_STRIPE_SHIP_COUNTRIES', ['IN', 'US', 'GB', 'CA', 'AU', 'AE', 'SG', 'MY', 'DE', 'FR']);

// Minutes stock is held for a customer while they pay on Stripe (must be at least 35).
if (!defined('VEENA_STRIPE_HOLD_MINUTES')) define('VEENA_STRIPE_HOLD_MINUTES', 35);

// Sales tax: charged ON TOP of the price (tax-exclusive), only when the delivery address is in
// this country + state. Every other state pays no sales tax. Rate is a percentage.
if (!defined('VEENA_TAX_COUNTRY')) define('VEENA_TAX_COUNTRY', 'US');
if (!defined('VEENA_TAX_STATE'))   define('VEENA_TAX_STATE', 'CA');
if (!defined('VEENA_TAX_RATE'))    define('VEENA_TAX_RATE', 7.75);

/* ========================================================================= */

// Loud warning in wp-admin while a placeholder key is still in place.
add_action('admin_notices', function () {
    if (!current_user_can('manage_options')) return;
    if (strpos(veena_stripe_secret(), 'REPLACE') !== false) {
        echo '<div class="notice notice-error"><p><strong>Veena Stripe Direct Checkout:</strong> no Stripe secret key found. Add your keys in WooCommerce → Settings → Payments → Stripe, or set VEENA_STRIPE_SECRET.</p></div>';
    } elseif (strpos(VEENA_STRIPE_WEBHOOK_SECRET, 'REPLACE') !== false) {
        echo '<div class="notice notice-warning"><p><strong>Veena Stripe Direct Checkout:</strong> webhook secret not set; addresses are only saved when the customer returns to the store.</p></div>';
    }
});

// wp_safe_redirect() only allows this WordPress domain and otherwise falls back to wp-admin.
// The storefront lives on another domain, so allow its host for our return/cancel redirects.
add_filter('allowed_redirect_hosts', function ($hosts) {
    $host = wp_parse_url(VEENA_STOREFRONT_URL, PHP_URL_HOST);
    if ($host) {
        $hosts[] = $host;
        $hosts[] = preg_replace('/^www\./', '', $host);
        $hosts[] = 'www.' . preg_replace('/^www\./', '', $host);
    }
    return $hosts;
});

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
    register_rest_route('veena-stripe/v1', '/cancel', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'veena_stripe_cancel',
    ]);
    register_rest_route('veena-stripe/v1', '/webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'veena_stripe_webhook',
    ]);
});

/**
 * Stripe secret key to use. Order of preference:
 *  1. VEENA_STRIPE_SECRET if you set a real key above / in wp-config.php
 *  2. The key already saved in the official "WooCommerce Stripe Gateway" plugin
 *     (so you don't have to copy it anywhere). Respects its test/live mode.
 */
function veena_stripe_secret() {
    if (strpos(VEENA_STRIPE_SECRET, 'REPLACE') === false) return VEENA_STRIPE_SECRET;

    if (class_exists('WC_Stripe_API') && method_exists('WC_Stripe_API', 'get_secret_key')) {
        $k = WC_Stripe_API::get_secret_key();
        if (!empty($k)) return $k;
    }
    $opt = get_option('woocommerce_stripe_settings', []);
    if (is_array($opt)) {
        $test = ($opt['testmode'] ?? 'no') === 'yes';
        $k = $test ? ($opt['test_secret_key'] ?? '') : ($opt['secret_key'] ?? '');
        if (!empty($k)) return $k;
    }
    return VEENA_STRIPE_SECRET;
}

/** Minimal Stripe REST helper (no SDK needed). */
function veena_stripe_api($path, $params = [], $method = 'POST') {
    $url  = 'https://api.stripe.com/v1/' . $path;
    $args = [
        'method'  => $method,
        'timeout' => 30,
        'headers' => [
            'Authorization' => 'Bearer ' . veena_stripe_secret(),
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

/**
 * Make sure every item is still available and hold the stock for this order while the
 * customer pays, so two shoppers can't both buy the last unit.
 * Returns an error message, or '' when the stock is OK/reserved.
 */
function veena_check_and_reserve_stock($order) {
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        if (!$product || !$product->managing_stock()) {
            if ($product && !$product->is_in_stock()) {
                return sprintf('Sorry, "%s" is out of stock.', $item->get_name());
            }
            continue;
        }
        $qty = (int) $item->get_quantity();
        if (!$product->is_in_stock()) {
            return sprintf('Sorry, "%s" is out of stock.', $item->get_name());
        }
        if (!$product->backorders_allowed() && $product->get_stock_quantity() < $qty) {
            return sprintf('Sorry, only %d of "%s" left in stock.', max(0, (int) $product->get_stock_quantity()), $item->get_name());
        }
    }

    // Reserve (also counts what other shoppers' unpaid orders are holding).
    $reserve = 'Automattic\WooCommerce\Checkout\Helpers\ReserveStock';
    if (class_exists($reserve)) {
        try {
            (new $reserve())->reserve_stock_for_order($order, VEENA_STRIPE_HOLD_MINUTES);
        } catch (\Exception $e) {
            return wp_strip_all_tags($e->getMessage()) ?: 'Sorry, an item in your cart was just bought by someone else.';
        }
    }
    return '';
}

/** Does sales tax apply to this delivery address? (CA, USA only.) */
function veena_tax_applies($country, $state) {
    return strtoupper(trim((string) $country)) === VEENA_TAX_COUNTRY
        && strtoupper(trim((string) $state)) === VEENA_TAX_STATE;
}

/** Order destination: shipping address, falling back to billing. */
function veena_order_destination($order) {
    $country = $order->get_shipping_country() ?: $order->get_billing_country();
    $state   = $order->get_shipping_state() ?: $order->get_billing_state();
    return [$country, $state];
}

/** Label shown on Stripe, in the order and in the account page. */
function veena_tax_label() {
    return sprintf('Sales Tax (%s %s%%)', VEENA_TAX_STATE, rtrim(rtrim(number_format((float) VEENA_TAX_RATE, 2, '.', ''), '0'), '.'));
}

/**
 * Stripe Tax Rate object (exclusive) for the configured rate. Created once, then cached per
 * Stripe account + rate, so test and live mode each get their own.
 */
function veena_stripe_tax_rate_id($force_new = false) {
    $opt = 'veena_stripe_txr_' . md5(veena_stripe_secret() . '|' . VEENA_TAX_RATE . '|' . VEENA_TAX_STATE);
    $id  = get_option($opt);
    if ($id && !$force_new) return $id;

    $rate = veena_stripe_api('tax_rates', [
        'display_name'  => 'Sales Tax',
        'description'   => veena_tax_label(),
        'percentage'    => (string) VEENA_TAX_RATE,
        'inclusive'     => 'false',
        'country'       => VEENA_TAX_COUNTRY,
        'state'         => VEENA_TAX_STATE,
        'jurisdiction'  => VEENA_TAX_STATE,
        'tax_type'      => 'sales_tax',
    ], 'POST');
    if (empty($rate['id'])) return '';
    update_option($opt, $rate['id'], false);
    return $rate['id'];
}

/**
 * Itemised, tax-EXCLUSIVE Stripe line items for the order (products, fees, shipping).
 * Only product lines carry the tax rate, so shipping is never taxed.
 */
function veena_stripe_line_items($order, $currency, $tax_rate_id) {
    $p = [];
    $i = 0;
    $add = function ($name, $cents, $qty, $taxed) use (&$p, &$i, $currency, $tax_rate_id) {
        if ($cents <= 0) return;
        $p["line_items[$i][quantity]"]                       = $qty;
        $p["line_items[$i][price_data][currency]"]           = $currency;
        $p["line_items[$i][price_data][unit_amount]"]        = $cents;
        $p["line_items[$i][price_data][product_data][name]"] = mb_substr($name, 0, 250);
        if ($taxed && $tax_rate_id) $p["line_items[$i][tax_rates][0]"] = $tax_rate_id;
        $i++;
    };

    foreach ($order->get_items() as $item) {
        $qty   = max(1, (int) $item->get_quantity());
        $cents = (int) round($item->get_total() * 100); // after coupons, before tax
        if ($cents % $qty === 0) {
            $add($item->get_name(), intdiv($cents, $qty), $qty, true);
        } else {
            // can't split evenly into cents: send as one line so the total stays exact
            $add($item->get_name() . ' × ' . $qty, $cents, 1, true);
        }
    }
    foreach ($order->get_fees() as $fee) {
        $add($fee->get_name(), (int) round($fee->get_total() * 100), 1, false);
    }
    $add('Shipping', (int) round($order->get_shipping_total() * 100), 1, false);
    return $p;
}

/**
 * Show the sales tax on the (still unpaid) order too, so wp-admin and the account page already
 * list Subtotal / Tax / Total. When the payment completes, Stripe's exact figure replaces it.
 */
function veena_apply_expected_tax($order, $apply) {
    foreach ($order->get_items('tax') as $item_id => $unused) {
        $order->remove_item($item_id);
    }
    $tax = 0.0;
    if ($apply) {
        foreach ($order->get_items() as $item) {
            $tax += round($item->get_total() * VEENA_TAX_RATE / 100, 2);
        }
        $tax = round($tax, 2);
    }
    $ex_tax_total = $order->get_total() - $order->get_total_tax();
    if ($tax > 0) {
        $line = new WC_Order_Item_Tax();
        $line->set_rate_code(strtoupper(VEENA_TAX_COUNTRY . '-' . VEENA_TAX_STATE . '-SALES-TAX'));
        $line->set_label(veena_tax_label());
        $line->set_rate_percent((float) VEENA_TAX_RATE);
        $line->set_compound(false);
        $line->set_tax_total($tax);
        $line->set_shipping_tax_total(0);
        $order->add_item($line);
    }
    $order->set_cart_tax($tax);
    $order->set_shipping_tax(0);
    $order->set_total(round($ex_tax_total + $tax, 2));
    $order->save();
}

/**
 * Close an order that was never paid: expire the Stripe page so it can't be paid later,
 * and mark the order Cancelled (WooCommerce then releases the held stock).
 * Never cancels an order that Stripe says is paid — that one is completed instead.
 */
function veena_cancel_unpaid_order($order, $reason) {
    if (!$order || $order->is_paid() || !$order->has_status(['pending', 'failed', 'on-hold'])) return false;

    $sid = $order->get_meta('_veena_stripe_session');
    if ($sid) {
        $s = veena_stripe_api('checkout/sessions/' . $sid, [], 'GET');
        if (!$s || empty($s['id'])) return false; // can't confirm with Stripe: leave it, the next check retries
        if (($s['payment_status'] ?? '') === 'paid') {
            veena_finalize_order($order, $s);
            return false;
        }
        if (($s['status'] ?? '') === 'open') {
            veena_stripe_api('checkout/sessions/' . $sid . '/expire', [], 'POST');
        }
    }
    $order->update_status('cancelled', $reason);
    return true;
}

/** Safety net: shortly after the Stripe page's lifetime ends, cancel the order if nobody paid. */
add_action('veena_stripe_expiry_check', function ($order_id) {
    veena_cancel_unpaid_order(wc_get_order($order_id), 'Stripe payment not completed in time; order cancelled automatically.');
});

/** GET: customer pressed Back / Cancel on the Stripe page. */
function veena_stripe_cancel(WP_REST_Request $req) {
    $order = wc_get_order(absint($req->get_param('order_id')));
    $key   = sanitize_text_field($req->get_param('order_key'));
    if ($order && hash_equals($order->get_order_key(), $key)) {
        veena_cancel_unpaid_order($order, 'Customer left the Stripe payment page without paying.');
    }
    wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=checkout&payment=cancelled');
    exit;
}

/**
 * Create a Stripe customer from the addresses typed in the store, so Stripe's page does not
 * have to ask for them again. Returns the customer id, or '' if Stripe refused.
 */
function veena_stripe_customer($order) {
    $c = [];
    $set = function ($key, $val) use (&$c) {
        $val = trim((string) $val);
        if ($val !== '') $c[$key] = $val;
    };
    $set('email', $order->get_billing_email());
    $set('name', trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()));
    $set('phone', $order->get_billing_phone());
    $set('address[line1]', $order->get_billing_address_1());
    $set('address[line2]', $order->get_billing_address_2());
    $set('address[city]', $order->get_billing_city());
    $set('address[state]', $order->get_billing_state());
    $set('address[postal_code]', $order->get_billing_postcode());
    $set('address[country]', $order->get_billing_country());

    // Delivery address (falls back to billing when the store form had no separate one).
    $ship_name = trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name());
    $set('shipping[name]', $ship_name ?: ($c['name'] ?? ''));
    $set('shipping[phone]', $order->get_shipping_phone() ?: $order->get_billing_phone());
    $set('shipping[address][line1]', $order->get_shipping_address_1() ?: $order->get_billing_address_1());
    $set('shipping[address][line2]', $order->get_shipping_address_2());
    $set('shipping[address][city]', $order->get_shipping_city() ?: $order->get_billing_city());
    $set('shipping[address][state]', $order->get_shipping_state() ?: $order->get_billing_state());
    $set('shipping[address][postal_code]', $order->get_shipping_postcode() ?: $order->get_billing_postcode());
    $set('shipping[address][country]', $order->get_shipping_country() ?: $order->get_billing_country());
    $c['metadata[order_id]'] = (string) $order->get_id();

    $res = veena_stripe_api('customers', $c, 'POST');
    return !empty($res['id']) ? $res['id'] : '';
}

/**
 * WooCommerce prints the shipping address in emails/invoices only when the order has a shipping
 * method line. Orders from the storefront have none, so the address was left out. Treat any
 * order that has a delivery address and went through Stripe checkout as needing one.
 */
add_filter('woocommerce_order_needs_shipping_address', function ($needs, $hide, $order) {
    if ($needs || !$order) return $needs;
    return $order->get_shipping_address_1() !== '' && $order->get_meta('_veena_stripe_session') !== '';
}, 10, 3);

/** wp-admin: show the delivery contact email (WooCommerce has no shipping-email field) under the shipping address. */
add_action('woocommerce_admin_order_data_after_shipping_address', function ($order) {
    $email = $order->get_meta('_shipping_email');
    if ($email) {
        echo '<p><strong>' . esc_html__('Shipping email', 'woocommerce') . ':</strong> <a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a></p>';
    }
});

/** Everything needed to ship: street, city, country (and phone for contact). Returns an error or ''. */
function veena_address_error($order) {
    $country = $order->get_shipping_country() ?: $order->get_billing_country();
    $street  = $order->get_shipping_address_1() ?: $order->get_billing_address_1();
    $city    = $order->get_shipping_city() ?: $order->get_billing_city();
    if ($street === '' || $city === '' || $country === '') {
        return 'Please enter your full delivery address.';
    }
    if (!in_array(strtoupper($country), veena_stripe_ship_countries(), true)) {
        return 'Sorry, we do not deliver to that country.';
    }
    if (trim($order->get_billing_phone()) === '') {
        return 'Please enter a phone number.';
    }
    return '';
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

    $addr_error = veena_address_error($order);
    if ($addr_error !== '') {
        $order->update_status('cancelled', 'Address check failed: ' . $addr_error);
        return new WP_REST_Response(['error' => $addr_error, 'code' => 'bad_address'], 400);
    }

    $stock_error = veena_check_and_reserve_stock($order);
    if ($stock_error !== '') {
        // Release anything held and close the unpaid order so it can't be paid later.
        $order->update_status('cancelled', 'Stock unavailable at payment: ' . $stock_error);
        return new WP_REST_Response(['error' => $stock_error, 'code' => 'out_of_stock'], 409);
    }

    $currency = strtolower($order->get_currency());
    // Sales tax applies only to California deliveries; everywhere else is tax-free.
    list($dest_country, $dest_state) = veena_order_destination($order);
    $tax_rate_id = veena_tax_applies($dest_country, $dest_state) ? veena_stripe_tax_rate_id() : '';
    $taxing = $tax_rate_id !== '';
    veena_apply_expected_tax($order, $taxing);

    $params = [
        'mode'                 => 'payment',
        // Ask for cards explicitly so we don't depend on the dashboard's payment-method defaults.
        'payment_method_types[0]' => 'card',
        'success_url'          => add_query_arg(
            ['order_id' => $order_id, 'session_id' => '{CHECKOUT_SESSION_ID}'],
            rest_url('veena-stripe/v1/return')
        ),
        // Back/Cancel on Stripe -> our endpoint cancels the unpaid order, then returns to the store.
        'cancel_url'           => add_query_arg(
            ['order_id' => $order_id, 'order_key' => $order_key],
            rest_url('veena-stripe/v1/cancel')
        ),
        // Checkout link expires just inside the stock hold, so a held unit is never paid for after release.
        'expires_at'           => time() + (VEENA_STRIPE_HOLD_MINUTES - 4) * 60,
        'client_reference_id'  => (string) $order_id,
        'metadata[order_id]'   => (string) $order_id,
    ];
    // The store form already collected the billing + delivery address and phone, so they go to
    // Stripe as a customer and the Stripe page only asks for the card.
    $customer_id = veena_stripe_customer($order);
    if ($customer_id !== '') {
        $params['customer'] = $customer_id;
    } else {
        // Stripe refused the customer: fall back to asking on Stripe's page.
        $params['billing_address_collection']       = 'required';
        $params['phone_number_collection[enabled]'] = 'true';
        foreach (veena_stripe_ship_countries() as $i => $cc) {
            $params["shipping_address_collection[allowed_countries][$i]"] = $cc;
        }
        $email = $order->get_billing_email();
        if (is_email($email)) $params['customer_email'] = $email;
    }
    $params += veena_stripe_line_items($order, $currency, $tax_rate_id);

    $session = veena_stripe_api('checkout/sessions', $params, 'POST');
    if ((!$session || empty($session['url'])) && $taxing) {
        // The cached tax rate may have been archived in the Stripe dashboard: make a fresh one and retry once.
        $fresh = veena_stripe_tax_rate_id(true);
        if ($fresh) {
            foreach ($params as $k => $v) {
                if (strpos($k, '[tax_rates][0]') !== false) $params[$k] = $fresh;
            }
            $session = veena_stripe_api('checkout/sessions', $params, 'POST');
        }
    }
    if (!$session || empty($session['url'])) {
        return new WP_REST_Response(['error' => 'Stripe session failed', 'detail' => $session], 502);
    }

    $order->update_meta_data('_veena_stripe_session', $session['id']);
    $order->save();

    // If the customer just closes the tab, cancel the order once the Stripe page has expired.
    wp_clear_scheduled_hook('veena_stripe_expiry_check', [$order_id]);
    wp_schedule_single_event(time() + VEENA_STRIPE_HOLD_MINUTES * 60 - 2 * 60, 'veena_stripe_expiry_check', [$order_id]);

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

    // The addresses the customer typed in the store are kept. Stripe's values only fill gaps
    // (for example if Stripe had to ask for the address itself).
    if (!$order->get_billing_first_name() && !empty($cd['name'])) {
        $parts = explode(' ', trim($cd['name']), 2);
        $order->set_billing_first_name($parts[0]);
        $order->set_billing_last_name($parts[1] ?? '');
    }
    if (!$order->get_billing_email() && !empty($cd['email'])) $order->set_billing_email($cd['email']);
    if (!$order->get_billing_phone() && !empty($cd['phone'])) $order->set_billing_phone($cd['phone']);

    if (!$order->get_billing_address_1() && !empty($addr['line1'])) {
        $order->set_billing_address_1($addr['line1']);
        $order->set_billing_address_2($addr['line2'] ?? '');
        $order->set_billing_city($addr['city'] ?? '');
        $order->set_billing_state($addr['state'] ?? '');
        $order->set_billing_postcode($addr['postal_code'] ?? '');
        $order->set_billing_country($addr['country'] ?? '');
    }

    $s_addr = $ship['address'] ?? [];
    if (!$order->get_shipping_address_1() && !empty($s_addr['line1'])) {
        $parts = explode(' ', trim($ship['name'] ?? ($cd['name'] ?? '')), 2);
        $order->set_shipping_first_name($parts[0] ?? '');
        $order->set_shipping_last_name($parts[1] ?? '');
        $order->set_shipping_address_1($s_addr['line1']);
        $order->set_shipping_address_2($s_addr['line2'] ?? '');
        $order->set_shipping_city($s_addr['city'] ?? '');
        $order->set_shipping_state($s_addr['state'] ?? '');
        $order->set_shipping_postcode($s_addr['postal_code'] ?? '');
        $order->set_shipping_country($s_addr['country'] ?? '');
    }
    if (!$order->get_shipping_phone() && $order->get_billing_phone()) {
        $order->set_shipping_phone($order->get_billing_phone());
    }

    veena_sync_customer_account($order);
}

/**
 * If the buyer has a store account (matched by email), link the order to it and save
 * the address/phone on their profile, so My Account > Orders / Addresses show them.
 * Same behaviour as WooCommerce's own checkout.
 */
function veena_sync_customer_account($order) {
    $email = $order->get_billing_email();
    if (!is_email($email) || !class_exists('WC_Customer')) return;
    $user = get_user_by('email', $email);
    if (!$user) return;

    if (!$order->get_customer_id()) $order->set_customer_id($user->ID);

    $c = new WC_Customer($user->ID);
    foreach (['first_name', 'last_name', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone'] as $f) {
        $setter = 'set_billing_' . $f;
        $getter = 'get_billing_' . $f;
        if (method_exists($c, $setter)) $c->$setter($order->$getter());
    }
    foreach (['first_name', 'last_name', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone'] as $f) {
        $setter = 'set_shipping_' . $f;
        $getter = 'get_shipping_' . $f;
        if (method_exists($c, $setter) && method_exists($order, $getter)) $c->$setter($order->$getter());
    }
    $c->save();
}

/**
 * Put the sales tax Stripe actually charged on the WooCommerce order as a proper tax line,
 * so the order screen, emails and reports show Subtotal / Shipping / Tax / Total.
 * Stripe's figures are the source of truth for what the customer paid.
 */
function veena_record_tax_on_order($order, $session) {
    if ($order->get_meta('_veena_tax_recorded')) return;

    $tax   = round(($session['total_details']['amount_tax'] ?? 0) / 100, 2);
    $total = round(($session['amount_total'] ?? 0) / 100, 2);

    // Drop any tax lines WooCommerce itself may have added, so tax is never counted twice.
    foreach ($order->get_items('tax') as $item_id => $unused) {
        $order->remove_item($item_id);
    }
    if ($tax > 0) {
        $line = new WC_Order_Item_Tax();
        $line->set_rate_code(strtoupper(VEENA_TAX_COUNTRY . '-' . VEENA_TAX_STATE . '-SALES-TAX'));
        $line->set_label(veena_tax_label());
        $line->set_rate_percent((float) VEENA_TAX_RATE);
        $line->set_compound(false);
        $line->set_tax_total($tax);
        $line->set_shipping_tax_total(0);
        $order->add_item($line);
    }
    $order->set_cart_tax($tax);
    $order->set_shipping_tax(0);
    if ($total > 0) $order->set_total($total);
    $order->update_meta_data('_veena_tax_recorded', '1');
}

/** Verify the payment, store address/phone, mark paid. Returns true if the session is paid. */
function veena_finalize_order($order, $session) {
    if (!$order || !$session || ($session['payment_status'] ?? '') !== 'paid') return false;
    if (!$order->is_paid()) {
        veena_apply_session_to_order($order, $session);
        veena_record_tax_on_order($order, $session);

        $order->payment_complete($session['payment_intent'] ?? '');
        $order->add_order_note('Paid via Stripe Checkout (session ' . ($session['id'] ?? '') . ').');
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            if ($product && $product->managing_stock() && $product->get_stock_quantity() < 0) {
                $order->add_order_note('WARNING: stock for "' . $item->get_name() . '" went negative (sold more than available). Check this order before shipping.');
            }
        }
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
        wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=thank-you&order_paid=' . $order_id . '&order_key=' . rawurlencode($order->get_order_key()));
        exit;
    }

    wp_safe_redirect(VEENA_STOREFRONT_URL . '/?view=checkout&payment=failed');
    exit;
}

/** POST webhook from Stripe -> same finalisation, independent of the customer's browser. */
function veena_stripe_webhook(WP_REST_Request $req) {
    if (strpos(VEENA_STRIPE_WEBHOOK_SECRET, 'REPLACE') !== false) {
        return new WP_REST_Response(['error' => 'Webhook secret not configured'], 503);
    }
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
    } elseif ($type === 'checkout.session.expired') {
        $session  = $event['data']['object'] ?? [];
        $order_id = absint($session['client_reference_id'] ?? 0);
        $order    = $order_id ? wc_get_order($order_id) : null;
        veena_cancel_unpaid_order($order, 'Stripe payment page expired without payment; order cancelled.');
    }
    return ['received' => true];
}
