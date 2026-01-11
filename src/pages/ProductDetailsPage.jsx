import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Share2, ShieldCheck, 
  HelpCircle, Copy, Check, RotateCcw, ArrowRight, 
  Minus, Plus, Info, Lock, Phone, MessageCircle, Sparkles, Flame
} from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts } from '../context/ProductContext';
import { RASHI_MAPPING } from '../data/rashiMapping';
import ProductGallery from '../components/shop/ProductGallery';
import { ProductReviews } from '../components/shop/ProductReviews'; 
import RashiFinderModal from '../components/shop/RashiFinderModal';
import ProductCard from '../components/shop/ProductCard';

// --- CONSTANTS & ICONS ---
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const RASHI_EMOJIS = {
  "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
  "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
  "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
  const { products, loading: staticLoading } = useProducts();
  const [realStock, setRealStock] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [coupons, setCoupons] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  
  // UI State
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [openSections, setOpenSections] = useState({ details: true, shipping: false, returns: false });
  const [addEnergization, setAddEnergization] = useState(false);
  const [devoteeName, setDevoteeName] = useState('');
  const [suitableRashis, setSuitableRashis] = useState([]);
  const [isRashiModalOpen, setIsRashiModalOpen] = useState(false);
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [viewCount, setViewCount] = useState(112);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const mainActionsRef = useRef(null);
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  // --- LOGIC ---
  const recommendations = useMemo(() => {
    if (!product || !products) return [];
    const otherProducts = products.filter(p => String(p.id) !== String(product.id));
    const sameCategory = otherProducts.filter(p => p.category === product.category);
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [products, product]);

  const getDiscountPercent = (qty) => {
    if (qty >= 3) return 15;
    if (qty === 2) return 10; 
    return 0;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'reviews'), where('spotId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => doc.data());
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        setAverageRating(Math.round((total / fetchedReviews.length) * 10) / 10); 
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchLiveData = async () => {
      if (!id || !product) return;
      setIsStockLoading(true);
      
      const matches = [];
      if (RASHI_MAPPING) {
        Object.keys(RASHI_MAPPING).forEach(rashi => {
          const mapping = RASHI_MAPPING[rashi];
          const keywords = mapping.keywords || [];
          const textToCheck = (product.name + " " + product.description + " " + product.category).toLowerCase();
          if (keywords.some(k => textToCheck.includes(k.toLowerCase()))) {
              matches.push({ name: rashi, ...mapping });
          }
        });
        setSuitableRashis(matches);
      }

      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        setRealStock(docSnap.exists() ? docSnap.data().stock : (product?.stock || 50));
        
        const couponsSnap = await getDocs(collection(db, 'coupons'));
        setCoupons(couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.isActive !== false));
      } catch (error) {
        setRealStock(product?.stock || 50);
      } finally {
        setIsStockLoading(false);
      }
    };
    fetchLiveData();
  }, [id, product]);

  // Observer for Sticky Bar & View Count
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting), 
      { threshold: 0 }
    );
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    
    const viewInterval = setInterval(() => setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1)), 4000);
    
    return () => { 
        if (mainActionsRef.current) observer.unobserve(mainActionsRef.current);
        clearInterval(viewInterval);
    };
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Toast notification would go here
    }
  };

  if (staticLoading) return <div className="h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-[#b45309]" size={32} /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const basePrice = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const discountPercent = getDiscountPercent(quantity);
  const pricePerUnit = basePrice - (basePrice * (discountPercent / 100));
  const totalPrice = (pricePerUnit * quantity) + (addEnergization ? ENERGIZATION_COST : 0);
  const isOutOfStock = !isStockLoading && realStock !== null && realStock < quantity;

  const handleDirectOrder = (paymentMode) => {
    const directItem = {
      id: product.id,
      name: product.name,
      price: pricePerUnit,
      quantity: quantity,
      variant: quantity === 1 ? 'Single' : `Bundle (${quantity})`,
      image: galleryImages[0],
      energization: addEnergization,
      energizationDetails: addEnergization ? { name: devoteeName } : null
    };
    navigate('/checkout', { state: { directPurchase: [directItem], paymentMode } });
  };

  const handleWhatsAppOrder = () => {
    const message = `Namaste! I want to order ${product.name}. Price: ₹${totalPrice}.`;
    const url = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const checkDelivery = () => {
    if (pincode.length !== 6) return;
    setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 4);
      setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    }, 1000);
  };

  return (
    <>
      <style>{`
        .font-crimson { font-family: 'Crimson Pro', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Sacred Background Pattern */
        .bg-sacred {
            background-color: #fcfbf9;
            background-image: radial-gradient(#d97706 0.5px, transparent 0.5px), radial-gradient(#d97706 0.5px, #fcfbf9 0.5px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            opacity: 1;
        }

        /* Shine Animation for Buttons */
        @keyframes shine { 
          0% { transform: translateX(-100%) skewX(-15deg); } 
          100% { transform: translateX(200%) skewX(-15deg); } 
        }
        .animate-shine::after {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%) skewX(-15deg);
          animation: shine 2.5s infinite;
        }

        /* Soft Pulse for Engagement */
        @keyframes softPulse {
            0% { box-shadow: 0 0 0 0 rgba(180, 83, 9, 0.2); }
            70% { box-shadow: 0 0 0 6px rgba(180, 83, 9, 0); }
            100% { box-shadow: 0 0 0 0 rgba(180, 83, 9, 0); }
        }
        .animate-soft-pulse { animation: softPulse 2s infinite; }
      `}</style>
      
      <RashiFinderModal 
         isOpen={isRashiModalOpen} 
         onClose={() => setIsRashiModalOpen(false)}
         onRashiSelected={(rashi) => {
            setIsRashiModalOpen(false);
            navigate(`/shop?rashi=${rashi}`);
         }}
      />

      {/* --- MANTRA STRIP (Brand Element) --- */}
      <div className="bg-[#1a1a1a] text-[#d4af37] text-[10px] md:text-xs font-bold py-1.5 text-center tracking-[0.2em] font-serif overflow-hidden">
        <span className="opacity-80">|| OM NAMAH SHIVAYA ||  AUTHENTIC RUDRAKSHA & SPIRITUAL PRODUCTS FROM KASHI  || HAR HAR MAHADEV ||</span>
      </div>

      <div className="bg-sacred min-h-screen pb-32 font-sans text-gray-900 relative">
        
        {/* Breadcrumb */}
        <div className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-[#e5e7eb] sticky top-0 z-40">
          <div className="container mx-auto px-6 py-3 text-[11px] font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wide">
              <Link to="/" className="hover:text-[#b45309]">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#b45309]">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 truncate">{product.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-0 md:px-6 md:py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-16">
            
            {/* Gallery Section */}
            <div className="w-full lg:w-[58%]">
               <ProductGallery images={galleryImages} />
            </div>

            {/* Details Section (Sticky on Desktop) */}
            <div className="w-full lg:w-[42%] px-5 md:px-0 pt-6 md:pt-0 relative">
              <div className="lg:sticky lg:top-24 space-y-6">
                
                {/* --- PRODUCT HEADER --- */}
                <div className="relative">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex gap-2">
                           <span className="bg-gradient-to-r from-[#b45309] to-[#d97706] text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <Sparkles size={10} /> Vibhut Verified
                           </span>
                           {viewCount > 50 && (
                               <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 animate-pulse">
                                   <Flame size={10} fill="currentColor" /> {viewCount} Viewing
                               </span>
                           )}
                       </div>
                       <button onClick={handleShare} className="text-gray-400 hover:text-[#b45309] transition-colors p-2 hover:bg-[#fff7ed] rounded-full">
                          <Share2 size={20} />
                       </button>
                    </div>
                    
                    <h1 className="font-crimson text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-2 leading-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-4 text-sm mb-5">
                        <div className="flex items-center gap-1 text-[#f59e0b]">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.round(averageRating || 5) ? "currentColor" : "none"} />
                            ))}
                            <span className="text-gray-500 font-medium ml-2 text-xs underline cursor-pointer hover:text-[#b45309]">
                                {reviews.length} Verified Reviews
                            </span>
                        </div>
                    </div>

                    {/* Price Block */}
                    <div className="p-4 bg-white border border-[#fed7aa] rounded-xl shadow-[0_4px_20px_rgba(251,146,60,0.1)] relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ffedd5] to-transparent rounded-bl-full opacity-50"></div>
                         
                         <div className="flex items-end gap-3 mb-1 relative z-10">
                             <span className="text-4xl font-bold text-[#1a1a1a]">
                                ₹{totalPrice.toLocaleString()}
                             </span>
                             {comparePrice > 0 && (
                                <div className="mb-1.5 flex flex-col leading-none">
                                    <span className="text-sm text-gray-400 line-through">₹{(comparePrice * quantity).toLocaleString()}</span>
                                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wide">
                                       Save {Math.round(((comparePrice - pricePerUnit) / comparePrice) * 100)}% Today
                                    </span>
                                </div>
                             )}
                         </div>
                         <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                             <CheckCircle2 size={12} className="text-green-600" /> All Taxes Included + Free Shipping
                         </p>
                    </div>
                </div>

                {/* --- BRAND TRUST BADGES (Eye Catching) --- */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { icon: ShieldCheck, label: "100% Authentic" },
                        { icon: Truck, label: "Fast Delivery" },
                        { icon: RotateCcw, label: "Easy Returns" },
                        { icon: Lock, label: "Secure Pay" }
                    ].map((badge, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-[#b45309]/30 transition-colors">
                            <badge.icon size={18} className="text-[#b45309] mb-1" />
                            <span className="text-[9px] font-bold uppercase text-gray-600 text-center leading-tight">{badge.label}</span>
                        </div>
                    ))}
                </div>

                {/* --- RASHI & QUANTITY --- */}
                <div className="space-y-4">
                    
                    {/* Rashi Recommendation */}
                    <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-lg p-3 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsRashiModalOpen(true)}>
                         <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-[#fde68a] flex items-center justify-center text-[#b45309]">
                                 <Sparkles size={14} />
                             </div>
                             <div>
                                 <p className="text-[10px] font-bold uppercase text-[#92400e]">Vedic Compatibility</p>
                                 <p className="text-xs font-bold text-gray-800">Is this suitable for your Rashi?</p>
                             </div>
                         </div>
                         <ChevronRight size={16} className="text-[#b45309]" />
                    </div>

                    {/* Quantity & Coupon */}
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Quantity</label>
                            <div className="flex items-center bg-white rounded-lg border border-gray-300 h-11 shadow-sm">
                                <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Minus size={14} /></button>
                                <div className="flex-1 text-center font-bold text-base text-[#1a1a1a]">{quantity}</div>
                                <button onClick={() => !isOutOfStock && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Plus size={14} /></button>
                            </div>
                        </div>
                        
                        {coupons.length > 0 && (
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Extra Savings</label>
                                <button 
                                  onClick={() => handleCopyCoupon(coupons[0].code)}
                                  className="w-full h-11 flex items-center justify-between px-3 bg-green-50 border border-dashed border-green-500 rounded-lg hover:bg-green-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Ticket size={16} className="text-green-600" />
                                        <div className="text-left">
                                            <span className="text-xs font-bold text-green-800 block leading-none">{coupons[0].code}</span>
                                            <span className="text-[9px] text-green-600">Save {coupons[0].value}%</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-white text-green-700 px-2 py-0.5 rounded shadow-sm">
                                        {copiedCoupon === coupons[0].code ? "APPLIED" : "APPLY"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- ENERGIZATION (Gold Card) --- */}
                    <div 
                        onClick={() => setAddEnergization(!addEnergization)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden
                        ${addEnergization ? 'border-[#b45309] bg-[#fffbf0] shadow-md' : 'border-gray-200 bg-white hover:border-[#b45309]/50'}`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                             <div className="flex items-start gap-3">
                                 <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${addEnergization ? 'bg-[#b45309] border-[#b45309] text-white' : 'border-gray-300 bg-white'}`}>
                                     {addEnergization && <Check size={12} strokeWidth={3} />}
                                 </div>
                                 <div>
                                     <span className="text-sm font-bold text-[#1a1a1a] block">Add Pran Pratistha (Energization)</span>
                                     <span className="text-[10px] text-[#b45309] font-bold bg-[#b45309]/10 px-1.5 py-0.5 rounded inline-block mt-1">
                                        HIGHLY RECOMMENDED
                                     </span>
                                 </div>
                             </div>
                             <span className="text-sm font-bold text-[#b45309]">+₹{ENERGIZATION_COST}</span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 mt-2 ml-8 font-serif leading-relaxed">
                            A Vedic ritual performed in your name at Kashi Vishwanath Temple to activate the spiritual energy of the product.
                        </p>
                        
                        {addEnergization && (
                            <div className="mt-3 ml-8 animate-in slide-in-from-top-2 fade-in">
                                <input 
                                    type="text" 
                                    placeholder="Enter Name for Sankalp (e.g. Rahul)" 
                                    className="w-full text-sm p-2.5 bg-white border border-[#b45309]/30 rounded-lg outline-none focus:border-[#b45309] font-serif shadow-inner"
                                    value={devoteeName}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDevoteeName(e.target.value)}
                                />
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-[#b45309] font-bold">
                                    <Truck size={10} /> Video proof sent on WhatsApp before dispatch
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- MAIN BUTTONS (Ref for Sticky) --- */}
                    <div ref={mainActionsRef} className="flex flex-col gap-3 pt-2">
                        <button 
                            onClick={() => handleDirectOrder('ONLINE')}
                            disabled={isOutOfStock}
                            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden group animate-soft-pulse
                            ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-black shadow-xl'}`}
                        >
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                               <div className="animate-shine"></div>
                            </div>
                            
                            <span className="font-bold text-sm uppercase tracking-wider relative z-10 flex items-center gap-2">
                                {isOutOfStock ? "Sold Out" : "Pay Online"} <ArrowRight size={18} />
                            </span>
                            {!isOutOfStock && (
                                <span className="text-[10px] font-bold text-[#fbbf24] relative z-10 bg-white/10 px-2 py-0.5 rounded-full mt-0.5">
                                    Get Extra 5% OFF + Priority Delivery
                                </span>
                            )}
                        </button>

                        <button 
                            onClick={() => handleDirectOrder('COD')}
                            disabled={isOutOfStock}
                            className="w-full py-3.5 border border-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-900 hover:bg-gray-50 hover:border-black transition-colors"
                        >
                            Cash on Delivery
                        </button>
                    </div>

                    {/* --- PINCODE & BUY ON WHATSAPP --- */}
                    <div className="flex gap-2 items-center">
                         <div className="relative flex-1">
                            <input 
                                type="text" maxLength={6} placeholder="Pincode" 
                                value={pincode} onChange={(e) => setPincode(e.target.value)}
                                className="w-full h-11 pl-3 pr-10 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:border-[#b45309] shadow-sm"
                            />
                            <button onClick={checkDelivery} className="absolute right-0 top-0 h-full px-4 text-[10px] font-bold uppercase hover:text-[#b45309] text-gray-500">Check</button>
                         </div>
                         
                         {/* Specific Buy On WhatsApp Button */}
                         <button onClick={handleWhatsAppOrder} className="h-11 px-4 bg-[#25D366] text-white rounded-lg flex items-center gap-2 shadow-sm hover:bg-[#20bd5a] transition-colors whitespace-nowrap">
                             <WhatsAppIcon />
                             <div className="flex flex-col items-start leading-none">
                                <span className="text-[8px] font-medium opacity-90 uppercase">Buy on</span>
                                <span className="text-[10px] font-bold">WhatsApp</span>
                             </div>
                         </button>
                    </div>
                    {deliveryDate && <p className="text-[11px] text-green-700 font-bold mt-1 flex items-center gap-1 ml-1"><Truck size={12} /> Expected delivery by {deliveryDate}</p>}

                </div>

                {/* --- ACCORDIONS (Clean UI) --- */}
                <div className="border-t border-gray-200 mt-6">
                     {[
                        { id: 'details', label: 'Product Description', content: (
                            <div className="font-sans text-gray-700">
                                {(product.detailImageUrls && product.detailImageUrls.length > 0) && (
                                    <img src={product.detailImageUrls[0]} alt="Detail" className="w-full h-auto rounded-lg mb-4 shadow-sm" />
                                )}
                                <p className="leading-relaxed">{product.description}</p>
                            </div>
                        )},
                        { id: 'shipping', label: 'Shipping & Delivery', content: (
                            <ul className="list-disc pl-4 space-y-2 text-gray-600 font-sans">
                                <li><strong>Dispatch:</strong> Within 24 hours of order confirmation.</li>
                                <li><strong>Delivery:</strong> 3-5 business days across India.</li>
                                <li><strong>Couriers:</strong> BlueDart, Delhivery, XpressBees.</li>
                            </ul>
                        )},
                        { id: 'returns', label: 'Returns & Guarantee', content: (
                            <ul className="list-disc pl-4 space-y-2 text-gray-600 font-sans">
                                <li>7-day easy replacement policy for damage/defects.</li>
                                <li>Video proof required during unboxing.</li>
                                <li>100% Authentic Guarantee card included.</li>
                            </ul>
                        )}
                     ].map((item) => (
                        <div key={item.id} className="border-b border-gray-200">
                             <button onClick={() => toggleSection(item.id)} className="w-full py-4 flex justify-between items-center text-left hover:text-[#b45309] transition-colors group">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-800 group-hover:text-[#b45309]">{item.label}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${openSections[item.id] ? 'rotate-180 text-[#b45309]' : ''}`} />
                             </button>
                             {openSections[item.id] && (
                                 <div className="pb-5 text-sm animate-in slide-in-from-top-1">
                                     {item.content}
                                 </div>
                             )}
                        </div>
                     ))}
                </div>

                {/* Help Box */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#b45309]">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Need Assistance?</p>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">Call/WhatsApp: +91 98765 43210</p>
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Similar Products */}
          {recommendations.length > 0 && (
             <div className="mt-24 border-t border-gray-200 pt-10 px-5 md:px-0">
                <div className="flex flex-col items-center mb-10 text-center">
                    <span className="text-[#b45309] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Divine Collection</span>
                    <h3 className="text-3xl font-crimson font-bold text-[#1a1a1a]">You May Also Like</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                   {recommendations.map((rec) => (
                      <ProductCard key={rec.id} product={rec} />
                   ))}
                </div>
             </div>
          )}
          
          <div className="mt-16 px-5 md:px-0"><ProductReviews productId={product.id} /></div>

          {/* --- FLOATING WHATSAPP BUTTON (Global Position Override) --- */}
          {/* Sits ABOVE the sticky bar on mobile (bottom-20), normal on desktop */}
          <a 
             href="https://wa.me/919876543210" 
             target="_blank" 
             rel="noreferrer"
             className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center md:hidden"
          >
             <MessageCircle size={24} />
          </a>

          {/* --- SMART STICKY BAR (Desktop & Mobile) --- */}
          <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-5px_25px_rgba(0,0,0,0.1)]
              ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
               
               {/* Product Info (Left) */}
               <div className="flex items-center gap-3 overflow-hidden flex-1 md:flex-none">
                  <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex-shrink-0">
                    <img src={galleryImages[0]} alt="" className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate max-w-[120px] md:max-w-xs">{product.name}</p>
                    <p className="text-[10px] md:text-xs font-bold text-[#b45309]">₹{totalPrice.toLocaleString()}</p>
                  </div>
               </div>

               {/* Buttons (Right) */}
               <div className="flex gap-2 items-center">
                 <button onClick={() => handleDirectOrder('COD')} className="hidden md:block px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase hover:bg-gray-50 text-gray-800">
                    COD
                 </button>
                 <button onClick={() => handleDirectOrder('ONLINE')} className="px-6 py-3 bg-[#1a1a1a] text-white rounded-lg text-xs font-bold uppercase hover:bg-black shadow-lg flex items-center gap-2 whitespace-nowrap">
                    Pay Online <span className="hidden sm:inline">• Save 5%</span>
                 </button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;