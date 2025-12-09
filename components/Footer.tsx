import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, ChevronDown } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  // State to manage which footer sections are open on mobile
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="bg-[#0f1f2e] text-white mt-auto">
      {/* Newsletter Strip - Visual match to theme */}
      <div className="bg-[#e31e24] py-8 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 border-l-4 border-white pl-4">
            <h3 className="text-xl font-bold uppercase tracking-wide">Newsletter</h3>
          </div>
          <div className="flex-1 max-w-xl mx-auto flex w-full md:px-8">
             <input 
              type="email" 
              placeholder="Enter your email here..." 
              className="flex-1 px-4 py-2 text-gray-800 text-sm focus:outline-none rounded-l-sm"
            />
            <button className="bg-white text-[#e31e24] font-bold px-6 py-2 text-sm uppercase rounded-r-sm flex items-center hover:bg-gray-100 transition">
              <span className="mr-2">✉</span> Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Widget Areas */}
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8 text-sm">
          {/* Widget 1 - My Account */}
          <div className="border-b border-gray-800 lg:border-none">
            <h4 
              className="font-bold text-lg py-4 lg:py-0 lg:mb-6 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('account')}
            >
              <span className="flex items-center"><span className="text-[#e31e24] mr-2">›</span> MY ACCOUNT</span>
              <ChevronDown className={`lg:hidden transition-transform duration-300 ${openSections['account'] ? 'rotate-180' : ''}`} size={16} />
            </h4>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections['account'] ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mb-0'}`}>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('account', 'dashboard')}>› My Account</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('account', 'orders')}>› Orders</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('account', 'addresses')}>› Addresses</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('cart')}>› Shopping Cart</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('wishlist')}>› Wishlist</li>
              </ul>
            </div>
          </div>

          {/* Widget 2 - Customer Service */}
          <div className="border-b border-gray-800 lg:border-none">
            <h4 
              className="font-bold text-lg py-4 lg:py-0 lg:mb-6 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('service')}
            >
              <span className="flex items-center"><span className="text-[#e31e24] mr-2">›</span> CUSTOMER SERVICE</span>
              <ChevronDown className={`lg:hidden transition-transform duration-300 ${openSections['service'] ? 'rotate-180' : ''}`} size={16} />
            </h4>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections['service'] ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mb-0'}`}>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'sitemap')}>› Sitemap</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('shop')}>› Recently Viewed Products</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('shop')}>› Compare Products List</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('shop')}>› New Products</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'contact')}>› Contact Us</li>
              </ul>
            </div>
          </div>

           {/* Widget 3 - Information */}
           <div className="border-b border-gray-800 lg:border-none">
            <h4 
              className="font-bold text-lg py-4 lg:py-0 lg:mb-6 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('info')}
            >
              <span className="flex items-center"><span className="text-[#e31e24] mr-2">›</span> INFORMATION</span>
              <ChevronDown className={`lg:hidden transition-transform duration-300 ${openSections['info'] ? 'rotate-180' : ''}`} size={16} />
            </h4>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections['info'] ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mb-0'}`}>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'shipping-policy')}>› Shipping Policy</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'refund_returns')}>› Refunds & Returns</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'privacy-policy')}>› Privacy Policy</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'about-us')}>› About Us</li>
              </ul>
            </div>
          </div>

          {/* Widget 4 - Socials & Payments */}
          <div className="border-b border-gray-800 lg:border-none">
            <h4 
              className="font-bold text-lg py-4 lg:py-0 lg:mb-6 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('follow')}
            >
              <span className="flex items-center"><span className="text-[#e31e24] mr-2">›</span> FOLLOW US</span>
              <ChevronDown className={`lg:hidden transition-transform duration-300 ${openSections['follow'] ? 'rotate-180' : ''}`} size={16} />
            </h4>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections['follow'] ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mb-0'}`}>
              <div className="flex space-x-3 mb-8">
                <a href="#" className="w-10 h-10 bg-black flex items-center justify-center hover:bg-[#e31e24] transition rounded-sm">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-black flex items-center justify-center hover:bg-[#e31e24] transition rounded-sm">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-black flex items-center justify-center hover:bg-[#e31e24] transition rounded-sm">
                  <Instagram size={18} />
                </a>
              </div>

              <h4 className="font-bold text-lg mb-4 flex items-center">
                <span className="text-[#e31e24] mr-2">›</span> PAYMENT METHODS
              </h4>
              <div className="flex space-x-2">
                <div className="bg-black px-2 py-1 rounded"><span className="font-bold italic">VISA</span></div>
                <div className="bg-black px-2 py-1 rounded"><span className="font-bold">MasterCard</span></div>
                <div className="bg-black px-2 py-1 rounded"><span className="font-bold text-blue-400 italic">PayPal</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#0b141b] py-6 border-t border-gray-800 text-xs text-gray-500">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Veena Collections. All Rights Reserved Design By Sathish Kruppaiayn</p>
        </div>
      </div>
    </footer>
  );
};