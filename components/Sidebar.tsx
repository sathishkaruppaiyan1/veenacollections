import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  categories: Category[];
  onCategoryClick: (category: string) => void;
  // Filters
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  showOutOfStock: boolean;
  setShowOutOfStock: (show: boolean) => void;
  attributes: any[]; // List of attributes with their terms
  selectedAttributes: Record<string, string[]>;
  toggleAttribute: (attrName: string, termSlug: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  onCategoryClick,
  priceRange,
  setPriceRange,
  showOutOfStock,
  setShowOutOfStock,
  attributes,
  selectedAttributes,
  toggleAttribute
}) => {
  return (
    <div className="w-full lg:w-1/4 space-y-8">
      {/* Categories Widget */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-[#EE6348] text-white font-bold uppercase py-3 px-4 flex justify-between items-center">
          <span>Categories</span>
          <span className="text-xs">▼</span>
        </div>
        <ul className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
          {categories.map((item) => (
            <li
              key={item.id}
              className="group flex items-center px-4 py-3 text-sm text-gray-600 hover:text-[#EE6348] cursor-pointer transition"
              onClick={() => onCategoryClick(item.name)}
            >
              <ChevronRight size={14} className="mr-2 text-gray-300 group-hover:text-[#EE6348]" />
              {item.name}
            </li>
          ))}
          {/* Fallback Static Items if API returns empty */}
          {categories.length === 0 && ['Men', 'Women', 'Accessories'].map((item, idx) => (
            <li
              key={`static-${idx}`}
              className="group flex items-center px-4 py-3 text-sm text-gray-600 hover:text-[#EE6348] cursor-pointer transition"
              onClick={() => onCategoryClick(item)}
            >
              <ChevronRight size={14} className="mr-2 text-gray-300 group-hover:text-[#EE6348]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-[#EE6348] text-white font-bold uppercase py-3 px-4">
          <span>Filter by Price</span>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Min: ${priceRange[0]}</span>
            <span>Max: ${priceRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-[#EE6348]"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setPriceRange([0, 50])}
              className="text-xs border px-2 py-1 hover:border-[#EE6348] hover:text-[#EE6348]"
            >Under $50</button>
            <button
              onClick={() => setPriceRange([50, 200])}
              className="text-xs border px-2 py-1 hover:border-[#EE6348] hover:text-[#EE6348]"
            >$50 - $200</button>
            <button
              onClick={() => setPriceRange([200, 1000])}
              className="text-xs border px-2 py-1 hover:border-[#EE6348] hover:text-[#EE6348]"
            >$200+</button>
          </div>
        </div>
      </div>

      {/* Available Stock */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-[#EE6348] text-white font-bold uppercase py-3 px-4">
          <span>Availability</span>
        </div>
        <div className="p-4">
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 hover:text-[#EE6348]">
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={() => setShowOutOfStock(!showOutOfStock)}
              className="accent-[#EE6348]"
            />
            <span>Show Out of Stock Items</span>
          </label>
        </div>
      </div>

      {/* Attribute Filters */}
      {attributes.map(attr => (
        <div key={attr.id} className="border border-gray-200 bg-white">
          <div className="bg-[#EE6348] text-white font-bold uppercase py-3 px-4 flex justify-between items-center">
            <span>{attr.name}</span>
            <span className="text-xs">▼</span>
          </div>
          <div className="p-4 max-h-[200px] overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {attr.terms && attr.terms.map((term: any) => {
                const isSelected = selectedAttributes[attr.name]?.includes(term.slug);

                // Special styling for Color
                if (attr.name.toLowerCase() === 'color') {
                  return (
                    <div
                      key={term.id}
                      onClick={() => toggleAttribute(attr.name, term.slug)}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center relative ${isSelected ? 'border-[#EE6348]' : 'border-gray-200'}`}
                      style={{ backgroundColor: term.name.toLowerCase() }}
                      title={term.name}
                    >
                      {isSelected && <span className="text-white text-xs drop-shadow-md">✓</span>}
                    </div>
                  );
                }

                // Default styling for Size, etc.
                return (
                  <button
                    key={term.id}
                    onClick={() => toggleAttribute(attr.name, term.slug)}
                    className={`text-xs px-3 py-1 border transition ${isSelected ? 'bg-[#EE6348] text-white border-[#EE6348]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#EE6348]'}`}
                  >
                    {term.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Popular Tags Widget */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-[#EE6348] text-white font-bold uppercase py-3 px-4 flex justify-between items-center">
          <span>Popular Tags</span>
          <span className="text-xs">▼</span>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {['apparel', 'awesome', 'beautiful', 'black', 'cool', 'digital', 'golden', 'luxurious', 'nice', 'vintage'].map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-500 hover:text-[#EE6348] cursor-pointer transition border border-gray-200 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};