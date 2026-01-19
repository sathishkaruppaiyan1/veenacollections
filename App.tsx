import React, { useState, useEffect } from 'react';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FilterBar } from './components/FilterBar';
import { QuickViewModal } from './components/QuickViewModal';
import { SocialShare } from './components/SocialShare';
import { CookieConsent } from './components/CookieConsent';
import { CookiePolicy } from './components/CookiePolicy';
import { api } from './api';
import { Product, ViewState, CartItem, Category, NavItem, Variation, Order } from './types';
import { ArrowRight, ArrowLeft, Plus, Minus, X, Check, Home, Grid, List, Star, ShoppingCart, Heart, Loader2, User, Package, MapPin, LogOut, CreditCard, Quote } from 'lucide-react';

const DEFAULT_LOGO = "https://khaki-sparrow-300023.hostingersite.com/wp-content/uploads/2025/11/Blue-White-Modern-Minimalist-Name-Logo-2.png";

interface DealProps {
  onNavigate: (view: any) => void;
  products: Product[];
  onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: (id: number) => boolean;
}

const DealOfTheDay = ({ onNavigate, products, onProductClick, onAddToCart, onToggleWishlist, isInWishlist }: DealProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set a target date 2 days from now for demo purposes
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#e31e24] py-12 md:py-16 text-white overflow-hidden relative mb-16">
      {/* Background Image updated to Saree/Texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-25"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-lg font-bold uppercase mb-2 tracking-widest text-white/80">Don't Miss Out</h3>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 uppercase">Deal of the Day</h2>
            <p className="mb-8 max-w-lg mx-auto lg:mx-0 text-lg text-white/90">Get up to 50% off on our exclusive traditional saree and jewelry collection. Limited time offer!</p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white text-[#e31e24] px-10 py-3.5 font-bold uppercase hover:bg-black hover:text-white transition shadow-lg text-sm tracking-widest"
            >
              Shop The Deal
            </button>
          </div>
          <div className="lg:w-1/2 flex justify-center gap-3 md:gap-6">
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-white/20">
              <span className="text-3xl md:text-4xl font-bold">{timeLeft.days}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Days</span>
            </div>
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-white/20">
              <span className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Hours</span>
            </div>
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-white/20">
              <span className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Mins</span>
            </div>
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-white/20">
              <span className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Secs</span>
            </div>
          </div>
        </div>

        {/* Products Grid Below Timer */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/20">
            {products.slice(0, 3).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={isInWishlist(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      text: "Absolutely stunning saree! The craftsmanship is incredible and it looks even better in person. Fast shipping too.",
      role: "Verified Buyer",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 4,
      text: "Great quality for the price. The fabric is very comfortable. Would definitely recommend Veena Collections.",
      role: "Regular Customer",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2670&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Emily Davis",
      rating: 5,
      text: "I bought the silver jewelry set for my sister and she loves it. The packaging was beautiful and premium.",
      role: "Verified Buyer",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2670&auto=format&fit=crop"
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="bg-[#f9f9f9] py-16 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Customer Reviews</h3>
          <div className="w-12 h-0.5 bg-[#e31e24] mx-auto mt-4"></div>
        </div>

        <div className="max-w-5xl mx-auto relative bg-white p-8 md:p-12 shadow-sm rounded-sm">
          <Quote size={48} className="text-[#e31e24]/10 absolute top-4 left-4" />
          <Quote size={48} className="text-[#e31e24]/10 absolute bottom-4 right-4 transform rotate-180" />

          <div className="relative min-h-[180px] flex flex-col md:flex-row items-center gap-8 transition-all duration-500">
            {/* Product Image */}
            <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={reviews[currentReview].image}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Review Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-4 text-[#e31e24]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < reviews[currentReview].rating ? "currentColor" : "none"} stroke="currentColor" className={i < reviews[currentReview].rating ? "" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-gray-600 text-lg italic mb-6 leading-relaxed">"{reviews[currentReview].text}"</p>
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-wide">{reviews[currentReview].name}</h4>
                <span className="text-xs text-gray-500">{reviews[currentReview].role}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentReview(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentReview ? 'bg-[#e31e24] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Navigation State
  const [accountTab, setAccountTab] = useState<'dashboard' | 'orders' | 'addresses' | 'details'>('dashboard');
  const [currentPageSlug, setCurrentPageSlug] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('');

  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(false);
  const [productAttributes, setProductAttributes] = useState<any[]>([]);
  const [selectedFilterAttributes, setSelectedFilterAttributes] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<string>('default');

  // Dynamic Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [siteInfo, setSiteInfo] = useState({ name: 'VEENA COLLECTIONS', description: 'Traditional & Modern' });
  const [siteLogo, setSiteLogo] = useState<string | null>(DEFAULT_LOGO);
  const [loading, setLoading] = useState<boolean>(true);

  // Variation States
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationLoading, setVariationLoading] = useState<boolean>(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [currentVariation, setCurrentVariation] = useState<Variation | null>(null);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedProducts, fetchedCategories, fetchedMenu, fetchedInfo, fetchedLogo, fetchedAttrs] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getMenu(),
          api.getSiteInfo(),
          api.getSiteLogo(),
          api.getAttributes()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setMenuItems(fetchedMenu);
        setSiteInfo(fetchedInfo);
        setSiteLogo(fetchedLogo || DEFAULT_LOGO);

        // Fetch terms for each attribute
        const attrsWithTerms = await Promise.all(fetchedAttrs.map(async (attr) => {
          const terms = await api.getAttributeTerms(attr.id);
          return { ...attr, terms };
        }));
        setProductAttributes(attrsWithTerms);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setView(state.view);
        if (state.view === 'account' && state.param) setAccountTab(state.param);
        if (state.view === 'page' && state.param) setCurrentPageSlug(state.param);
        if (state.view === 'shop') setCurrentCategory(state.param || '');
        if (state.view === 'product' && state.productId) {
          const prod = products.find(p => p.id === state.productId);
          if (prod) setActiveProduct(prod);
        }
      } else {
        // Default to home if no state
        setView('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]); // Re-bind when products change so we can find product by ID

  const handleNavigate = (newView: ViewState, param?: string) => {
    setView(newView);

    if (newView === 'account' && param) {
      setAccountTab(param as any);
    }

    if (newView === 'page' && param) {
      setCurrentPageSlug(param);
    }

    if (newView === 'shop') {
      setCurrentCategory(param || '');
    }

    // Push to history
    window.history.pushState({ view: newView, param }, '', `?view=${newView}${param ? `&param=${param}` : ''}`);
    window.scrollTo(0, 0);
  };

  const handleProductClick = async (id: number) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      setActiveProduct(prod);
      // setView('product'); called inside handleNavigate logic usually, but here we do it manually to include productId in state
      setView('product');
      window.history.pushState({ view: 'product', productId: id }, '', `?view=product&id=${id}`);
      window.scrollTo(0, 0);

      // Reset variation state
      setVariations([]);
      setSelectedAttributes({});
      setCurrentVariation(null);

      // If variable product, fetch variations
      if (prod.type === 'variable') {
        setVariationLoading(true);
        try {
          const vars = await api.getProductVariations(prod.id);
          setVariations(vars);
        } catch (e) {
          console.error("Error fetching variations", e);
        } finally {
          setVariationLoading(false);
        }
      }
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const addToCart = (product: Product) => {
    // Check if variable product and variation is selected
    if (product.type === 'variable' && !currentVariation) {
      showToast('Please select all options before adding to cart');
      return;
    }

    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: (currentVariation ? currentVariation.price : product.price),
      image: (currentVariation && currentVariation.image?.src) ? currentVariation.image.src : product.image,
      quantity: 1,
      variationId: currentVariation?.id,
      selectedAttributes: currentVariation ? selectedAttributes : undefined
    };

    setCart(prev => {
      const existing = prev.find(item => item.id === itemToAdd.id && item.variationId === itemToAdd.variationId);
      if (existing) {
        return prev.map(item => item.id === itemToAdd.id && item.variationId === itemToAdd.variationId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, itemToAdd];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (id: number, variationId?: number) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.variationId === variationId)));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast("Removed from Wishlist");
        return prev.filter(p => p.id !== product.id);
      }
      showToast("Added to Wishlist");
      return [...prev, product];
    });
  };

  const isInWishlist = (id: number) => wishlist.some(p => p.id === id);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  // Logic to find matching variation based on currently selected attributes
  useEffect(() => {
    if (activeProduct?.type === 'variable' && variations.length > 0) {
      // Check if all required attributes are selected
      const requiredAttributes = activeProduct.attributes.filter(a => a.variation);
      const allSelected = requiredAttributes.every(attr => selectedAttributes[attr.name]);

      if (allSelected) {
        // Find matching variation
        const match = variations.find(v => {
          return v.attributes.every(vAttr => {
            // Get selected value for this attribute name
            const selectedVal = selectedAttributes[vAttr.name];
            // vAttr.option is the value in the variation (e.g. "Blue")
            return selectedVal === vAttr.option;
          });
        });
        setCurrentVariation(match || null);
      } else {
        setCurrentVariation(null);
      }
    }
  }, [selectedAttributes, variations, activeProduct]);

  // Handle Sidebar Attribute Toggles
  const toggleAttributeFilter = (attrName: string, termSlug: string) => {
    setSelectedFilterAttributes(prev => {
      const current = prev[attrName] || [];
      const updated = current.includes(termSlug)
        ? current.filter(t => t !== termSlug)
        : [...current, termSlug];

      return { ...prev, [attrName]: updated };
    });
  };

  // --- Views ---

  const CheckoutView = () => {
    const handlePlaceOrder = (e: React.FormEvent) => {
      e.preventDefault();
      setToast({ message: "Order placed successfully! (Demo)", visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      setCart([]);
      handleNavigate('home');
    };

    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Billing Details</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First Name *</label>
                  <input type="text" required className="w-full border p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name *</label>
                  <input type="text" required className="w-full border p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                <input type="text" className="w-full border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Street Address *</label>
                <input type="text" required className="w-full border p-2 text-sm" placeholder="House number and street name" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Town / City *</label>
                <input type="text" required className="w-full border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                <input type="tel" required className="w-full border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address *</label>
                <input type="email" required className="w-full border p-2 text-sm" />
              </div>
            </form>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">Your Order</h3>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between font-bold text-xs uppercase text-gray-500 mb-2">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-gray-200 pt-4 mb-6">
                <span>Total</span>
                <span className="text-[#f10044]">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <button type="submit" form="checkout-form" className="w-full bg-[#f10044] text-white font-bold uppercase py-3 hover:bg-black transition">Place Order</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AccountView = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
      if (accountTab === 'orders') {
        setLoadingOrders(true);
        api.getOrders().then(setOrders).finally(() => setLoadingOrders(false));
      }
    }, [accountTab]);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4">
            <nav className="flex flex-col border border-gray-200 bg-white">
              <button
                onClick={() => setAccountTab('dashboard')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'dashboard' ? 'text-[#f10044] border-l-4 border-l-[#f10044]' : 'text-gray-600'}`}
              >
                <User size={16} className="mr-3" /> Dashboard
              </button>
              <button
                onClick={() => setAccountTab('orders')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'orders' ? 'text-[#f10044] border-l-4 border-l-[#f10044]' : 'text-gray-600'}`}
              >
                <Package size={16} className="mr-3" /> Orders
              </button>
              <button
                onClick={() => setAccountTab('addresses')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'addresses' ? 'text-[#f10044] border-l-4 border-l-[#f10044]' : 'text-gray-600'}`}
              >
                <MapPin size={16} className="mr-3" /> Addresses
              </button>
              <button className="flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 text-gray-600">
                <LogOut size={16} className="mr-3" /> Logout
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-gray-200 p-6 min-h-[400px]">
            {accountTab === 'dashboard' && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Hello, User</h2>
                <p className="text-gray-600 text-sm mb-4">
                  From your account dashboard you can view your <span className="text-[#f10044] cursor-pointer" onClick={() => setAccountTab('orders')}>recent orders</span>,
                  manage your <span className="text-[#f10044] cursor-pointer" onClick={() => setAccountTab('addresses')}>shipping and billing addresses</span>,
                  and <span className="text-[#f10044] cursor-pointer">edit your password and account details</span>.
                </p>
              </div>
            )}

            {accountTab === 'orders' && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h2>
                {loadingOrders ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#f10044]" /></div>
                ) : orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase">
                        <tr>
                          <th className="p-3">Order</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-3 font-bold text-[#f10044]">#{order.id}</td>
                            <td className="p-3 text-gray-600">{new Date(order.date_created).toLocaleDateString()}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></td>
                            <td className="p-3 font-bold text-gray-700">${order.total}</td>
                            <td className="p-3">
                              <button className="bg-[#f10044] text-white px-3 py-1 text-xs rounded hover:bg-black transition">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded text-sm">
                    No orders found. <span className="font-bold cursor-pointer underline" onClick={() => handleNavigate('shop')}>Go Shop!</span>
                  </div>
                )}
              </div>
            )}

            {accountTab === 'addresses' && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Addresses</h2>
                <p className="text-gray-600 text-sm mb-6">The following addresses will be used on the checkout page by default.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded bg-gray-50">
                    <h3 className="font-bold text-gray-700 mb-2 flex justify-between">Billing Address <span className="text-[#f10044] text-xs cursor-pointer">Edit</span></h3>
                    <p className="text-sm text-gray-500 italic">You have not set up this type of address yet.</p>
                  </div>
                  <div className="border p-4 rounded bg-gray-50">
                    <h3 className="font-bold text-gray-700 mb-2 flex justify-between">Shipping Address <span className="text-[#f10044] text-xs cursor-pointer">Edit</span></h3>
                    <p className="text-sm text-gray-500 italic">You have not set up this type of address yet.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PageView = () => {
    const [pageData, setPageData] = useState<{ title: string, content: string } | null>(null);
    const [loadingPage, setLoadingPage] = useState(false);

    useEffect(() => {
      if (currentPageSlug) {
        setLoadingPage(true);
        api.getPage(currentPageSlug).then(setPageData).finally(() => setLoadingPage(false));
      }
    }, [currentPageSlug]);

    if (!currentPageSlug) return null;

    return (
      <div className="container mx-auto px-4 py-12">
        {loadingPage ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#f10044]" size={40} /></div>
        ) : pageData ? (
          <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-100 shadow-sm">
            <h1 className="text-3xl font-bold uppercase font-heading text-gray-800 mb-8 pb-4 border-b border-[#f10044] inline-block">{pageData.title}</h1>
            <div className="prose prose-sm md:prose-base max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: pageData.content }} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-800">Page Not Found</h2>
            <p className="text-gray-500 mt-2">The page "{currentPageSlug}" could not be loaded.</p>
            <button onClick={() => handleNavigate('home')} className="mt-4 text-[#f10044] font-bold underline">Return Home</button>
          </div>
        )}
      </div>
    );
  };

  const TrackOrderView = () => {
    const [orderId, setOrderId] = useState('');
    const [billingEmail, setBillingEmail] = useState('');
    const [trackingResult, setTrackingResult] = useState<Order | null>(null);
    const [trackingError, setTrackingError] = useState('');
    const [isTracking, setIsTracking] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsTracking(true);
      setTrackingError('');
      setTrackingResult(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock finding an order from the API.orders mock data
        const orders = await api.getOrders();
        const found = orders.find(o => o.id.toString() === orderId);

        if (found) {
          setTrackingResult(found);
        } else {
          setTrackingError(`Could not find order #${orderId}. Please check the Order ID and try again.`);
        }
      } catch (err) {
        setTrackingError("An error occurred while tracking. Please try again.");
      } finally {
        setIsTracking(false);
      }
    };

    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">Track Order</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-6">
            To track your order please enter your Order ID in the box below and press the "Track" button.
            This was given to you on your receipt and in the confirmation email you should have received.
          </p>

          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#f10044]"
                placeholder="Found in your order confirmation email."
              />
              <p className="text-xs text-gray-400 mt-1">Try using ID <strong>1024</strong> or <strong>998</strong> for this demo.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Billing Email</label>
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#f10044]"
                placeholder="Email you used during checkout."
              />
            </div>
            <button
              type="submit"
              disabled={isTracking}
              className="bg-[#f10044] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm disabled:opacity-50 flex items-center"
            >
              {isTracking ? <><Loader2 className="animate-spin mr-2" size={16} /> Tracking...</> : 'Track'}
            </button>
          </form>

          {trackingError && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 text-sm rounded border border-red-100 flex items-center">
              <X size={16} className="mr-2" /> {trackingError}
            </div>
          )}

          {trackingResult && (
            <div className="mt-8 border-t border-gray-200 pt-8 animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Check size={20} className="text-green-600 mr-2" /> Order #{trackingResult.id} Found
              </h3>
              <div className="bg-gray-50 p-6 rounded text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold uppercase text-[#f10044]">{trackingResult.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold">{new Date(trackingResult.date_created).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold">${trackingResult.total}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <p className="font-bold text-gray-700 mb-2">Items:</p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {trackingResult.line_items.map((item, idx) => (
                      <li key={idx}>{item.quantity} x {item.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const HomeView = () => {
    const slides = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1610189012906-4783fda31c5d?q=80&w=2574&auto=format&fit=crop',
        title: 'ELEGANT SAREES',
        subtitle: 'TRADITIONAL & MODERN',
        discount: 'Up to 30% Off'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2670&auto=format&fit=crop',
        title: 'LUXURY ACCESSORIES',
        subtitle: 'GOLD & DIAMOND',
        discount: 'New Arrivals'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2670&auto=format&fit=crop',
        title: 'WEDDING COLLECTION',
        subtitle: 'SPECIAL OCCASION',
        discount: 'Flat 20% Off'
      }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }, []);

    // Helper to get Best Sellers (using reverse of products for demo variety)
    const bestSellers = [...products].reverse().slice(0, 4);

    return (
      <>
        {/* Hero Slider */}
        <div className="relative h-[500px] w-full bg-[#111] overflow-hidden mb-12">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>

              <div className="container mx-auto px-4 relative h-full flex flex-col justify-center items-start text-white">
                <div className="border border-white/30 p-2 inline-block mb-4 animate-fade-in-up">
                  <span className="uppercase text-sm tracking-widest px-2">{slide.subtitle}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold font-heading mb-2 animate-fade-in-up delay-100">{slide.title}</h2>
                <div className="bg-white/10 backdrop-blur-sm border-l-4 border-[#f10044] px-4 py-2 mb-8 animate-fade-in-up delay-200">
                  <span className="text-xl tracking-wide uppercase">{slide.discount}</span>
                </div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="bg-[#f10044] text-white hover:bg-[#d1003a] transition font-bold uppercase px-8 py-3 text-sm tracking-wider shadow-lg animate-fade-in-up delay-300"
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}

          {/* Slider Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx === currentSlide ? 'bg-[#f10044]' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </div>

        {/* Deal of the Day (Replaces Welcome Section) */}
        <DealOfTheDay
          onNavigate={handleNavigate}
          products={products}
          onProductClick={handleProductClick}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
        />

        {/* Categories Grid */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Categories</h3>
            <div className="w-12 h-0.5 bg-[#f10044] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="relative group overflow-hidden cursor-pointer aspect-square" onClick={() => handleNavigate('shop', cat.name)}>
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                {/* White Overlay Scale Animation */}
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none"></div>

                {/* Title Slide Up Animation - Visible on mobile, hover effect on desktop */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:-translate-y-[40%] lg:group-hover:opacity-100 lg:group-hover:-translate-y-1/2 transition-all duration-300 ease-out z-10 w-full flex justify-center pointer-events-none">
                  <div className="bg-[#f10044] text-white font-bold uppercase py-2 px-1 min-w-[200px] text-center shadow-lg hover:bg-[#d1003a] transition-colors pointer-events-auto">
                    {cat.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-[#f6f6f6] py-16 mb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Featured Products</h3>
              <div className="w-12 h-0.5 bg-[#f10044] mx-auto mt-4"></div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    onQuickView={handleQuickView}
                    isWishlisted={isInWishlist(product.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>



        {/* Customer Reviews */}
        <CustomerReviews />

      </>
    );
  };

  const ShopView = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-xs text-gray-500 mb-6">
        <Home size={12} className="mr-1" />
        <span className="mx-1">/</span>
        <span className="font-bold text-gray-700">Shop</span>
      </div>

      <div className="mb-8 bg-gray-100 py-12 px-6 text-center border-b-4 border-[#f10044]">
        <h1 className="text-4xl font-bold uppercase font-heading text-gray-800 tracking-wider">{currentCategory || "All Products"}</h1>
        <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Explore our exclusive collection</p>
      </div>

      {/* Horizontal Filter Bar */}
      <FilterBar
        categories={categories}
        onCategoryClick={(cat) => handleNavigate('shop', cat)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        showOutOfStock={showOutOfStock}
        setShowOutOfStock={setShowOutOfStock}
        attributes={productAttributes}
        selectedAttributes={selectedFilterAttributes}
        toggleAttribute={toggleAttributeFilter}
      />

      <div className="flex-1">

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 p-2 mb-6 flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">Sort by</span>
              <select
                className="border border-gray-300 p-1 text-gray-600 focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="date-desc">Newest Arrivals</option>
                <option value="rating-desc">Rating: High to Low</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">Display</span>
              <select className="border border-gray-300 p-1 text-gray-600 focus:outline-none">
                <option>6</option>
                <option>9</option>
                <option>12</option>
                <option>24</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-2 text-[#f10044] border border-gray-200"><Grid size={16} /></button>
            <button className="p-2 text-gray-400 border border-transparent hover:border-gray-200"><List size={16} /></button>
          </div>
        </div>

        {/* Product Grid - Full Width */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products
            .filter(p => {
              // 1. Category Filter
              if (currentCategory && p.category.toLowerCase() !== currentCategory.toLowerCase()) return false;

              // 2. Price Filter (Simple check against main price)
              if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

              // 3. Stock Filter
              // if (!showOutOfStock && p.stock_status === 'outofstock') return false; 

              // 4. Attribute Filter
              const hasSelectedAttributes = Object.entries(selectedFilterAttributes).every(([attrName, selectedTerms]) => {
                const terms = selectedTerms as string[];
                if (terms.length === 0) return true;

                // Check if product has this attribute with one of the selected terms
                const productAttr = p.attributes.find(pa => pa.name === attrName);
                if (!productAttr) return false;

                // Check if any of the product's options for this attribute match selected terms
                return productAttr.options.some(opt => terms.includes(opt.toLowerCase().replace(/\s+/g, '-')));
              });

              if (!hasSelectedAttributes) return false;

              return true;
            })
            .sort((a, b) => {
              switch (sortBy) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'date-desc': return new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime();
                case 'rating-desc': return b.rating - a.rating;
                default: return 0;
              }
            })
            .map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onQuickView={handleQuickView}
                isWishlisted={isInWishlist(product.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );

  const ProductView = () => {
    if (!activeProduct) return null;

    // Use variation image/price if available, else product default
    const displayImage = (currentVariation && currentVariation.image?.src) ? currentVariation.image.src : activeProduct.image;
    const displayPrice = currentVariation ? currentVariation.price : activeProduct.price;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-xs text-gray-500 mb-8">
          <Home size={12} className="mr-1" cursor="pointer" onClick={() => handleNavigate('home')} />
          <span className="mx-1">/</span>
          <span className="cursor-pointer hover:text-[#f10044]" onClick={() => handleNavigate('shop')}>{activeProduct.category}</span>
          <span className="mx-1">/</span>
          <span className="font-bold text-gray-700">{activeProduct.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 bg-white p-6 border border-gray-100 mb-12">
          {/* Image */}
          <div className="w-full md:w-1/2">
            <div className="border border-gray-200 p-4 relative">
              <img src={displayImage} alt={activeProduct.name} className="w-full h-auto object-contain transition-all duration-300" />
              <button className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-[#f10044] hover:text-white transition">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{activeProduct.name}</h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>

            <div className="flex space-x-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < activeProduct.rating ? "currentColor" : "none"} />
              ))}
            </div>

            <div className="border-t border-b border-gray-100 py-4 mb-6">
              <span className="text-gray-500 text-sm mr-2">Manufacturer:</span>
              <span className="text-[#f10044]">Rado</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-[#f10044]">${displayPrice.toFixed(2)}</span>
            </div>

            {/* Variation Selectors */}
            {activeProduct.type === 'variable' && activeProduct.attributes && (
              <div className="mb-6 space-y-4">
                {variationLoading && <div className="text-xs text-[#f10044]">Loading variations...</div>}

                {activeProduct.attributes.filter(attr => attr.variation).map(attr => (
                  <div key={attr.id} className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-1">{attr.name}:</label>
                    <select
                      className="border border-gray-300 p-2 text-sm w-full md:w-1/2 focus:border-[#f10044] outline-none"
                      onChange={(e) => setSelectedAttributes(prev => ({ ...prev, [attr.name]: e.target.value }))}
                      value={selectedAttributes[attr.name] || ""}
                    >
                      <option value="">Select {attr.name}</option>
                      {attr.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300">
                <input type="text" value="1" readOnly className="w-12 text-center py-2 text-sm text-gray-600 focus:outline-none" />
                <div className="flex flex-col border-l border-gray-300">
                  <button className="px-1 text-gray-500 hover:bg-gray-100 text-[8px]">▲</button>
                  <button className="px-1 text-gray-500 hover:bg-gray-100 text-[8px] border-t border-gray-300">▼</button>
                </div>
              </div>
              <button
                onClick={() => addToCart(activeProduct)}
                className={`text-white px-8 py-2.5 font-bold uppercase text-sm transition flex items-center ${(activeProduct.type === 'variable' && !currentVariation) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#f10044] hover:bg-black'
                  }`}
              >
                <ShoppingCart size={16} className="mr-2" /> Add to cart
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => toggleWishlist(activeProduct)}
                className={`px-4 py-2 text-xs flex items-center transition ${isInWishlist(activeProduct.id) ? 'bg-[#f10044] text-white' : 'bg-[#35404f] text-white hover:bg-gray-700'}`}
              >
                <Heart size={12} className="mr-1" fill={isInWishlist(activeProduct.id) ? "currentColor" : "none"} />
                {isInWishlist(activeProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="bg-[#35404f] text-white px-4 py-2 text-xs flex items-center hover:bg-gray-700 transition">
                <Check size={12} className="mr-1" /> Add to Compare
              </button>
            </div>

            {/* Social Sharing */}
            <SocialShare
              productUrl={window.location.href}
              productName={activeProduct.name}
            />

            <div className="mt-8 border-t border-gray-100 pt-6">
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WishlistView = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Your Wishlist is empty!</p>
          <button onClick={() => handleNavigate('shop')} className="text-[#f10044] font-bold underline">Go to Shop</button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm min-w-[600px] hidden md:table">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-bold uppercase text-gray-600">
                  <th className="p-4">Image</th>
                  <th className="p-4">Product(s)</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wishlist.map(item => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start">
                        <span className="text-[#f10044] text-sm font-bold cursor-pointer hover:underline" onClick={() => handleProductClick(item.id)}>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-green-600 font-bold">In Stock</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { addToCart(item); toggleWishlist(item); }}
                          className="bg-[#f10044] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="bg-gray-200 text-gray-600 p-2 hover:bg-gray-300 transition"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const CartView = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded">
          <p className="text-gray-500 mb-4">Your Shopping Cart is empty!</p>
          <button onClick={() => handleNavigate('shop')} className="text-[#f10044] font-bold underline">Go to Shop</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs font-bold uppercase text-gray-600">
                    <th className="p-4">Image</th>
                    <th className="p-4">Product(s)</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Qty.</th>
                    <th className="p-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map((item, idx) => (
                    <tr key={`${item.id}-${item.variationId || 'simple'}-${idx}`}>
                      <td className="p-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start">
                          <span className="text-[#f10044] text-sm font-bold">{item.name}</span>
                          {item.selectedAttributes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.selectedAttributes).map(([key, val]) => (
                                <span key={key} className="mr-2">{key}: {val}</span>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => removeFromCart(item.id, item.variationId)}
                            className="text-gray-400 hover:text-[#f10044] text-xs flex items-center mt-1"
                          >
                            <X size={12} className="mr-1" /> Remove
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <input type="text" value={item.quantity} readOnly className="w-10 border text-center text-sm" />
                      </td>
                      <td className="p-4 text-sm font-bold text-[#f10044]">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.variationId || 'simple'}-${idx}`} className="bg-white border border-gray-200 p-4 shadow-sm flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[#f10044] text-sm font-bold line-clamp-2">{item.name}</span>
                        <button onClick={() => removeFromCart(item.id, item.variationId)} className="text-gray-400"><X size={18} /></button>
                      </div>
                      {item.selectedAttributes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.selectedAttributes).map(([key, val]) => (
                            <span key={key} className="mr-2">{key}: {val}</span>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-base font-bold text-[#f10044]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button onClick={() => handleNavigate('shop')} className="bg-[#35404f] text-white text-xs font-bold uppercase px-6 py-3 hover:bg-[#f10044] transition w-full sm:w-auto text-center">Continue Shopping</button>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-gray-50 p-6 border shadow-sm">
              <div className="flex justify-between mb-6 text-lg font-bold text-[#f10044]">
                <span>Total:</span>
                <span>${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <button
                onClick={() => handleNavigate('checkout')}
                className="w-full bg-[#f10044] text-white font-bold uppercase py-3 hover:bg-black transition rounded-sm"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const RegisterView = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate login
      setToast({ message: `Welcome back, ${loginEmail}!`, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      handleNavigate('account', 'dashboard');
    };

    const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate registration
      setIsRegistering(true);
      setTimeout(() => {
        setIsRegistering(false);
        setToast({ message: "Registration successful! Please check your email.", visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
        handleNavigate('account', 'dashboard');
      }, 1500);
    };

    return (
      <div className="container mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-2xl font-bold uppercase font-heading mb-8 text-center border-b pb-4">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Login Form */}
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold uppercase text-gray-800 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username or email address *</label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#f10044] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#f10044] transition"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="text-[#f10044] hover:underline">Lost your password?</a>
              </div>
              <button type="submit" className="bg-[#f10044] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm w-full md:w-auto">
                Log In
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold uppercase text-gray-800 mb-6">Register</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email address *</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#f10044] transition"
                />
              </div>

              <div className="text-sm text-gray-600 space-y-4">
                <p>A link to set a new password will be sent to your email address.</p>
                <p>
                  Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our
                  <a href="#" className="text-[#f10044] font-bold ml-1 hover:underline">privacy policy</a>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="bg-white border-2 border-[#f10044] text-[#f10044] font-bold uppercase px-8 py-3 hover:bg-[#f10044] hover:text-white transition text-sm w-full md:w-auto flex items-center justify-center disabled:opacity-50"
              >
                {isRegistering ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const Toast = ({ message, visible }: { message: string, visible: boolean }) => {
    if (!visible) return null;
    return (
      <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded shadow-2xl z-[100] animate-fade-in-down flex items-center max-w-sm">
        <Check size={20} className="mr-3 flex-shrink-0" />
        <span className="text-sm font-semibold">{message}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500 flex-col">
        <Loader2 size={48} className="animate-spin text-[#f10044] mb-4" />
        <p className="uppercase tracking-widest text-xs font-bold">Loading Veena Collections...</p>
      </div>
    );
  }

  const DealView = () => {
    // Filter products with sale price for "Deal of the Day"
    const dealProducts = products.filter(p => p.sale_price && p.sale_price !== "");

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gray-100 py-12 px-6 text-center border-b-4 border-[#f10044]">
          <h1 className="text-4xl font-bold uppercase font-heading text-gray-800 tracking-wider">Deals of the Day</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Limited time offers on premium collection</p>
        </div>

        {dealProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onQuickView={handleQuickView}
                isWishlisted={isInWishlist(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No deals available at the moment. Check back later!</p>
            <button onClick={() => handleNavigate('shop')} className="mt-4 text-[#f10044] font-bold underline">Browse All Products</button>
          </div>
        )}
      </div>
    );
  };

  const RentMeView = () => {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 h-64 md:h-auto bg-[url('https://images.unsplash.com/photo-1550614000-4b9519e0921f?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="md:w-1/2 p-8 md:p-12">
            <h1 className="text-3xl font-bold uppercase font-heading text-gray-800 mb-4">Rent Premium Wear</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Why buy when you can rent? Experience luxury for your special occasions without the commitment.
              Our rental service offers a curated collection of premium sarees and ethnic wear.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <Check className="text-[#f10044] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Premium Collection</h4>
                  <p className="text-sm text-gray-500">Access to designer wear at a fraction of the cost.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="text-[#f10044] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Hygiene First</h4>
                  <p className="text-sm text-gray-500">Professionally dry-cleaned and sanitized before every rental.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="text-[#f10044] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Easy Returns</h4>
                  <p className="text-sm text-gray-500">Simple pickup and drop-off process.</p>
                </div>
              </div>
            </div>

            <button className="bg-[#f10044] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm">
              Contact Us to Rent
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CategoriesView = () => (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">All Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="group cursor-pointer" onClick={() => handleNavigate('shop', cat.name)}>
            <div className="relative overflow-hidden aspect-square mb-3 bg-gray-50 border border-gray-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="bg-white text-[#f10044] font-bold px-4 py-2 uppercase text-sm tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View</span>
              </div>
            </div>
            <h3 className="text-center font-bold text-gray-800 uppercase tracking-wide group-hover:text-[#f10044] transition">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Toast message={toast.message} visible={toast.visible} />

      <Header
        onNavigate={handleNavigate}
        onProductClick={handleProductClick}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        menuItems={menuItems}
        siteLogo={siteLogo || undefined}
        siteName={siteInfo.name}
      />

      <main className="flex-1 bg-white">
        {view === 'home' && <HomeView />}
        {view === 'shop' && <ShopView />}
        {view === 'categories' && <CategoriesView />}
        {view === 'deal' && <DealView />}
        {view === 'rent' && <RentMeView />}
        {view === 'product' && <ProductView />}
        {view === 'cart' && <CartView />}
        {view === 'wishlist' && <WishlistView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'register' && <RegisterView />}
        {view === 'account' && <AccountView />}
        {view === 'page' && <PageView />}
        {view === 'track-order' && <TrackOrderView />}
        {view === 'cookie-policy' && <CookiePolicy onBack={() => handleNavigate('home')} />}
      </main>

      <Footer onNavigate={handleNavigate} />
      <FloatingWhatsApp />
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
      />
      <CookieConsent onViewPolicy={() => handleNavigate('cookie-policy')} />
    </div>
  );
};

export default App;