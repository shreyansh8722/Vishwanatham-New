import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

// Images
// Hero1 is in 'public' folder (String path)
// Hero2 and Hero3 are in 'src/assets' (Imports)
import hero2 from '../../assets/hero2.webp';
import hero3 from '../../assets/hero3.webp';

const Hero = () => {
  // Array of images for the slideshow
  const images = ["/hero1.webp", hero2, hero3]; 
  
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[85vh] bg-black overflow-hidden flex items-end justify-center pb-20">
      
      {/* Background Slideshow */}
      {images.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* OPTIMIZATION: Priority loading for the first image */}
          <img 
            src={img} 
            alt={`Vishwanatham Spiritual Artifacts - Slide ${index + 1}`} 
            className="w-full h-full object-cover opacity-60"
            // FIXED: Changed fetchPriority to fetchpriority (lowercase)
            fetchpriority={index === 0 ? "high" : "auto"} 
            loading={index === 0 ? "eager" : "lazy"}      
            width="1920" 
            height="1080"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Buttons */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 animate-fade-in mb-8 md:mb-12">
        <Link to="/shop">
          <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
            Shop Collection <ArrowRight size={16} />
          </button>
        </Link>
        <Link to="/consult">
          <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
            Talk to Astrologer <Phone size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;