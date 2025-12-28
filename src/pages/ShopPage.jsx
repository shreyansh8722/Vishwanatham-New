import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import { Filter, ChevronRight, Loader2, X } from 'lucide-react';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // --- FILTER STATE ---
  // We lift the state up here so we can filter the products array
  const [filters, setFilters] = useState({
    priceRange: [0, 50000], // Default range
    categories: [],
    materials: [],
    purposes: []
  });

  // 1. Sync URL Category with Filters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({ ...prev, categories: [categoryParam] }));
    } else {
      // If no URL param, reset category filter (optional, depends on UX preference)
      setFilters(prev => ({ ...prev, categories: [] }));
    }
  }, [searchParams]);

  // 2. FILTERING LOGIC
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // A. Price Check
      const price = Number(product.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // B. Category Check
      if (filters.categories.length > 0) {
        // Loose check: "Rudraksha" matches "Rudraksha Beads" or "Indonesian Rudraksha"
        const productCat = product.category?.toLowerCase() || '';
        const hasMatch = filters.categories.some(cat => productCat.includes(cat.toLowerCase()));
        if (!hasMatch) return false;
      }

      // C. Material Check
      if (filters.materials.length > 0) {
        const productMat = product.material?.toLowerCase() || product.description?.toLowerCase() || '';
        const hasMatch = filters.materials.some(mat => productMat.includes(mat.toLowerCase()));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [products, filters]);

  // 3. SORTING LOGIC
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
       if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
       if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
       if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
       return 0; // Featured (Default)
    });
  }, [filteredProducts, sortBy]);

  // Handlers for Sidebar
  const handleFilterChange = (section, value) => {
     setFilters(prev => {
        const current = prev[section];
        const isSelected = current.includes(value);
        
        if (isSelected) {
           return { ...prev, [section]: current.filter(item => item !== value) };
        } else {
           return { ...prev, [section]: [...current, value] };
        }
     });
  };

  const handlePriceChange = (newRange) => {
     setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 50000],
      categories: [],
      materials: [],
      purposes: []
    });
  };

  if (loading) {
     return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-gray-50 border-b border-gray-100">
         <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-6">
               <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> 
               <ChevronRight size={10} />
               <span className="text-gray-900">Shop</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3">
               Spiritual Artifacts
            </h1>
            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
               Showing {sortedProducts.length} authentic items for your spiritual journey.
            </p>
         </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
         
         {/* SIDEBAR (Desktop) */}
         <div className="hidden md:block w-64 flex-shrink-0">
            <FilterSidebar 
               filters={filters} 
               onFilterChange={handleFilterChange} 
               onPriceChange={handlePriceChange}
               onClear={clearFilters}
            /> 
         </div>

         {/* GRID */}
         <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {sortedProducts.length} Results
               </span>
               
               <div className="flex items-center gap-4">
                  <button 
                    className="md:hidden flex items-center gap-2 text-xs font-bold uppercase"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                     <Filter size={14} /> Filters
                  </button>

                  <div className="flex items-center gap-2">
                     <span className="hidden md:inline text-[10px] font-bold uppercase text-gray-400">Sort by:</span>
                     <select 
                        className="text-xs font-bold border-none bg-transparent outline-none cursor-pointer hover:text-[#B08D55]"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                     >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Grid */}
            {sortedProducts.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {sortedProducts.map((product) => (
                     <ProductCard key={product.id} product={product} />
                  ))}
               </div>
            ) : (
               <div className="py-20 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <h3 className="font-serif text-xl text-gray-400 mb-2">No artifacts found</h3>
                  <button onClick={clearFilters} className="text-[#B08D55] font-bold text-xs uppercase tracking-widest hover:underline">
                     Clear Filters
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
         <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
               <h2 className="font-serif text-2xl font-bold">Filters</h2>
               <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
               <FilterSidebar 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  onPriceChange={handlePriceChange}
                  onClear={clearFilters}
                  mobile={true}
               />
            </div>
            <div className="p-6 border-t border-gray-100">
               <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-4 bg-black text-white font-bold text-sm uppercase tracking-widest rounded shadow-lg"
               >
                  Show {sortedProducts.length} Results
               </button>
            </div>
         </div>
      )}

    </div>
  );
};

export default ShopPage;