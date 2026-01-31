import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldAlert } from 'lucide-react';

interface CookieConsentProps {
    onViewPolicy: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onViewPolicy }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Delay appearance for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAction = (type: 'accepted' | 'declined') => {
        localStorage.setItem('cookie-consent', type);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-6xl">
                <div className="bg-white border border-gray-200 shadow-2xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    {/* Accent decoration */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EE6348]"></div>

                    <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-full text-[#EE6348] flex-shrink-0">
                            <Cookie size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                                Cookie Consent <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wide">California Notice</span>
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">
                                We use cookies to enhance your experience, analyze site usage, and support our marketing efforts.
                                California residents have the right to opt-out of the "sale" or "sharing" of their personal information.
                                By clicking "Accept", you agree to our use of cookies as described in our{' '}
                                <button
                                    onClick={onViewPolicy}
                                    className="text-[#EE6348] font-bold hover:underline underline-offset-2"
                                >
                                    Privacy & Cookie Policy
                                </button>.
                            </p>
                            <div className="mt-3 flex items-center space-x-4">
                                <button
                                    onClick={onViewPolicy}
                                    className="text-xs text-blue-600 font-bold hover:underline flex items-center"
                                >
                                    <ShieldAlert size={12} className="mr-1" /> Do Not Sell or Share My Personal Information
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => handleAction('declined')}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 border border-gray-200 rounded transition hover:bg-gray-50 uppercase tracking-wider"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => handleAction('accepted')}
                            className="w-full sm:w-auto px-10 py-2.5 text-sm font-bold text-white bg-[#EE6348] hover:bg-black rounded transition shadow-md shadow-orange-100 uppercase tracking-wider"
                        >
                            Accept All
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 transition"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
