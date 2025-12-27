import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

const SearchPopup = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { products } = useProducts();

  // 1. Auto-Focus on Open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // 2. Live Filtering Logic
  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();
      
      const filtered = products.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(lowerQuery);
        const categoryMatch = p.category && p.category.toLowerCase().includes(lowerQuery);
        const tagsMatch = p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(lowerQuery));
        
        return nameMatch || categoryMatch || tagsMatch;
      }).slice(0, 5); // Limit to 5 results for clean mobile view

      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      onClose();
      setQuery('');
      setResults([]);
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
    setQuery('');
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-white animate-fade-in flex flex-col">
      <div className="container mx-auto px-6 py-6 flex-1 flex flex-col">
        
        {/* Header: Close Button */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Search Store</span>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="Close search" // ADDED
          >
            <X className="w-6 h-6 text-black group-hover:text-[var(--color-primary)] transition-colors" />
          </button>
        </div>
        
        <div className="max-w-3xl mx-auto w-full">
          
          {/* 3. The Search Input */}
          <form onSubmit={handleSearch} className="relative group mb-6">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for..."
              className="w-full bg-transparent border-b-2 border-gray-200 py-3 pl-8 pr-12 text-lg font-heading font-bold outline-none focus:border-black transition-colors placeholder:text-gray-300 text-black"
              autoComplete="off" 
            />
            <button 
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              aria-label="Submit search" // ADDED
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          {/* 4. Live Results Box */}
          {results.length > 0 ? (
            <div className="bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto animate-fade-up">
              <div className="p-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Top Matches
              </div>
              {results.map((product) => {
                 const thumbnail = product.featuredImageUrl || product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/100';

                 return (
                  <div 
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h4 className="font-heading font-bold text-sm text-black group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase">{product.category}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-black">₹{product.price}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[var(--color-primary)]" />
                    </div>
                  </div>
                 );
              })}
              <button 
                onClick={handleSearch}
                className="w-full py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:bg-gray-50 transition-colors"
              >
                View all results
              </button>
            </div>
          ) : (
            /* Popular Searches (When empty) */
            !query && (
              <div className="mt-8 animate-fade-in">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-4 text-center">Trending Now</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Rudraksha', 'Shiva', 'Mala', 'Bracelet', 'Ring'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        navigate(`/shop?search=${term}`);
                        onClose();
                      }}
                      className="px-5 py-2 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-white hover:bg-black transition-all rounded-full"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
          
          {query.trim().length > 1 && results.length === 0 && (
             <div className="text-center py-8 text-gray-400 text-sm">
                No matches found for "{query}"
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPopup;