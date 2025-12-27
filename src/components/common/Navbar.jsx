import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, ChevronDown, User, Menu, X, MessageCircle, Phone, ChevronRight } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import BrandLogo from './BrandLogo'; 
import NewsletterPopup from './NewsletterPopup';
import SearchPopup from './SearchPopup'; 
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';

const navItems = [
  { 
    label: "Material", 
    path: "/shop",
    hasDropdown: true,
    items: [
      { name: "Rudraksha", link: "/shop?category=Rudraksha" },
      { name: "Crystals", link: "/shop?category=Crystals" },
      { name: "Karungali (Ebony)", link: "/shop?category=Karungali" },
      { name: "Parad (Mercury)", link: "/shop?category=Parad" }
    ]
  },
  { 
    label: "Purpose", 
    path: "/shop",
    hasDropdown: true,
    items: [
      { name: "Wealth (Dhan)", link: "/shop?purpose=Wealth" },
      { name: "Marriage", link: "/shop?purpose=Marriage" },
      { name: "Health", link: "/shop?purpose=Health" },
      { name: "Protection (Raksha)", link: "/shop?purpose=Protection" }
    ]
  },
  { 
    label: "Services", 
    path: "/consult",
    hasDropdown: true,
    items: [
      { name: "Vedic Astrology", link: "/consult?type=Vedic" },
      { name: "Tarot Reading", link: "/consult?type=Tarot" },
      { name: "Numerology", link: "/consult?type=Numerology" }
    ]
  },
  { label: "New Arrivals", path: "/shop?sort=new", hasDropdown: false }
];

const announcements = [
  "Free 5 Mukhi Rudraksha on Prepaid Orders Above ₹499",
  "Consult with India's Top Vedic Astrologers - First Call Free"
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false); 
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { cartItems, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // Rotate Announcements
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- SMART SEARCH LOGIC (Desktop) ---
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowerQuery = searchQuery.toLowerCase();
      
      const filtered = products.filter(p => {
         const name = p.name ? p.name.toLowerCase() : '';
         const cat = p.category ? p.category.toLowerCase() : '';
         return name.includes(lowerQuery) || cat.includes(lowerQuery);
      }).slice(0, 5);

      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, products]);

  // Click Outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <>
      <NewsletterPopup />
      <SearchPopup isOpen={isSearchPopupOpen} onClose={() => setIsSearchPopupOpen(false)} />

      {/* 1. TOP ANNOUNCEMENT STRIP */}
      <div className="bg-black text-white h-[32px] w-full relative overflow-hidden z-[160]">
        <div className="container mx-auto h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAnnouncement}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[11px] font-bold tracking-widest uppercase truncate px-4"
            >
              {announcements[currentAnnouncement]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MAIN NAV BAR */}
      <nav className="sticky top-0 bg-white z-[140] border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center gap-4 md:gap-8">
            
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <button 
                className="md:hidden text-black" 
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <Link to="/" aria-label="Vishwanatham Home">
                <BrandLogo className="h-8 md:h-10 w-auto text-[var(--color-primary)]" />
              </Link>
            </div>

            {/* --- SMART SEARCH BAR (Desktop Only) --- */}
            <div className="hidden md:block flex-grow max-w-xl relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative group">
                <input 
                  type="text" 
                  placeholder="Search for 'Rudraksha', 'Gemstones'..." 
                  className="w-full bg-gray-50 text-black border border-transparent focus:border-gray-300 focus:bg-white rounded-full py-2.5 pl-5 pr-12 text-base transition-all outline-none placeholder:text-gray-400 placeholder:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full text-gray-500 hover:text-[var(--color-primary)] shadow-sm transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </form>

              {/* DROPDOWN RESULTS */}
              <AnimatePresence>
                {showResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b border-gray-100">
                          Products
                        </div>
                        {searchResults.map((product) => {
                           const img = product.featuredImageUrl || product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/80';
                           return (
                             <div 
                               key={product.id}
                               onClick={() => handleProductClick(product.id)}
                               className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                             >
                               <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                                 <img src={img} alt={product.name} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1">
                                 <h4 className="text-sm font-bold text-black group-hover:text-[var(--color-primary)] line-clamp-1">{product.name}</h4>
                                 <p className="text-[10px] text-gray-500 uppercase">{product.category}</p>
                               </div>
                               <span className="text-xs font-bold text-black">₹{product.price}</span>
                               <ChevronRight size={14} className="text-gray-300" />
                             </div>
                           );
                        })}
                        <button 
                          onClick={handleSearchSubmit}
                          className="w-full py-3 text-center text-xs font-bold text-[var(--color-primary)] bg-gray-50 hover:bg-gray-100 uppercase tracking-widest transition-colors"
                        >
                          View All Results
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400 text-sm italic">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              {/* FIXED: Removed nested <button> inside <Link> and applied styles directly to Link */}
              <Link 
                to="/consult" 
                className="hidden lg:flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] hover:text-white transition-all"
                aria-label="Consult with an Astrologer"
              >
                <Phone size={14} /> Consult
              </Link>

              <div className="flex items-center gap-5 text-gray-800">
                 {/* Mobile Search Icon Trigger */}
                 <button 
                   className="md:hidden" 
                   onClick={() => setIsSearchPopupOpen(true)}
                   aria-label="Open search"
                 >
                   <Search size={22} />
                 </button>
                 
                 {/* LINK TO LOGIN PAGE */}
                 <Link 
                   to="/login" 
                   className="hidden md:block hover:text-[var(--color-primary)] transition-colors"
                   aria-label="Login"
                 >
                   <User size={22} strokeWidth={1.5} />
                 </Link>
                 
                 {/* Cart Trigger */}
                 <button 
                   onClick={() => setIsCartOpen(true)} 
                   className="relative hover:text-[var(--color-primary)] transition-colors"
                   aria-label="View cart"
                 >
                   <ShoppingBag size={22} strokeWidth={1.5} />
                   {cartItemCount > 0 && (
                     <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                       {cartItemCount}
                     </span>
                   )}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LOWER ROW: Categories (Desktop Mega Menu) */}
        <div className="hidden md:block border-t border-gray-50">
          <div className="container mx-auto flex justify-center">
            <div className="flex items-center gap-10">
              {navItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group py-3 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-1 text-[13px] font-bold uppercase tracking-widest transition-colors ${
                      hoveredIndex === idx ? 'text-[var(--color-primary)]' : 'text-gray-800'
                    }`}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown size={14} className={`transition-transform duration-200 ${hoveredIndex === idx ? 'rotate-180' : ''}`} />}
                  </Link>
                  <AnimatePresence>
                    {hoveredIndex === idx && item.hasDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-xl z-[145] py-8"
                      >
                        <div className="container mx-auto px-8 grid grid-cols-4 gap-12">
                            <div className="col-span-1">
                                <h4 className="font-heading font-bold text-black mb-4 text-lg">Explore {item.label}</h4>
                                <ul className="space-y-3">
                                  {item.items?.map((subItem, sIdx) => (
                                    <li key={sIdx}>
                                      <Link to={subItem.link} className="text-gray-500 hover:text-[var(--color-primary)] text-sm font-medium transition-colors block">
                                        {subItem.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                            </div>
                            <div className="col-span-1">
                                <h4 className="font-heading font-bold text-black mb-4 text-lg">Featured</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                   <div className="text-xs font-bold text-[var(--color-primary)] mb-1">BESTSELLER</div>
                                   <div className="font-bold text-sm mb-2">Gauri Shankar Rudraksha</div>
                                   <Link to="/shop" className="text-xs underline text-gray-600 hover:text-black">View Product</Link>
                                </div>
                            </div>
                            <div className="col-span-2 bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg flex items-center justify-between border border-gray-100">
                                <div>
                                   <h5 className="font-heading font-bold text-xl text-[var(--color-primary)]">Confused?</h5>
                                   <p className="text-sm text-gray-600 mt-1 mb-3 max-w-xs">Talk to our Vedic experts to find the right Rudraksha for your Kundali.</p>
                                   <Link to="/consult" className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase rounded hover:bg-black transition-colors">Chat Now</Link>
                                </div>
                                <MessageCircle size={48} className="text-[var(--color-primary)] opacity-10" />
                            </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[190] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[200] shadow-2xl overflow-y-auto md:hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <BrandLogo className="h-8 text-[var(--color-primary)]" />
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {navItems.map((item, idx) => (
                    <div key={idx} className="border-b border-gray-50 py-3">
                      <Link 
                        to={item.path} 
                        className="font-heading text-lg font-bold text-black flex justify-between items-center"
                        onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {item.hasDropdown && (
                        <div className="pl-4 mt-2 space-y-3 ml-1">
                          {item.items?.map((sub, sIdx) => (
                             <Link 
                               key={sIdx} 
                               to={sub.link} 
                               className="block text-sm text-gray-500 font-medium"
                               onClick={() => setMobileMenuOpen(false)}
                             >
                               {sub.name}
                             </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobile Actions */}
                  <div className="mt-4 flex flex-col gap-3">
                    <Link to="/consult" className="w-full py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded font-bold uppercase text-xs text-center">
                       Consult Astrologer
                    </Link>
                    <Link to="/login" className="w-full py-3 bg-black text-white rounded font-bold uppercase text-xs text-center">
                       Login / Signup
                    </Link>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;