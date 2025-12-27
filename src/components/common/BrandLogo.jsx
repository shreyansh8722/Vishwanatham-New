import React from 'react';
import logo from '../../assets/logo.webp';

const BrandLogo = ({ className, lightMode = false }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative mt-2">
      <img 
        src={logo} 
        alt="Vishwanatham Logo" 
        className="w-30 h-30 md:w-60 md:h-60 object-contain" 
      />
    </div>
  </div>
);

export default BrandLogo;