import { MOCK_PRODUCTS, CATEGORIES, NAV_ITEMS } from './constants';
import { Product, Category, NavItem, Variation, Order, DealOfTheDayData } from './types';

// ==========================================
// ⚙️ CONFIGURATION
// Replace these values with your actual WordPress details
// ==========================================
const WP_CONFIG = {
  // Your WordPress Site URL (no trailing slash)
  SITE_URL: 'https://admin.theveenacollections.com',

  // WooCommerce REST API Keys (WooCommerce > Settings > Advanced > REST API)
  // WARNING: In a production app, never expose secrets in frontend code. Use a proxy server.
  CONSUMER_KEY: 'ck_9e2a74de176bb39930b1484a5c061af4b962d7cc',
  CONSUMER_SECRET: 'cs_ace993e01a48ed2e715318479d0b2dd4d040bd67',
};

// Use proxy in development (Vite proxies /wp-json to WooCommerce)
// In production, you would need a backend proxy or CORS enabled on WordPress
const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/wp-json' : `${WP_CONFIG.SITE_URL}/wp-json`;

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
  // 1b. Fetch Deal of the Day Products and Timer
  //
  // HOW TO SET UP IN WORDPRESS ADMIN:
  //
  // 1. PRODUCTS: Go to Products > Tags > Create a tag called "deal-of-the-day"
  //    Then edit any product and add this tag to include it in Deal of the Day
  //
  // 2. TIMER: Go to Pages > Add New > Create a page with slug "deal-timer"
  //    In the page content, enter the end date/time in this format:
  //    2025-02-15T23:59:59
  //    (Year-Month-DayTHour:Minute:Second)
  // -----------------------------------------------------------
  getDealProducts: async (): Promise<DealOfTheDayData> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        // Mock data fallback
        return {
          products: MOCK_PRODUCTS.slice(0, 3),
          saleEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        };
      }

      // First, get the tag ID for "deal-of-the-day"
      const tagResponse = await fetch(`${API_BASE}/wc/v3/products/tags?${getAuthParams()}&slug=deal-of-the-day`);
      const tagData = await tagResponse.json();

      if (!tagData || tagData.length === 0) {
        console.warn("Tag 'deal-of-the-day' not found. Create it in WooCommerce > Products > Tags");
        return { products: [], saleEndDate: null };
      }

      const tagId = tagData[0].id;

      // Fetch products with the tag ID
      const response = await fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&tag=${tagId}&per_page=20`);
      const data = await handleResponse(response);

      const products = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price || 0),
        oldPrice: item.regular_price ? parseFloat(item.regular_price) : undefined,
        rating: Math.round(parseFloat(item.average_rating)) || 0,
        image: item.images && item.images.length > 0 ? item.images[0].src : 'https://placehold.co/600x600?text=No+Image',
        category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
        sku: item.sku,
        type: item.type,
        attributes: item.attributes || [],
        date_created: item.date_created,
        sale_price: item.sale_price,
        date_on_sale_to: item.date_on_sale_to
      }));

      // Fetch timer end date from WordPress page "deal-timer"
      let saleEndDate: string | null = null;
      try {
        const timerResponse = await fetch(`${API_BASE}/wp/v2/pages?slug=deal-timer`);
        const timerData = await timerResponse.json();
        if (timerData && timerData.length > 0) {
          // Extract date from page content (strip HTML tags)
          const content = timerData[0].content?.rendered || '';
          const textContent = content.replace(/<[^>]*>/g, '').trim();
          // Try to parse as ISO date
          const parsedDate = new Date(textContent);
          if (!isNaN(parsedDate.getTime())) {
            saleEndDate = parsedDate.toISOString();
          }
        }
      } catch (e) {
        console.warn("Could not fetch deal timer page:", e);
      }

      // Fallback: if no timer page, use 2 days from now
      if (!saleEndDate) {
        saleEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      }

      return { products, saleEndDate };

    } catch (error) {
      console.error("Failed to fetch deal products:", error);
      return {
        products: MOCK_PRODUCTS.slice(0, 3),
        saleEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  },

  // -----------------------------------------------------------
  // 2. Fetch Categories from WooCommerce
  // -----------------------------------------------------------
  getCategories: async (): Promise<Category[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return CATEGORIES;

      // Fetch all categories including empty ones (hide_empty=false)
      const response = await fetch(`${API_BASE}/wc/v3/products/categories?${getAuthParams()}&hide_empty=false&per_page=100&parent=0`);
      const data = await handleResponse(response);

      console.log('Fetched categories:', data.length, data.map((c: any) => c.name));

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        count: item.count || 0,
        // WooCommerce categories usually have an 'image' object if set
        image: item.image?.src || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=B8A99A&color=fff&size=400&bold=true`
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
    // Known logo URL - always return this for reliability
    const KNOWN_LOGO = 'https://admin.theveenacollections.com/wp-content/uploads/2025/11/Blue-White-Modern-Minimalist-Name-Logo-2.png';
    
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return KNOWN_LOGO;

      const response = await fetch(`${API_BASE}/wp/v2/settings?${getAuthParams()}`);

      if (response.ok) {
        const settings = await response.json();
        const logoId = settings.site_logo;

        if (logoId) {
          const mediaResponse = await fetch(`${API_BASE}/wp/v2/media/${logoId}`);
          if (mediaResponse.ok) {
            const media = await mediaResponse.json();
            return media.source_url || KNOWN_LOGO;
          }
        }
      }
      return KNOWN_LOGO;
    } catch (error) {
      console.warn("Could not fetch site logo, using default:", error);
      return KNOWN_LOGO;
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
  // 7b. Get Approved Reviews (from WordPress comments on "reviews" page)
  //
  // HOW IT WORKS:
  // 1. Reviews are submitted as comments on a WordPress page with slug "reviews"
  // 2. Go to WordPress Admin > Comments to moderate (Approve/Pending/Spam)
  // 3. Only APPROVED comments will appear in the review slider
  // -----------------------------------------------------------
  getReviews: async (): Promise<Array<{
    id: number;
    name: string;
    email?: string;
    text: string;
    rating: number;
    date: string;
    image?: string;
  }>> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return [
          { id: 1, name: "Sarah Johnson", text: "Absolutely stunning saree! The craftsmanship is incredible.", rating: 5, date: new Date().toISOString() },
          { id: 2, name: "Michael Chen", text: "Great quality for the price. Would definitely recommend!", rating: 4, date: new Date().toISOString() },
        ];
      }

      // Fetch approved product reviews via WooCommerce REST API
      const response = await fetch(`${API_BASE}/wc/v3/products/reviews?${getAuthParams()}&per_page=20&status=approved&orderby=date_gmt&order=desc`);
      if (!response.ok) return [];

      const allReviews = await response.json();

      // Double-check: only show approved reviews (admin keys may bypass server-side filter)
      const reviews = allReviews.filter((r: any) => r.status === 'approved');

      // Collect unique product IDs to fetch their images
      const productIds = [...new Set(reviews.map((r: any) => r.product_id).filter(Boolean))] as number[];
      const productImages: Record<number, string> = {};

      if (productIds.length > 0) {
        try {
          const ids = productIds.slice(0, 20).join(',');
          const prodRes = await fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&include=${ids}&per_page=20`);
          if (prodRes.ok) {
            const products = await prodRes.json();
            for (const p of products) {
              const img = p.images?.[0]?.src;
              if (img) productImages[p.id] = img;
            }
          }
        } catch (_) { /* proceed without product images */ }
      }

      return reviews.map((review: any) => {
        const textContent = (review.review || '')
          .replace(/<[^>]*>/g, '')
          .trim();

        // Use product image, then reviewer avatar, then fallback
        const image = productImages[review.product_id]
          || review.reviewer_avatar_urls?.['96']
          || review.reviewer_avatar_urls?.['48']
          || undefined;

        return {
          id: review.id,
          name: review.reviewer || 'Anonymous',
          email: review.reviewer_email || undefined,
          text: textContent,
          rating: review.rating || 5,
          date: review.date_created,
          image
        };
      });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 7c. Submit Review (saves as WooCommerce product review on a random product)
  // Uses WooCommerce REST API which authenticates with consumer key/secret
  // Supports image upload to WordPress media library
  // -----------------------------------------------------------
  submitReview: async (args: {
    text: string;
    image?: string; // Base64 data URL
    authorName?: string;
    authorEmail: string;
    rating?: number;
  }): Promise<void> => {
    const { text, image, authorName, authorEmail, rating = 5 } = args;
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
      throw new Error('WordPress is not configured. Set SITE_URL in api.ts.');
    }

    let imageHtml = '';
    
    // Upload image to WordPress media library if provided
    if (image && image.startsWith('data:image/')) {
      try {
        // Convert base64 to blob
        const response = await fetch(image);
        const blob = await response.blob();
        
        // Create form data for media upload
        const formData = new FormData();
        formData.append('file', blob, 'review-image.jpg');
        
        // Upload to WordPress media
        const mediaRes = await fetch(`${API_BASE}/wp/v2/media?${getAuthParams()}`, {
          method: 'POST',
          body: formData,
        });
        
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          const imageUrl = mediaData.source_url || mediaData.guid?.rendered;
          if (imageUrl) {
            imageHtml = `<br><br><img src="${imageUrl}" alt="Review image" style="max-width: 400px; height: auto;" />`;
          }
        }
      } catch (err) {
        console.warn('Image upload failed, submitting review without image:', err);
      }
    }

    // Pick a random product to attach the review to
    const productsRes = await fetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&per_page=10&status=publish`);
    if (!productsRes.ok) {
      throw new Error('Could not fetch products. Please try again.');
    }
    const products = await productsRes.json();
    if (!products || products.length === 0) {
      throw new Error('No products found to attach review to.');
    }
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    // Submit review via WooCommerce REST API with hold status so admin can moderate
    const reviewContent = text + imageHtml;
    const res = await fetch(`${API_BASE}/wc/v3/products/reviews?${getAuthParams()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: randomProduct.id,
        review: reviewContent,
        reviewer: authorName || 'Guest',
        reviewer_email: authorEmail,
        rating: rating,
        status: 'hold',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.code === 'woocommerce_rest_comment_duplicate') {
        throw new Error('You have already submitted this review.');
      }
      throw new Error(errData.message || 'Could not submit review. Please try again.');
    }
  },

  // -----------------------------------------------------------
  // 7c. Newsletter Subscribe
  //
  // USING: "Newsletter" by Stefano Lissa (FREE)
  // Plugin is already installed, subscribers go to Newsletter > Subscribers
  // -----------------------------------------------------------
  subscribeNewsletter: async (email: string): Promise<void> => {
    if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return;

    const trimmedEmail = email.trim();

    // Newsletter plugin by Stefano Lissa - uses form submission
    const formData = new FormData();
    formData.append('ne', trimmedEmail);
    formData.append('nlang', '');

    try {
      // Use proxy in dev, direct URL in production
      const subscribeUrl = isDev ? '/newsletter-subscribe' : `${WP_CONFIG.SITE_URL}/?na=ajaxsub`;

      const response = await fetch(subscribeUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();

      // Newsletter plugin returns JSON with status
      try {
        const json = JSON.parse(result);
        if (json.status === 0 && json.message) {
          throw new Error(json.message);
        }
        // status 1 = success, 2 = confirmation email sent, etc.
        return;
      } catch (parseError) {
        // If not JSON but response OK, consider success
        if (response.ok) return;
        throw new Error('Subscription failed. Please try again.');
      }
    } catch (e) {
      console.warn("Newsletter subscription failed:", e);
      throw e;
    }
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
  // 7e. Create Order in WooCommerce
  // -----------------------------------------------------------
  createOrder: async (orderData: {
    billing: {
      first_name: string;
      last_name: string;
      company?: string;
      address_1: string;
      city: string;
      phone: string;
      email: string;
    };
    line_items: Array<{
      product_id: number;
      quantity: number;
      variation_id?: number;
    }>;
    payment_method: string;
    payment_method_title: string;
    coupon_lines?: Array<{ code: string }>;
  }): Promise<{ id: number; order_key: string; status: string }> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return { id: Date.now(), order_key: 'demo-' + Date.now(), status: 'pending' };
      }

      const response = await fetch(`${API_BASE}/wc/v3/orders?${getAuthParams()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          set_paid: orderData.payment_method === 'cod' ? false : false, // COD orders are not paid
          status: 'processing'
        }),
      });

      const data = await handleResponse(response);
      return {
        id: data.id,
        order_key: data.order_key,
        status: data.status
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // -----------------------------------------------------------
  // 7f. Fetch Payment Gateways
  // -----------------------------------------------------------
  getPaymentGateways: async (): Promise<Array<{ id: string; title: string; description: string; enabled: boolean }>> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return [
          { id: 'cod', title: 'Cash on Delivery', description: 'Pay with cash upon delivery.', enabled: true }
        ];
      }

      const response = await fetch(`${API_BASE}/wc/v3/payment_gateways?${getAuthParams()}`);
      const data = await handleResponse(response);

      return data
        .filter((gateway: any) => gateway.enabled)
        .map((gateway: any) => ({
          id: gateway.id,
          title: gateway.title,
          description: gateway.description || '',
          enabled: gateway.enabled
        }));
    } catch (error) {
      console.error("Failed to fetch payment gateways:", error);
      return [
        { id: 'cod', title: 'Cash on Delivery', description: 'Pay with cash upon delivery.', enabled: true }
      ];
    }
  },

  // -----------------------------------------------------------
  // 7g. Get Shipment Tracking (AST Pro Plugin)
  // Requires: Advanced Shipment Tracking Pro plugin
  // -----------------------------------------------------------
  getShipmentTracking: async (orderId: number): Promise<Array<{
    tracking_number: string;
    tracking_provider: string;
    tracking_link: string;
    date_shipped: string;
    status?: string;
  }>> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return [];
      }

      const response = await fetch(`${API_BASE}/wc-ast/v3/orders/${orderId}/shipment-trackings?${getAuthParams()}`);

      if (!response.ok) {
        // AST Pro not installed or no tracking for this order
        return [];
      }

      const data = await response.json();

      return Array.isArray(data) ? data.map((item: any) => ({
        tracking_number: item.tracking_number || '',
        tracking_provider: item.tracking_provider || item.custom_tracking_provider || 'Unknown',
        tracking_link: item.tracking_link || item.formatted_tracking_link || '',
        date_shipped: item.date_shipped || '',
        status: item.status_text || item.status || ''
      })) : [];
    } catch (error) {
      console.error("Failed to fetch shipment tracking:", error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 7h. Get Order by ID (for tracking page)
  // -----------------------------------------------------------
  getOrderById: async (orderId: number, billingEmail?: string): Promise<Order | null> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return null;
      }

      const response = await fetch(`${API_BASE}/wc/v3/orders/${orderId}?${getAuthParams()}`);

      if (!response.ok) {
        return null;
      }

      const order = await response.json();

      // Verify email if provided (for security)
      if (billingEmail && order.billing?.email?.toLowerCase() !== billingEmail.toLowerCase()) {
        return null;
      }

      return {
        id: order.id,
        status: order.status,
        date_created: order.date_created,
        total: order.total,
        currency: order.currency,
        line_items: order.line_items.map((li: any) => ({
          name: li.name,
          quantity: li.quantity,
          total: li.total
        }))
      };
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return null;
    }
  },

  // -----------------------------------------------------------
  // 7i. Get Customer by Email (for addresses)
  // -----------------------------------------------------------
  getCustomerByEmail: async (email: string): Promise<{
    billing: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
      email: string;
      phone: string;
    };
    shipping: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
  } | null> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return null;
      }

      const response = await fetch(`${API_BASE}/wc/v3/customers?${getAuthParams()}&email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const customer = data[0];
        return {
          billing: customer.billing || {},
          shipping: customer.shipping || {}
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return null;
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