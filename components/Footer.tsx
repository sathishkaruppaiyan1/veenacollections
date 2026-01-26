import React, { useState } from 'react';
import { Facebook, Instagram, ChevronDown, Loader2, Mail } from 'lucide-react';
import { ViewState } from '../types';
import { api } from '../api';

interface FooterProps {
  onNavigate: (view: ViewState, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterError, setNewsletterError] = useState('');

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;
    setNewsletterError('');
    setNewsletterStatus('loading');
    try {
      await api.subscribeNewsletter(email);
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterError((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="bg-[#0f1f2e] text-white mt-auto">
      {/* Newsletter Strip - Visual match to theme */}
      <div className="bg-[#e31e24] py-8 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 border-l-4 border-white pl-4">
            <h3 className="text-xl font-bold uppercase tracking-wide">Newsletter</h3>
          </div>
          {newsletterStatus === 'success' ? (
            <p className="flex-1 max-w-xl mx-auto md:px-8 text-white font-semibold text-center md:text-left flex items-center justify-center gap-2">
              <Mail size={20} className="flex-shrink-0" />
              Thank you! You are now subscribed to Veena Collections updates and exclusive offers.
            </p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex-1 max-w-xl mx-auto w-full md:px-8">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email here..."
                  className="flex-1 px-4 py-2 text-gray-800 text-sm focus:outline-none rounded-l-sm sm:rounded-r-none rounded"
                  disabled={newsletterStatus === 'loading'}
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-white text-[#e31e24] font-bold px-6 py-2 text-sm uppercase rounded-r-sm rounded-l-sm sm:rounded-l-none flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-70"
                >
                  {newsletterStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <><span className="mr-2">✉</span> Subscribe</>}
                </button>
              </div>
              {newsletterError && <p className="text-sm text-white/90 mt-2">{newsletterError}</p>}
            </form>
          )}
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
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('track-order')}>› Track Your Order</li>
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
                <li className="hover:text-[#e31e24] transition text-gray-400">Email: theveenacollections@gmail.com</li>
                <li className="hover:text-[#e31e24] transition text-gray-400">Whatsapp: (909) 913-2080 only</li>
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
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'rental-policy')}>› Rental Policy</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('page', 'privacy-policy')}>› Privacy Policy</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('cookie-policy')}>› Cookie Policy</li>
                <li className="hover:text-[#e31e24] cursor-pointer transition" onClick={() => onNavigate('cookie-policy')}>› Do Not Sell My Info</li>
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