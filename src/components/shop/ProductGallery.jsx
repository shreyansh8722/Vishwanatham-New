import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn } from 'lucide-react';
import { ImageZoomModal } from './ImageZoomModal';

const ProductGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const scrollRef = useRef(null);
  // Prevents auto-scroll loop when user is swiping manually
  const isUserInteracting = useRef(false);

  if (!images.length) return null;

  // 1. AUTO-SCROLL (Sync Thumbnails -> Main Image)
  useEffect(() => {
    if (scrollRef.current && !isUserInteracting.current) {
      const width = scrollRef.current.offsetWidth;
      const target = selectedImage * width;
      if (Math.abs(scrollRef.current.scrollLeft - target) > 10) {
        scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
      }
    }
  }, [selectedImage]);

  // 2. SWIPE DETECTION (Sync Main Image -> Thumbnails)
  const handleScroll = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollRef.current.scrollLeft / width);
      if (index !== selectedImage) {
        setSelectedImage(index);
      }
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100
    });
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 h-fit sticky top-24 select-none">
        
        {/* DESKTOP THUMBNAILS */}
        <div className="hidden md:flex md:flex-col gap-3 overflow-y-auto scrollbar-hide md:w-20 md:h-[500px] flex-shrink-0 px-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-full h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === idx ? 'border-[#B08D55] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumb ${idx}`} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* MOBILE CAROUSEL (Native Scroll Snap) */}
        <div className="md:hidden relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAFAFA]">
           <div 
             ref={scrollRef}
             onScroll={handleScroll}
             onTouchStart={() => { isUserInteracting.current = true; }}
             onTouchEnd={() => { setTimeout(() => { isUserInteracting.current = false; }, 500); }}
             className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
             style={{ scrollBehavior: 'smooth' }}
           >
             {images.map((img, idx) => (
               <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                 <img 
                   src={img} 
                   onClick={() => setIsLightboxOpen(true)} // Opens the smooth modal on tap
                   className="w-full h-full object-cover active:scale-[0.98] transition-transform duration-200" 
                   alt={`View ${idx + 1}`}
                   loading={idx === 0 ? "eager" : "lazy"} // Performance: Load first image immediately
                   decoding="async"
                 />
               </div>
             ))}
           </div>

           {/* Dots Indicator */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
             {images.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all shadow-sm ${i === selectedImage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
             ))}
           </div>
           
           <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 pointer-events-none">
              <ZoomIn size={12} />
           </div>
        </div>

        {/* DESKTOP MAIN IMAGE */}
        <div 
          className="hidden md:block relative flex-grow bg-[#FAFAFA] rounded-2xl overflow-hidden cursor-zoom-in group h-[600px] w-full shadow-sm"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img 
            src={images[selectedImage]} 
            alt="Main" 
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="eager" // Performance: Important for LCP
          />
          
          {/* Lens Zoom Effect */}
          {showZoom && (
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat z-10 bg-white"
              style={{
                backgroundImage: `url("${images[selectedImage]}")`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundSize: '200%', 
              }}
            />
          )}
        </div>
      </div>

      {/* The New Super Smooth Modal */}
      <ImageZoomModal 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={selectedImage}
        onIndexChange={setSelectedImage}
      />
    </>
  );
};

export default ProductGallery;