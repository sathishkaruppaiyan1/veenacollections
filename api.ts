import { MOCK_PRODUCTS, CATEGORIES, NAV_ITEMS } from './constants';
import { Product, Category, NavItem, Variation, Order, DealOfTheDayData, HomeHeroBanner, HomeReel } from './types';

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
    let message = `API Error: ${response.status}`;
    let code = 'error';
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.code) code = errorJson.code;
      if (errorJson.message) {
        // Strip HTML tags from the message (e.g., links to login)
        message = errorJson.message.replace(/<[^>]*>/g, '');
      }
    } catch (e) {
      // Fallback if not JSON
      message = `${message} - ${errorText.substring(0, 150)}`;
    }
    const err = new Error(message) as any;
    err.code = code;
    throw err;
  }
  return response.json();
};

// Helper to construct Auth URL (Basic Auth over HTTPS is standard for WC)
const getAuthParams = () => {
  return `consumer_key=${WP_CONFIG.CONSUMER_KEY}&consumer_secret=${WP_CONFIG.CONSUMER_SECRET}`;
};

const mapProductImages = (item: any): string[] => {
  if (!Array.isArray(item.images) || item.images.length === 0) {
    return ['https://placehold.co/600x600?text=No+Image'];
  }

  const images = item.images
    .map((img: any) => img?.src)
    .filter((src: string | undefined): src is string => Boolean(src));

  return images.length > 0 ? images : ['https://placehold.co/600x600?text=No+Image'];
};

const stripManufacturerHtml = (html?: string): string => {
  if (!html) return '';

  return html
    .replace(/<p[^>]*>\s*(?:<strong[^>]*>\s*)?manufacturer\s*:?.*?<\/p>/gi, '')
    .replace(/<li[^>]*>\s*(?:<strong[^>]*>\s*)?manufacturer\s*:?.*?<\/li>/gi, '')
    .replace(/<tr[^>]*>\s*<t[dh][^>]*>\s*manufacturer\s*<\/t[dh]>\s*<t[dh][^>]*>.*?<\/t[dh]>\s*<\/tr>/gi, '')
    .trim();
};

const wcFetch = (url: string) => fetch(url, { cache: 'no-store' });

const decodeHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  }
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const extractStructuredJson = <T>(renderedContent: string, fallback: T): T => {
  try {
    const decoded = decodeHtml(renderedContent)
      .replace(/<a[^>]*href="([^"]+)"[^>]*>.*?<\/a>/gi, '$1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/<pre[^>]*><code[^>]*>/gi, '')
      .replace(/<\/code><\/pre>/gi, '')
      .replace(/("image"\s*:\s*)""\s*,?\s*(https?:\/\/[^\s",]+)\s*(?="title"|"subtitle"|"discount"|"buttonText"|"productId"|"category"|[}\],])/gi, '$1"$2",')
      .replace(/("image"\s*:\s*)"(https?:\/\/[^"]+)"\s*(?="title"|"subtitle"|"discount"|"buttonText"|"productId"|"category"|[}\],])/gi, '$1"$2",')
      .replace(/("image"\s*:\s*)(https?:\/\/[^\s",]+)\s*(?="title"|"subtitle"|"discount"|"buttonText"|"productId"|"category"|[}\],])/gi, '$1"$2",')
      .replace(/<[^>]*>/g, '')
      .trim();

    const jsonMatch = decoded.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!jsonMatch) return fallback;

    return JSON.parse(jsonMatch[1]) as T;
  } catch (error) {
    console.warn('Failed to parse structured homepage content:', error);
    return fallback;
  }
};

const getAcfImageUrl = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return '';
  return value.url || value.source_url || value.sizes?.large || value.sizes?.medium_large || '';
};

const resolveMediaUrl = async (value: any): Promise<string> => {
  const directUrl = getAcfImageUrl(value);
  if (directUrl) return directUrl;

  const mediaId = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value)
      ? Number(value)
      : null;

  if (!mediaId) return '';

  try {
    const response = await fetch(`${API_BASE}/wp/v2/media/${mediaId}`);
    if (!response.ok) return '';
    const media = await response.json();
    return media?.source_url || media?.guid?.rendered || '';
  } catch (error) {
    console.warn(`Failed to resolve media ID ${mediaId}:`, error);
    return '';
  }
};

const normalizeHeroBanner = async (item: any, index: number): Promise<HomeHeroBanner> => ({
  id: Number(item.id || index + 1),
  image: await resolveMediaUrl(item.image || item.banner_image || item.hero_image),
  title: item.title || item.banner_title || '',
  subtitle: item.subtitle || item.banner_subtitle || '',
  discount: item.discount || item.badge || item.offer_text || '',
  buttonText: item.buttonText || item.button_text || item.cta_text || 'Shop Now',
  productId: item.productId || item.product_id ? Number(item.productId || item.product_id) : undefined,
  category: item.category || item.category_name || undefined
});

const normalizeHomeReel = async (item: any, index: number): Promise<HomeReel> => ({
  id: Number(item.id || index + 1),
  mediaUrl: await resolveMediaUrl(item.video || item.video_url || item.mediaUrl || item.media_url || item.image),
  mediaType: item.mediaType || item.media_type || (item.video || item.video_url || item.mediaUrl || item.media_url ? 'video' : 'image'),
  title: item.title || '',
  subtitle: item.subtitle || item.caption || '',
  priceText: item.priceText || item.price_text || '',
  buttonText: item.buttonText || item.button_text || item.cta_text || 'Shop Now',
  productId: item.productId || item.product_id ? Number(item.productId || item.product_id) : undefined,
  productLink: item.productLink || item.product_link || '',
  category: item.category || item.category_name || undefined
});

let searchCache: any[] | null = null;
let isCaching = false;

// Map a raw WooCommerce order into our Order shape (with line item images + totals)
const mapOrder = (o: any): Order => ({
  id: o.id,
  number: o.number ? String(o.number) : String(o.id),
  status: o.status,
  date_created: o.date_created,
  date_paid: o.date_paid || null,
  total: o.total,
  currency: o.currency,
  currency_symbol: o.currency_symbol,
  subtotal: (o.line_items || []).reduce((acc: number, li: any) => acc + parseFloat(li.subtotal || li.total || '0'), 0).toFixed(2),
  shipping_total: o.shipping_total,
  discount_total: o.discount_total,
  total_tax: o.total_tax,
  line_items: (o.line_items || []).map((li: any) => ({
    id: li.id,
    name: li.name,
    quantity: li.quantity,
    total: li.total,
    subtotal: li.subtotal,
    price: typeof li.price === 'number' ? li.price : parseFloat(li.price || '0'),
    sku: li.sku,
    product_id: li.product_id,
    variation_id: li.variation_id,
    image: li.image?.src || undefined,
    meta: (li.meta_data || [])
      .filter((m: any) => m && m.key && !String(m.key).startsWith('_'))
      .map((m: any) => ({
        label: m.display_key || m.key,
        value: typeof m.display_value === 'string' ? m.display_value.replace(/<[^>]*>/g, '').trim() : String(m.value ?? '')
      }))
      .filter((m: any) => m.value)
  })),
  billing: o.billing || undefined,
  shipping: o.shipping || undefined,
  payment_method_title: o.payment_method_title || undefined,
  shipping_method: (o.shipping_lines || [])[0]?.method_title || undefined,
  customer_note: o.customer_note || undefined
});

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

      // Fetch all products - WooCommerce max per_page is 100, so we need pagination for more
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) { // Safety limit: max 10 pages = 1000 products
        const response = await wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&per_page=100&page=${page}&status=publish`);
        
        if (!response.ok) break;
        
        const data = await response.json();
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allProducts = [...allProducts, ...data];
          // Check if there are more pages (from response headers)
          const totalPages = response.headers.get('X-WP-TotalPages');
          if (totalPages && page >= parseInt(totalPages)) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      console.log(`Fetched ${allProducts.length} products from WooCommerce`);

      // Map WooCommerce Data to App Interface
      return allProducts.map((item: any) => {
        const images = mapProductImages(item);
        console.log('Product descriptions:', {
          name: item.name,
          short_description: item.short_description,
          description: item.description
        });
        
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          permalink: item.permalink,
          price: parseFloat(item.price || 0),
          oldPrice: item.regular_price && item.sale_price ? parseFloat(item.regular_price) : undefined,
          rating: Math.round(parseFloat(item.average_rating)) || 0,
          images,
          image: images[0],
          category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
          categories: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : [],
          categoryIds: Array.isArray(item.categories) ? item.categories.map((c: any) => c.id) : [],
          sku: item.sku,
          type: item.type,
          attributes: item.attributes || [],
          date_created: item.date_created,
          short_description: stripManufacturerHtml(item.short_description),
          description: stripManufacturerHtml(item.description),
          stock_quantity: item.stock_quantity ?? null,
          stock_status: item.stock_status || 'instock',
          manage_stock: item.manage_stock || false
        };
      });

    } catch (error) {
      console.error("Failed to fetch products from API, using fallback:", error);
      return MOCK_PRODUCTS;
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      if (!query) return [];

      // Initialize background cache for partial SKU searches
      if (searchCache === null && !isCaching && !WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        isCaching = true;
        Promise.all([
          wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&per_page=100&page=1`),
          wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&per_page=100&page=2`)
        ]).then(async ([res1, res2]) => {
          let cached = [];
          if (res1.ok) cached.push(...(await res1.json()));
          if (res2.ok) cached.push(...(await res2.json()));
          searchCache = cached;
          isCaching = false;
        }).catch(() => { isCaching = false; });
      }

      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return MOCK_PRODUCTS.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
        );
      }

      const [searchResponse, skuResponse] = await Promise.all([
        wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&search=${encodeURIComponent(query)}&per_page=5`),
        wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&sku=${encodeURIComponent(query)}&per_page=5`)
      ]);
      
      let allData: any[] = [];
      if (searchResponse.ok) {
        allData = [...allData, ...(await searchResponse.json())];
      }
      if (skuResponse.ok) {
        allData = [...allData, ...(await skuResponse.json())];
      }

      // Check local cache for partial SKU matches
      if (searchCache) {
          const lowerQuery = query.toLowerCase();
          const partialMatches = searchCache.filter(p => 
              (p.sku && String(p.sku).toLowerCase().includes(lowerQuery)) ||
              (p.name && String(p.name).toLowerCase().includes(lowerQuery))
          );
          allData = [...allData, ...partialMatches];
      }

      const uniqueData = Array.from(new Map(allData.map((item: any) => [item.id, item])).values());
      const data = uniqueData.slice(0, 5);

      return data.map((item: any) => {
        const images = mapProductImages(item);
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          permalink: item.permalink,
          price: parseFloat(item.price || 0),
          oldPrice: item.regular_price && item.sale_price ? parseFloat(item.regular_price) : undefined,
          rating: Math.round(parseFloat(item.average_rating)) || 0,
          images,
          image: images[0],
          category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
          categories: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : [],
          categoryIds: Array.isArray(item.categories) ? item.categories.map((c: any) => c.id) : [],
          sku: item.sku,
          type: item.type,
          attributes: item.attributes || [],
          short_description: stripManufacturerHtml(item.short_description),
          description: stripManufacturerHtml(item.description),
          stock_quantity: item.stock_quantity ?? null,
          stock_status: item.stock_status || 'instock',
          manage_stock: item.manage_stock || false
        };
      });
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
      const tagResponse = await wcFetch(`${API_BASE}/wc/v3/products/tags?${getAuthParams()}&slug=deal-of-the-day`);
      const tagData = await tagResponse.json();

      if (!tagData || tagData.length === 0) {
        console.warn("Tag 'deal-of-the-day' not found. Create it in WooCommerce > Products > Tags");
        return { products: [], saleEndDate: null };
      }

      const tagId = tagData[0].id;

      // Fetch products with the tag ID
      const response = await wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&tag=${tagId}&per_page=100`);
      const data = await handleResponse(response);

      const products = data.map((item: any) => {
        const images = mapProductImages(item);
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          permalink: item.permalink,
          price: parseFloat(item.price || 0),
          oldPrice: item.regular_price ? parseFloat(item.regular_price) : undefined,
          rating: Math.round(parseFloat(item.average_rating)) || 0,
          images,
          image: images[0],
          category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
          categories: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : [],
          categoryIds: Array.isArray(item.categories) ? item.categories.map((c: any) => c.id) : [],
          sku: item.sku,
          type: item.type,
          attributes: item.attributes || [],
          date_created: item.date_created,
          sale_price: item.sale_price,
          date_on_sale_to: item.date_on_sale_to,
          stock_quantity: item.stock_quantity ?? null,
          stock_status: item.stock_status || 'instock',
          manage_stock: item.manage_stock || false
        };
      });

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
  // 1c. Fetch Best Seller Products (tagged "best-sellers" in WooCommerce)
  //
  // HOW TO SET UP IN WORDPRESS ADMIN:
  // 1. Go to Products > Tags > Create a tag with slug "best-sellers"
  // 2. Edit any product and add this tag to include it as a Best Seller
  // -----------------------------------------------------------
  getBestSellerProducts: async (): Promise<Product[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return MOCK_PRODUCTS.slice(0, 4);
      }

      // First, get the tag ID for "best-sellers"
      const tagResponse = await wcFetch(`${API_BASE}/wc/v3/products/tags?${getAuthParams()}&slug=best-sellers`);
      const tagData = await tagResponse.json();

      if (!tagData || tagData.length === 0) {
        console.warn("Tag 'best-sellers' not found. Create it in WooCommerce > Products > Tags");
        return [];
      }

      const tagId = tagData[0].id;

      // Fetch products with the tag ID
      const response = await wcFetch(`${API_BASE}/wc/v3/products?${getAuthParams()}&tag=${tagId}&per_page=100&status=publish`);
      const data = await handleResponse(response);

      return data.map((item: any) => {
        const images = mapProductImages(item);
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          permalink: item.permalink,
          price: parseFloat(item.price || 0),
          oldPrice: item.regular_price ? parseFloat(item.regular_price) : undefined,
          rating: Math.round(parseFloat(item.average_rating)) || 0,
          images,
          image: images[0],
          category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
          categories: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : [],
          categoryIds: Array.isArray(item.categories) ? item.categories.map((c: any) => c.id) : [],
          sku: item.sku,
          type: item.type,
          attributes: item.attributes || [],
          date_created: item.date_created,
          sale_price: item.sale_price,
          date_on_sale_to: item.date_on_sale_to,
          short_description: stripManufacturerHtml(item.short_description),
          description: stripManufacturerHtml(item.description),
          stock_quantity: item.stock_quantity ?? null,
          stock_status: item.stock_status || 'instock',
          manage_stock: item.manage_stock || false
        };
      });

    } catch (error) {
      console.error("Failed to fetch best seller products:", error);
      return [];
    }
  },

  // -----------------------------------------------------------
  // 2. Fetch Categories from WooCommerce
  // -----------------------------------------------------------
  getCategories: async (): Promise<Category[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return CATEGORIES;

      // Fetch ALL categories (top-level + subcategories) so the app knows the
      // hierarchy. We filter to top-level for the home grid, and to children
      // of the current category for the filter sidebar on the shop page.
      const response = await wcFetch(`${API_BASE}/wc/v3/products/categories?${getAuthParams()}&hide_empty=false&per_page=100&orderby=id&order=asc`);
      const data = await handleResponse(response);

      console.log('Fetched categories:', data.length, data.map((c: any) => ({ name: c.name, id: c.id, parent: c.parent, menu_order: c.menu_order })));

      const mapped: Category[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        count: item.count || 0,
        menu_order: typeof item.menu_order === 'number' ? item.menu_order : 0,
        parent: typeof item.parent === 'number' ? item.parent : 0,
        // WooCommerce categories usually have an 'image' object if set
        image: item.image?.src || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=B8A99A&color=fff&size=400&bold=true`
      }));

      // Match WooCommerce admin ordering: menu_order ASC, then id ASC (creation order).
      // This respects the per-category "Display order" set in WC admin when present,
      // and preserves the order in which categories were added otherwise.
      const hasCustomOrder = mapped.some(c => (c.menu_order ?? 0) > 0);
      mapped.sort((a, b) => {
        if (hasCustomOrder) {
          const ao = a.menu_order ?? 0;
          const bo = b.menu_order ?? 0;
          if (ao !== bo) return ao - bo;
        }
        return a.id - b.id;
      });

      return mapped;

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
      const catResponse = await wcFetch(`${API_BASE}/wc/v3/products/categories?${getAuthParams()}&hide_empty=true&parent=0&per_page=8`);
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
  // 3b. Fetch Single Product (for real-time stock data)
  // -----------------------------------------------------------
  getProduct: async (productId: number): Promise<Product | null> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return null;
      const response = await wcFetch(`${API_BASE}/wc/v3/products/${productId}?${getAuthParams()}`);
      const item = await handleResponse(response);
      const images = mapProductImages(item);
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        permalink: item.permalink,
        price: parseFloat(item.price || 0),
        oldPrice: item.regular_price && item.sale_price ? parseFloat(item.regular_price) : undefined,
        rating: Math.round(parseFloat(item.average_rating)) || 0,
        images,
        image: images[0],
        category: item.categories && item.categories.length > 0 ? item.categories[0].name : 'Uncategorized',
        categories: Array.isArray(item.categories) ? item.categories.map((c: any) => c.name) : [],
        categoryIds: Array.isArray(item.categories) ? item.categories.map((c: any) => c.id) : [],
        sku: item.sku,
        type: item.type,
        attributes: item.attributes || [],
        date_created: item.date_created,
        short_description: stripManufacturerHtml(item.short_description),
        description: stripManufacturerHtml(item.description),
        stock_quantity: item.stock_quantity ?? null,
        stock_status: item.stock_status || 'instock',
        manage_stock: item.manage_stock || false
      };
    } catch (error) {
      console.error("Failed to fetch single product:", error);
      return null;
    }
  },

  // -----------------------------------------------------------
  // 4. Fetch Product Variations
  // -----------------------------------------------------------
  getProductVariations: async (productId: number): Promise<Variation[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return [];

      const response = await wcFetch(`${API_BASE}/wc/v3/products/${productId}/variations?${getAuthParams()}`);
      const data = await handleResponse(response);

      return data.map((v: any) => {
        console.log('Variation stock data:', { id: v.id, manage_stock: v.manage_stock, stock_quantity: v.stock_quantity, stock_status: v.stock_status, attributes: v.attributes });
        return {
          id: v.id,
          price: parseFloat(v.price),
          regular_price: v.regular_price ? parseFloat(v.regular_price) : undefined,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : undefined,
          image: v.image,
          attributes: v.attributes,
          stock_quantity: v.stock_quantity ?? null,
          stock_status: v.stock_status || 'instock',
          manage_stock: v.manage_stock || false
        };
      });
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

  getHomeHeroBanners: async (): Promise<HomeHeroBanner[]> => {
    const fallback: HomeHeroBanner[] = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1610189012906-4783fda31c5d?q=80&w=2574&auto=format&fit=crop',
        title: 'ELEGANT SAREES',
        subtitle: 'TRADITIONAL & MODERN',
        discount: 'Up to 30% Off',
        buttonText: 'Shop Now'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2670&auto=format&fit=crop',
        title: 'LUXURY ACCESSORIES',
        subtitle: 'GOLD & DIAMOND',
        discount: 'New Arrivals',
        buttonText: 'Shop Now'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2670&auto=format&fit=crop',
        title: 'WEDDING COLLECTION',
        subtitle: 'SPECIAL OCCASION',
        discount: 'Flat 20% Off',
        buttonText: 'Shop Now'
      }
    ];

    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return fallback;

      const response = await fetch(`${API_BASE}/wp/v2/pages?slug=home-hero-banners&_fields=id,slug,acf,content`);
      const data = await handleResponse(response);
      if (!data || data.length === 0) return fallback;

      const acf = data[0].acf;
      const acfItems = acf?.home_hero_banners || acf?.hero_banners || acf?.banners;
      if (Array.isArray(acfItems) && acfItems.length > 0) {
        const normalized = (await Promise.all(
          acfItems.map((item: any, index: number) => normalizeHeroBanner(item, index))
        ))
          .filter((item: HomeHeroBanner) => Boolean(item.image && item.title));
        if (normalized.length > 0) return normalized;
      }

      const parsed = extractStructuredJson<HomeHeroBanner[]>(data[0].content?.rendered || '', fallback);
      const normalizedParsed = Array.isArray(parsed)
        ? (await Promise.all(parsed.map((item, index) => normalizeHeroBanner(item, index)))).filter((item) => Boolean(item.image && item.title))
        : [];
      return normalizedParsed.length > 0 ? normalizedParsed : fallback;
    } catch (error) {
      console.warn('Failed to fetch home hero banners, using fallback:', error);
      return fallback;
    }
  },

  getHomeReels: async (): Promise<HomeReel[]> => {
    const fallback: HomeReel[] = [];

    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) return fallback;

      const response = await fetch(`${API_BASE}/wp/v2/pages?slug=home-reels&_fields=id,slug,acf,content`);
      const data = await handleResponse(response);
      if (!data || data.length === 0) return fallback;

      const acf = data[0].acf;
      const acfItems = acf?.home_reels || acf?.reels || acf?.shop_by_reels;
      if (Array.isArray(acfItems) && acfItems.length > 0) {
        const normalized = (await Promise.all(
          acfItems.map((item: any, index: number) => normalizeHomeReel(item, index))
        ))
          .filter((item: HomeReel) => Boolean(item.mediaUrl));
        if (normalized.length > 0) return normalized;
      }

      const parsed = extractStructuredJson<HomeReel[]>(data[0].content?.rendered || '', fallback);
      const normalizedParsed = Array.isArray(parsed)
        ? (await Promise.all(parsed.map((item, index) => normalizeHomeReel(item, index)))).filter((item) => Boolean(item.mediaUrl))
        : [];
      return normalizedParsed;
    } catch (error) {
      console.warn('Failed to fetch home reels, using fallback:', error);
      return fallback;
    }
  },

  // -----------------------------------------------------------
  // 7. Fetch Orders (My Account)
  // -----------------------------------------------------------
  getOrders: async (customerEmail?: string): Promise<Order[]> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) throw new Error("Mock");

      // Scope orders to the signed-in customer. Without an email we cannot tell
      // whose orders these are, so return nothing rather than leaking other buyers'
      // addresses and phone numbers into the order details popup.
      if (!customerEmail) return [];

      const email = customerEmail.toLowerCase();
      let query = `per_page=20&orderby=date&order=desc`;

      // Registered customers can be filtered server-side by customer id
      const customerRes = await fetch(`${API_BASE}/wc/v3/customers?${getAuthParams()}&email=${encodeURIComponent(customerEmail)}`);
      if (customerRes.ok) {
        const customers = await customerRes.json();
        if (Array.isArray(customers) && customers[0]?.id) {
          query += `&customer=${customers[0].id}`;
        } else {
          // Guest checkout: fall back to Woo's billing search
          query += `&search=${encodeURIComponent(customerEmail)}`;
        }
      } else {
        query += `&search=${encodeURIComponent(customerEmail)}`;
      }

      const response = await fetch(`${API_BASE}/wc/v3/orders?${getAuthParams()}&${query}`);
      const data = await handleResponse(response);

      // Final guard: only ever show orders billed to this email
      return data
        .map(mapOrder)
        .filter((o: Order) => (o.billing?.email || '').toLowerCase() === email);

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
  }): Promise<{ id: number; order_key: string; status: string; payment_url: string }> => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return { id: Date.now(), order_key: 'demo-' + Date.now(), status: 'pending', payment_url: '' };
      }

      // COD is paid on delivery (no gateway). Every other method is an online
      // gateway (Stripe), so the order stays "pending" and unpaid until the
      // customer completes payment on WooCommerce's order-pay page.
      const isCod = orderData.payment_method === 'cod';

      // Strip empty billing fields. WooCommerce rejects an empty-string email
      // as "Invalid parameter(s): billing", which blocks Express Checkout for
      // guests (Stripe collects the email/address on its hosted page instead).
      const cleanBilling = Object.fromEntries(
        Object.entries(orderData.billing).filter(([, v]) => v !== '' && v != null)
      );

      const response = await fetch(`${API_BASE}/wc/v3/orders?${getAuthParams()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          billing: cleanBilling,
          set_paid: false,
          status: isCod ? 'processing' : 'pending'
        }),
      });

      const data = await handleResponse(response);
      return {
        id: data.id,
        order_key: data.order_key,
        status: data.status,
        payment_url: data.payment_url || ''
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // -----------------------------------------------------------
  // 7e-b. Create a Stripe-hosted Checkout Session for an order
  // (handled server-side by the Veena Stripe Direct Checkout plugin)
  // -----------------------------------------------------------
  createStripeCheckoutSession: async (orderId: number, orderKey: string): Promise<string> => {
    const response = await fetch(
      `${API_BASE}/veena-stripe/v1/session?order_id=${orderId}&order_key=${encodeURIComponent(orderKey)}`,
      { method: 'POST' }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Failed to start Stripe checkout');
    }
    return data.url as string;
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

      const gateways = data
        .filter((gateway: any) => gateway.enabled)
        .map((gateway: any) => ({
          id: gateway.id,
          title: gateway.title,
          description: gateway.description || '',
          enabled: gateway.enabled
        }));

      console.log("Payment gateways fetched:", gateways);
      return gateways;
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

      return mapOrder(order);
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
  // 7j. Update Customer Address
  // -----------------------------------------------------------
  updateCustomerAddress: async (email: string, addressType: 'billing' | 'shipping', address: Record<string, string>) => {
    try {
      const customerResponse = await fetch(`${API_BASE}/wc/v3/customers?${getAuthParams()}&email=${encodeURIComponent(email)}`);
      const customers = await handleResponse(customerResponse);
      const customer = Array.isArray(customers) ? customers[0] : null;

      if (!customer?.id) {
        throw new Error('Customer account could not be found. Please register before saving an address.');
      }

      const response = await fetch(`${API_BASE}/wc/v3/customers/${customer.id}?${getAuthParams()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [addressType]: address })
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to update customer address:", error);
      throw error;
    }
  },
  
  // -----------------------------------------------------------
  // 7k. Register Customer
  // -----------------------------------------------------------
  registerCustomer: async (customerData: {
    email: string;
    first_name: string;
    last_name: string;
    billing: {
      first_name: string;
      last_name: string;
      address_1: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
      email: string;
    };
    password?: string;
  }) => {
    try {
      if (WP_CONFIG.SITE_URL.includes('your-wordpress-site.com')) {
        return { id: Date.now(), ...customerData };
      }

      // Create customer. If WooCommerce is configured to "Automatically generate account password",
      // it will do so and email the user because no password is included here.
      const dataToSend = {
        ...customerData,
        username: customerData.email.split('@')[0]
      };

      const response = await fetch(`${API_BASE}/wc/v3/customers?${getAuthParams()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to register customer:", error);
      throw error;
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
