import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { FilterBar } from './components/FilterBar';
import { QuickViewModal } from './components/QuickViewModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { SocialShare } from './components/SocialShare';
import { CookieConsent } from './components/CookieConsent';
import { CookiePolicy } from './components/CookiePolicy';
import { OrderDetailsModal, statusStyles } from './components/OrderDetailsModal';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { api } from './api';
import { Product, ViewState, CartItem, Category, NavItem, Variation, Order, HomeHeroBanner, HomeReel } from './types';
import { ArrowRight, ArrowLeft, Plus, Minus, X, Check, Home, Star, ShoppingCart, Heart, Loader2, UserCircle2, Package, MapPin, LogOut, CreditCard, Quote, Tag, Truck, Phone, Mail, Play, Facebook, Instagram } from 'lucide-react';

const ORDER_ITEM_PLACEHOLDER = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Item';
const DEFAULT_LOGO = "https://admin.theveenacollections.com/wp-content/uploads/2025/11/Blue-White-Modern-Minimalist-Name-Logo-2.png";

interface DealProps {
  onNavigate: (view: any) => void;
  onProductClick: (id: number) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: (id: number) => boolean;
  onQuickView: (p: Product) => void;
}

const DealOfTheDay = ({ onNavigate, onProductClick, onAddToCart, onToggleWishlist, isInWishlist, onQuickView }: DealProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [saleEndDate, setSaleEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dealExpired, setDealExpired] = useState(false);

  // Fetch deal products from WooCommerce
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const data = await api.getDealProducts();
        setDealProducts(data.products);
        setSaleEndDate(data.saleEndDate);
      } catch (error) {
        console.error("Failed to fetch deal products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // Timer countdown based on sale end date from WooCommerce
  useEffect(() => {
    if (!saleEndDate) return;

    const targetDate = new Date(saleEndDate);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
        setDealExpired(false);
      } else {
        setDealExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [saleEndDate]);

  // Don't render if no deal products
  if (!loading && dealProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#B8A99A] py-12 md:py-16 text-[#0b141b] overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-lg font-bold uppercase mb-2 tracking-widest text-[#0b141b]/70">Don't Miss Out</h3>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 uppercase">Deal of the Day</h2>
            <p className="mb-8 max-w-lg mx-auto lg:mx-0 text-lg text-[#0b141b]/80">Get up to 50% off on our exclusive traditional saree and jewelry collection. Limited time offer!</p>
            <button
              onClick={() => onNavigate('deal')}
              className="bg-[#EE6348] text-white px-10 py-3.5 font-bold uppercase hover:bg-black hover:text-white transition shadow-lg text-sm tracking-widest"
            >
              Shop The Deal
            </button>
          </div>
          {saleEndDate && (
            <div className="lg:w-1/2 flex justify-center gap-3 md:gap-6">
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.days}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Days</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Mins</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Secs</span>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid Below Timer */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#0b141b]" size={32} />
          </div>
        ) : dealProducts.length > 0 && (
          <div className={`gap-6 pt-8 border-t border-white/20 ${
            dealProducts.length === 1 ? 'flex justify-center' :
            dealProducts.length === 2 ? 'grid grid-cols-1 sm:flex sm:justify-center sm:gap-8 lg:gap-12' :
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {dealProducts.map(product => (
              <div key={product.id} className={dealProducts.length <= 2 ? 'w-full sm:max-w-[320px] lg:max-w-[350px]' : ''}>
                <ProductCard
                  product={product}
                  onClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  isWishlisted={isInWishlist(product.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerReviews = () => {
  // Default/fallback reviews shown while loading or if no reviews exist
  const defaultReviews: Array<{ id: number; name: string; rating: number; text: string; uploadedImage?: string }> = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      text: "Absolutely stunning saree! The craftsmanship is incredible and it looks even better in person. Fast shipping too."
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 4,
      text: "Great quality for the price. The fabric is very comfortable. Would definitely recommend Veena Collections."
    },
    {
      id: 3,
      name: "Emily Davis",
      rating: 5,
      text: "I bought the silver jewelry set for my sister and she loves it. The packaging was beautiful and premium."
    }
  ];

  const [reviews, setReviews] = useState(defaultReviews);
  const [currentReview, setCurrentReview] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch approved reviews from WooCommerce + merge with local pending reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Load locally saved reviews first
        let localReviews: any[] = [];
        try { localReviews = JSON.parse(localStorage.getItem('localReviews') || '[]'); } catch (_) {}

        const fetchedReviews = await api.getReviews();
        
        // Merge API reviews with local reviews (avoid duplicates)
        const apiReviewEmails = new Set(fetchedReviews.map(r => r.email?.toLowerCase()));
        
        // Format API reviews
        const formattedApiReviews = fetchedReviews.map(r => {
          // Find matching local review to attach uploaded image
          const localMatch = localReviews.find(l =>
            l.email?.toLowerCase() === r.email?.toLowerCase() && 
            l.text.slice(0, 30) === r.text.slice(0, 30)
          );
          return {
            id: r.id,
            name: r.name,
            rating: r.rating,
            text: r.text,
            uploadedImage: localMatch?.uploadedImage || undefined
          };
        });

        // Add local reviews that aren't in API yet (pending approval)
        const pendingLocalReviews = localReviews
          .filter(l => !apiReviewEmails.has(l.email?.toLowerCase()))
          .map(l => ({
            id: l.id,
            name: l.name,
            rating: l.rating,
            text: l.text,
            uploadedImage: l.uploadedImage || undefined
          }));

        // Combine: local pending reviews first, then API approved reviews
        const allReviews = [...pendingLocalReviews, ...formattedApiReviews];
        
        // Always show reviews - use fetched/local if available, otherwise defaults
        setReviews(allReviews.length > 0 ? allReviews : defaultReviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Keep default reviews on error
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length <= 1) return;
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
          <div className="w-12 h-0.5 bg-[#EE6348] mx-auto mt-4"></div>
        </div>

        <div className="max-w-5xl mx-auto relative bg-white p-8 md:p-12 shadow-sm rounded-sm">
          <Quote size={48} className="text-[#EE6348]/10 absolute top-4 left-4" />
          <Quote size={48} className="text-[#EE6348]/10 absolute bottom-4 right-4 transform rotate-180" />

          {loading ? (
            <div className="flex justify-center items-center min-h-[180px]">
              <Loader2 className="animate-spin text-[#EE6348]" size={32} />
            </div>
          ) : (
            <>
              <div className="relative min-h-[180px] flex flex-col items-center transition-all duration-500">
                {/* User Avatar */}
                <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#EE6348] shadow-md mb-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reviews[currentReview]?.name || 'User')}&background=EE6348&color=fff&size=128`}
                    alt={reviews[currentReview]?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Review Content */}
                <div className="flex-1 text-center">
                  <div className="flex justify-center mb-4 text-[#EE6348]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill={i < (reviews[currentReview]?.rating || 5) ? "currentColor" : "none"} stroke="currentColor" className={i < (reviews[currentReview]?.rating || 5) ? "" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-lg italic mb-4 leading-relaxed max-w-3xl mx-auto">"{reviews[currentReview]?.text}"</p>
                  
                  {/* User uploaded image as small tile */}
                  {reviews[currentReview]?.uploadedImage && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={reviews[currentReview].uploadedImage}
                        alt="Review photo"
                        className="w-20 h-20 object-cover rounded border border-gray-200 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        onClick={() => {
                          // Optional: could open full-size image in modal
                          window.open(reviews[currentReview].uploadedImage, '_blank');
                        }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase tracking-wide">{reviews[currentReview]?.name}</h4>
                    <span className="text-xs text-gray-500">Verified Buyer</span>
                  </div>
                </div>
              </div>

              {reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReview(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentReview ? 'bg-[#EE6348] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Read initial route state from the URL so a page refresh lands on the same view.
const getInitialUrlState = () => {
  if (typeof window === 'undefined') return { view: 'home' as ViewState, param: '', productId: 0 };
  const params = new URLSearchParams(window.location.search);
  const rawView = params.get('view');
  const validViews: ViewState[] = ['home','shop','product','cart','wishlist','register','account','page','checkout','track-order','categories','deal','rent','cookie-policy','thank-you'];
  const view: ViewState = (rawView && (validViews as string[]).includes(rawView)) ? (rawView as ViewState) : 'home';
  const param = params.get('param') || '';
  const productId = parseInt(params.get('id') || '0', 10) || 0;
  return { view, param, productId };
};

const App: React.FC = () => {
  const initialUrl = getInitialUrlState();
  const [view, setView] = useState<ViewState>(initialUrl.view);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('veena_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('veena_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('veena_cart', JSON.stringify(cart));
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [cart]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('veena_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('veena_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [wishlist]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('veena_user');
    return saved ? true : false;
  });
  const [user, setUser] = useState<{ email: string; name: string; picture?: string } | null>(() => {
    const saved = localStorage.getItem('veena_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const userFirstName = user?.name?.trim()?.split(/\s+/)[0] || '';

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Navigation State (initialized from URL for hard-refresh persistence)
  const [accountTab, setAccountTab] = useState<'dashboard' | 'orders' | 'addresses' | 'details'>(
    initialUrl.view === 'account' && ['dashboard', 'orders', 'addresses', 'details'].includes(initialUrl.param)
      ? (initialUrl.param as any)
      : 'dashboard'
  );
  const [currentPageSlug, setCurrentPageSlug] = useState<string>(
    initialUrl.view === 'page' ? initialUrl.param : ''
  );
  const [currentCategory, setCurrentCategory] = useState<string>(
    initialUrl.view === 'shop' ? initialUrl.param : ''
  );

  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(false);
  const [productAttributes, setProductAttributes] = useState<any[]>([]);
  const [selectedFilterAttributes, setSelectedFilterAttributes] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Dynamic Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
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
        const [fetchedProducts, fetchedBestSellers, fetchedCategories, fetchedMenu, fetchedInfo, fetchedLogo, fetchedAttrs] = await Promise.all([
          api.getProducts(),
          api.getBestSellerProducts(),
          api.getCategories(),
          api.getMenu(),
          api.getSiteInfo(),
          api.getSiteLogo(),
          api.getAttributes()
        ]);
        setProducts(fetchedProducts);
        setBestSellerProducts(fetchedBestSellers);
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

  // On first mount, seed history.state so back/forward works after a hard refresh.
  useEffect(() => {
    if (window.history.state == null) {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') || 'home';
      const p = params.get('param') || undefined;
      const id = parseInt(params.get('id') || '0', 10) || undefined;
      window.history.replaceState({ view: v, param: p, productId: id }, '', window.location.search || '');
    }
  }, []);

  // If the URL points to a product on refresh, look it up once products load.
  useEffect(() => {
    if (initialUrl.view !== 'product' || !initialUrl.productId) return;
    if (products.length === 0) return;
    const prod = products.find(p => p.id === initialUrl.productId);
    if (prod && activeProduct?.id !== prod.id) {
      setActiveProduct(prod);
    }
  }, [products]);

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
      setView('product');
      window.history.pushState({ view: 'product', productId: id }, '', `?view=product&id=${id}`);
      window.scrollTo(0, 0);

      // Reset variation state and quantity
      setVariations([]);
      setSelectedAttributes({});
      setProductQuantity(1);
      setCurrentVariation(null);

      // Fetch fresh product data for real-time stock info
      api.getProduct(id).then(freshProd => {
        if (freshProd) {
          setActiveProduct(freshProd);
          // Also update the product in the products array so cart gets fresh stock data
          setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: freshProd.stock_quantity, stock_status: freshProd.stock_status, manage_stock: freshProd.manage_stock } : p));
        }
      });

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

  // ── Stock helpers ──────────────────────────────────────────
  // Resolve the max purchasable qty.
  // Priority: variation stock > product stock > unlimited (null)
  const resolveMaxQty = (product: Product, variation?: Variation | null): number | null => {
    // Check variation stock status first if set explicitly to out of stock
    if (variation && variation.stock_status === 'outofstock') return 0;
    
    // Check product stock status
    if (product.stock_status === 'outofstock') return 0;

    if (variation && variation.manage_stock && variation.stock_quantity != null) {
      return variation.stock_quantity;
    }
    if (product.manage_stock && product.stock_quantity != null) {
      return product.stock_quantity;
    }
    return null;
  };

  // For cart items we already stored maxQty at add-time
  const getCartItemMax = (item: CartItem): number | null => {
    return item.maxQty ?? null;
  };

  // ── Cart functions (fresh) ───────────────────────────────
  const addToCart = (product: Product, opts?: { variation?: Variation | null; selectedAttributes?: Record<string, string>; quantity?: number }) => {
    const useVariation = opts?.variation !== undefined ? opts.variation : currentVariation;
    const useSelected = opts?.selectedAttributes !== undefined ? opts.selectedAttributes : selectedAttributes;
    const qtyToAdd = opts?.quantity || 1;

    if (product.type === 'variable' && !useVariation) {
      showToast('Please select all options before adding to cart');
      return;
    }

    const maxQty = resolveMaxQty(product, useVariation);

    const itemToAdd: CartItem = {
      ...product,
      price: useVariation ? useVariation.price : product.price,
      image: (useVariation?.image?.src) ? useVariation.image.src : product.image,
      quantity: qtyToAdd,
      variationId: useVariation?.id,
      selectedAttributes: useVariation ? useSelected : undefined,
      maxQty,
    };

    setCart(prev => {
      const existing = prev.find(i => i.id === itemToAdd.id && i.variationId === itemToAdd.variationId);

      if (existing) {
        let newQty = existing.quantity + qtyToAdd;
        if (maxQty !== null && newQty > maxQty) {
          newQty = maxQty;
          showToast(`Only ${maxQty} available in stock`);
        }
        return prev.map(i =>
          i.id === itemToAdd.id && i.variationId === itemToAdd.variationId
            ? { ...i, quantity: newQty }
            : i
        );
      }

      let finalQty = qtyToAdd;
      if (maxQty !== null && finalQty > maxQty) {
        finalQty = maxQty;
        showToast(`Only ${maxQty} available in stock`);
      }
      return [...prev, { ...itemToAdd, quantity: finalQty }];
    });

    if (maxQty === null || qtyToAdd <= maxQty) {
      showToast(`Added ${product.name} to cart`);
    }
  };

  const removeFromCart = (id: number, variationId?: number) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.variationId === variationId)));
  };

  const updateCartQuantity = (id: number, variationId: number | undefined, change: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== id || item.variationId !== variationId) return item;
          const newQty = item.quantity + change;
          if (newQty <= 0) return null;
          const max = getCartItemMax(item);
          if (max !== null && newQty > max) {
            showToast(`Only ${max} available in stock`);
            return { ...item, quantity: max };
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setCartItemQuantity = (id: number, variationId: number | undefined, qty: number) => {
    if (qty <= 0) { removeFromCart(id, variationId); return; }
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id || item.variationId !== variationId) return item;
        const max = getCartItemMax(item);
        let finalQty = Math.max(1, qty);
        if (max !== null && finalQty > max) {
          finalQty = max;
          showToast(`Only ${max} available in stock`);
        }
        return { ...item, quantity: finalQty };
      })
    );
  };

  // Express checkout: cart -> Stripe directly, skipping the on-site billing form.
  // Stripe Checkout collects the email/address; the WP snippet writes it back to
  // the order on return. (The full billing form still exists in CheckoutView and
  // can be re-enabled later by pointing the cart button back to 'checkout'.)
  const [expressLoading, setExpressLoading] = useState(false);
  const handleExpressCheckout = async () => {
    if (cart.length === 0) { showToast('Your cart is empty'); return; }
    setExpressLoading(true);
    try {
      const nameParts = (user?.name || '').trim().split(' ');
      const order = await api.createOrder({
        billing: {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          address_1: '',
          city: '',
          phone: '',
          email: user?.email || '',
        },
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          variation_id: item.variationId,
        })),
        payment_method: 'stripe',
        payment_method_title: 'Credit / Debit Card',
      });
      setLastOrderId(order.id.toString());
      const stripeUrl = await api.createStripeCheckoutSession(order.id, order.order_key);
      window.location.href = stripeUrl;
    } catch (error) {
      console.error('Express checkout failed:', error);
      showToast('Could not start checkout. Please try again.');
      setExpressLoading(false);
    }
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
        setProductQuantity(1); // Reset qty when variation changes (different stock)
      } else {
        setCurrentVariation(null);
        setProductQuantity(1);
      }
    }
  }, [selectedAttributes, variations, activeProduct]);

  useEffect(() => {
    if (!activeProduct) {
      setSelectedProductImage(null);
      return;
    }

    if (currentVariation?.image?.src) {
      setSelectedProductImage(currentVariation.image.src);
      return;
    }

    setSelectedProductImage(activeProduct.images?.[0] || activeProduct.image);
  }, [activeProduct, currentVariation]);

  useEffect(() => {
    if (!activeProduct) return;

    setRecentlyViewedIds(prev => {
      const next = [activeProduct.id, ...prev.filter(id => id !== activeProduct.id)].slice(0, 8);
      try {
        localStorage.setItem('veena_recently_viewed', JSON.stringify(next));
      } catch {
        // Ignore storage failures and keep the in-memory list.
      }
      return next;
    });
  }, [activeProduct?.id]);

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

  const [lastOrderId, setLastOrderId] = useState<string>('');

  // Handle the return from Stripe-hosted Checkout: the WordPress plugin redirects
  // back to /?view=thank-you&order_paid=<id> after marking the order paid.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidOrderId = params.get('order_paid');
    if (paidOrderId) {
      setLastOrderId(paidOrderId);
      setCart([]);
      setView('thank-you');
      // Strip the query params so a refresh doesn't re-trigger this.
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getPreferredProductDescription = (product: Product): string => {
    const hasMeaningfulHtml = (html?: string) =>
      Boolean(html && html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim());

    if (hasMeaningfulHtml(product.description)) return product.description!;
    if (hasMeaningfulHtml(product.short_description)) return product.short_description!;
    return '';
  };

  const CheckoutView = () => {
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [paymentGateways, setPaymentGateways] = useState<Array<{ id: string; title: string; description: string }>>([]);
    const [selectedPayment, setSelectedPayment] = useState<string>('');
    const [loadingGateways, setLoadingGateways] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');

    // Billing form state
    const [billing, setBilling] = useState({
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      city: '',
      phone: '',
      email: ''
    });

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setBilling(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = appliedCoupon ? Math.min(appliedCoupon.discountAmount, subtotal) : 0;
    const total = Math.max(0, subtotal - discount);

    // Fetch payment gateways
    useEffect(() => {
      const fetchGateways = async () => {
        setLoadingGateways(true);
        try {
          const gateways = await api.getPaymentGateways();
          setPaymentGateways(gateways);
          if (gateways.length > 0) {
            setSelectedPayment(gateways[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch payment gateways:", error);
        } finally {
          setLoadingGateways(false);
        }
      };
      fetchGateways();
    }, []);

    const handleApplyCoupon = async () => {
      const code = couponInput.trim();
      if (!code) return;
      setCouponLoading(true);
      setCouponError('');
      try {
        const res = await api.validateCoupon(code, subtotal);
        if (res.valid) {
          setAppliedCoupon({ code: res.code, discountAmount: res.discountAmount });
          setCouponInput('');
        } else {
          setCouponError(res.message);
        }
      } catch (e) {
        setCouponError((e as Error).message || 'Could not validate coupon.');
      } finally {
        setCouponLoading(false);
      }
    };

    const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setCouponError('');
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setOrderError('');

      if (!selectedPayment) {
        setToast({ message: "Please select a payment method", visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
        return;
      }

      if (cart.length === 0) {
        setToast({ message: "Your cart is empty", visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
        return;
      }

      setPlacingOrder(true);

      try {
        // Get payment method title
        const paymentMethod = paymentGateways.find(g => g.id === selectedPayment);

        console.log("Creating order with payment method:", selectedPayment);

        // Create order in WooCommerce
        // WooCommerce Stripe plugin will handle payment processing server-side
        const order = await api.createOrder({
          billing: billing,
          line_items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            variation_id: item.variationId
          })),
          payment_method: selectedPayment,
          payment_method_title: paymentMethod?.title || selectedPayment,
          coupon_lines: appliedCoupon ? [{ code: appliedCoupon.code }] : undefined
        });

        console.log("Order created:", order);

        // Online gateways (Stripe): send the customer straight to Stripe-hosted
        // Checkout (checkout.stripe.com). The order stays "pending" until the
        // Stripe Direct Checkout plugin marks it paid on return.
        if (selectedPayment !== 'cod') {
          setLastOrderId(order.id.toString());
          const stripeUrl = await api.createStripeCheckoutSession(order.id, order.order_key);
          window.location.href = stripeUrl;
          return;
        }

        // COD (or any non-redirect method): complete the order locally.
        // REAL-TIME STOCK UPDATE: Decrement local stock immediately after purchase
        setProducts(prevProducts => {
          return prevProducts.map(mainProduct => {
            const purchasedItem = cart.find(ci => ci.id === mainProduct.id);
            if (purchasedItem && mainProduct.manage_stock && mainProduct.stock_quantity != null) {
              return {
                ...mainProduct,
                stock_quantity: Math.max(0, mainProduct.stock_quantity - purchasedItem.quantity),
                stock_status: (mainProduct.stock_quantity - purchasedItem.quantity) <= 0 ? 'outofstock' : mainProduct.stock_status
              };
            }
            return mainProduct;
          });
        });

        setLastOrderId(order.id.toString());
        setCart([]);
        handleNavigate('thank-you');
      } catch (error) {
        console.error("Order creation failed:", error);
        setOrderError('Failed to place order. Please try again.');
        setToast({ message: "Failed to place order. Please try again.", visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      } finally {
        setPlacingOrder(false);
      }
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
                  <input
                    type="text"
                    name="first_name"
                    value={billing.first_name}
                    onChange={handleBillingChange}
                    required
                    className="w-full border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={billing.last_name}
                    onChange={handleBillingChange}
                    required
                    className="w-full border p-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={billing.company}
                  onChange={handleBillingChange}
                  className="w-full border p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Street Address *</label>
                <input
                  type="text"
                  name="address_1"
                  value={billing.address_1}
                  onChange={handleBillingChange}
                  required
                  className="w-full border p-2 text-sm"
                  placeholder="House number and street name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Town / City *</label>
                <input
                  type="text"
                  name="city"
                  value={billing.city}
                  onChange={handleBillingChange}
                  required
                  className="w-full border p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={billing.phone}
                  onChange={handleBillingChange}
                  required
                  className="w-full border p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={billing.email}
                  onChange={handleBillingChange}
                  required
                  className="w-full border p-2 text-sm"
                />
              </div>
              {orderError && <p className="text-red-600 text-sm">{orderError}</p>}
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
              {/* Coupon */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-gray-500" />
                  <span className="text-sm font-bold text-gray-700">Coupon code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-sm text-green-700">Discount ({appliedCoupon.code}): -${discount.toFixed(2)}</span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-[#EE6348] hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                      placeholder="Enter code"
                      className="flex-1 min-w-[120px] border border-gray-300 p-2 text-sm"
                      disabled={couponLoading}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-gray-800 text-white text-sm font-bold uppercase hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
              </div>

              {/* Payment Methods */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-gray-500" />
                  Payment Method
                </h4>
                {loadingGateways ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-[#EE6348]" />
                  </div>
                ) : paymentGateways.length > 0 ? (
                  <div className="space-y-3">
                    {paymentGateways.map((gateway) => (
                      <label
                        key={gateway.id}
                        className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition ${selectedPayment === gateway.id ? 'border-[#EE6348] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={gateway.id}
                          checked={selectedPayment === gateway.id}
                          onChange={() => setSelectedPayment(gateway.id)}
                          className="mt-1 accent-[#EE6348]"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-800">{gateway.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No payment methods available.</p>
                )}
              </div>

              <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-gray-200 pt-4 mb-6">
                <span>Total</span>
                <span className="text-[#EE6348]">${total.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={placingOrder || !selectedPayment}
                className="w-full bg-[#EE6348] text-white font-bold uppercase py-3 hover:bg-black transition disabled:opacity-50 flex items-center justify-center"
              >
                {placingOrder ? <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</> : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ThankYouView = () => {
    const [orderDetails, setOrderDetails] = useState<Order | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
      if (!lastOrderId) return;
      let cancelled = false;

      const fetchOrder = async (attempt = 0) => {
        setLoadingOrder(true);
        const order = await api.getOrderById(Number(lastOrderId));
        if (cancelled) return;

        // The Stripe plugin writes the address onto the order server-side just
        // before redirecting here. If it hasn't propagated yet, retry once.
        const hasAddress = Boolean(order?.billing?.address_1 || order?.shipping?.address_1);
        if (order && !hasAddress && attempt < 2) {
          setTimeout(() => fetchOrder(attempt + 1), 1500);
          return;
        }
        setOrderDetails(order);
        setLoadingOrder(false);
      };

      fetchOrder();
      return () => { cancelled = true; };
    }, [lastOrderId]);

    const addr = orderDetails?.shipping?.address_1 ? orderDetails.shipping : orderDetails?.billing;
    const fullName = [addr?.first_name, addr?.last_name].filter(Boolean).join(' ');
    const hasAddress = Boolean(addr?.address_1);

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold uppercase font-heading text-gray-800 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-2">Your order has been placed successfully.</p>
          {lastOrderId && (
            <p className="text-sm text-gray-500 mb-8">Order ID: <span className="font-bold text-[#EE6348]">#{lastOrderId}</span></p>
          )}

          {loadingOrder && !orderDetails && (
            <div className="flex justify-center py-6">
              <Loader2 size={28} className="animate-spin text-[#EE6348]" />
            </div>
          )}

          {orderDetails && (
            <div className="text-left space-y-4 mb-8">
              {/* Order items */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={18} className="text-[#EE6348]" /> Order Summary
                </h3>
                <div className="space-y-3">
                  {orderDetails.line_items.map((li, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-700">
                      <span>{li.name} <span className="text-gray-400">× {li.quantity}</span></span>
                      <span className="font-medium">${li.total}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#EE6348]">${orderDetails.total}</span>
                </div>
                {orderDetails.payment_method_title && (
                  <p className="text-xs text-gray-500 mt-2">Paid via {orderDetails.payment_method_title}</p>
                )}
              </div>

              {/* Delivery address */}
              {hasAddress && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-[#EE6348]" /> Delivery Address
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {fullName && <p className="font-medium">{fullName}</p>}
                    {addr?.address_1 && <p>{addr.address_1}</p>}
                    {addr?.address_2 && <p>{addr.address_2}</p>}
                    <p>{[addr?.city, addr?.state, addr?.postcode].filter(Boolean).join(', ')}</p>
                    {addr?.country && <p>{addr.country}</p>}
                    {orderDetails.billing?.phone && <p className="mt-1 text-gray-500">{orderDetails.billing.phone}</p>}
                    {orderDetails.billing?.email && <p className="text-gray-500">{orderDetails.billing.email}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="font-bold text-gray-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                You will receive an order confirmation email shortly.
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                Our team will process your order within 24 hours.
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                You can track your order status in your account.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNavigate('shop')}
              className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-black transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => handleNavigate('track-order')}
              className="border-2 border-[#EE6348] text-[#EE6348] font-bold uppercase px-8 py-3 hover:bg-[#EE6348] hover:text-white transition"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AccountView = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderTracking, setOrderTracking] = useState<Record<number, Array<{
      tracking_number: string;
      tracking_provider: string;
      tracking_link: string;
      date_shipped: string;
      status?: string;
    }>>>({});
    const [customerAddresses, setCustomerAddresses] = useState<{
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
    } | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [editingAddress, setEditingAddress] = useState<'billing' | 'shipping' | null>(null);
    const [addressForm, setAddressForm] = useState<Record<string, string>>({});
    const [savingAddress, setSavingAddress] = useState(false);

    useEffect(() => {
      if (accountTab === 'orders') {
        setLoadingOrders(true);
        api.getOrders(user?.email).then(async (fetchedOrders) => {
          setOrders(fetchedOrders);
          // Fetch tracking for each order
          const trackingData: Record<number, any[]> = {};
          await Promise.all(fetchedOrders.map(async (order) => {
            const tracking = await api.getShipmentTracking(order.id);
            if (tracking.length > 0) {
              trackingData[order.id] = tracking;
            }
          }));
          setOrderTracking(trackingData);
        }).finally(() => setLoadingOrders(false));
      }
    }, [accountTab, user?.email]);

    useEffect(() => {
      if (accountTab === 'addresses' && user?.email) {
        setLoadingAddresses(true);
        api.getCustomerByEmail(user.email).then(setCustomerAddresses).finally(() => setLoadingAddresses(false));
      }
    }, [accountTab, user?.email]);

    const handleEditAddress = (addressType: 'billing' | 'shipping') => {
      const existingAddress = customerAddresses?.[addressType] || {};
      setAddressForm({
        first_name: existingAddress.first_name || '',
        last_name: existingAddress.last_name || '',
        company: existingAddress.company || '',
        address_1: existingAddress.address_1 || '',
        address_2: existingAddress.address_2 || '',
        city: existingAddress.city || '',
        state: existingAddress.state || '',
        postcode: existingAddress.postcode || '',
        country: existingAddress.country || '',
        ...(addressType === 'billing' ? {
          email: existingAddress.email || user?.email || '',
          phone: existingAddress.phone || ''
        } : {})
      });
      setEditingAddress(addressType);
    };

    const handleAddressSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!editingAddress || !user?.email) return;

      setSavingAddress(true);
      try {
        await api.updateCustomerAddress(user.email, editingAddress, addressForm);
        const updatedCustomer = await api.getCustomerByEmail(user.email);
        setCustomerAddresses(updatedCustomer);
        setEditingAddress(null);
        showToast(`${editingAddress === 'billing' ? 'Billing' : 'Shipping'} address updated`);
      } catch (error) {
        showToast((error as Error).message || 'Could not update address. Please try again.');
      } finally {
        setSavingAddress(false);
      }
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-8 border-b pb-4">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4">
            <nav className="flex flex-col border border-gray-200 bg-white">
              <button
                onClick={() => setAccountTab('dashboard')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'dashboard' ? 'text-[#EE6348] border-l-4 border-l-[#EE6348]' : 'text-gray-600'}`}
              >
                <UserCircle2 size={16} className="mr-3" /> Dashboard
              </button>
              <button
                onClick={() => setAccountTab('orders')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'orders' ? 'text-[#EE6348] border-l-4 border-l-[#EE6348]' : 'text-gray-600'}`}
              >
                <Package size={16} className="mr-3" /> Orders
              </button>
              <button
                onClick={() => setAccountTab('addresses')}
                className={`flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 border-b border-gray-100 transition ${accountTab === 'addresses' ? 'text-[#EE6348] border-l-4 border-l-[#EE6348]' : 'text-gray-600'}`}
              >
                <MapPin size={16} className="mr-3" /> Addresses
              </button>
              <button
                onClick={() => { googleLogout(); setUser(null); setIsLoggedIn(false); localStorage.removeItem('veena_user'); handleNavigate('home'); }}
                className="flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 text-gray-600"
              >
                <LogOut size={16} className="mr-3" /> Logout
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-gray-200 p-6 min-h-[400px]">
            {accountTab === 'dashboard' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[#EE6348]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#EE6348] flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Hello, {user?.name || 'User'}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  From your account dashboard you can view your <span className="text-[#EE6348] cursor-pointer" onClick={() => setAccountTab('orders')}>recent orders</span>,
                  manage your <span className="text-[#EE6348] cursor-pointer" onClick={() => setAccountTab('addresses')}>shipping and billing addresses</span>,
                  and <span className="text-[#EE6348] cursor-pointer">edit your password and account details</span>.
                </p>
              </div>
            )}

            {accountTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
                  {orders.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {loadingOrders ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#EE6348]" /></div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const tracking = orderTracking[order.id] || [];
                      const sty = statusStyles(order.status);
                      const items = order.line_items || [];
                      const itemCount = items.reduce((acc, li) => acc + (li.quantity || 0), 0);
                      const thumbs = items.slice(0, 3);
                      return (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                          {/* Card header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 border-b border-gray-100">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 leading-tight">#{order.number || order.id}</p>
                              <p className="text-[11px] text-gray-500">
                                {new Date(order.date_created).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' · '}{itemCount} item{itemCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sty.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sty.dot}`} />{sty.label}
                            </span>
                          </div>

                          {/* Card body: item thumbnails + summary */}
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="flex -space-x-3 shrink-0">
                              {thumbs.map((item, idx) => (
                                <img
                                  key={item.id ?? idx}
                                  src={item.image || ORDER_ITEM_PLACEHOLDER}
                                  alt={item.name}
                                  loading="lazy"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ORDER_ITEM_PLACEHOLDER; }}
                                  className="w-14 h-14 rounded-xl object-cover bg-gray-100 border-2 border-white shadow-sm"
                                />
                              ))}
                              {items.length > 3 && (
                                <div className="w-14 h-14 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">
                                  +{items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{items[0]?.name || 'Order items'}</p>
                              {items.length > 1 && (
                                <p className="text-[11px] text-gray-500 truncate">+{items.length - 1} more item{items.length - 1 !== 1 ? 's' : ''}</p>
                              )}
                              <p className="text-base font-bold text-[#EE6348] mt-1">${parseFloat(order.total || '0').toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Tracking strip */}
                          {tracking.length > 0 && (
                            <div className="mx-4 mb-3 flex items-center gap-2 bg-[#EE6348]/5 rounded-xl px-3 py-2">
                              <Truck size={14} className="text-[#EE6348] shrink-0" />
                              <span className="text-[11px] text-gray-600 truncate flex-1">
                                <span className="font-bold text-gray-700">{tracking[0].tracking_provider}</span>
                                {tracking[0].tracking_number ? ` · ${tracking[0].tracking_number}` : ''}
                              </span>
                              {tracking[0].tracking_link && (
                                <a
                                  href={tracking[0].tracking_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 text-[11px] font-bold text-[#EE6348] hover:underline"
                                >
                                  Track
                                </a>
                              )}
                            </div>
                          )}

                          {/* Card footer */}
                          <div className="px-4 pb-3">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="w-full bg-[#EE6348] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-black transition active:scale-[0.99]"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Package size={28} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">No orders yet</p>
                    <p className="text-xs text-gray-500 mb-4">Your orders will show up here once you place one.</p>
                    <button
                      onClick={() => handleNavigate('shop')}
                      className="bg-[#EE6348] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-black transition"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}

                <OrderDetailsModal
                  order={selectedOrder}
                  isOpen={!!selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  tracking={selectedOrder ? (orderTracking[selectedOrder.id] || []) : []}
                />
              </div>
            )}

            {accountTab === 'addresses' && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Addresses</h2>
                <p className="text-gray-600 text-sm mb-6">The following addresses will be used on the checkout page by default.</p>
                {editingAddress && (
                  <form onSubmit={handleAddressSubmit} className="border border-[#EE6348]/30 bg-[#EE6348]/5 p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-700">Edit {editingAddress === 'billing' ? 'Billing' : 'Shipping'} Address</h3>
                      <button type="button" onClick={() => setEditingAddress(null)} className="text-gray-500 hover:text-gray-800" aria-label="Close address form"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ['first_name', 'First name', true],
                        ['last_name', 'Last name', true],
                        ['company', 'Company', false],
                        ['address_1', 'Address line 1', true],
                        ['address_2', 'Address line 2', false],
                        ['city', 'City', true],
                        ['state', 'State', false],
                        ['postcode', 'Postcode', true],
                        ['country', 'Country code', true],
                        ...(editingAddress === 'billing' ? [['phone', 'Phone', false], ['email', 'Email', true]] : [])
                      ].map(([field, label, required]) => (
                        <label key={field as string} className="text-sm text-gray-600">
                          {label as string}{required ? ' *' : ''}
                          <input
                            type={field === 'email' ? 'email' : 'text'}
                            required={Boolean(required)}
                            value={addressForm[field as string] || ''}
                            onChange={(event) => setAddressForm(prev => ({ ...prev, [field as string]: event.target.value }))}
                            className="w-full border border-gray-300 bg-white p-2 mt-1 focus:outline-none focus:border-[#EE6348]"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" disabled={savingAddress} className="bg-[#EE6348] text-white px-5 py-2 text-sm font-bold hover:bg-black transition disabled:opacity-60">
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setEditingAddress(null)} className="border border-gray-300 text-gray-600 px-5 py-2 text-sm font-bold hover:bg-gray-100 transition">Cancel</button>
                    </div>
                  </form>
                )}
                {loadingAddresses ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#EE6348]" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded bg-gray-50">
                      <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
                        Billing Address
                        <button type="button" onClick={() => handleEditAddress('billing')} className="text-[#EE6348] text-xs hover:underline">Edit</button>
                      </h3>
                      {customerAddresses?.billing?.address_1 ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{customerAddresses.billing.first_name} {customerAddresses.billing.last_name}</p>
                          {customerAddresses.billing.company && <p>{customerAddresses.billing.company}</p>}
                          <p>{customerAddresses.billing.address_1}</p>
                          {customerAddresses.billing.address_2 && <p>{customerAddresses.billing.address_2}</p>}
                          <p>{customerAddresses.billing.city}{customerAddresses.billing.state ? `, ${customerAddresses.billing.state}` : ''} {customerAddresses.billing.postcode}</p>
                          <p>{customerAddresses.billing.country}</p>
                          {customerAddresses.billing.phone && (
                            <p className="flex items-center gap-1 mt-2">
                              <Phone size={12} /> {customerAddresses.billing.phone}
                            </p>
                          )}
                          {customerAddresses.billing.email && (
                            <p className="flex items-center gap-1">
                              <Mail size={12} /> {customerAddresses.billing.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">You have not set up this type of address yet.</p>
                      )}
                    </div>
                    <div className="border p-4 rounded bg-gray-50">
                      <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
                        Shipping Address
                        <button type="button" onClick={() => handleEditAddress('shipping')} className="text-[#EE6348] text-xs hover:underline">Edit</button>
                      </h3>
                      {customerAddresses?.shipping?.address_1 ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{customerAddresses.shipping.first_name} {customerAddresses.shipping.last_name}</p>
                          {customerAddresses.shipping.company && <p>{customerAddresses.shipping.company}</p>}
                          <p>{customerAddresses.shipping.address_1}</p>
                          {customerAddresses.shipping.address_2 && <p>{customerAddresses.shipping.address_2}</p>}
                          <p>{customerAddresses.shipping.city}{customerAddresses.shipping.state ? `, ${customerAddresses.shipping.state}` : ''} {customerAddresses.shipping.postcode}</p>
                          <p>{customerAddresses.shipping.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">You have not set up this type of address yet.</p>
                      )}
                    </div>
                  </div>
                )}
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
        <style dangerouslySetInnerHTML={{__html: `
          .custom-wp-page form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 1.5rem;
            max-width: 600px;
          }
          .custom-wp-page input[type="text"],
          .custom-wp-page input[type="email"],
          .custom-wp-page input[type="tel"],
          .custom-wp-page input[type="number"],
          .custom-wp-page textarea,
          .custom-wp-page select {
            width: 100%;
            padding: 14px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s ease;
            background-color: #f9fafb;
            color: #374151;
            font-family: inherit;
          }
          .custom-wp-page input:focus,
          .custom-wp-page textarea:focus,
          .custom-wp-page select:focus {
            outline: none;
            border-color: #EE6348;
            box-shadow: 0 0 0 3px rgba(238, 99, 72, 0.15);
            background-color: #ffffff;
          }
          .custom-wp-page textarea {
            min-height: 150px;
            resize: vertical;
          }
          .custom-wp-page input[type="submit"],
          .custom-wp-page button[type="submit"],
          .custom-wp-page .wpcf7-submit,
          .custom-wp-page .wpforms-submit {
            background-color: #EE6348;
            color: white;
            padding: 14px 36px;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: fit-content;
            box-shadow: 0 4px 6px rgba(238, 99, 72, 0.2);
            margin-top: 12px;
          }
          .custom-wp-page input[type="submit"]:hover,
          .custom-wp-page button[type="submit"]:hover,
          .custom-wp-page .wpcf7-submit:hover,
          .custom-wp-page .wpforms-submit:hover {
            background-color: #0b141b;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          .custom-wp-page label {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
            display: inline-block;
            font-size: 14px;
          }
          .custom-wp-page .wpcf7-form-control-wrap {
            display: block;
            margin-top: 4px;
          }
          .custom-wp-page .has-spinner {
            display: none !important;
          }
        `}} />
        {loadingPage ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EE6348]" size={40} /></div>
        ) : pageData ? (
          currentPageSlug === 'contact' ? (
            <div className="max-w-6xl mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-xl rounded-xl">
              <h1 className="text-3xl md:text-4xl font-bold uppercase font-heading text-gray-800 mb-8 pb-4 border-b-2 border-[#EE6348] inline-block tracking-wide">{pageData.title}</h1>
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="w-full lg:w-[60%]">
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-600 custom-wp-page leading-relaxed" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                </div>
                <div className="w-full lg:w-[40%] bg-gray-50 p-8 md:p-10 rounded-xl border border-gray-100 h-fit">
                  <div className="mb-10">
                    <h4 className="font-bold text-lg md:text-xl mb-6 flex items-center text-gray-800 uppercase tracking-widest font-heading">
                      <span className="text-[#EE6348] mr-3">›</span> Customer Service
                    </h4>
                    <ul className="space-y-4 text-gray-600 font-medium">
                      <li className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-4 flex-shrink-0">
                          <Mail className="text-[#EE6348]" size={18} />
                        </div>
                        <a href="mailto:theveenacollections@gmail.com" className="hover:text-[#EE6348] transition break-all">theveenacollections@gmail.com</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-4 flex-shrink-0">
                          <Phone className="text-[#EE6348]" size={18} />
                        </div>
                        <a href="https://wa.me/19099132080" target="_blank" rel="noopener noreferrer" className="hover:text-[#EE6348] transition">Whatsapp: (909) 913-2080 only</a>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg md:text-xl mb-6 flex items-center text-gray-800 uppercase tracking-widest font-heading">
                      <span className="text-[#EE6348] mr-3">›</span> Follow Us
                    </h4>
                    <div className="flex space-x-4">
                      <a href="#" className="w-12 h-12 bg-black flex items-center justify-center text-white hover:bg-[#EE6348] transition rounded-full shadow-md hover:-translate-y-1">
                        <Facebook size={20} />
                      </a>
                      <a href="#" className="w-12 h-12 bg-black flex items-center justify-center text-white hover:bg-[#EE6348] transition rounded-full shadow-md hover:-translate-y-1">
                        <Instagram size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 border border-gray-100 shadow-xl rounded-xl">
              <h1 className="text-3xl md:text-4xl font-bold uppercase font-heading text-gray-800 mb-8 pb-4 border-b-2 border-[#EE6348] inline-block tracking-wide">{pageData.title}</h1>
              <div className="prose prose-sm md:prose-base max-w-none text-gray-600 custom-wp-page leading-relaxed" dangerouslySetInnerHTML={{ __html: pageData.content }} />
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-800">Page Not Found</h2>
            <p className="text-gray-500 mt-2">The page "{currentPageSlug}" could not be loaded.</p>
            <button onClick={() => handleNavigate('home')} className="mt-4 text-[#EE6348] font-bold underline">Return Home</button>
          </div>
        )}
      </div>
    );
  };

  const TrackOrderView = () => {
    const [orderId, setOrderId] = useState('');
    const [billingEmail, setBillingEmail] = useState('');
    const [trackingResult, setTrackingResult] = useState<Order | null>(null);
    const [shipmentTracking, setShipmentTracking] = useState<Array<{
      tracking_number: string;
      tracking_provider: string;
      tracking_link: string;
      date_shipped: string;
      status?: string;
    }>>([]);
    const [trackingError, setTrackingError] = useState('');
    const [isTracking, setIsTracking] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsTracking(true);
      setTrackingError('');
      setTrackingResult(null);
      setShipmentTracking([]);

      try {
        const orderIdNum = parseInt(orderId);
        if (isNaN(orderIdNum)) {
          setTrackingError('Please enter a valid Order ID.');
          return;
        }

        // Fetch order from WooCommerce
        const order = await api.getOrderById(orderIdNum, billingEmail);

        if (order) {
          setTrackingResult(order);

          // Fetch shipment tracking from AST Pro
          const tracking = await api.getShipmentTracking(orderIdNum);
          setShipmentTracking(tracking);
        } else {
          setTrackingError(`Could not find order #${orderId}. Please check the Order ID and billing email.`);
        }
      } catch (err) {
        setTrackingError("An error occurred while tracking. Please try again.");
      } finally {
        setIsTracking(false);
      }
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-100 text-green-700';
        case 'processing': return 'bg-blue-100 text-blue-700';
        case 'on-hold': return 'bg-yellow-100 text-yellow-700';
        case 'pending': return 'bg-gray-100 text-gray-700';
        case 'cancelled': case 'failed': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
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
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348]"
                placeholder="Found in your order confirmation email."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Billing Email</label>
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348]"
                placeholder="Email you used during checkout."
              />
            </div>
            <button
              type="submit"
              disabled={isTracking}
              className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm disabled:opacity-50 flex items-center"
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
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold uppercase text-xs px-3 py-1 rounded ${getStatusColor(trackingResult.status)}`}>
                    {trackingResult.status}
                  </span>
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

              {/* Shipment Tracking Section */}
              {shipmentTracking.length > 0 && (
                <div className="mt-6 bg-blue-50 p-6 rounded border border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Package size={18} className="mr-2 text-blue-600" /> Shipment Tracking
                  </h4>
                  <div className="space-y-4">
                    {shipmentTracking.map((tracking, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border border-blue-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Carrier:</span>
                            <p className="font-bold text-gray-800">{tracking.tracking_provider}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tracking Number:</span>
                            <p className="font-bold text-gray-800">{tracking.tracking_number}</p>
                          </div>
                          {tracking.date_shipped && (
                            <div>
                              <span className="text-gray-500">Shipped Date:</span>
                              <p className="font-bold text-gray-800">{new Date(tracking.date_shipped).toLocaleDateString()}</p>
                            </div>
                          )}
                          {tracking.status && (
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="font-bold text-green-600">{tracking.status}</p>
                            </div>
                          )}
                        </div>
                        {tracking.tracking_link && (
                          <a
                            href={tracking.tracking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center text-sm text-[#EE6348] font-bold hover:underline"
                          >
                            Track Package <ArrowRight size={14} className="ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shipmentTracking.length === 0 && trackingResult.status !== 'completed' && (
                <div className="mt-6 bg-yellow-50 p-4 rounded border border-yellow-100 text-sm text-yellow-800">
                  <p>Tracking information will be available once your order has been shipped.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const HomeView = () => {
    const [heroBanners, setHeroBanners] = useState<HomeHeroBanner[]>([]);
    const [homeReels, setHomeReels] = useState<HomeReel[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const reelsSliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      api.getHomeHeroBanners().then(setHeroBanners).catch((e) => console.error('Hero banners:', e));
      api.getHomeReels().then(setHomeReels).catch((e) => console.error('Home reels:', e));
    }, []);

    useEffect(() => {
      if (heroBanners.length <= 1) return;
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [heroBanners]);

    const handleHomeContentClick = (item: { productId?: number; category?: string }) => {
      if (item.productId) {
        handleProductClick(item.productId);
        return;
      }
      if (item.category) {
        handleNavigate('shop', item.category);
        return;
      }
      handleNavigate('shop');
    };

    const scrollReels = (direction: 'left' | 'right') => {
      const container = reelsSliderRef.current;
      if (!container) return;
      const cardWidth = container.clientWidth < 768 ? container.clientWidth * 0.78 : 320;
      container.scrollBy({
        left: direction === 'right' ? cardWidth : -cardWidth,
        behavior: 'smooth'
      });
    };

    const reelCards = (homeReels.length > 0 ? homeReels : products.slice(0, 4).map((product, index) => ({
      id: index + 1,
      mediaUrl: product.images?.[0] || product.image,
      mediaType: 'image' as const,
      title: product.name,
      subtitle: product.category,
      priceText: `$${product.price.toFixed(2)}`,
      buttonText: 'Shop Now',
      productId: product.id
    }))).map((reel, index) => {
      const productLink = reel.productLink?.trim();
      const productSlugFromLink = productLink
        ? productLink.replace(/\/+$/, '').split('/').filter(Boolean).pop()?.toLowerCase()
        : '';
      const linkedProduct = reel.productId
        ? products.find((product) => product.id === reel.productId)
        : products.find((product) =>
            Boolean(
              productLink && (
                product.permalink?.toLowerCase() === productLink.toLowerCase() ||
                product.slug?.toLowerCase() === productSlugFromLink
              )
            )
          );
      return {
        ...reel,
        id: reel.id || index + 1,
        mediaType: reel.mediaType || 'video',
        mediaUrl: reel.mediaUrl || linkedProduct?.images?.[0] || linkedProduct?.image || '',
        title: reel.title || linkedProduct?.name || `Reel ${index + 1}`,
        subtitle: reel.subtitle || linkedProduct?.category || reel.category || '',
        priceText: reel.priceText || (linkedProduct ? `$${linkedProduct.price.toFixed(2)}` : ''),
        buttonText: reel.buttonText || 'Shop Now',
        category: reel.category || linkedProduct?.category,
        productId: reel.productId || linkedProduct?.id,
        productLink: reel.productLink || linkedProduct?.permalink
      };
    }).filter((reel) => Boolean(reel.mediaUrl));

    useEffect(() => {
      const container = reelsSliderRef.current;
      if (!container || reelCards.length <= 1) return;

      const interval = window.setInterval(() => {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const cardWidth = container.clientWidth < 768 ? container.clientWidth * 0.78 : 320;
        const nextLeft = container.scrollLeft + cardWidth;

        container.scrollTo({
          left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
          behavior: 'smooth'
        });
      }, 3500);

      return () => window.clearInterval(interval);
    }, [reelCards.length]);

    return (
      <>
        {/* Hero Slider */}
        <div className="relative h-[500px] w-full bg-[#111] overflow-hidden">
          {heroBanners.map((slide, index) => (
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
                <div className="bg-white/10 backdrop-blur-sm border-l-4 border-[#EE6348] px-4 py-2 mb-8 animate-fade-in-up delay-200">
                  <span className="text-xl tracking-wide uppercase">{slide.discount}</span>
                </div>
                <button
                  onClick={() => handleHomeContentClick(slide)}
                  className="bg-[#EE6348] text-white hover:bg-[#EE6348] transition font-bold uppercase px-8 py-3 text-sm tracking-wider shadow-lg animate-fade-in-up delay-300"
                >
                  {slide.buttonText || 'Shop Now'}
                </button>
              </div>
            </div>
          ))}

          {/* Slider Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx === currentSlide ? 'bg-[#EE6348]' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </div>

        {/* Deal of the Day (Replaces Welcome Section) */}
        <DealOfTheDay
          onNavigate={handleNavigate}
          onProductClick={handleProductClick}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
          onQuickView={handleQuickView}
        />

        {/* Categories Grid */}
        <div className="container mx-auto px-4 mb-16 pt-12">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Categories</h3>
            <div className="w-12 h-0.5 bg-[#EE6348] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter(c => !c.parent).map(cat => (
              <div key={cat.id} className="relative group overflow-hidden cursor-pointer aspect-square" onClick={() => handleNavigate('shop', cat.name)}>
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=B8A99A&color=fff&size=400&bold=true`;
                  }}
                />

                {/* White Overlay Scale Animation */}
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out pointer-events-none"></div>

                {/* Title Slide Up Animation - Visible on mobile, hover effect on desktop */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:-translate-y-[40%] lg:group-hover:opacity-100 lg:group-hover:-translate-y-1/2 transition-all duration-300 ease-out z-10 w-full px-2 flex justify-center pointer-events-none">
                  <div className="bg-[#EE6348] text-white font-bold uppercase py-2 px-2 w-full max-w-[90%] md:w-auto md:min-w-[180px] text-center shadow-lg hover:bg-[#EE6348] transition-colors pointer-events-auto text-[10px] sm:text-xs md:text-sm leading-tight line-clamp-2">
                    {cat.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        {bestSellerProducts.length > 0 && (
          <div className="bg-[#B8A99A] py-16 mb-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <h3 className="text-xl font-bold uppercase tracking-widest text-black">Best Sellers</h3>
                <div className="w-12 h-0.5 bg-[#EE6348] mx-auto mt-4"></div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellerProducts.map(product => (
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
        )}

        {/* Shop by Reels */}
        <div className="container mx-auto px-4 mb-16">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Shop by Reels</h3>
            <div className="w-12 h-0.5 bg-[#EE6348] mx-auto mt-4"></div>
          </div>
          <div className="flex items-center justify-end gap-3 mb-6">
            <button
              type="button"
              onClick={() => scrollReels('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#EE6348] hover:bg-[#EE6348] hover:text-white"
              aria-label="Scroll reels left"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollReels('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#EE6348] hover:bg-[#EE6348] hover:text-white"
              aria-label="Scroll reels right"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleNavigate('shop')}
              className="text-sm font-bold uppercase tracking-wider text-[#EE6348] hover:text-black transition"
            >
              View All
            </button>
          </div>

          <div
            ref={reelsSliderRef}
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {reelCards.map((reel, index) => (
              <button
                key={`reel-${reel.id}`}
                type="button"
                onClick={() => handleHomeContentClick(reel)}
                className="group relative min-w-[72%] sm:min-w-[46%] lg:min-w-[23%] overflow-hidden rounded-2xl bg-black text-left aspect-[9/16] shadow-sm snap-start"
              >
                {reel.mediaType === 'video' ? (
                  <video
                    src={reel.mediaUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={reel.mediaUrl}
                    alt={reel.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/80" />

                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                  <Play size={12} fill="currentColor" />
                  Reel {index + 1}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/75">{reel.subtitle}</p>
                  <h4 className="line-clamp-2 text-sm font-bold uppercase leading-5">{reel.title}</h4>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-[#ffd7c8]">{reel.priceText}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] transition group-hover:border-[#EE6348] group-hover:bg-[#EE6348]">
                      {reel.buttonText}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <CustomerReviews key={reviewRefreshKey} />

        <div className="container mx-auto px-4 text-center pt-6 pb-12">
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-[#EE6348] transition"
          >
            Write a Review
          </button>
        </div>

        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (data) => {
            try {
              await api.submitReview(data);
              
              // Save full review locally so it appears immediately (even before admin approval)
              const localReviews = JSON.parse(localStorage.getItem('localReviews') || '[]');
              const newReview = {
                id: Date.now(),
                name: data.authorName || 'Guest',
                email: data.authorEmail || '',
                text: data.text,
                rating: data.rating || 5,
                uploadedImage: data.image || null,
                date: new Date().toISOString()
              };
              
              // Remove any existing review with same email to avoid duplicates
              const filteredReviews = localReviews.filter((r: any) => 
                r.email?.toLowerCase() !== newReview.email.toLowerCase()
              );
              
              filteredReviews.unshift(newReview);
              localStorage.setItem('localReviews', JSON.stringify(filteredReviews));
              
              setToast({ message: 'Thank you! Your review has been submitted and will appear shortly.', visible: true });
              setTimeout(() => setToast((p) => ({ ...p, visible: false })), 4000);
              setShowReviewModal(false);
              
              // Force component remount to show new review
              setReviewRefreshKey(prev => prev + 1);
            } catch (error) {
              console.error('Review submission error:', error);
              setToast({ message: 'Error submitting review. Please try again.', visible: true });
              setTimeout(() => setToast((p) => ({ ...p, visible: false })), 4000);
            }
          }}
        />

      </>
    );
  };

  const ShopView = () => {
    const PAGE_SIZE = 12;
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const filteredLengthRef = useRef(0);

    // Resolve the currently-selected category object and its descendant IDs so we
    // can include products that belong to any subcategory of the selected one.
    const activeCategoryInfo = useMemo(() => {
      if (!currentCategory) return { current: null as Category | null, descendantNames: new Set<string>() };
      const current = categories.find(c => c.name.toLowerCase() === currentCategory.toLowerCase()) || null;
      if (!current) return { current: null, descendantNames: new Set<string>() };
      // Collect current + all descendants by walking the parent tree.
      const descendants = new Set<number>([current.id]);
      let changed = true;
      while (changed) {
        changed = false;
        categories.forEach(c => {
          if (c.parent && descendants.has(c.parent) && !descendants.has(c.id)) {
            descendants.add(c.id);
            changed = true;
          }
        });
      }
      const descendantNames = new Set(
        categories.filter(c => descendants.has(c.id)).map(c => c.name.toLowerCase())
      );
      return { current, descendantNames };
    }, [categories, currentCategory]);

    // Get products for current category (before applying price/attribute filters).
    // A product is shown if ANY of its assigned categories matches the current
    // category or any of its descendants — this is what makes subcategory pages
    // work when a product is only tagged to the subcategory (e.g. "Silk Saree")
    // and the parent ("Saree") displays it too.
    const categoryProducts = useMemo(() => {
      return products.filter(p => {
        if (!currentCategory) return true;
        const productCats = (p.categories && p.categories.length > 0 ? p.categories : [p.category])
          .map(n => n.toLowerCase());
        const names = activeCategoryInfo.descendantNames;
        if (names.size === 0) {
          return productCats.includes(currentCategory.toLowerCase());
        }
        return productCats.some(pc => names.has(pc));
      });
    }, [products, currentCategory, activeCategoryInfo]);

    // Direct subcategories of the current category (used for the in-page grid).
    const subcategories = useMemo(() => {
      if (!activeCategoryInfo.current) return [] as Category[];
      return categories.filter(c => c.parent === activeCategoryInfo.current!.id);
    }, [categories, activeCategoryInfo]);

    // Categories shown in the filter sidebar: direct subcategories of the current
    // category, or top-level categories when the shop page has no category selected.
    const filterCategories = useMemo(() => {
      if (subcategories.length > 0) return subcategories;
      return categories.filter(c => !c.parent);
    }, [categories, subcategories]);

    // Calculate dynamic price range from category products
    const availablePriceRange = useMemo(() => {
      if (categoryProducts.length === 0) return { min: 0, max: 1000 };
      const prices = categoryProducts.map(p => p.price);
      return {
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
      };
    }, [categoryProducts]);

    // Filter attributes to only show those available in current category
    const availableAttributes = useMemo(() => {
      if (categoryProducts.length === 0) return [];
      
      // Collect all unique attributes from category products
      const attrMap = new Map<string, Set<string>>();
      
      categoryProducts.forEach(product => {
        product.attributes?.forEach(attr => {
          if (attr.variation) {
            if (!attrMap.has(attr.name)) {
              attrMap.set(attr.name, new Set());
            }
            attr.options.forEach(opt => attrMap.get(attr.name)?.add(opt));
          }
        });
      });

      // Match with full attribute data from productAttributes
      return productAttributes
        .filter(attr => attrMap.has(attr.name))
        .map(attr => ({
          ...attr,
          terms: attr.terms?.filter((term: any) => 
            attrMap.get(attr.name)?.has(term.name)
          ) || []
        }))
        .filter(attr => attr.terms.length > 0);
    }, [categoryProducts, productAttributes]);

    // When the category changes, snap the price slider to the new category's
    // price range and clear attribute selections that may not apply anymore.
    // Use functional updaters so we return the same reference when nothing
    // actually changed — otherwise we'd schedule an unnecessary re-render
    // every mount (ShopView is redefined inside App), which closes the
    // filter sidebar as soon as the user opens it.
    useEffect(() => {
      setPriceRange(prev =>
        prev[0] === availablePriceRange.min && prev[1] === availablePriceRange.max
          ? prev
          : [availablePriceRange.min, availablePriceRange.max]
      );
      setSelectedFilterAttributes(prev =>
        Object.keys(prev).length === 0 ? prev : {}
      );
    }, [currentCategory, availablePriceRange.min, availablePriceRange.max]);

    const filteredProducts = useMemo(() => {
      return categoryProducts
        .filter(p => {
          if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
          const hasSelectedAttributes = Object.entries(selectedFilterAttributes).every(([attrName, selectedTerms]) => {
            const terms = selectedTerms as string[];
            if (terms.length === 0) return true;
            const productAttr = p.attributes.find(pa => pa.name === attrName);
            if (!productAttr) return false;
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
            case 'date-asc': return new Date(a.date_created || 0).getTime() - new Date(b.date_created || 0).getTime();
            default: return new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime();
          }
        });
    }, [categoryProducts, priceRange, selectedFilterAttributes, sortBy]);

    filteredLengthRef.current = filteredProducts.length;

    // Reset display count when filters change
    useEffect(() => {
      setDisplayCount(PAGE_SIZE);
      setIsLoadingMore(false);
    }, [currentCategory, priceRange, selectedFilterAttributes, sortBy]);

    useEffect(() => {
      const el = loadMoreRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;

          setDisplayCount(prev => {
            const total = filteredLengthRef.current;
            if (prev >= total) return prev;
            setIsLoadingMore(true);
            return Math.min(prev + PAGE_SIZE, total);
          });
        },
        { rootMargin: '300px 0px', threshold: 0.01 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    useEffect(() => {
      if (!isLoadingMore) return;
      const timer = window.setTimeout(() => setIsLoadingMore(false), 250);
      return () => window.clearTimeout(timer);
    }, [isLoadingMore, displayCount]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-xs text-gray-500 mb-6">
          <Home size={12} className="mr-1" />
          <span className="mx-1">/</span>
          <span className="font-bold text-gray-700">Shop</span>
        </div>

        <div className="mb-8 bg-gray-100 py-12 px-6 text-center border-b-4 border-[#EE6348]">
          <h1 className="text-4xl font-bold uppercase font-heading text-gray-800 tracking-wider">{currentCategory || "All Products"}</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>
        </div>

        {/* Filters and Sort in one line */}
        <FilterBar
          categories={filterCategories}
          onCategoryClick={(cat) => handleNavigate('shop', cat)}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          maxPrice={availablePriceRange.max}
          showOutOfStock={showOutOfStock}
          setShowOutOfStock={setShowOutOfStock}
          attributes={availableAttributes}
          selectedAttributes={selectedFilterAttributes}
          toggleAttribute={toggleAttributeFilter}
          onResetFilters={() => {
            setPriceRange([availablePriceRange.min, availablePriceRange.max]);
            setShowOutOfStock(false);
            setSelectedFilterAttributes({});
          }}
          endContent={
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by</span>
              <select
                className="border border-gray-300 p-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#EE6348]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date: New to Old</option>
                <option value="date-asc">Date: Old to New</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          }
        />

        <div className="flex-1">
          {/* Subcategory cards (shown when the current category has children) */}
          {subcategories.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">Shop by Subcategory</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subcategories.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleNavigate('shop', sub.name)}
                    className="group relative overflow-hidden aspect-square border border-gray-200 bg-white hover:border-[#EE6348] transition"
                  >
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=B8A99A&color=fff&size=400&bold=true`;
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">{sub.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid - Full Width */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {filteredProducts.slice(0, displayCount).map(product => (
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
          
          {/* Loading more indicator */}
          {isLoadingMore && displayCount < filteredProducts.length && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin text-[#EE6348] mx-auto" size={32} />
              <p className="text-sm text-gray-500 mt-2">Loading more products...</p>
            </div>
          )}
          
          {/* Sentinel for infinite scroll */}
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
          
          {/* End message */}
          {displayCount >= filteredProducts.length && filteredProducts.length > PAGE_SIZE && (
            <div className="text-center py-8 text-gray-500 text-sm">
              You've reached the end. Showing all {filteredProducts.length} products.
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductView = () => {
    if (!activeProduct) return null;

    const productGallery = activeProduct.images && activeProduct.images.length > 0
      ? activeProduct.images
      : [activeProduct.image];
    const galleryImages = currentVariation?.image?.src
      ? [currentVariation.image.src, ...productGallery.filter(img => img !== currentVariation.image?.src)]
      : productGallery;
    const displayImage = selectedProductImage || galleryImages[0] || activeProduct.image;
    const displayPrice = currentVariation ? currentVariation.price : activeProduct.price;
    const productDescription = getPreferredProductDescription(activeProduct);
    const recentlyViewedProducts = recentlyViewedIds
      .filter(id => id !== activeProduct.id)
      .map(id => products.find(product => product.id === id))
      .filter((product): product is Product => Boolean(product));
    const relatedProducts = products.filter(product => {
      if (product.id === activeProduct.id) return false;
      if (activeProduct.categoryIds?.length && product.categoryIds?.length) {
        return activeProduct.categoryIds.some(categoryId => product.categoryIds?.includes(categoryId));
      }
      if (activeProduct.categories?.length && product.categories?.length) {
        return activeProduct.categories.some(category => product.categories?.includes(category));
      }
      return product.category === activeProduct.category;
    }).slice(0, 8);

    const renderProductSection = (title: string, items: Product[], emptyMessage: string) => (
      <div className="mt-10">
        <h2 className="text-2xl font-bold uppercase font-heading text-gray-800 mb-5">{title}</h2>
        {items.length === 0 ? (
          <div className="border border-gray-100 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(product => (
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
        )}
      </div>
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-xs text-gray-500 mb-8">
          <Home size={12} className="mr-1" cursor="pointer" onClick={() => handleNavigate('home')} />
          <span className="mx-1">/</span>
          <span className="cursor-pointer hover:text-[#EE6348]" onClick={() => handleNavigate('shop', activeProduct.category)}>{activeProduct.category}</span>
          <span className="mx-1">/</span>
          <span className="font-bold text-gray-700">{activeProduct.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 bg-white p-6 border border-gray-100 mb-12">
          {/* Image */}
          <div className="w-full md:w-1/2">
            <div className="border border-gray-200 p-4">
              <img src={displayImage} alt={activeProduct.name} className="w-full h-auto object-contain transition-all duration-300" />
            </div>
            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {galleryImages.map((image, index) => {
                  const isActive = image === displayImage;
                  return (
                    <button
                      key={`${activeProduct.id}-${index}-${image}`}
                      type="button"
                      onClick={() => setSelectedProductImage(image)}
                      className={`border p-1 transition ${isActive ? 'border-[#EE6348]' : 'border-gray-200 hover:border-[#EE6348]'}`}
                    >
                      <img src={image} alt={`${activeProduct.name} ${index + 1}`} className="h-24 w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{activeProduct.name}</h1>
            {productDescription && (
              <div 
                className="text-sm text-gray-500 mb-6 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: productDescription }}
              />
            )}

            <div className="mb-6">
              <span className="text-3xl font-bold text-[#EE6348]">${displayPrice.toFixed(2)}</span>
            </div>

            {/* Variation Selectors */}
            {activeProduct.type === 'variable' && activeProduct.attributes && (
              <div className="mb-6 space-y-4">
                {variationLoading && <div className="text-xs text-[#EE6348]">Loading variations...</div>}

                {activeProduct.attributes.filter(attr => attr.variation).map(attr => (
                  <div key={attr.id} className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">{attr.name}:</label>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((opt, i) => {
                        const isSelected = selectedAttributes[attr.name] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [attr.name]: opt }))}
                            className={`px-4 py-2 text-sm font-medium border rounded transition ${
                              isSelected
                                ? 'bg-[#EE6348] text-white border-[#EE6348]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#EE6348] hover:text-[#EE6348]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(() => {
              const max = resolveMaxQty(activeProduct, currentVariation);
              return max !== null ? (
                <p className={`text-sm font-semibold mb-3 ${max > 0 ? (max <= 3 ? 'text-orange-500' : 'text-green-600') : 'text-red-600'}`}>
                  {max > 0 ? `${max} in stock` : 'Out of stock'}
                </p>
              ) : null;
            })()}

            {(() => {
              const maxStock = resolveMaxQty(activeProduct, currentVariation);
              const isOutOfStock = maxStock !== null && maxStock <= 0;
              
              if (isOutOfStock) {
                return (
                  <div className="mb-8">
                    <button 
                      disabled 
                      className="bg-gray-400 text-white px-10 py-3 font-bold uppercase text-sm cursor-not-allowed flex items-center shadow-md"
                    >
                      <X size={18} className="mr-2" /> Out of Stock
                    </button>
                  </div>
                );
              }

              const atMax = maxStock !== null && productQuantity >= maxStock;
              
              return (
                <div className="flex items-center space-x-4 mb-8">
                  <div className="inline-flex items-center bg-gray-50 rounded-full border border-gray-200">
                    <button
                      onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))}
                      disabled={productQuantity <= 1}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${productQuantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-[#EE6348] hover:text-white'}`}
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <span className="w-12 text-center text-base font-bold text-gray-800 select-none">{productQuantity}</span>
                    <button
                      onClick={() => setProductQuantity(prev => {
                        if (maxStock !== null && prev >= maxStock) {
                          showToast(`Only ${maxStock} available in stock`);
                          return maxStock;
                        }
                        return prev + 1;
                      })}
                      disabled={atMax}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${atMax ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-[#EE6348] hover:text-white'}`}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(activeProduct, { quantity: productQuantity });
                      setProductQuantity(1); // Reset to 1 after adding
                    }}
                    className={`text-white px-8 py-2.5 font-bold uppercase text-sm transition flex items-center ${(activeProduct.type === 'variable' && !currentVariation) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#EE6348] hover:bg-black'
                      }`}
                  >
                    <ShoppingCart size={16} className="mr-2" /> Add to cart
                  </button>
                </div>
              );
            })()}

            <div className="flex space-x-2">
              <button
                onClick={() => toggleWishlist(activeProduct)}
                className={`px-4 py-2 text-xs flex items-center transition ${isInWishlist(activeProduct.id) ? 'bg-[#EE6348] text-white' : 'bg-[#35404f] text-white hover:bg-gray-700'}`}
              >
                <Heart size={12} className="mr-1" fill={isInWishlist(activeProduct.id) ? "currentColor" : "none"} />
                {isInWishlist(activeProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
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

        {recentlyViewedProducts.length > 0 && renderProductSection('Recently Viewed Products', recentlyViewedProducts, 'Products you viewed recently will appear here.')}
        {renderProductSection('Related Products', relatedProducts, 'Related products will appear here once matching items are available.')}
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
          <button onClick={() => handleNavigate('shop')} className="text-[#EE6348] font-bold underline">Go to Shop</button>
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
                        <span className="text-[#EE6348] text-sm font-bold cursor-pointer hover:underline" onClick={() => handleProductClick(item.id)}>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-green-600 font-bold">In Stock</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { addToCart(item); toggleWishlist(item); }}
                          className="bg-[#EE6348] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition"
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
          <button onClick={() => handleNavigate('shop')} className="text-[#EE6348] font-bold underline">Go to Shop</button>
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
                          <span className="text-[#EE6348] text-sm font-bold">{item.name}</span>
                          {item.selectedAttributes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.selectedAttributes).map(([key, val]) => (
                                <span key={key} className="mr-2">{key}: {val}</span>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => removeFromCart(item.id, item.variationId)}
                            className="text-gray-400 hover:text-[#EE6348] text-xs flex items-center mt-1"
                          >
                            <X size={12} className="mr-1" /> Remove
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="p-4">
                        {(() => { const max = getCartItemMax(item); const atMax = max !== null && item.quantity >= max; return (
                        <div className="flex flex-col items-start gap-1">
                          <div className="inline-flex items-center bg-gray-50 rounded-full border border-gray-200">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.variationId, -1)}
                              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#EE6348] hover:text-white transition-all duration-200"
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-gray-800 select-none">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.variationId, 1)}
                              disabled={atMax}
                              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${atMax ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-[#EE6348] hover:text-white'}`}
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                          {max !== null && <span className="text-[10px] text-gray-400 pl-1">{max} available</span>}
                        </div>
                        ); })()}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#EE6348]">${(item.price * item.quantity).toFixed(2)}</td>
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
                        <span className="text-[#EE6348] text-sm font-bold line-clamp-2">{item.name}</span>
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
                    <div className="flex justify-between items-center mt-3">
                      {(() => { const max = getCartItemMax(item); const atMax = max !== null && item.quantity >= max; return (
                      <div className="flex flex-col gap-0.5">
                        <div className="inline-flex items-center bg-gray-50 rounded-full border border-gray-200">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.variationId, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-[#EE6348] hover:text-white transition-all duration-200"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.variationId, 1)}
                            disabled={atMax}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${atMax ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-[#EE6348] hover:text-white'}`}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                        {max !== null && <span className="text-[9px] text-gray-400 text-center">{max} available</span>}
                      </div>
                      ); })()}
                      <span className="text-base font-bold text-[#EE6348]">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button onClick={() => handleNavigate('shop')} className="bg-[#35404f] text-white text-xs font-bold uppercase px-6 py-3 hover:bg-[#EE6348] transition w-full sm:w-auto text-center">Continue Shopping</button>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-gray-50 p-6 border shadow-sm">
              <div className="flex justify-between mb-6 text-lg font-bold text-[#EE6348]">
                <span>Total:</span>
                <span>${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <button
                onClick={handleExpressCheckout}
                disabled={expressLoading}
                className="w-full bg-[#EE6348] text-white font-bold uppercase py-3 hover:bg-black transition rounded-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {expressLoading ? <><Loader2 size={18} className="animate-spin" /> Redirecting…</> : 'Checkout'}
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
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [regCity, setRegCity] = useState('');
    const [regPostcode, setRegPostcode] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const userData = { email: loginEmail, name: loginEmail.split('@')[0] || 'User' };
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('veena_user', JSON.stringify(userData));
      setToast({ message: `Welcome back, ${userData.name}!`, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      handleNavigate('account', 'dashboard');
    };

    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsRegistering(true);
      try {
        const customerData = {
          email: registerEmail,
          first_name: regFirstName,
          last_name: regLastName,
          billing: {
            first_name: regFirstName,
            last_name: regLastName,
            address_1: regAddress,
            city: regCity,
            state: '',
            postcode: regPostcode,
            country: 'IN', // Default to India or detect
            email: registerEmail
          }
        };
        
        await api.registerCustomer(customerData);
        
        setToast({ message: "Registration successful! A link to set your password has been sent to your email.", visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 6000);
        
        // Clear form
        setRegisterEmail('');
        setRegFirstName('');
        setRegLastName('');
        setRegAddress('');
        setRegCity('');
        setRegPostcode('');
        
        // Optionally scroll to top to show login form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        let errorMsg = err.message || "Registration failed. Please try again.";
        if (err.code === 'registration-error-email-exists') {
          errorMsg = "This email is already registered. Please log in using the form on the left!";
        }
        setToast({ message: errorMsg, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
      } finally {
        setIsRegistering(false);
      }
    };

    const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
      if (!credentialResponse.credential) return;
      try {
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        const name = payload.name || payload.email || 'User';
        const email = payload.email || '';
        const picture = payload.picture || '';
        const userData = { name, email, picture };
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('veena_user', JSON.stringify(userData));
        setToast({ message: `Welcome, ${name}!`, visible: true });
        setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
        handleNavigate('account', 'dashboard');
      } catch {
        setToast({ message: 'Google sign-in failed.', visible: true });
        setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
      }
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
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="text-[#EE6348] hover:underline">Lost your password?</a>
              </div>
              <button type="submit" className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm w-full md:w-auto">
                Log In
              </button>
              {googleClientId && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <div className="w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setToast({ message: 'Google sign-in failed. Please try again.', visible: true });
                        setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
                      }}
                      theme="filled_blue"
                      size="large"
                      width="100%"
                      text="continue_with"
                      shape="rectangular"
                    />
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Register Form */}
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold uppercase text-gray-800 mb-6">Register</h2>

            {/* Google Sign Up Button */}
            {googleClientId && (
              <div className="mb-6">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setToast({ message: 'Google sign-up failed. Please try again.', visible: true });
                      setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
                    }}
                    theme="filled_blue"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email address *</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                    placeholder="House number and street name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Town / City *</label>
                    <input
                      type="text"
                      required
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Postcode / ZIP *</label>
                    <input
                      type="text"
                      required
                      value={regPostcode}
                      onChange={(e) => setRegPostcode(e.target.value)}
                      className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#EE6348] transition"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isRegistering}
                className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm w-full flex items-center justify-center disabled:opacity-50"
              >
                {isRegistering ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Register'}
              </button>
              
              <div className="mt-4 text-center md:hidden">
                <p className="text-sm">Already have an account? <button type="button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[#EE6348] font-bold">Login here</button></p>
              </div>
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
        <Loader2 size={48} className="animate-spin text-[#EE6348] mb-4" />
        <p className="uppercase tracking-widest text-xs font-bold">Loading Veena Collections...</p>
      </div>
    );
  }

  const DealView = () => {
    const [dealProducts, setDealProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [saleEndDate, setSaleEndDate] = useState<string | null>(null);

    useEffect(() => {
      const fetchDeals = async () => {
        setLoading(true);
        try {
          const data = await api.getDealProducts();
          setDealProducts(data.products);
          setSaleEndDate(data.saleEndDate);
        } catch (error) {
          console.error("Failed to fetch deal products:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDeals();
    }, []);

    const [dealExpired, setDealExpired] = useState(false);

    useEffect(() => {
      if (!saleEndDate) return;
      const targetDate = new Date(saleEndDate);
      const interval = setInterval(() => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
          setDealExpired(false);
        } else {
          setDealExpired(true);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [saleEndDate]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-[#B8A99A] py-12 px-6 text-center">
          <h1 className="text-4xl font-bold uppercase font-heading text-gray-800 tracking-wider">Deals of the Day</h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Limited time offers on premium collection</p>

          {/* Timer */}
          {saleEndDate && (
            <div className="flex justify-center gap-3 md:gap-6 mt-8">
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.days}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Days</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Mins</span>
              </div>
              <div className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-4 rounded-lg w-20 md:w-28 border border-[#0b141b]/15">
                <span className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider mt-1 font-bold">Secs</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#EE6348]" size={40} />
          </div>
        ) : dealProducts.length > 0 ? (
          <div className={`gap-6 ${
            dealProducts.length === 1 ? 'flex justify-center' :
            dealProducts.length === 2 ? 'grid grid-cols-1 sm:flex sm:justify-center sm:gap-8 lg:gap-12' :
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {dealProducts.map(product => (
              <div key={product.id} className={dealProducts.length <= 2 ? 'w-full sm:max-w-[320px] lg:max-w-[350px]' : ''}>
                <ProductCard
                  product={product}
                  onClick={handleProductClick}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={handleQuickView}
                  isWishlisted={isInWishlist(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No deals available at the moment. Check back later!</p>
            <button onClick={() => handleNavigate('shop')} className="mt-4 text-[#EE6348] font-bold underline">Browse All Products</button>
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
                <Check className="text-[#EE6348] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Premium Collection</h4>
                  <p className="text-sm text-gray-500">Access to designer wear at a fraction of the cost.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="text-[#EE6348] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Hygiene First</h4>
                  <p className="text-sm text-gray-500">Professionally dry-cleaned and sanitized before every rental.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="text-[#EE6348] mt-1 mr-3" size={18} />
                <div>
                  <h4 className="font-bold text-gray-800">Easy Returns</h4>
                  <p className="text-sm text-gray-500">Simple pickup and drop-off process.</p>
                </div>
              </div>
            </div>

            <button className="bg-[#EE6348] text-white font-bold uppercase px-8 py-3 hover:bg-black transition text-sm">
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
        {categories.filter(c => !c.parent).map(cat => (
          <div key={cat.id} className="group cursor-pointer" onClick={() => handleNavigate('shop', cat.name)}>
            <div className="relative overflow-hidden aspect-square mb-3 bg-gray-50 border border-gray-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=B8A99A&color=fff&size=400&bold=true`;
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="bg-white text-[#EE6348] font-bold px-4 py-2 uppercase text-sm tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View</span>
              </div>
            </div>
            <h3 className="text-center font-bold text-gray-800 uppercase tracking-wide group-hover:text-[#EE6348] transition">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans relative">
      <Toast message={toast.message} visible={toast.visible} />

      <Header
        onNavigate={handleNavigate}
        onProductClick={handleProductClick}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        menuItems={menuItems}
        siteLogo={siteLogo || DEFAULT_LOGO}
        siteName={siteInfo.name}
        isLoggedIn={isLoggedIn}
        userFirstName={userFirstName}
      />

      <main className="flex-1 bg-white">
        {view === 'home' && <HomeView />}
        {view === 'shop' && <ShopView />}
        {view === 'categories' && <CategoriesView />}
        {view === 'deal' && <DealView />}
        {view === 'product' && <ProductView />}
        {view === 'cart' && <CartView />}
        {view === 'wishlist' && <WishlistView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'register' && <RegisterView />}
        {view === 'account' && <AccountView />}
        {view === 'page' && <PageView />}
        {view === 'track-order' && <TrackOrderView />}
        {view === 'cookie-policy' && <CookiePolicy onBack={() => handleNavigate('home')} />}
        {view === 'thank-you' && <ThankYouView />}
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
