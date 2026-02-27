export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface Variation {
  id: number;
  price: number;
  regular_price?: number;
  sale_price?: number;
  image?: { src: string };
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
  stock_quantity?: number | null;
  stock_status?: string;
  manage_stock?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number; // 0-5
  image: string;
  sku?: string;
  category: string;
  type: string; // 'simple', 'variable', etc.
  attributes: ProductAttribute[];
  date_created: string;
  sale_price?: string;
  date_on_sale_to?: string; // ISO string for sale end date
  short_description?: string; // HTML content
  description?: string; // HTML content
  stock_quantity?: number | null;
  stock_status?: string; // 'instock', 'outofstock', 'onbackorder'
  manage_stock?: boolean;
}

export interface DealOfTheDayData {
  products: Product[];
  saleEndDate: string | null; // The earliest sale end date among products
}

export interface CartItem extends Product {
  quantity: number;
  variationId?: number;
  selectedAttributes?: Record<string, string>;
  maxQty?: number | null; // max purchasable qty from stock, null = unlimited
}

export interface Order {
  id: number;
  status: string;
  date_created: string; // ISO string
  total: string;
  currency: string;
  line_items: Array<{ name: string; quantity: number; total: string }>;
}

export type ViewState = 'home' | 'shop' | 'product' | 'cart' | 'wishlist' | 'register' | 'account' | 'page' | 'checkout' | 'track-order' | 'categories' | 'deal' | 'rent' | 'cookie-policy' | 'thank-you';

export interface Category {
  id: number;
  name: string;
  image: string;
  count?: number;
}

export interface NavItem {
  label: string;
  id: string;
  hasSubmenu?: boolean;
}