import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageZoomModal = ({ isOpen, onClose, images, initialIndex = 0, onIndexChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  // Refs for direct DOM manipulation (High Performance)
  const imgRef = useRef(null); 
  const containerRef = useRef(null);
  
  // Mutable Gesture State
  const state = useRef({
    x: 0, y: 0, scale: 1,
    isPanning: false,
    startDist: 0, startScale: 1,
    startX: 0, startY: 0,
    startPanX: 0, startPanY: 0,
    pinchCenter: { x: 0, y: 0 }
  });

  const lastTap = useRef(0);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      resetZoom(false);
    }
  }, [isOpen, initialIndex]);

  // Handle Image Switching - Find new active image in DOM
  useEffect(() => {
    if (containerRef.current) {
       // We look for the image that matches the current index
       const activeImg = containerRef.current.querySelector(`img[data-index="${activeIndex}"]`);
       if (activeImg) {
         imgRef.current = activeImg;
         resetZoom(true);
       }
    }
  }, [activeIndex]);

  const updateParentIndex = (newIndex) => {
    if (onIndexChange) onIndexChange(newIndex);
  };

  // --- TRANSFORMS ---
  const updateTransform = useCallback((animate = false) => {
    if (imgRef.current) {
      const { x, y, scale } = state.current;
      imgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      imgRef.current.style.transition = animate ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    }
  }, []);

  const resetZoom = (animate = true) => {
    state.current = { x: 0, y: 0, scale: 1, isPanning: false };
    updateTransform(animate);
  };

  const getBoundaries = (currentScale) => {
    if (!containerRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    const overflowX = Math.max(0, (w * currentScale - w) / 2);
    const overflowY = Math.max(0, (h * currentScale - h) / 2);
    return { minX: -overflowX, maxX: overflowX, minY: -overflowY, maxY: overflowY };
  };

  // --- NAVIGATION ---
  const handleNext = useCallback(() => { 
    setActiveIndex((p) => {
      const next = (p + 1) % images.length;
      updateParentIndex(next);
      return next;
    }); 
  }, [images.length]);
  
  const handlePrev = useCallback(() => { 
    setActiveIndex((p) => {
      const prev = (p - 1 + images.length) % images.length;
      updateParentIndex(prev);
      return prev;
    }); 
  }, [images.length]);

  // --- TOUCH HANDLERS ---
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Check Double Tap
      const now = Date.now();
      if (now - lastTap.current < 300) {
        handleDoubleTap(e.touches[0]);
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;

      // Start Pan/Swipe
      state.current.isPanning = true;
      state.current.startX = e.touches[0].clientX;
      state.current.startY = e.touches[0].clientY;
      state.current.startPanX = state.current.x;
      state.current.startPanY = state.current.y;

    } else if (e.touches.length === 2) {
      // Start Pinch
      state.current.isPanning = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      state.current.startDist = dist;
      state.current.startScale = state.current.scale;
      
      const rect = containerRef.current.getBoundingClientRect();
      state.current.pinchCenter = {
         x: (t1.clientX + t2.clientX) / 2 - (rect.left + rect.width / 2),
         y: (t1.clientY + t2.clientY) / 2 - (rect.top + rect.height / 2)
      };
      state.current.startPanX = state.current.x;
      state.current.startPanY = state.current.y;
    }
  };

  const onTouchMove = (e) => {
    if (!state.current.isPanning) return;
    e.preventDefault(); // Stop browser scrolling inside modal

    if (e.touches.length === 2) {
      // PINCH
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (state.current.startDist === 0) return;
      
      const ratio = dist / state.current.startDist;
      const newScale = Math.min(Math.max(state.current.startScale * ratio, 0.5), 8);
      
      const scaleRatio = newScale / state.current.startScale;
      const moveX = state.current.pinchCenter.x - (state.current.pinchCenter.x - state.current.startPanX) * scaleRatio;
      const moveY = state.current.pinchCenter.y - (state.current.pinchCenter.y - state.current.startPanY) * scaleRatio;

      state.current.scale = newScale;
      state.current.x = moveX;
      state.current.y = moveY;
      updateTransform(false);

    } else if (e.touches.length === 1) {
      // SWIPE / PAN
      const dx = e.touches[0].clientX - state.current.startX;
      const dy = e.touches[0].clientY - state.current.startY;

      if (state.current.scale <= 1.05) { 
         // SWIPE Logic (Horizontal only)
         state.current.x = dx;
         state.current.y = 0; 
         updateTransform(false);
      } else {
         // PAN Logic (Free movement with boundaries)
         let newX = state.current.startPanX + dx;
         let newY = state.current.startPanY + dy;
         const bounds = getBoundaries(state.current.scale);
         
         // Rubber banding
         if (newX > bounds.maxX) newX = bounds.maxX + (newX - bounds.maxX) * 0.3;
         if (newX < bounds.minX) newX = bounds.minX - (bounds.minX - newX) * 0.3;
         if (newY > bounds.maxY) newY = bounds.maxY + (newY - bounds.maxY) * 0.3;
         if (newY < bounds.minY) newY = bounds.minY - (bounds.minY - newY) * 0.3;

         state.current.x = newX;
         state.current.y = newY;
         updateTransform(false);
      }
    }
  };

  const onTouchEnd = (e) => {
    if (e.touches.length > 0) return; // Still touching with one finger

    state.current.isPanning = false;

    if (state.current.scale <= 1.05) {
        // Handle Swipe Threshold
        const swipeThreshold = 50;
        if (state.current.x > swipeThreshold) {
            handlePrev();
        } else if (state.current.x < -swipeThreshold) {
            handleNext();
        } else {
            resetZoom(true);
        }
    } else {
        // Snap back if panned out of bounds
        const bounds = getBoundaries(state.current.scale);
        let targetX = state.current.x;
        let targetY = state.current.y;
        let needsSnap = false;

        if (state.current.x > bounds.maxX) { targetX = bounds.maxX; needsSnap = true; }
        if (state.current.x < bounds.minX) { targetX = bounds.minX; needsSnap = true; }
        if (state.current.y > bounds.maxY) { targetY = bounds.maxY; needsSnap = true; }
        if (state.current.y < bounds.minY) { targetY = bounds.minY; needsSnap = true; }

        if (needsSnap) {
            state.current.x = targetX;
            state.current.y = targetY;
            updateTransform(true);
        }
    }
  };

  const handleDoubleTap = (touch) => {
    if (state.current.scale > 1.1) {
      resetZoom(true);
    } else {
      // Gentle Zoom (1.5x)
      const targetScale = 1.5; 
      state.current = { x: 0, y: 0, scale: targetScale, isPanning: false };
      updateTransform(true);
    }
  };

  // Animation variants
  const variants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
            <span className="text-white/90 text-sm font-bold tracking-widest drop-shadow-md">
               {activeIndex + 1} / {images.length}
            </span>
            <button onClick={onClose} className="pointer-events-auto p-2 bg-white/10 rounded-full text-white">
              <X size={24} />
            </button>
          </div>

          {/* Main Area */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center relative touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={activeIndex}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 flex items-center justify-center w-full h-full"
              >
                <img
                  data-index={activeIndex}
                  src={images[activeIndex]}
                  alt="Zoom"
                  className="max-w-full max-h-screen object-contain select-none"
                  draggable="false"
                  style={{ willChange: 'transform' }}
                /> 
              </motion.div>
            </AnimatePresence>
          </div>

           {/* Desktop Arrows */}
           <button onClick={handlePrev} className="absolute left-2 p-4 text-white/50 hover:text-white z-50 hidden md:block"><ChevronLeft size={32} /></button>
           <button onClick={handleNext} className="absolute right-2 p-4 text-white/50 hover:text-white z-50 hidden md:block"><ChevronRight size={32} /></button>

           <div className="absolute bottom-8 pointer-events-none text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase md:hidden">
             Double Tap to Zoom / Swipe to Navigate
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};