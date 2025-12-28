import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './hooks/useAuth'; 
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { LoginModalProvider } from './context/LoginModalContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));

// FIX: Removed React.StrictMode for stable touch gestures
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ProductProvider>
        <LoginModalProvider>
          <CartProvider>
            <App />
            <Toaster position="bottom-center" />
          </CartProvider>
        </LoginModalProvider>
      </ProductProvider>
    </AuthProvider>
  </BrowserRouter>
);