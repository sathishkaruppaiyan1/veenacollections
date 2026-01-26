import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, User, Search, Lock, Menu, X, ChevronRight, Truck, Loader2 } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onProductClick,
  cartCount,
  wishlistCount,
  menuItems,
  siteLogo,
  siteName = "VEENA COLLECTIONS",
  isLoggedIn = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      setShowResults(true);
      try {
        const results = await api.searchProducts(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  return (
    <header className="w-full relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* Marquee Bar */}
      <div className="bg-[#f10044] text-white text-xs font-bold py-1.5 overflow-hidden border-b border-[#d1003a]">
        <div className="whitespace-nowrap animate-marquee inline-block">
          Welcome to Veena Collections &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; Welcome to Veena Collections &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; Welcome to Veena Collections
        </div>
      </div>
      {/* Top Bar */}
      <div className="bg-[#0b141b] text-gray-400 text-xs py-2 border-b border-gray-800">
        <div className="container mx-auto px-4 flex justify-end items-center">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('track-order')}
              className="flex items-center hover:text-white transition"
            >
              <Truck size={14} className="mr-1" />
              <span className="hidden sm:inline">Track Your Order</span>
            </button>
            {isLoggedIn && (
              <button onClick={() => onNavigate('account', 'dashboard')} className="flex items-center hover:text-white transition">
                <User size={14} className="mr-1" />
                <span className="hidden sm:inline">My Account</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('wishlist')}
              className="flex items-center hover:text-white transition group"
            >
              <div className="relative">
                <Heart size={14} className="mr-1" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 left-2 bg-[#e31e24] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none">
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
                <Lock size={14} className="mr-1" />
                <span className="hidden sm:inline">Log in</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center text-[#e31e24] font-bold hover:text-red-400 transition group"
            >
              <div className="relative">
                <ShoppingCart size={14} className="mr-1 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 left-2 bg-[#e31e24] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none border border-[#0b141b]">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[#e31e24]">Shopping cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="bg-[#0f1f2e] py-4 shadow-lg relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            {/* Left Section: Logo & Desktop Menu */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 xl:gap-10">
              {/* Logo */}
              <div
                className="flex items-center justify-between lg:justify-start cursor-pointer"
                onClick={() => onNavigate('home')}
              >
                <div className="flex items-center">
                  {siteLogo ? (
                    <img src={siteLogo} alt={siteName} className="h-16 lg:h-24 mr-3 object-contain" />
                  ) : (
                    <div className="relative w-16 h-16 lg:w-24 lg:h-24 mr-3 border-2 border-white rounded-full flex items-center justify-center flex-shrink-0 bg-[#e31e24] text-white font-bold text-xl lg:text-2xl font-heading">
                      VC
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-white tracking-widest font-heading uppercase">{siteName}</h1>
                    <p className="text-[10px] text-gray-400 tracking-widest uppercase">Designed to Dazzle, Premium Quality.. Timeless Elegance</p>
                  </div>
                </div>
              </div>

              {/* Desktop Menu Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-white font-bold uppercase text-sm tracking-wide hover:text-[#e31e24] transition border-b-2 border-transparent hover:border-[#e31e24] pb-1"
                >
                  Shop
                </button>
                <button
                  onClick={() => onNavigate('categories')}
                  className="text-white font-bold uppercase text-sm tracking-wide hover:text-[#e31e24] transition border-b-2 border-transparent hover:border-[#e31e24] pb-1"
                >
                  Categories
                </button>
                <button
                  onClick={() => onNavigate('deal')}
                  className="text-white font-bold uppercase text-sm tracking-wide hover:text-[#e31e24] transition border-b-2 border-transparent hover:border-[#e31e24] pb-1"
                >
                  Deal of the Day
                </button>
                <button
                  onClick={() => onNavigate('rent')}
                  className="text-white font-bold uppercase text-sm tracking-wide hover:text-[#e31e24] transition border-b-2 border-transparent hover:border-[#e31e24] pb-1"
                >
                  Rent Me
                </button>
              </nav>
            </div>

            {/* Right Section: Search Bar & Burger Menu (Mobile Only) */}
            <div className="flex items-center gap-3 w-full lg:w-auto lg:flex-1 lg:justify-end lg:max-w-md">
              {/* Search Bar */}
              <div className="relative flex-1" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search store..."
                  className="w-full bg-transparent border border-gray-600 text-gray-300 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-[#e31e24] transition placeholder-gray-500"
                />
                {isSearching ? (
                  <Loader2 size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#e31e24] animate-spin" />
                ) : (
                  <Search size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#e31e24]" />
                )}

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-800 shadow-xl rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-100">
                    {searchResults.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition"
                        onClick={() => {
                          onProductClick(product.id);
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                      >
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain mr-3 bg-gray-50 rounded" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                          <p className="text-xs text-[#f10044] font-bold">${product.price.toFixed(2)}</p>
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

              {/* Burger Menu Button - HIDDEN on Desktop (lg:hidden) */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="bg-[#e31e24] hover:bg-white hover:text-[#e31e24] text-white p-2.5 rounded transition duration-300 flex-shrink-0 lg:hidden"
                aria-label="Open Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
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
            className="text-gray-400 hover:text-[#e31e24] transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">

          <div className="mb-6 lg:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm px-4 py-2 rounded focus:outline-none focus:border-[#e31e24]"
              />
              <Search size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pages</h3>
            <ul className="space-y-2">
              <li onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer font-semibold text-gray-700">Home</li>
              <li onClick={() => { onNavigate('cart'); setIsMenuOpen(false); }} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer font-semibold text-gray-700">Cart</li>
              <li onClick={() => { onNavigate('page', 'contact'); setIsMenuOpen(false); }} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer font-semibold text-gray-700">Contact</li>
              <li onClick={() => { onNavigate('page', 'about-us'); setIsMenuOpen(false); }} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer font-semibold text-gray-700">About</li>
            </ul>
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <div
                  onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition border border-transparent hover:border-gray-100"
                >
                  <span className="font-semibold text-gray-700 group-hover:text-[#e31e24] transition">{item.label}</span>
                  {item.hasSubmenu && <ChevronRight size={16} className="text-gray-300 group-hover:text-[#e31e24]" />}
                </div>
              </li>
            ))}
            {menuItems.length === 0 && ['Men', 'Women', 'Accessories', 'Watches', 'Jewelry'].map((item, idx) => (
              <li key={idx}>
                <div onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition">
                  <span className="font-semibold text-gray-700 group-hover:text-[#e31e24]">{item}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">My Account</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li onClick={() => { onNavigate('account', 'dashboard'); setIsMenuOpen(false); }} className="cursor-pointer hover:text-[#e31e24] flex items-center"><User size={14} className="mr-2" /> Dashboard</li>
              <li onClick={() => { onNavigate('account', 'orders'); setIsMenuOpen(false); }} className="cursor-pointer hover:text-[#e31e24] flex items-center"><ShoppingCart size={14} className="mr-2" /> Orders</li>
              <li onClick={() => { onNavigate('wishlist'); setIsMenuOpen(false); }} className="cursor-pointer hover:text-[#e31e24] flex items-center"><Heart size={14} className="mr-2" /> Wishlist</li>
              <li onClick={() => { onNavigate('track-order'); setIsMenuOpen(false); }} className="cursor-pointer hover:text-[#e31e24] flex items-center"><Truck size={14} className="mr-2" /> Track Order</li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};