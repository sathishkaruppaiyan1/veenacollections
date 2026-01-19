import React from 'react';
import { Shield, Cookie, Info, XCircle, CheckCircle } from 'lucide-react';

interface CookiePolicyProps {
    onBack: () => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
    return (
        <div className="bg-white">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 py-12">
                <div className="container mx-auto px-4 text-center">
                    <Cookie size={48} className="mx-auto text-[#f10044] mb-4" />
                    <h1 className="text-3xl font-bold uppercase font-heading text-gray-800 tracking-tight">California Cookie Policy</h1>
                    <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
                        This policy describes how Veena Collections uses cookies and similar technologies in compliance with the CCPA and CPRA.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto prose prose-red">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Info size={20} className="mr-2 text-[#f10044]" /> 1. Introduction
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            At Veena Collections, we respect your privacy. This Cookie Policy explains how we use cookies, web beacons, pixels, and other tracking technologies on our website. For residents of California, this policy serves as a notice under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Cookie size={20} className="mr-2 text-[#f10044]" /> 2. What are Cookies?
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Shield size={20} className="mr-2 text-[#f10044]" /> 3. How We Use Cookies
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#f10044]">
                                <h3 className="font-bold text-gray-800 mb-2">Essential Cookies</h3>
                                <p className="text-sm text-gray-600">These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                                <h3 className="font-bold text-gray-800 mb-2">Performance and Functionality Cookies</h3>
                                <p className="text-sm text-gray-600">These cookies are used to enhance the performance and functionality of our website but are non-essential to their use.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                                <h3 className="font-bold text-gray-800 mb-2">Analytics and Customization Cookies</h3>
                                <p className="text-sm text-gray-600">These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-yellow-500">
                                <h3 className="font-bold text-gray-800 mb-2">Advertising Cookies</h3>
                                <p className="text-sm text-gray-600">These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12 bg-red-50 p-8 rounded-xl border border-red-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <XCircle size={20} className="mr-2 text-red-600" /> 4. California Resident Rights (CCPA/CPRA)
                        </h2>
                        <p className="text-gray-600 mb-4">
                            If you are a California resident, you have specific rights regarding your personal information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><strong>Right to Know:</strong> You can request that we disclose the categories and specific pieces of personal information we have collected about you.</li>
                            <li><strong>Right to Delete:</strong> You can request that we delete personal information we have collected from you.</li>
                            <li><strong>Right to Opt-Out:</strong> You have the right to opt-out of the "sale" or "sharing" of your personal information for cross-context behavioral advertising.</li>
                            <li><strong>Right to Correct:</strong> You can request that we correct inaccurate personal information that we maintain about you.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <CheckCircle size={20} className="mr-2 text-green-600" /> 5. How to Control Cookies
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('cookie-consent');
                                window.location.reload();
                            }}
                            className="bg-[#f10044] text-white px-6 py-2 rounded font-bold hover:bg-black transition text-sm"
                        >
                            Reset Cookie Preferences
                        </button>
                    </section>

                    <div className="border-t border-gray-100 pt-8 mt-16 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">Last updated: January 19, 2026</p>
                        <button
                            onClick={onBack}
                            className="text-[#f10044] font-bold hover:underline uppercase tracking-widest text-xs"
                        >
                            Back to Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
