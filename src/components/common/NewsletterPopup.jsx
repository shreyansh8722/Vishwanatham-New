import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
      if (!hasSeenNewsletter) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenNewsletter', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md p-10 text-center shadow-2xl animate-scale-in rounded-lg border-t-4 border-[var(--color-primary)]">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close newsletter" // ADDED
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Title */}
        <h3 className="font-heading text-3xl md:text-4xl text-black mb-3 font-bold">
          Join the Circle
        </h3>
        
        {/* Body */}
        <p className="font-body text-xs text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto">
          Subscribe to receive updates on new collections, spiritual insights from Kashi, and exclusive offers.
        </p>
        
        <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
          <input 
            type="email" 
            placeholder="YOUR EMAIL ADDRESS" 
            className="w-full bg-gray-50 border border-gray-200 rounded py-3 text-center text-sm font-bold outline-none focus:border-black transition-colors placeholder:text-gray-400 text-black uppercase tracking-wider"
            required
          />
          <button 
            type="submit" 
            className="bg-black text-white py-3.5 text-xs font-bold font-body uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-colors shadow-lg rounded"
          >
            Subscribe
          </button>
        </form>
        
        <button 
          className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors underline decoration-dotted" 
          onClick={handleClose}
        >
          No thanks, I prefer to browse
        </button>
      </div>
    </div>
  );
};

export default NewsletterPopup;