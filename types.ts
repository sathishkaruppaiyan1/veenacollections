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
  slug?: string;
  permalink?: string;
  price: number;
  oldPrice?: number;
  rating: number; // 0-5
  image: string;
  images?: string[];
  sku?: string;
  category: string;
  categories?: string[]; // All category names the product belongs to (for subcategory filtering)
  categoryIds?: number[]; // All category IDs the product belongs to
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

export interface HomeHeroBanner {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  discount?: string;
  buttonText?: string;
  productId?: number;
  category?: string;
}

export interface HomeReel {
  id: number;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  title?: string;
  subtitle?: string;
  priceText?: string;
  buttonText?: string;
  productId?: number;
  productLink?: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
  variationId?: number;
  selectedAttributes?: Record<string, string>;
  maxQty?: number | null; // max purchasable qty from stock, null = unlimited
}

export interface OrderAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface OrderLineItem {
  id?: number;
  name: string;
  quantity: number;
  total: string;
  subtotal?: string;
  price?: number;
  sku?: string;
  product_id?: number;
  variation_id?: number;
  image?: string;
  meta?: Array<{ label: string; value: string }>; // variation attributes (Size, Colour...)
}

export interface Order {
  id: number;
  number?: string;
  status: string;
  date_created: string; // ISO string
  date_paid?: string | null;
  total: string;
  currency: string;
  currency_symbol?: string;
  subtotal?: string;
  shipping_total?: string;
  discount_total?: string;
  total_tax?: string;
  line_items: OrderLineItem[];
  billing?: OrderAddress;
  shipping?: OrderAddress;
  payment_method_title?: string;
  shipping_method?: string;
  customer_note?: string;
}

export type ViewState = 'home' | 'shop' | 'product' | 'cart' | 'wishlist' | 'register' | 'account' | 'page' | 'checkout' | 'track-order' | 'categories' | 'deal' | 'rent' | 'cookie-policy' | 'thank-you';

export interface Category {
  id: number;
  name: string;
  image: string;
  count?: number;
  menu_order?: number;
  parent?: number;
}

export interface NavItem {
  label: string;
  id: string;
  hasSubmenu?: boolean;
}
