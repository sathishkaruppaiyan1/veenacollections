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
        <path d="M12.012 2.01a9.988 9.988 0 0 0-9.98 9.98c0 1.765.46 3.447 1.284 4.887l-1.304 4.747 4.856-1.272a9.96 9.96 0 0 0 4.823 1.233H12c5.524 0 10-4.476 10-10 0-5.524-4.476-10-10-10zm5.847 14.241c-.244.686-1.42 1.334-2.008 1.408-.511.085-1.157.108-1.867-.125-.434-.142-.989-.318-1.7-.619-2.983-1.29-4.93-4.29-5.078-4.49-.149-.2-1.21-1.611-1.21-3.071s.766-2.176 1.042-2.476c.276-.3.511-.371.698-.371.185 0 .354.012.492.012.149.006.353-.058.552.428.2.49.691 1.685.753 1.808.062.124.1.267.018.43-.081.161-.124.267-.248.41-.124.143-.261.317-.373.422-.124.124-.255.255-.112.497.143.243 1.264 2.086 2.614 3.284.88.783 1.48 1.758 1.653 2.057.174.298.019.458-.13.607-.137.136-.3.354-.453.527-.149.174-.199.298-.304.497-.106.2-.05.372.025.521.075.149.669 1.612.916 2.207.243.579.488.5.669.51.182.012.378.012.57.012.199 0 .524-.074.795-.373.273-.298 1.04-1.016 1.04-2.479 0-1.463-1.066-2.876-1.214-3.075-.149-.199-2.097-3.2-5.078-4.488-.709-.306-1.262-.489-1.694-.626-.712-.226-1.361-.194-1.872-.118-.571.085-1.759.719-2.006 1.413-.248.695-.248 1.29-.174 1.413.074.124.272.198.57.347z" />
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
                className="flex items-center text-gray-700 hover:text-white transition-all text-sm font-bold mt-4 border-2 border-gray-200 px-6 py-2.5 rounded-full hover:bg-[#f10044] hover:border-[#f10044] shadow-sm uppercase tracking-wider"
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
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-[#f10044] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-200 hover:scale-110"
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
