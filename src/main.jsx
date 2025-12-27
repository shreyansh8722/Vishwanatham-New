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

// --- REMOVE LOADER FUNCTION ---
// This fades out the white screen smoothly once the app is ready
const removeLoader = () => {
  const loader = document.getElementById('root-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
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
  </React.StrictMode>
);

// Trigger removal after render
requestAnimationFrame(() => removeLoader());