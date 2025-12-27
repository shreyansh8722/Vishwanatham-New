import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo'; 
import { CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Truck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 border-t border-gray-900 font-body">
      
      {/* 1. TRUST ICONS */}
      <div className="container mx-auto px-6 pb-12 border-b border-gray-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: CheckCircle2, title: "Lab Certified", desc: "100% Authentic" },
            { icon: ShieldCheck, title: "Secure Payment", desc: "SSL Encrypted" },
            { icon: Truck, title: "Express Shipping", desc: "All India Delivery" },
            { icon: Phone, title: "24/7 Support", desc: "Expert Assistance" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-3 group">
              <item.icon className="w-8 h-8 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" strokeWidth={1.5} />
              <div>
                <h4 className="font-heading text-lg font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MAIN LINKS */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" aria-label="Vishwanatham Home">
              {/* Ensure BrandLogo handles 'text-white' or passes color props */}
              <BrandLogo className="text-white h-8 w-auto" /> 
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs font-medium">
              Ancient wisdom for the modern soul. Delivering energized spiritual tools from Kashi to the world.
            </p>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6 text-white">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/shop?category=Rudraksha" className="hover:text-[var(--color-primary)] transition-colors">Rudraksha</Link></li>
              <li><Link to="/shop?category=Gemstones" className="hover:text-[var(--color-primary)] transition-colors">Gemstones</Link></li>
              <li><Link to="/shop?category=Yantras" className="hover:text-[var(--color-primary)] transition-colors">Yantras</Link></li>
              <li><Link to="/shop?category=Mala" className="hover:text-[var(--color-primary)] transition-colors">Japa Malas</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/about" className="hover:text-[var(--color-primary)] transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-[var(--color-primary)] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-[var(--color-primary)] transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6 text-white">Visit Us</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li className="flex items-start gap-3">
                 <MapPin size={18} className="text-[var(--color-primary)] shrink-0" />
                 <span>Godowlia Chowk, Varanasi,<br/>Uttar Pradesh, 221001</span>
              </li>
              <li className="flex items-center gap-3">
                 <Phone size={18} className="text-[var(--color-primary)] shrink-0" />
                 <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                 <Mail size={18} className="text-[var(--color-primary)] shrink-0" />
                 <span>support@vishwanatham.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-900 pt-8 mt-10 gap-4">
          <p className="text-xs text-gray-600 font-bold">
            © 2025 Vishwanatham. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
             <Link to="/privacy" className="hover:text-white">Privacy</Link>
             <Link to="/terms" className="hover:text-white">Terms</Link>
             <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;