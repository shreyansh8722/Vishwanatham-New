import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, onPriceChange, onClear, mobile }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    material: true,
    purpose: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Define your available options here
  const categories = ["Rudraksha", "Gemstones", "Yantra", "Mala", "Idols", "Incense"];
  const materials = ["Gold", "Silver", "Copper", "Wood", "Crystal", "Stone"];
  const purposes = ["Meditation", "Wealth", "Health", "Protection", "Relationships"];

  return (
    <div className={`h-full bg-white ${mobile ? '' : 'sticky top-32'}`}>
      {!mobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
           <h3 className="font-heading font-bold text-xl text-black">Filters</h3>
           <button onClick={onClear} className="text-[10px] font-bold uppercase text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
        </div>
      )}

      <div className="space-y-8">
        
        {/* PRICE FILTER */}
        <div className="border-b border-gray-100 pb-6">
          <button onClick={() => toggleSection('price')} className="flex justify-between items-center w-full mb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-black">Price Range</span>
            {expandedSections.price ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
          </button>
          
          {expandedSections.price && (
            <div className="animate-fade-in px-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-4 font-body">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="500"
                value={filters.priceRange[1]}
                onChange={(e) => onPriceChange([filters.priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          )}
        </div>

        {/* CATEGORY FILTER */}
        <div className="border-b border-gray-100 pb-6">
          <button onClick={() => toggleSection('category')} className="flex justify-between items-center w-full mb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-black">Category</span>
            {expandedSections.category ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
          </button>
          
          {expandedSections.category && (
            <div className="space-y-3 animate-fade-in">
              {categories.map(cat => {
                const isChecked = filters.categories.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${isChecked ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                       {isChecked && <Check size={10} className="text-white" />}
                       <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isChecked}
                          onChange={() => onFilterChange('categories', cat)}
                       />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-black font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                       {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* MATERIAL FILTER */}
        <div className="border-b border-gray-100 pb-6">
          <button onClick={() => toggleSection('material')} className="flex justify-between items-center w-full mb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-black">Material</span>
            {expandedSections.material ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
          </button>
          
          {expandedSections.material && (
            <div className="space-y-3 animate-fade-in">
              {materials.map(mat => {
                const isChecked = filters.materials.includes(mat);
                return (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${isChecked ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                       {isChecked && <Check size={10} className="text-white" />}
                       <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isChecked}
                          onChange={() => onFilterChange('materials', mat)}
                       />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-black font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                       {mat}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FilterSidebar;