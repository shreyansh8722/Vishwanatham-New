import React, { useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

export const ImageZoomModal = ({ isOpen, onClose, images, initialIndex = 0, onIndexChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const transformRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setScale(1);
    }
  }, [isOpen, initialIndex]);

  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      onIndexChange?.(next);
      resetZoom();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      onIndexChange?.(prev);
      resetZoom();
    }
  };

  const resetZoom = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      setScale(1);
    }
  };

  // Swipe handlers (Only active when NOT zoomed)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (scale === 1) handleNext();
    },
    onSwipedRight: () => {
      if (scale === 1) handlePrev();
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden touch-none"
        >
          {/* Header */}
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
            <span className="text-white/90 text-sm font-bold tracking-widest drop-shadow-md">
               {activeIndex + 1} / {images.length}
            </span>
            <button 
              onClick={onClose} 
              className="pointer-events-auto p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* MAIN ZOOM AREA */}
          <div 
            {...swipeHandlers}
            className="w-full h-full flex items-center justify-center relative"
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={1}
              maxScale={4}
              onTransformed={(e) => setScale(e.state.scale)}
              doubleClick={{
                disabled: false,
                // If zoomed in at all, reset. If at 1x, zoom in.
                mode: scale > 1.05 ? "reset" : "zoomIn",
                step: 0.5 // FIX: Reduced from 2 to 0.5 for a gentler zoom (1x -> 1.5x)
              }}
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              <TransformComponent>
                <img
                  src={images[activeIndex]}
                  alt="Zoom"
                  className="max-w-full max-h-screen object-contain"
                  style={{ width: "100vw", height: "100vh" }} 
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Nav Arrows (Desktop) */}
          {activeIndex > 0 && (
            <button onClick={handlePrev} className="absolute left-2 p-4 text-white/50 hover:text-white z-50 hidden md:block">
              <ChevronLeft size={32} />
            </button>
          )}
          {activeIndex < images.length - 1 && (
             <button onClick={handleNext} className="absolute right-2 p-4 text-white/50 hover:text-white z-50 hidden md:block">
              <ChevronRight size={32} />
            </button>
          )}

          {/* Mobile Hint */}
          <div className="absolute bottom-8 pointer-events-none text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase md:hidden">
            {scale === 1 ? 'Swipe to Navigate' : 'Double Tap to Reset'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};