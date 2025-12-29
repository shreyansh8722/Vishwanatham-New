import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Eye, Package, Info, ArrowRight, Minus, Plus,
  Phone, Share2, Sparkles, Moon, Zap, ShieldCheck, HelpCircle, Copy, Check,
  RotateCcw
} from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts } from '../context/ProductContext';
import { RASHI_MAPPING } from '../data/rashiMapping';
import ProductGallery from '../components/shop/ProductGallery';
import { ProductReviews } from '../components/shop/ProductReviews'; 
import RashiFinderModal from '../components/shop/RashiFinderModal';
import ProductCard from '../components/shop/ProductCard';

// Custom Om Icon
const OmIcon = () => (
  <span className="text-lg leading-none font-serif">🕉️</span>
);

// Correct WhatsApp Logo SVG
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Zodiac Emojis Mapping
const RASHI_EMOJIS = {
  "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
  "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
  "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data State
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
  const [openSections, setOpenSections] = useState({ 
    details: true, 
    shipping: false,
    returns: false 
  });
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

  // --- RECOMMENDATION LOGIC ---
  const recommendations = useMemo(() => {
    if (!product || !products) return [];
    
    // 1. Get ALL other products (excluding current one)
    const otherProducts = products.filter(p => String(p.id) !== String(product.id));
    
    // 2. Prioritize Same Category
    const sameCategory = otherProducts.filter(p => p.category === product.category);
    
    // 3. Fallback to Any Other Product
    const differentCategory = otherProducts.filter(p => p.category !== product.category);
    
    // 4. Combine (Same Cat first, then others) -> Limit to 4
    return [...sameCategory, ...differentCategory].slice(0, 4);
  }, [products, product]);


  // Dynamic Discount
  const getDiscountPercent = (qty) => {
    if (qty >= 3) return 15;
    if (qty === 2) return 10; 
    return 0;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 1. Live Reviews
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'reviews'), where('spotId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => doc.data());
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        setAverageRating(Math.round((total / fetchedReviews.length) * 10) / 10); 
      } else {
        setAverageRating(0); 
      }
    });
    return () => unsubscribe();
  }, [id]);

  // 2. Fetch Stock & Rashi
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

  // 3. Observers
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0.1 });
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    
    const viewInterval = setInterval(() => setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1)), 5000);
    
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
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Vishwanatham!`,
          url: window.location.href,
        });
      } catch (error) {
        // User rejected share or not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link");
      }
    }
  };

  if (staticLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
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
        
        /* SHINE EFFECT (For Pay Online) */
        @keyframes shine { 
          0% { transform: translateX(-100%) rotate(25deg); } 
          100% { transform: translateX(200%) rotate(25deg); } 
        }
        .animate-shine { animation: shine 1.5s infinite linear; }
        
        /* COSMIC BREATH (For Rashi Button) */
        @keyframes cosmic-breath {
            0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(176,141,85, 0.1), 0 2px 4px -1px rgba(176,141,85, 0.06); }
            50% { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(176,141,85, 0.3), 0 4px 6px -2px rgba(176,141,85, 0.1); border-color: #D4AF37; }
            100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(176,141,85, 0.1), 0 2px 4px -1px rgba(176,141,85, 0.06); }
        }
        .animate-cosmic-breath {
            animation: cosmic-breath 3s infinite ease-in-out;
        }

        /* Other utility animations */
        @keyframes attract-pulse {
            0%, 100% { border-color: #E5E7EB; transform: scale(1); }
            50% { border-color: #B08D55; transform: scale(1.01); box-shadow: 0 4px 12px rgba(176,141,85, 0.15); }
        }
        .animate-attract { animation: attract-pulse 3s infinite ease-in-out; }

        @keyframes cosmic-flow {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }
        .animate-cosmic { 
            background: linear-gradient(135deg, #FFFBF0 0%, #FFFFFF 50%, #FDF7E3 100%);
            background-size: 200% 200%;
            animation: cosmic-flow 5s ease infinite alternate;
        }
      `}</style>
      
      <RashiFinderModal 
         isOpen={isRashiModalOpen} 
         onClose={() => setIsRashiModalOpen(false)}
         onRashiSelected={(rashi) => {
            setIsRashiModalOpen(false);
            navigate(`/shop?rashi=${rashi}`);
         }}
      />

      <div className="bg-white min-h-screen pb-32 font-sans text-gray-900">
        
        {/* Breadcrumb */}
        <div className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
              <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#B08D55] transition-colors">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-0 md:pt-6">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">
            
            {/* Gallery */}
            <div className="w-full lg:w-[58%]">
               <ProductGallery images={galleryImages} />
            </div>

            {/* Buy Box */}
            <div className="w-full lg:w-[42%] mt-4 lg:mt-0">
              
              {/* Product Title & Header (Price Moved Inside Here) */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-3">
                     <span className="bg-gradient-to-r from-[#B08D55] to-[#8C6B3D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-sans shadow-sm">
                        Best Seller
                     </span>
                     <button onClick={handleShare} className="text-gray-400 hover:text-[#B08D55] transition-colors">
                        <Share2 size={18} />
                     </button>
                  </div>
                  
                  <h1 className="font-crimson text-3xl md:text-4xl font-bold text-black mb-3 leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Price & Reviews Row */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 font-sans">
                     
                     {/* Left: Price + Discount Badge */}
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-crimson font-bold text-black">₹{totalPrice.toLocaleString()}</span>
                            {comparePrice > 0 && (
                                <>
                                  <span className="text-sm text-gray-400 line-through font-medium">
                                      ₹{(comparePrice * quantity).toLocaleString()}
                                  </span>
                                  {/* RED DISCOUNT BADGE */}
                                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                                     -{Math.round(((comparePrice - pricePerUnit) / comparePrice) * 100)}% OFF
                                  </span>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">Inclusive of all taxes</p>
                     </div>

                     {/* Right: Reviews */}
                     <div className="flex items-center justify-between md:justify-end gap-3">
                         {reviews.length > 0 ? (
                           <div className="flex items-center gap-1.5 text-yellow-500 bg-[#FFFBF0] px-3 py-1.5 rounded-lg border border-[#F4EBD9]">
                              <span className="text-sm font-bold text-[#1F362A]">{averageRating}</span>
                              <Star size={14} fill="currentColor" />
                              <span className="text-xs text-gray-400 font-medium border-l border-gray-200 pl-1.5 ml-0.5">
                                {reviews.length} Reviews
                              </span>
                           </div>
                         ) : (
                            <div className="flex items-center gap-1 opacity-60">
                               <Star size={14} className="text-gray-300" />
                               <span className="text-xs font-medium text-gray-400">No Reviews</span>
                            </div>
                         )}
                         
                         <span className="text-[10px] text-[#B08D55] font-bold flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full md:hidden">
                            <Eye size={12} /> {viewCount} viewing
                         </span>
                     </div>
                  </div>
              </div>

              {/* ✨ ASTRO RECOMMENDATION */}
              <div className="flex flex-col gap-4 mb-6 font-sans">
                {suitableRashis.length > 0 ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#E6D5B8] shadow-sm animate-cosmic group">
                     <div className="absolute top-[-10px] right-[-10px] text-[#B08D55]/5 rotate-12 transform scale-150">
                        <Moon size={80} />
                     </div>
                     
                     <div className="p-4 relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                           <div className="h-[1px] w-8 bg-[#B08D55]/30"></div>
                           <p className="text-[10px] text-[#8C6B3D] uppercase font-bold tracking-[0.2em] flex items-center gap-1">
                              Perfect Match For
                           </p>
                           <div className="h-[1px] w-8 bg-[#B08D55]/30"></div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                           {suitableRashis.map(r => (
                             <span key={r.name} className="px-3 py-1.5 bg-white/60 backdrop-blur-md text-[#1F362A] text-xs font-bold uppercase tracking-wide rounded-lg border border-[#F4EBD9] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 hover:bg-white hover:border-[#B08D55]">
                               <span className="text-sm">{RASHI_EMOJIS[r.name]}</span> {r.name}
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>
                ) : (
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                      <Sparkles className="text-gray-400" size={16} />
                      <p className="text-xs text-gray-500">Universal benefits for all Rashis.</p>
                   </div>
                )}
                
                {/* REVEAL BUTTON: Cosmic Breath (No Shine) + Emoji */}
                <button 
                  onClick={() => setIsRashiModalOpen(true)}
                  className="w-full py-4 text-white rounded-xl text-xs font-bold uppercase tracking-[0.15em] bg-[#1F362A] border border-[#B08D55] relative overflow-hidden group animate-cosmic-breath"
                >
                   <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="text-lg leading-none filter drop-shadow-md">✨</span> Reveal My Rashi Match
                   </span>
                </button>
              </div>

              {/* Quantity */}
              <div className="mb-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm font-sans">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-bold text-gray-900 uppercase">Select Quantity</span>
                   {discountPercent > 0 && (
                     <span className="text-xs font-bold text-[#B08D55] bg-[#FFFBF0] px-2 py-0.5 rounded border border-[#F4EBD9]">
                       {discountPercent}% Bundle Savings
                     </span>
                   )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-lg h-12 w-32 border border-gray-200">
                    <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center hover:bg-white hover:text-[#B08D55] rounded-l-lg transition-colors"><Minus size={16} /></button>
                    <div className="flex-1 h-full flex items-center justify-center font-bold text-black font-crimson text-2xl pt-1">{quantity}</div>
                    <button onClick={() => !isOutOfStock && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white hover:text-[#B08D55] rounded-r-lg transition-colors"><Plus size={16} /></button>
                  </div>
                  {quantity === 1 && (
                     <p className="text-xs text-[#B08D55] font-bold underline decoration-dotted cursor-pointer hover:text-[#967645]" onClick={() => setQuantity(2)}>
                        Buy 2 & Save 10%
                     </p>
                  )}
                </div>
              </div>

              {/* Offers Section */}
              {coupons.length > 0 && (
                <div className="mb-6 font-sans">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                     <Ticket size={12} /> Available Offers
                  </h5>
                  <div className="flex flex-col gap-2">
                    {coupons.map(coupon => (
                      <div key={coupon.id} className="border border-dashed border-[#B08D55] bg-[#FFFBF0] p-3 rounded-lg flex justify-between items-center group transition-colors hover:bg-[#FFF9E5]">
                        <div>
                          <span className="font-bold text-[#1F362A] text-sm flex items-center gap-2">
                             {coupon.code}
                          </span>
                          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">{coupon.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-xs text-[#B08D55] bg-white px-2 py-1 rounded border border-[#E6D5B8]">
                              {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                            </span>
                            <button 
                               onClick={() => handleCopyCoupon(coupon.code)}
                               className="text-[#B08D55] hover:text-[#967645] transition-colors"
                               title="Copy Code"
                            >
                               {copiedCoupon === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Energization */}
              <div 
                 onClick={() => setAddEnergization(!addEnergization)}
                 className={`mb-6 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden group font-sans
                    ${addEnergization 
                       ? 'bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] shadow-xl transform scale-[1.02] ring-1 ring-[#B08D55] animate-pulse-gold' 
                       : 'bg-white border-2 border-dashed border-gray-300 hover:border-[#B08D55] hover:bg-gray-50 animate-attract'}`}
              >
                 <div className={`p-5 flex items-start gap-4 ${addEnergization ? 'text-[#1F362A]' : 'text-gray-900'}`}>
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0
                       ${addEnergization ? 'bg-white text-[#B08D55] shadow-sm' : 'border-2 border-gray-300 bg-white'}`}>
                       {addEnergization && <Check size={14} strokeWidth={3} />}
                    </div>
                    
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                           <p className="text-sm font-bold flex items-center gap-2">
                              Add Pran Pratistha (Energization)
                              {!addEnergization && (
                                <span className="bg-[#B08D55] text-white text-[9px] px-1.5 py-0.5 rounded uppercase shadow-sm">
                                    Recommended
                                </span>
                              )}
                           </p>
                           <span className={`text-xs font-bold ${addEnergization ? 'text-[#1F362A]' : 'text-[#B08D55]'}`}>
                             +₹{ENERGIZATION_COST}
                           </span>
                       </div>
                       
                       <p className={`text-[11px] mt-1 leading-relaxed ${addEnergization ? 'text-[#1F362A] font-medium' : 'text-gray-500'}`}>
                          Vedic ritual performed in your name at Kashi Vishwanath temple to activate the spiritual energy. 
                       </p>
                       
                       {addEnergization && (
                          <div className="mt-4 pt-3 border-t border-[#1F362A]/20 animate-fade-in">
                            <label className="text-[10px] font-bold text-[#1F362A] uppercase block mb-1">Name for Sankalp</label>
                            <input 
                                type="text" 
                                placeholder="Enter devotee name..." 
                                className="w-full text-sm p-2.5 bg-white/90 border-none rounded-lg outline-none text-[#1F362A] placeholder:text-gray-500 shadow-inner font-serif"
                                value={devoteeName}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setDevoteeName(e.target.value)}
                            />
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Main Actions (Pay Online Black + Shine) */}
              <div ref={mainActionsRef} className="flex flex-col gap-3 mb-6 font-sans">
                 <button 
                    onClick={() => handleDirectOrder('ONLINE')}
                    disabled={isOutOfStock}
                    className={`w-full py-4 rounded-xl shadow-xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden transition-all hover:scale-[1.01]
                    ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
                 >
                    {isOutOfStock ? "Sold Out" : (
                      <>
                        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
                           <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg] animate-shine"></div>
                        </div>
                        
                        <span className="font-bold text-sm uppercase tracking-widest relative z-10 flex items-center gap-2 text-[#F4EBD9]">
                           Pay Online <ArrowRight size={16} />
                        </span>
                        
                        <span className="text-[10px] font-bold text-[#B08D55] bg-white/10 px-2 py-0.5 rounded-full relative z-10">
                           ⚡ Early Dispatch + 5% OFF
                        </span>
                      </>
                    )}
                 </button>

                 <button 
                    onClick={() => handleDirectOrder('COD')}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 border border-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-900 hover:border-black hover:bg-gray-50 transition-colors"
                 >
                    Cash on Delivery
                 </button>
              </div>

              {/* Delivery & Accordions */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
                 <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Truck size={12} /> Check Delivery
                 </h5>
                 <div className="flex gap-2">
                    <input 
                       type="text" maxLength={6} placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} 
                       className="flex-1 h-10 px-3 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#B08D55] bg-white" 
                    />
                    <button onClick={checkDelivery} className="px-4 bg-black text-white rounded-lg text-xs font-bold uppercase hover:bg-[#B08D55] transition-colors">
                       Check
                    </button>
                 </div>
                 {deliveryDate && <p className="text-xs text-green-700 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Estimated: {deliveryDate}</p>}
              </div>

              {/* WhatsApp & Help Section */}
              <div className="grid grid-cols-2 gap-3 mb-6 font-sans">
                 <button 
                    onClick={handleWhatsAppOrder}
                    className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-xl shadow-sm hover:bg-green-700 transition-all"
                 >
                    <WhatsAppIcon />
                    <div className="text-left">
                       <p className="text-[10px] font-medium opacity-90 leading-none">Order on</p>
                       <p className="text-sm font-bold leading-tight">WhatsApp</p>
                    </div>
                 </button>
                 <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <HelpCircle className="text-gray-400" size={24} />
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Need Help?</p>
                       <a href="tel:+919876543210" className="text-sm font-bold text-gray-900 hover:underline">Contact Us</a>
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-100 font-sans">
                  {/* Product Details */}
                  <div className="border-b border-gray-100">
                     <button onClick={() => toggleSection('details')} className="w-full py-4 flex justify-between items-center text-left hover:text-[#B08D55] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2"><Info size={16} /> Product Details</span>
                        <ChevronDown size={14} className={`transition-transform ${openSections.details ? 'rotate-180' : ''}`} />
                     </button>
                     {openSections.details && (
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed font-serif animate-fade-in">
                           {/* Corrected Description Image: Uses detailImageUrls[0] */}
                           {(product.detailImageUrls && product.detailImageUrls.length > 0) && (
                             <img 
                               src={product.detailImageUrls[0]} 
                               alt="Detail" 
                               className="w-full h-auto object-cover rounded-lg mb-4 shadow-sm"
                             />
                           )}
                           <p>{product.description || "Authentic spiritual artifact from Kashi."}</p>
                        </div>
                     )}
                  </div>

                  {/* Shipping & Dispatch */}
                  <div className="border-b border-gray-100">
                     <button onClick={() => toggleSection('shipping')} className="w-full py-4 flex justify-between items-center text-left hover:text-[#B08D55] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2"><Truck size={16} /> Shipping & Dispatch</span>
                        <ChevronDown size={14} className={`transition-transform ${openSections.shipping ? 'rotate-180' : ''}`} />
                     </button>
                     {openSections.shipping && (
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed font-serif animate-fade-in pl-6">
                           <ul className="list-disc pl-4 space-y-1">
                              <li>Dispatched within 24 hours of ordering.</li>
                              <li>Free shipping across India on prepaid orders.</li>
                              <li>Secure packaging to ensure safety during transit.</li>
                              <li>Tracking details shared via WhatsApp & SMS.</li>
                           </ul>
                        </div>
                     )}
                  </div>

                  {/* Returns & Replacements */}
                  <div className="border-b border-gray-100">
                     <button onClick={() => toggleSection('returns')} className="w-full py-4 flex justify-between items-center text-left hover:text-[#B08D55] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2"><RotateCcw size={16} /> Returns & Replacements</span>
                        <ChevronDown size={14} className={`transition-transform ${openSections.returns ? 'rotate-180' : ''}`} />
                     </button>
                     {openSections.returns && (
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed font-serif animate-fade-in pl-6">
                           <ul className="list-disc pl-4 space-y-1">
                              <li>7-day easy replacement policy for damaged/wrong items.</li>
                              <li>Video unboxing required for damage claims.</li>
                              <li>Genuine authentic products directly from Kashi.</li>
                           </ul>
                        </div>
                     )}
                  </div>
              </div>

            </div>
          </div>

          {/* 1. You May Also Like Section (Improved with ProductCard) */}
          {recommendations.length > 0 && (
             <div className="mt-16 border-t border-gray-200 pt-10">
                <div className="mb-8 text-center">
                   {/* Clean Title, Crimson Pro Font */}
                   <h3 className="text-2xl font-crimson font-bold text-gray-900">You May Also Like</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {recommendations.map((rec) => (
                      <ProductCard key={rec.id} product={rec} />
                   ))}
                </div>
             </div>
          )}
          
          <div className="mt-16"><ProductReviews productId={product.id} /></div>

          {/* Sticky Mobile Bar */}
          <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4 font-sans">
               
               {/* Product Info (Left Side) */}
               <div className="hidden sm:flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    <img src={galleryImages[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-[#B08D55] font-bold">₹{totalPrice.toLocaleString()}</p>
                  </div>
               </div>

               {/* Buttons (Right Side) */}
               <div className="flex gap-2 flex-1 sm:flex-none w-full sm:w-auto">
                 <button onClick={() => handleDirectOrder('COD')} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 text-black text-xs font-bold uppercase rounded-lg hover:bg-gray-50">COD</button>
                 <button onClick={() => handleDirectOrder('ONLINE')} className="flex-[1.5] sm:flex-none px-8 py-3 bg-black text-[#F4EBD9] text-xs font-bold uppercase rounded-lg shadow-lg hover:bg-gray-900 relative overflow-hidden group">
                    <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
                       <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg] animate-shine"></div>
                    </div>
                    Pay Online
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