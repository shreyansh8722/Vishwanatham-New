import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export const CartModal = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal 
  } = useCart();
  
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="font-heading text-xl font-bold text-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
            Your cart ({cartItems.length})
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
            aria-label="Close cart" // ADDED
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-black">Your cart is empty</p>
                <p className="font-body text-sm text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-sm font-bold border-b-2 border-[var(--color-primary)] pb-1 text-[var(--color-primary)] hover:text-black hover:border-black transition-colors uppercase tracking-wide"
              >
                Start shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                <div className="w-20 h-24 bg-gray-50 overflow-hidden relative rounded-md border border-gray-100 flex-shrink-0">
                  <img 
                    src={item.images?.[0] || item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-heading text-base font-bold text-black leading-tight line-clamp-2">
                      <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="hover:text-[var(--color-primary)] transition-colors">
                        {item.name}
                      </Link>
                    </h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Remove item" // ADDED
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3 font-body font-medium">
                    {item.selectedSize && `Size: ${item.selectedSize} | `} <span className="text-black font-bold">₹{item.price.toLocaleString()}</span>
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-sm h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        className="px-2 hover:bg-gray-100 text-gray-500 h-full flex items-center transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity" // ADDED
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold min-w-[20px] text-center text-black">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        className="px-2 hover:bg-gray-100 text-gray-500 h-full flex items-center transition-colors"
                        aria-label="Increase quantity" // ADDED
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-primary)] ml-auto">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-body text-sm font-bold text-gray-500 uppercase tracking-wide">Subtotal</span>
              <span className="font-heading text-2xl font-bold text-black">
                ₹{getCartTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mb-6 text-center uppercase tracking-wider">
              Shipping & taxes calculated at checkout
            </p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 text-sm font-bold rounded-md hover:bg-[var(--color-primary)] transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest"
            >
              Checkout now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;