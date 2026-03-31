import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star } from 'lucide-react';
import { Product, Variation } from '../types';
import { api } from '../api';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, opts?: { variation: Variation | null; selectedAttributes?: Record<string, string> }) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationLoading, setVariationLoading] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [currentVariation, setCurrentVariation] = useState<Variation | null>(null);

  // Fetch variations when modal opens with a variable product
  useEffect(() => {
    if (!isOpen || !product) return;
    setSelectedAttributes({});
    setCurrentVariation(null);
    setVariations([]);
    if (product.type === 'variable') {
      setVariationLoading(true);
      api.getProductVariations(product.id)
        .then(setVariations)
        .catch((e) => console.error('QuickView variations:', e))
        .finally(() => setVariationLoading(false));
    }
  }, [isOpen, product?.id, product?.type]);

  // Find matching variation from selected attributes
  useEffect(() => {
    if (!product || product.type !== 'variable' || variations.length === 0) return;
    const variationAttrs = product.attributes?.filter((a) => a.variation) || [];
    const allSelected = variationAttrs.every((a) => selectedAttributes[a.name]);
    if (!allSelected) {
      setCurrentVariation(null);
      return;
    }
    const match = variations.find((v) =>
      v.attributes.every((va) => selectedAttributes[va.name] === va.option)
    );
    setCurrentVariation(match || null);
  }, [selectedAttributes, variations, product]);

  if (!isOpen || !product) return null;

  const displayImage = currentVariation?.image?.src || product.image;
  const displayPrice = currentVariation ? currentVariation.price : product.price;
  const displayOldPrice = currentVariation?.regular_price ?? product.oldPrice;
  const variationAttrs = product.attributes?.filter((a) => a.variation) || [];
  const isVariable = product.type === 'variable';
  const canAddToCart = !isVariable || !!currentVariation;
  const hasMeaningfulHtml = (html?: string) =>
    Boolean(html && html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim());
  const productDescription = hasMeaningfulHtml(product.description)
    ? product.description!
    : hasMeaningfulHtml(product.short_description)
      ? product.short_description!
      : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:bg-[#EE6348] hover:text-white hover:border-[#EE6348] transition-all duration-200"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
            <img
              src={displayImage}
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
                  <Star key={i} size={16} fill={i < product.rating ? 'currentColor' : 'none'} className={i < product.rating ? '' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">({product.rating} Reviews)</span>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              {displayOldPrice != null && <span className="text-gray-400 line-through text-lg">${displayOldPrice.toFixed(2)}</span>}
              <span className="text-2xl font-bold text-[#EE6348]">${displayPrice.toFixed(2)}</span>
            </div>

            {/* Variation selectors: Size, Color, etc. */}
            {isVariable && variationAttrs.length > 0 && (
              <div className="mb-6 space-y-4">
                {variationLoading && <div className="text-xs text-[#EE6348]">Loading options…</div>}
                {variationAttrs.map((attr) => (
                  <div key={attr.id} className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-2">{attr.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((opt, i) => {
                        const isSelected = selectedAttributes[attr.name] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedAttributes((s) => ({ ...s, [attr.name]: opt }))}
                            className={`px-4 py-2 text-sm font-medium border rounded transition ${
                              isSelected
                                ? 'bg-[#EE6348] text-white border-[#EE6348]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#EE6348] hover:text-[#EE6348]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {productDescription && (
              <div
                className="text-gray-600 mb-8 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: productDescription }}
              />
            )}

            <button
              onClick={() => {
                if (isVariable && currentVariation) {
                  onAddToCart(product, { variation: currentVariation, selectedAttributes });
                } else if (!isVariable) {
                  onAddToCart(product);
                }
                onClose();
              }}
              disabled={!canAddToCart}
              className={`bg-[#EE6348] text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 w-full md:w-auto transition ${
                canAddToCart ? 'hover:bg-black' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={20} />
              <span>{canAddToCart ? 'Add to Cart' : 'Select options'}</span>
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
