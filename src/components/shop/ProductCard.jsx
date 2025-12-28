import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  // Resolve images
  const imageList = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [product.featuredImageUrl || product.image || 'https://via.placeholder.com/400'];

  const price = Number(product.price) || 0;
  const comparePrice = Number(product.comparePrice) || 0;
  const savings = comparePrice > price ? comparePrice - price : 0;
  const hasReviews = product.reviews && Number(product.reviews) > 0;
  const rating = product.rating || 0;

  return (
    <div className="group relative flex flex-col bg-white p-3 transition-all duration-300 hover:shadow-xl rounded-xl border border-transparent hover:border-gray-200">
      
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg mb-4">
        <Link to={`/product/${product.id}`} className="block w-full h-full relative">
          
          {/* PRIMARY IMAGE */}
          <img
            src={imageList[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />

          {/* SECONDARY IMAGE (Hover) */}
          {imageList.length > 1 && (
            <img
              src={imageList[1]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-white"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badges - Larger & Bolder */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-black text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest font-sans rounded-md shadow-md">
              Bestseller
            </span>
          )}
          {savings > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest shadow-md font-sans rounded-md">
              -{Math.round((savings/comparePrice)*100)}%
            </span>
          )}
        </div>

        {/* ADD TO CART BUTTON - Larger */}
        <button 
           onClick={(e) => { 
             e.preventDefault(); 
             addToCart({ ...product, image: imageList[0] }); 
           }}
           className="absolute bottom-4 right-4 bg-black text-white p-3.5 rounded-full shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-gray-900 z-20 flex items-center justify-center"
           aria-label="Add to Cart"
        >
           <ShoppingBag size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="px-1 text-center font-sans">
        
        {/* Title - Increased to text-lg (18px) */}
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          <Link to={`/product/${product.id}`} className="hover:text-gray-600 transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price & Rating Row */}
        <div className="flex flex-col items-center gap-1.5">
           <div className="flex items-baseline gap-2.5">
              {/* Price - Increased to text-xl (20px) */}
              <span className="text-xl font-extrabold text-black">₹{price.toLocaleString()}</span>
              {comparePrice > price && (
                  <span className="text-sm text-gray-400 line-through font-semibold">₹{comparePrice.toLocaleString()}</span>
              )}
           </div>

           {/* Rating */}
           {hasReviews && (
               <div className="flex items-center gap-1.5 opacity-80">
                    <Star size={14} className="fill-black text-black" strokeWidth={0} />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{rating} ({product.reviews})</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;