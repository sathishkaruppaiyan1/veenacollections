import React, { useState, useEffect } from 'react';
import { Share2, Mail, Facebook, Instagram, Copy, Check } from 'lucide-react';

// WhatsApp Icon component for a more brand-accurate look
const WhatsAppIcon = ({ size = 18, className = "" }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

interface SocialShareProps {
    productUrl: string;
    productName: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ productUrl, productName }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || (navigator.share !== undefined && window.innerWidth < 768));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: productName,
                    text: `Check out ${productName} on Veena Collections!`,
                    url: productUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback if navigator.share fails or isn't supported despite check
            alert("Sharing not supported on this device/browser.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(productUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (isMobile) {
        return (
            <button
                onClick={handleNativeShare}
                className="flex items-center text-gray-700 hover:text-white transition-all text-sm font-bold mt-4 border-2 border-gray-200 px-6 py-2.5 rounded-full hover:bg-[#EE6348] hover:border-[#EE6348] shadow-sm uppercase tracking-wider"
            >
                <Share2 size={18} className="mr-2" /> Share this product
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-3 mt-8 border-t border-gray-100 pt-8">
            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mr-2">Share On</span>

            {/* Email */}
            <a
                href={`mailto:?subject=Check out ${productName}&body=I found this amazing product: ${productUrl}`}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-[#EE6348] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:scale-110"
                title="Share via Email"
            >
                <Mail size={20} />
            </a>

            {/* Facebook */}
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:scale-110"
                title="Share on Facebook"
            >
                <Facebook size={20} />
            </a>

            {/* WhatsApp */}
            <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${productName}: ${productUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:scale-110"
                title="Share on WhatsApp"
            >
                <WhatsAppIcon size={20} />
            </a>

            {/* Instagram (Copy Link) */}
            <button
                onClick={copyToClipboard}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:scale-110 relative group"
                title="Copy Link (for Instagram)"
            >
                {copied ? <Check size={20} /> : <Instagram size={20} />}

                {/* Tooltip for copy feedback */}
                <span className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2.5 py-1.5 rounded transition-all duration-200 shadow-lg ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                    Link Copied!
                </span>
            </button>

        </div>
    );
};
