import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export const ImageZoomModal = ({ isOpen, onClose, images, initialIndex = 0, onIndexChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollRef = useRef(null);

  // 1. INSTANT SETUP (No Delays)
  useLayoutEffect(() => {
    if (isOpen && scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      // Force scroll position immediately before paint
      scrollRef.current.scrollLeft = initialIndex * width;
      setActiveIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen]); // Only run when opening

  // 2. Handle Scroll (Updates Index)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < images.length) {
      setActiveIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  return (
    // REMOVED: AnimatePresence wrapper that caused exit delays
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
      <style>{`
        .react-transform-wrapper { width: 100% !important; height: 100% !important; }
        .react-transform-component { width: 100% !important; height: 100% !important; }
        .zoom-wrapper-custom { touch-action: pan-x pinch-zoom !important; }
        .zoom-wrapper-custom.is-zoomed { touch-action: none !important; }
      `}</style>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <span className="text-white/90 text-sm font-medium tracking-widest drop-shadow-md">
          {activeIndex + 1} / {images.length}
        </span>
        <button 
          onClick={onClose} 
          className="pointer-events-auto p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* NATIVE SCROLL CONTAINER */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-grow flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide ${isZoomed ? 'overflow-hidden' : ''}`}
        style={{ width: '100vw', height: '100%' }}
      >
        {images.map((img, index) => {
          // OPTIMIZATION: Only load the heavy Zoom Wrapper for the CURRENT image.
          // This prevents the browser from trying to initialize zoom logic for 10 images at once.
          const isCurrentSlide = index === activeIndex;

          return (
            <div 
              key={index} 
              className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center relative"
              style={{ width: '100vw' }}
            >
              {isCurrentSlide ? (
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={4}
                  centerOnInit={true}
                  alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                  doubleClick={{ mode: "toggle" }}
                  panning={{ disabled: !isZoomed }} 
                  onZoom={({ state }) => setIsZoomed(state.scale > 1.01)}
                  onZoomStop={({ state }) => setIsZoomed(state.scale > 1.01)}
                  onTransformed={({ state }) => setIsZoomed(state.scale > 1.01)}
                >
                  <TransformComponent
                    wrapperClass={`zoom-wrapper-custom ${isZoomed ? 'is-zoomed' : ''}`}
                    contentStyle={{ width: "100%", height: "100%" }}
                  >
                    <img
                      src={img}
                      alt={`View ${index}`}
                      className="max-w-full max-h-screen object-contain select-none w-full h-full"
                      draggable={false}
                      loading="eager"       // Load immediately
                      decoding="sync"       // Decode on main thread (faster visual)
                    />
                  </TransformComponent>
                </TransformWrapper>
              ) : (
                // For non-active slides, render a simple lightweight image
                <img
                  src={img}
                  alt={`View ${index}`}
                  className="max-w-full max-h-screen object-contain select-none w-full h-full"
                  draggable={false}
                  loading="eager"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Arrows */}
      {activeIndex > 0 && (
        <button 
          onClick={() => scrollToSlide(activeIndex - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white z-50 hidden md:block"
        >
          <ChevronLeft size={40} />
        </button>
      )}
      {activeIndex < images.length - 1 && (
        <button 
          onClick={() => scrollToSlide(activeIndex + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white z-50 hidden md:block"
        >
          <ChevronRight size={40} />
        </button>
      )}

      {/* Mobile Hint */}
      {!isZoomed && (
         <div className="absolute bottom-10 w-full text-center pointer-events-none text-white/40 text-[10px] font-bold uppercase tracking-widest md:hidden">
            Swipe • Double Tap to Zoom
         </div>
      )}
    </div>
  );
};