import React from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (id: number) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart, onToggleWishlist, onQuickView, isWishlisted }) => {
  return (
    <div className="group bg-white border border-gray-100 p-4 transition hover:shadow-xl relative overflow-hidden">
      {/* Actions Floating Left - Theme Specific - Visible on mobile, hover-only on desktop */}
      <div className="absolute left-4 top-4 z-10 flex flex-col space-y-2 transition-all duration-300 opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-10 lg:group-hover:opacity-100 lg:group-hover:translate-x-0">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          className="w-10 h-10 bg-[#EE6348] text-white rounded-full flex items-center justify-center hover:bg-black transition shadow-md"
          title="Add to Cart"
        >
          <ShoppingCart size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md ${isWishlisted ? 'bg-black text-[#EE6348]' : 'bg-[#EE6348] text-white hover:bg-black'}`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product); }}
          className="w-10 h-10 bg-[#EE6348] text-white rounded-full flex items-center justify-center hover:bg-black transition shadow-md"
          title="Quick View"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Image */}
      <div
        className="relative h-64 w-full mb-4 cursor-pointer overflow-hidden"
        onClick={() => onClick(product.id)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition duration-700 ease-in-out"
        />
      </div>

      {/* Info */}
      <div className="text-center">
        <h3
          className="text-gray-600 text-sm mb-2 h-10 overflow-hidden cursor-pointer hover:text-[#EE6348] transition"
          onClick={() => onClick(product.id)}
        >
          {product.name}
        </h3>

        <div className="flex justify-center items-center space-x-2 mb-2">
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-bold">${product.oldPrice.toFixed(2)}</span>
          )}
          <span className="text-black font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>

      </div>
    </div>
  );
};