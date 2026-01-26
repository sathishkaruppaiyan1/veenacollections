import { MOCK_PRODUCTS, CATEGORIES, NAV_ITEMS } from './constants';
import { Product, Category, NavItem, Variation, Order } from './types';

// ==========================================
// ⚙️ CONFIGURATION
// Replace these values with your actual WordPress details
// ==========================================
const WP_CONFIG = {
  // Your WordPress Site URL (no trailing slash)
  SITE_URL: 'https://khaki-sparrow-300023.hostingersite.com',

  // WooCommerce REST API Keys (WooCommerce > Settings > Advanced > REST API)
  // WARNING: In a production app, never expose secrets in frontend code. Use a proxy server.
  CONSUMER_KEY: 'ck_ed8e1befbb8cf9af9aa37bb25bc53460f9dad126',
  CONSUMER_SECRET: 'cs_6161ab63060be64538aafbd678ae2b87be83c796',
};

const API_BASE = `${WP_CONFIG.SITE_URL}/wp-json`;

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

// Helper to construct Auth URL (Basic Auth over HTTPS is standard for WC)
const getAuthParams = () => {
  return `consumer_key=${WP_CONFIG.CONSUMER_KEY}&consumer_secret=${WP_CONFIG.CONSUMER_SECRET}`;
};

export const api = {
  // -----------------------------------------------------------
  // 1. Fetch Products from WooCommerce
  // -----------------------------------------------------------
  getProducts: async (): Promise<Product[]> => {
    try {
      // Check if config is dummy data
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        console.warn("Using Mock Data: WP_CONFIG not set in api.ts");
        return MOCK_PRODUCTS;
      }

      const response = await fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&per_page=20`);
      const data = await handleResponse(response);

      // Map WooCommerce Data to App Interface
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price || 0),
        oldPrice: item.regular_price && item.sale_price ? parseFloat(item.regular_price) : undefined,
        rating: Math.round(parseFloat(item.average_rating)) || 0,
        // Use the first image or a placeholder
        image: item.images && item.images.length > 0 ? item.images[0].src : 'https://placehold.co/600x600?text=No+Image',
        category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
        sku: item.sku,
        type: item.type,
        attributes: item.attributes || [],
        date_created: item.date_created
      }));

    } catch (error) {
      console.error("Failed to fetch products from API, using fallback:", error);
      return MOCK_PRODUCTS;
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      if (!query) return [];
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      }

      const response = await fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&search=${encodeURIComponent(query)}&per_page=5`);
      const data = await handleResponse(response);

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price || 0),
        oldPrice: item.regular_price && item.sale_price ? parseFloat(item.regular_price) : undefined,
        rating: Math.round(parseFloat(item.average_rating)) || 0,
        image: item.images && item.images.length > 0 ? item.images[0].src : 'https://placehold.co/600x600?text=No+Image',
        category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
        sku: item.sku,
        type: item.type,
        attributes: item.attributes || []
      }));
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 2. Fetch Categories from WooCommerce
  // -----------------------------------------------------------
  getCategories: async (): Promise<Category[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return CATEGORIES;

      const response = await fetch(`${API_BASE}/wc/v3/products/categories?${getAuthParams()}&hide_empty=true&per_page=100`);
      const data = await handleResponse(response);

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        // WooCommerce categories usually have an 'image' object if set
        image: item.image ? item.image.src : 'https://placehold.co/400x300?text=Category'
      }));

    } catch (error) {
      console.error("Failed to fetch categories from API, using fallback:", error);
      return CATEGORIES;
    }
  },

  // -----------------------------------------------------------
  // 3. Fetch Menus 
  // Requirement: Install 'WP REST API Menus' plugin on WordPress
  // Fallback: If plugin is missing, fetch Product Categories instead
  // -----------------------------------------------------------
  getMenu: async (slug: string = 'primary-menu'): Promise<NavItem[]> => {
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return NAV_ITEMS;

    try {
      // Attempt 1: Try WP REST API Menus endpoint
      const response = await fetch(`${API_BASE}/menus/v1/menus/${slug}`);

      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          return data.items.map((item: any) => ({
            id: item.ID.toString(),
            label: item.title,
            hasSubmenu: item.child_items && item.child_items.length > 0
          }));
        }
      } else {
        console.warn(`Menu endpoint not found (Status ${response.status}). Attempting fallback to Categories.`);
      }
    } catch (error) {
      console.warn("Failed to fetch menu from plugin, attempting fallback...", error);
    }

    // Attempt 2: Fallback to WooCommerce Categories
    try {
      const catResponse = await fetch(`${API_BASE}/wc/v3/products/categories?${getAuthParams()}&hide_empty=true&parent=0&per_page=8`);
      if (catResponse.ok) {
        const data = await catResponse.json();
        return data.map((cat: any) => ({
          id: `cat-${cat.id}`,
          label: cat.name,
          hasSubmenu: false
        }));
      }
    } catch (error) {
      console.error("Failed to fetch categories for menu fallback:", error);
    }

    // Attempt 3: Static Fallback
    return NAV_ITEMS;
  },

  // -----------------------------------------------------------
  // 4. Fetch Product Variations
  // -----------------------------------------------------------
  getProductVariations: async (productId: number): Promise<Variation[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return [];

      const response = await fetch(`${API_BASE}/wc/v3/products/${productId}/variations?${getAuthParams()}`);
      const data = await handleResponse(response);

      return data.map((v: any) => ({
        id: v.id,
        price: parseFloat(v.price),
        regular_price: v.regular_price ? parseFloat(v.regular_price) : undefined,
        sale_price: v.sale_price ? parseFloat(v.sale_price) : undefined,
        image: v.image,
        attributes: v.attributes
      }));
    } catch (error) {
      console.error("Failed to fetch variations:", error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 5. Fetch Attributes & Terms
  // -----------------------------------------------------------
  getAttributes: async (): Promise<any[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return [];
      const response = await fetch(`${API_BASE}/wc/v3/products/attributes?${getAuthParams()}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      return [];
    }
  },

  getAttributeTerms: async (attributeId: number): Promise<any[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return [];
      const response = await fetch(`${API_BASE}/wc/v3/products/attributes/${attributeId}/terms?${getAuthParams()}&per_page=100`);
      return await handleResponse(response);
    } catch (error) {
      console.error(`Failed to fetch terms for attribute ${attributeId}:`, error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 5. Fetch Site Information (Name, Description)
  // -----------------------------------------------------------
  getSiteInfo: async (): Promise<{ name: string; description: string }> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return { name: 'VEENA COLLECTIONS', description: 'Traditional & Modern' };
      }

      const response = await fetch(API_BASE); // Public index usually returns site info
      const data = await response.json();
      return {
        name: data.name || 'VEENA COLLECTIONS',
        description: data.description || 'Traditional & Modern'
      };
    } catch (error) {
      console.error("Failed to fetch site info:", error);
      return { name: 'VEENA COLLECTIONS', description: 'Traditional & Modern' };
    }
  },

  // -----------------------------------------------------------
  // 6. Fetch Site Logo
  // -----------------------------------------------------------
  getSiteLogo: async (): Promise<string | null> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return null;

      const response = await fetch(`${API_BASE}/wp/v2/settings?${getAuthParams()}`);

      if (response.ok) {
        const settings = await response.json();
        const logoId = settings.site_logo;

        if (logoId) {
          const mediaResponse = await fetch(`${API_BASE}/wp/v2/media/${logoId}`);
          if (mediaResponse.ok) {
            const media = await mediaResponse.json();
            return media.source_url;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn("Could not fetch site logo (likely requires permissions):", error);
      return null;
    }
  },

  // -----------------------------------------------------------
  // 7. Fetch Orders (My Account)
  // -----------------------------------------------------------
  getOrders: async (): Promise<Order[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) throw new Error("Mock");

      // In a real app, you would filter by customer_id using current user context
      const response = await fetch(`${API_BASE}/wc/v3/orders?${getAuthParams()}&per_page=5`);
      const data = await handleResponse(response);

      return data.map((o: any) => ({
        id: o.id,
        status: o.status,
        date_created: o.date_created,
        total: o.total,
        currency: o.currency,
        line_items: o.line_items.map((li: any) => ({
          name: li.name,
          quantity: li.quantity,
          total: li.total
        }))
      }));

    } catch (error) {
      console.warn("Using Mock Orders (Auth failed or demo mode)");
      // Mock Data for "Clone" feel
      return [
        {
          id: 1024,
          status: 'completed',
          date_created: new Date().toISOString(),
          total: '450.00',
          currency: 'USD',
          line_items: [{ name: "Men's Modern Brown Strap Watch", quantity: 1, total: '450.00' }]
        },
        {
          id: 998,
          status: 'processing',
          date_created: new Date(Date.now() - 86400000 * 2).toISOString(),
          total: '2500.00',
          currency: 'USD',
          line_items: [{ name: "Women Beautiful Silver Chain Watch", quantity: 1, total: '2500.00' }]
        }
      ];
    }
  },

  // -----------------------------------------------------------
  // 7b. Submit Review (saves as WordPress comment on a "reviews" page, optional file to Media)
  // Create a WordPress page with slug "reviews" or "testimonials" to collect these.
  // -----------------------------------------------------------
  submitReview: async (args: {
    text: string;
    file?: File;
    authorName?: string;
    authorEmail: string;
  }): Promise<void> => {
    const { text, file, authorName, authorEmail } = args;
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
      throw new Error('WordPress is not configured. Set SITE_URL in api.ts.');
    }

    const escapeHtml = (s: string) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let attachmentHtml = '';
    if (file) {
      try {
        const mediaUrl = `${API_BASE}/wp/v2/media?${getAuthParams()}`;
        const res = await fetch(mediaUrl, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const url = data.source_url || data.guid?.rendered || '';
          const name = file.name || 'attachment';
          if (url) attachmentHtml = ` <p>Attachment: <a href="${escapeHtml(url)}">${escapeHtml(name)}</a></p>`;
        }
      } catch (e) {
        console.warn('Review attachment upload failed, submitting text only:', e);
      }
    }

    const content = `<p>${escapeHtml(text)}</p>${attachmentHtml}`;

    let postId: number | null = null;
    for (const slug of ['reviews', 'testimonials']) {
      const r = await fetch(`${API_BASE}/wp/v2/pages?slug=${slug}`);
      if (!r.ok) continue;
      const pages = await r.json();
      if (pages && pages[0] && pages[0].id) {
        postId = pages[0].id;
        break;
      }
    }
    if (!postId) {
      throw new Error("Please create a WordPress page with slug 'reviews' or 'testimonials' to collect reviews.");
    }

    const res = await fetch(`${API_BASE}/wp/v2/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post: postId,
        content,
        author_name: authorName || 'Guest',
        author_email: authorEmail || 'guest@veenacollections.local',
      }),
    });
    await handleResponse(res);
  },

  // -----------------------------------------------------------
  // 7c. Newsletter Subscribe
  // Suggests: MC4WP (Mailchimp for WordPress) or Newsletter by Stefano Lissa.
  // This app POSTs to MC4WP's REST endpoint. If that 404s, we still resolve so the
  // thank-you message shows; install a plugin to persist in WordPress.
  // -----------------------------------------------------------
  subscribeNewsletter: async (email: string): Promise<void> => {
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return;

    const url = `${API_BASE}/mc4wp/v1/subscribe`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    // 404 = MC4WP not installed; still show thank-you. 200/201 = success.
    if (res.ok || res.status === 404) return;
    const err = await res.text();
    throw new Error(err || `Subscribe failed (${res.status})`);
  },

  // -----------------------------------------------------------
  // 7d. Validate / Apply Coupon
  // Uses WooCommerce GET /wc/v3/coupons?search=CODE to find coupon, then computes
  // discount from amount + discount_type. Demo: SAVE10=10% off, FLAT5=$5 off.
  // -----------------------------------------------------------
  validateCoupon: async (
    code: string,
    subtotal: number
  ): Promise<{ valid: true; code: string; discountAmount: number } | { valid: false; message: string }> => {
    const codeClean = code.trim().toUpperCase();

    // Demo fallback when WordPress not configured
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
      if (codeClean === 'SAVE10') {
        const amt = Math.min(subtotal * 0.1, subtotal);
        return { valid: true, code: 'SAVE10', discountAmount: Math.round(amt * 100) / 100 };
      }
      if (codeClean === 'FLAT5') {
        const amt = Math.min(5, subtotal);
        return { valid: true, code: 'FLAT5', discountAmount: amt };
      }
      return { valid: false, message: 'Invalid or expired coupon.' };
    }

    try {
      const response = await fetch(
        `${API_BASE}/wc/v3/coupons?${getAuthParams()}&search=${encodeURIComponent(codeClean)}&per_page=20`
      );
      const data = await handleResponse(response);
      const coupon = Array.isArray(data)
        ? data.find((c: any) => String(c.code || '').toUpperCase() === codeClean)
        : null;

      if (!coupon) return { valid: false, message: 'Coupon not found.' };

      if (coupon.date_expires) {
        const exp = new Date(coupon.date_expires);
        if (exp.getTime() < Date.now()) return { valid: false, message: 'This coupon has expired.' };
      }
      const limit = coupon.usage_limit;
      if (limit !== null && limit !== '' && Number(limit) > 0) {
        const used = Number(coupon.usage_count) || 0;
        if (used >= Number(limit)) return { valid: false, message: 'This coupon has reached its usage limit.' };
      }

      const amount = parseFloat(coupon.amount) || 0;
      const dtype = String(coupon.discount_type || 'fixed_cart').toLowerCase();
      let discountAmount = 0;
      if (dtype === 'percent') {
        discountAmount = Math.min((subtotal * amount) / 100, subtotal);
      } else {
        // fixed_cart, fixed_product, etc.
        discountAmount = Math.min(amount, subtotal);
      }
      discountAmount = Math.round(discountAmount * 100) / 100;
      if (discountAmount <= 0) return { valid: false, message: 'This coupon does not apply to this order.' };

      return { valid: true, code: String(coupon.code), discountAmount };
    } catch (e) {
      console.warn('validateCoupon failed:', e);
      return { valid: false, message: 'Could not validate coupon. Please try again.' };
    }
  },

  // -----------------------------------------------------------
  // 8. Fetch Page Content (Privacy, Terms, etc.)
  // -----------------------------------------------------------
  getPage: async (slug: string): Promise<{ title: string; content: string } | null> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) throw new Error("Mock");

      const response = await fetch(`${API_BASE}/wp/v2/pages?slug=${slug}`);
      const data = await handleResponse(response);

      if (data && data.length > 0) {
        return {
          title: data[0].title.rendered,
          content: data[0].content.rendered
        };
      }
      return null;
    } catch (error) {
      // Graceful fallback for demo
      return {
        title: slug.replace('-', ' ').toUpperCase(),
        content: `<p>This is a placeholder for the <strong>${slug}</strong> page. In a real application, this content would be fetched from your WordPress pages.</p><p>Ensure you have a page with slug <em>"${slug}"</em> created in your WordPress Dashboard.</p>`
      };
    }
  }
};