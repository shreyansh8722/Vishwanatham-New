import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- EAGER COMPONENTS (Load Instantly) ---
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartModal from './components/shop/CartModal';
import { AppSkeleton } from './components/skeletons/AppSkeleton';

// OPTIMIZATION: Import Home Page directly so it renders immediately
// (No "Loading..." or blank screen for the main landing page)
import Home from './pages/HomePage'; 

// --- LAZY COMPONENTS (Download only when needed) ---
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ConsultPage = lazy(() => import('./pages/ConsultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));

// --- ADMIN (Heavy - Never load this for normal users) ---
const AdminPage = lazy(() => import('./pages/AdminPage'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-900">
      <ScrollToTop />
      
      {/* Navbar stays visible during navigation */}
      <Navbar />
      <CartModal />

      <main className="flex-grow relative min-h-screen">
        {/* Suspense is still needed for the OTHER lazy pages */}
        <Suspense fallback={<AppSkeleton />}>
          <Routes>
            {/* Home is now rendered instantly without Suspense waiting */}
            <Route path="/" element={<Home />} />
            
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/consult" element={<ConsultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Route */}
            <Route path="/admin/*" element={<AdminPage />} />
            
            <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;