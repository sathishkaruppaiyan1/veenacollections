import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    count: number;
}

interface FilterBarProps {
    categories: Category[];
    onCategoryClick: (category: string) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    showOutOfStock: boolean;
    setShowOutOfStock: (show: boolean) => void;
    attributes: any[];
    selectedAttributes: Record<string, string[]>;
    toggleAttribute: (attrName: string, termSlug: string) => void;
    endContent?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    categories,
    onCategoryClick,
    priceRange,
    setPriceRange,
    showOutOfStock,
    setShowOutOfStock,
    attributes,
    selectedAttributes,
    toggleAttribute,
    endContent
}) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    return (
        <div className="bg-white border-y border-gray-200 py-4 mb-8 sticky top-0 z-40 shadow-sm" ref={dropdownRef}>
            <div className="container mx-auto px-4 flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-gray-700 uppercase mr-2">Filters:</span>

                {/* Categories Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('categories')}
                        className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-full border transition ${activeDropdown === 'categories' ? 'border-[#f10044] text-[#f10044] bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#f10044]'}`}
                    >
                        <span>Categories</span>
                        <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'categories' && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <ul className="max-h-60 overflow-y-auto">
                                {categories.length > 0 ? categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        onClick={() => { onCategoryClick(cat.name); setActiveDropdown(null); }}
                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-600 hover:text-[#f10044] rounded transition"
                                    >
                                        {cat.name} ({cat.count})
                                    </li>
                                )) : (
                                    ['Men', 'Women', 'Accessories'].map((cat, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => { onCategoryClick(cat); setActiveDropdown(null); }}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-600 hover:text-[#f10044] rounded transition"
                                        >
                                            {cat}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Price Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('price')}
                        className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-full border transition ${activeDropdown === 'price' ? 'border-[#f10044] text-[#f10044] bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#f10044]'}`}
                    >
                        <span>Price</span>
                        <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'price' && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between text-sm text-gray-600 mb-4 font-bold">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full accent-[#f10044] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex flex-wrap gap-2 mt-6">
                                <button onClick={() => setPriceRange([0, 50])} className="text-xs border px-3 py-1 rounded-full hover:border-[#f10044] hover:text-[#f10044] transition">Under $50</button>
                                <button onClick={() => setPriceRange([50, 200])} className="text-xs border px-3 py-1 rounded-full hover:border-[#f10044] hover:text-[#f10044] transition">$50 - $200</button>
                                <button onClick={() => setPriceRange([200, 1000])} className="text-xs border px-3 py-1 rounded-full hover:border-[#f10044] hover:text-[#f10044] transition">$200+</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Availability Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('stock')}
                        className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-full border transition ${activeDropdown === 'stock' ? 'border-[#f10044] text-[#f10044] bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#f10044]'}`}
                    >
                        <span>Availability</span>
                        <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'stock' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'stock' && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <label className="flex items-center space-x-3 cursor-pointer text-sm text-gray-700 hover:text-[#f10044] group">
                                <div className={`w-5 h-5 border rounded flex items-center justify-center transition ${showOutOfStock ? 'bg-[#f10044] border-[#f10044]' : 'border-gray-300 group-hover:border-[#f10044]'}`}>
                                    {showOutOfStock && <Check size={12} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={showOutOfStock}
                                    onChange={() => setShowOutOfStock(!showOutOfStock)}
                                    className="hidden"
                                />
                                <span>Show Out of Stock</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Dynamic Attributes Dropdowns */}
                {attributes.map(attr => (
                    <div className="relative" key={attr.id}>
                        <button
                            onClick={() => toggleDropdown(attr.name)}
                            className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-full border transition ${activeDropdown === attr.name ? 'border-[#f10044] text-[#f10044] bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#f10044]'}`}
                        >
                            <span>{attr.name}</span>
                            <ChevronDown size={14} className={`transition-transform ${activeDropdown === attr.name ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === attr.name && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex flex-wrap gap-2">
                                    {attr.terms && attr.terms.map((term: any) => {
                                        const isSelected = selectedAttributes[attr.name]?.includes(term.slug);

                                        // Color Swatches
                                        if (attr.name.toLowerCase() === 'color') {
                                            return (
                                                <div
                                                    key={term.id}
                                                    onClick={() => toggleAttribute(attr.name, term.slug)}
                                                    className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center relative transition-transform hover:scale-110 ${isSelected ? 'border-[#f10044] ring-1 ring-offset-2 ring-[#f10044]' : 'border-gray-200'}`}
                                                    style={{ backgroundColor: term.name.toLowerCase() }}
                                                    title={term.name}
                                                >
                                                    {isSelected && <Check size={12} className="text-white drop-shadow-md" />}
                                                </div>
                                            );
                                        }

                                        // Standard Buttons
                                        return (
                                            <button
                                                key={term.id}
                                                onClick={() => toggleAttribute(attr.name, term.slug)}
                                                className={`text-xs px-3 py-1.5 rounded border transition ${isSelected ? 'bg-[#f10044] text-white border-[#f10044]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#f10044] hover:text-[#f10044]'}`}
                                            >
                                                {term.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {endContent && <div className="ml-auto flex items-center gap-4 flex-shrink-0">{endContent}</div>}

                {/* Reset Filters (optional visual cue) */}
                {(priceRange[0] > 0 || priceRange[1] < 1000 || showOutOfStock || Object.values(selectedAttributes).some(v => (v as string[]).length > 0)) && (
                    <button
                        onClick={() => {
                            setPriceRange([0, 1000]);
                            setShowOutOfStock(false);
                            // Note: Ideally we'd have a resetAttributes function passed down, or just handle it in parent
                        }}
                        className="text-xs text-gray-400 hover:text-[#f10044] underline ml-auto"
                    >
                        Clear Filters
                    </button>
                )}

            </div>
        </div>
    );
};
