import { Product, Category, NavItem } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Men's Modern Brown Strap Watch",
    price: 1500.00,
    oldPrice: 1850.00,
    rating: 4,
    image: "https://picsum.photos/id/175/600/600",
    category: "Men",
    sku: "VC-001",
    type: 'simple',
    attributes: []
  },
  {
    id: 2,
    name: "Golden Pocket Watch",
    price: 1600.00,
    oldPrice: 1850.00,
    rating: 5,
    image: "https://picsum.photos/id/119/600/600",
    category: "Pocket",
    sku: "VC-002",
    type: 'simple',
    attributes: []
  },
  {
    id: 3,
    name: "Women Beautiful Silver Chain Watch",
    price: 2500.00,
    rating: 5,
    image: "https://picsum.photos/id/22/600/600",
    category: "Women",
    sku: "VC-003",
    type: 'simple',
    attributes: []
  },
  {
    id: 4,
    name: "Women Orange Strap Watch",
    price: 2050.00,
    oldPrice: 3000.00,
    rating: 3,
    image: "https://picsum.photos/id/36/600/600",
    category: "Women",
    sku: "VC-004",
    type: 'simple',
    attributes: []
  },
  {
    id: 5,
    name: "Kids New Silver Chain Watch",
    price: 500.00,
    oldPrice: 550.00,
    rating: 4,
    image: "https://picsum.photos/id/60/600/600",
    category: "Accessories",
    sku: "VC-005",
    type: 'simple',
    attributes: []
  },
  {
    id: 6,
    name: "Women Bold Silver Chain",
    price: 3000.00,
    rating: 5,
    image: "https://picsum.photos/id/96/600/600",
    category: "Women",
    sku: "VC-006",
    type: 'simple',
    attributes: []
  }
];

export const CATEGORIES: Category[] = [
  { id: 1, name: "Men", image: "https://picsum.photos/id/1005/400/300" },
  { id: 2, name: "Women", image: "https://picsum.photos/id/1011/400/300" },
  { id: 3, name: "Pocket", image: "https://picsum.photos/id/1059/400/300" },
  { id: 4, name: "Accessories", image: "https://picsum.photos/id/1062/400/300" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Men', id: 'men', hasSubmenu: true },
  { label: 'Women', id: 'women', hasSubmenu: true },
  { label: 'Pocket', id: 'pocket' },
  { label: 'Accessories', id: 'accessories' },
];