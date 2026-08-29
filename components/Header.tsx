import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, UserCircle2, Search, Menu, X, ChevronRight, ChevronLeft, Truck, Loader2 } from 'lucide-react';
import { NavItem, Product } from '../types';
import { api } from '../api';

interface HeaderProps {
  onNavigate: (view: any, param?: string) => void;
  onProductClick: (id: number) => void;
  cartCount: number;
  wishlistCount: number;
  menuItems: NavItem[];
  siteLogo?: string;
  siteName?: string;
  isLoggedIn?: boolean;
  userFirstName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onProductClick,
  cartCount,
  wishlistCount,
  menuItems,
  siteLogo,
  siteName = "VEENA COLLECTIONS",
  isLoggedIn = false,
  userFirstName
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const announcements = [
    "Welcome to Veena Collections",
    "Free Shipping on Orders Over $100",
    "New Arrivals Every Week"
  ];
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection('right');
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextAnnouncement = () => {
    setSlideDirection('right');
    setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setSlideDirection('left');
    setCurrentAnnouncementIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    const performSearch = async () => {
      if (debouncedQuery.length > 2) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const results = await api.searchProducts(debouncedQuery);
          if (active) {
            setSearchResults(results);
          }
        } catch (error) {
          console.error("Search error", error);
        } finally {
          if (active) {
            setIsSearching(false);
          }
        }
      } else {
        if (active) {
          setSearchResults([]);
          setShowResults(false);
        }
      }
    };
    performSearch();
    return () => { active = false; };
  }, [debouncedQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="w-full relative">
      {/* Announcement Slider */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-right {
          animation: slideInRight 0.5s ease-out forwards;
        }
        .animate-slide-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }
      `}</style>
      <div className="bg-[#B8A99A] text-white text-xs font-bold py-1.5 border-b border-[#A39486] overflow-hidden">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <button onClick={prevAnnouncement} className="hover:text-gray-200 transition p-1" aria-label="Previous announcement">
            <ChevronLeft size={16} />
          </button>
          <div className="w-64 text-center overflow-hidden">
            <div key={currentAnnouncementIndex} className={`whitespace-nowrap ${slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}>
              {announcements[currentAnnouncementIndex]}
            </div>
          </div>
          <button onClick={nextAnnouncement} className="hover:text-gray-200 transition p-1" aria-label="Next announcement">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {/* Top Bar */}
      <div className="bg-[#0b141b] text-gray-400 text-sm py-2.5 border-b border-gray-800">
        <div className="container mx-auto px-4 flex justify-end items-center">
          <div className="flex items-center space-x-6">
            {isLoggedIn && userFirstName && (
              <button
                onClick={() => onNavigate('account', 'dashboard')}
                className="flex items-center hover:text-white transition"
              >
                <span className="hidden sm:inline">Hello {userFirstName}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('track-order')}
              className="flex items-center hover:text-white transition"
            >
              <Truck size={18} className="mr-1.5" />
              <span className="hidden sm:inline">Track Your Order</span>
            </button>
            {isLoggedIn && (
              <button onClick={() => onNavigate('account', 'dashboard')} className="flex items-center hover:text-white transition">
                <UserCircle2 size={18} className="mr-1.5" />
                <span className="hidden sm:inline">My Account</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('wishlist')}
              className="flex items-center hover:text-white transition group"
            >
              <div className="relative mr-1.5">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#EE6348] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center hover:text-white transition"
              >
                <UserCircle2 size={18} className="mr-1.5" />
                <span className="hidden sm:inline">Log in</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center text-[#EE6348] font-bold hover:text-white transition group"
            >
              <div className="relative mr-1.5">
                <ShoppingCart size={18} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#EE6348] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none border border-[#0b141b]">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[#EE6348]">Shopping cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logo & Search Bar Section */}
      <div className="bg-white py-4 relative z-20 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center justify-between w-full lg:w-auto gap-3 min-w-0">
              {/* Logo */}
              <div
                className="flex items-center cursor-pointer min-w-0"
                onClick={() => onNavigate('home')}
              >
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="h-14 sm:h-20 lg:h-28 mr-2 sm:mr-3 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="relative w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mr-2 sm:mr-3 border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 bg-[#EE6348] text-white font-bold text-lg sm:text-2xl lg:text-3xl font-heading">
                    VC
                  </div>
                )}
                <div className="block min-w-0">
                  <h1 className="text-base sm:text-xl md:text-3xl font-bold text-gray-900 tracking-wide sm:tracking-widest font-heading uppercase truncate">{siteName}</h1>
                  <p className="text-[9px] sm:text-[10px] md:text-sm text-gray-500 tracking-wide sm:tracking-widest uppercase mt-0.5 sm:mt-1 truncate">Premium Quality... Timeless Elegance...</p>
                </div>
              </div>

              {/* Burger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="bg-[#EE6348] hover:bg-black text-white p-2.5 rounded transition duration-300 flex-shrink-0 lg:hidden"
                aria-label="Open Menu"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 w-full lg:flex-1 lg:max-w-xl">
              <div className="relative flex-1" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search store..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-[#EE6348] focus:bg-white transition placeholder-gray-400"
                />
                {isSearching ? (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                    <Loader2 size={16} className="text-[#EE6348] animate-spin" />
                  </div>
                ) : (
                  <Search size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                )}

                {/* Search Results Dropdown */}
                {showResults && isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl rounded-lg z-50 overflow-hidden border border-gray-100">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center p-3 border-b border-gray-50 last:border-none animate-pulse">
                        <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                          <div className="h-3 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showResults && searchResults.length > 0 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-800 shadow-xl rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-100">
                    {searchResults.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition animate-slide-right"
                        style={{ animationDuration: '0.3s' }}
                        onClick={() => {
                          onProductClick(product.id);
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain mr-3 bg-gray-50 rounded" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate text-gray-800">{product.name}</h4>
                          <p className="text-xs text-[#EE6348] font-bold">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showResults && searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-500 text-sm p-4 text-center shadow-xl rounded-lg z-50 border border-gray-100">
                    No products found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu Bar - Desktop Only */}
      <div className="hidden lg:block bg-[#0b141b] shadow-md relative z-10">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center space-x-1">
            <button
              onClick={() => onNavigate('home')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              Categories
            </button>
            <button
              onClick={() => onNavigate('deal')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              Deal of the Day
            </button>
            <button
              onClick={() => onNavigate('page', 'about-us')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate('page', 'contact')}
              className="text-white font-bold uppercase text-sm tracking-wide hover:bg-[#EE6348] transition px-5 py-3"
            >
              Contact
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Modal (Mobile Only) */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div className={`fixed top-0 right-0 z-[70] h-full w-[300px] max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#0f1f2e] text-white">
          <span className="font-bold text-lg uppercase tracking-wider font-heading">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-400 hover:text-[#EE6348] transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">

          <div className="mb-6 lg:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm px-4 py-2 rounded focus:outline-none focus:border-[#EE6348]"
              />
              {isSearching ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                  <Loader2 size={14} className="text-[#EE6348] animate-spin" />
                </div>
              ) : (
                <Search size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
            </div>
            {showResults && isSearching && (
              <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center p-2.5 border-b border-gray-50 last:border-none animate-pulse">
                    <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchResults.length > 0 && !isSearching && (
              <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition animate-slide-right"
                    style={{ animationDuration: '0.3s' }}
                    onClick={() => {
                      onProductClick(product.id);
                      setShowResults(false);
                      setSearchQuery('');
                      setIsMenuOpen(false);
                    }}
                  >
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-contain mr-3 bg-gray-50 rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate text-gray-800">{product.name}</h4>
                      <p className="text-xs text-[#EE6348] font-bold">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
              <div className="mt-2 bg-white text-gray-500 text-sm p-3 text-center rounded-lg border border-gray-100">
                No products found.
              </div>
            )}
          </div>

          <ul className="space-y-1">
            <li>
              <div 
                onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Home</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Shop</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('categories'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Category</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('deal'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Deal of the Day</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('page', 'about-us'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">About Us</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('page', 'contact'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Contact</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('account', 'dashboard'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition border-b border-gray-50"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">My Account</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => { onNavigate('track-order'); setIsMenuOpen(false); }}
                className="flex items-center p-3.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition"
              >
                <span className="font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#EE6348]">Track Order</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
