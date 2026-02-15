import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, ChevronDown } from 'lucide-react';

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
    onResetFilters?: () => void;
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
    onResetFilters,
    endContent
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        categories: true,
        price: true,
        availability: false,
    });

    const toggleSection = (name: string) => {
        setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const activeFilterCount = Object.values(selectedAttributes).reduce((sum, v) => sum + (v as string[]).length, 0)
        + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0)
        + (showOutOfStock ? 1 : 0);

    return (
        <>
            {/* Toolbar: Filter button + Sort */}
            <div className="bg-white border-y border-gray-200 py-3 mb-8 sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700 border border-gray-300 px-4 py-2 hover:border-[#EE6348] hover:text-[#EE6348] transition"
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-[#EE6348] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {endContent && <div className="flex items-center gap-4">{endContent}</div>}
                </div>
            </div>

            {/* Overlay */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Offcanvas Sidebar */}
            <div className={`fixed top-0 left-0 z-[70] h-full w-[320px] max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#0f1f2e] text-white">
                    <span className="font-bold text-lg uppercase tracking-wider">Filters</span>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#EE6348] transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="overflow-y-auto h-[calc(100%-130px)] p-5 space-y-6">

                    {/* Categories */}
                    <div>
                        <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full text-sm font-bold text-gray-800 uppercase tracking-widest mb-3">
                            Categories
                            <ChevronDown size={14} className={`transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.categories && (
                            <ul className="space-y-1 max-h-48 overflow-y-auto">
                                {categories.length > 0 ? categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        onClick={() => { onCategoryClick(cat.name); setIsOpen(false); }}
                                        className="px-3 py-2 text-sm text-gray-600 hover:text-[#EE6348] hover:bg-gray-50 rounded cursor-pointer transition flex justify-between"
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-xs text-gray-400">({cat.count})</span>
                                    </li>
                                )) : (
                                    ['Men', 'Women', 'Accessories'].map((cat, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => { onCategoryClick(cat); setIsOpen(false); }}
                                            className="px-3 py-2 text-sm text-gray-600 hover:text-[#EE6348] hover:bg-gray-50 rounded cursor-pointer transition"
                                        >
                                            {cat}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Price */}
                    <div>
                        <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full text-sm font-bold text-gray-800 uppercase tracking-widest mb-3">
                            Price
                            <ChevronDown size={14} className={`transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.price && (
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3 font-bold">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-[#EE6348] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button onClick={() => setPriceRange([0, 50])} className="text-xs border px-3 py-1.5 rounded hover:border-[#EE6348] hover:text-[#EE6348] transition">Under $50</button>
                                    <button onClick={() => setPriceRange([50, 200])} className="text-xs border px-3 py-1.5 rounded hover:border-[#EE6348] hover:text-[#EE6348] transition">$50 - $200</button>
                                    <button onClick={() => setPriceRange([200, 1000])} className="text-xs border px-3 py-1.5 rounded hover:border-[#EE6348] hover:text-[#EE6348] transition">$200+</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Availability */}
                    <div>
                        <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full text-sm font-bold text-gray-800 uppercase tracking-widest mb-3">
                            Availability
                            <ChevronDown size={14} className={`transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.availability && (
                            <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 hover:text-[#EE6348] group px-1">
                                <div className={`w-5 h-5 border rounded flex items-center justify-center transition ${showOutOfStock ? 'bg-[#EE6348] border-[#EE6348]' : 'border-gray-300 group-hover:border-[#EE6348]'}`}>
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
                        )}
                    </div>

                    {/* Dynamic Attribute Filters */}
                    {attributes.map(attr => {
                        const sectionKey = `attr_${attr.id}`;
                        const isExpanded = expandedSections[sectionKey] !== false; // default open
                        return (
                            <div key={attr.id}>
                                <div className="border-t border-gray-100 mb-6" />
                                <button onClick={() => toggleSection(sectionKey)} className="flex items-center justify-between w-full text-sm font-bold text-gray-800 uppercase tracking-widest mb-3">
                                    {attr.name}
                                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isExpanded && attr.terms && (
                                    <div className="flex flex-wrap gap-2">
                                        {attr.terms.map((term: any) => {
                                            const isSelected = selectedAttributes[attr.name]?.includes(term.slug);

                                            if (attr.name.toLowerCase() === 'color') {
                                                return (
                                                    <div
                                                        key={term.id}
                                                        onClick={() => toggleAttribute(attr.name, term.slug)}
                                                        className={`w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${isSelected ? 'border-[#EE6348] ring-1 ring-offset-2 ring-[#EE6348]' : 'border-gray-200'}`}
                                                        style={{ backgroundColor: term.name.toLowerCase() }}
                                                        title={term.name}
                                                    >
                                                        {isSelected && <Check size={12} className="text-white drop-shadow-md" />}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={term.id}
                                                    onClick={() => toggleAttribute(attr.name, term.slug)}
                                                    className={`text-xs px-3 py-1.5 rounded border transition ${isSelected ? 'bg-[#EE6348] text-white border-[#EE6348]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#EE6348] hover:text-[#EE6348]'}`}
                                                >
                                                    {term.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white flex gap-3">
                    {onResetFilters && (
                        <button
                            onClick={() => { onResetFilters(); }}
                            className="flex-1 border border-gray-300 text-gray-700 font-bold uppercase py-2.5 text-sm hover:bg-gray-50 transition"
                        >
                            Clear All
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 bg-[#EE6348] text-white font-bold uppercase py-2.5 text-sm hover:bg-[#d4533a] transition"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </>
    );
};
