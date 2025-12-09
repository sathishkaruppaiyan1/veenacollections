import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  categories: Category[];
}

export const Sidebar: React.FC<SidebarProps> = ({ categories }) => {
  return (
    <div className="w-full lg:w-1/4 space-y-8">
      {/* Categories Widget */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-[#e31e24] text-white font-bold uppercase py-3 px-4 flex justify-between items-center">
          <span>Categories</span>
          <span className="text-xs">▼</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {categories.map((item) => (
            <li key={item.id} className="group flex items-center px-4 py-3 text-sm text-gray-600 hover:text-[#e31e24] cursor-pointer transition">
              <ChevronRight size={14} className="mr-2 text-gray-300 group-hover:text-[#e31e24]" />
              {item.name}
            </li>
          ))}
          {/* Fallback Static Items if API returns empty during dev */}
          {categories.length === 0 && ['Men', 'Women', 'Pocket'].map((item, idx) => (
             <li key={`static-${idx}`} className="group flex items-center px-4 py-3 text-sm text-gray-600 hover:text-[#e31e24] cursor-pointer transition">
             <ChevronRight size={14} className="mr-2 text-gray-300 group-hover:text-[#e31e24]" />
             {item}
           </li>
          ))}
        </ul>
      </div>

       {/* Popular Tags Widget */}
       <div className="border border-gray-200 bg-white">
        <div className="bg-[#e31e24] text-white font-bold uppercase py-3 px-4 flex justify-between items-center">
          <span>Popular Tags</span>
          <span className="text-xs">▼</span>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {['apparel', 'awesome', 'beautiful', 'black', 'cool', 'digital', 'golden', 'luxurious', 'nice', 'vintage'].map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-500 hover:text-[#e31e24] cursor-pointer transition border border-gray-200 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};