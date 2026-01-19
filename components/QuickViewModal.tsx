import React from 'react';
import { X, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-[400px] w-auto object-contain"
                        />
                    </div>

                    {/* Details */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                        <span className="text-gray-500 text-sm uppercase tracking-wide mb-2">{product.category}</span>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < product.rating ? "currentColor" : "none"} className={i < product.rating ? "" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-gray-400 text-sm">({product.rating} Reviews)</span>
                        </div>

                        <div className="flex items-center space-x-3 mb-6">
                            {product.oldPrice && (
                                <span className="text-gray-400 line-through text-lg">${product.oldPrice.toFixed(2)}</span>
                            )}
                            <span className="text-2xl font-bold text-[#f10044]">${product.price.toFixed(2)}</span>
                        </div>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Experience the quality and elegance of our {product.name}. Perfect for any occasion, crafted with attention to detail and style.
                        </p>

                        <button
                            onClick={() => { onAddToCart(product); onClose(); }}
                            className="bg-[#f10044] text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider hover:bg-black transition flex items-center justify-center space-x-2 w-full md:w-auto"
                        >
                            <ShoppingCart size={20} />
                            <span>Add to Cart</span>
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col space-y-2 text-xs text-gray-500">
                            <p><span className="font-bold text-gray-700">SKU:</span> {product.sku || 'N/A'}</p>
                            <p><span className="font-bold text-gray-700">Category:</span> {product.category}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
