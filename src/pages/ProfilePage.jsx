import React, { useState, useEffect } from 'react';
import { Package, MapPin, LogOut, LayoutDashboard, ChevronRight, Home, ArrowLeft } from 'lucide-react'; // Added Icons
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState('orders');

  // Protect Route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) return null;

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-body">
      <div className="container mx-auto max-w-6xl">
        
        {/* --- NEW: BREADCRUMBS NAVIGATION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           {/* Breadcrumb Trail: Home > Profile */}
           <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
                <Home size={15} />
                <span>Home</span>
              </Link>
              <ChevronRight size={14} />
              <span className="font-bold text-black">My Account</span>
           </nav>

           {/* Explicit Back Button */}
           <button 
             onClick={() => navigate('/')} 
             className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
           >
             <ArrowLeft size={16} /> Back to Home
           </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
           <div>
             <h1 className="font-heading text-3xl md:text-4xl font-bold text-black">My Account</h1>
             <p className="text-gray-500 mt-2 text-sm">
               Welcome back, <span className="text-black font-bold">{user.displayName || 'Devotee'}</span>
             </p>
           </div>
           
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Member Since {new Date(user.metadata.creationTime).getFullYear()}
              </span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* SIDEBAR NAVIGATION */}
           <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                 
                 {/* User Info */}
                 <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-heading font-bold text-xl mb-3">
                       {getInitials(user.displayName)}
                    </div>
                    <div className="text-sm font-bold text-black">{user.displayName || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</div>
                 </div>

                 {/* Menu Items */}
                 <nav className="p-2 space-y-1">
                   <button 
                     onClick={() => setActiveTab('orders')}
                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold uppercase tracking-wide transition-all ${
                       activeTab === 'orders' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                     }`}
                   >
                      <Package size={18} /> Order History
                   </button>
                   
                   <button 
                     onClick={() => setActiveTab('addresses')}
                     className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold uppercase tracking-wide transition-all ${
                       activeTab === 'addresses' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                     }`}
                   >
                      <MapPin size={18} /> Addresses
                   </button>

                   <div className="my-2 border-t border-gray-100"></div>

                   {/* --- ADMIN BUTTON (Only if role is admin) --- */}
                   {user.role === 'admin' && (
                     <button 
                       onClick={() => navigate('/admin')}
                       className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-black hover:bg-gray-100 transition-colors mb-1"
                     >
                        <LayoutDashboard size={18} /> Admin Dashboard
                     </button>
                   )}

                   <button 
                     onClick={handleLogout}
                     className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-red-500 hover:bg-red-50 transition-colors"
                   >
                      <LogOut size={18} /> Logout
                   </button>
                 </nav>
              </div>
           </div>

           {/* RIGHT CONTENT AREA */}
           <div className="w-full lg:w-3/4">
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                 <div className="space-y-6 animate-fade-in">
                    <h2 className="font-heading text-2xl font-bold mb-6">Recent Orders</h2>
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                        <p className="text-gray-500 text-sm mb-6">Your spiritual journey begins with your first step.</p>
                        <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-[var(--color-primary)] transition-colors">
                           Start Shopping
                        </button>
                    </div>
                 </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-end mb-6">
                       <h2 className="font-heading text-2xl font-bold">Saved Addresses</h2>
                       <button className="text-xs font-bold text-[var(--color-primary)] uppercase hover:underline">
                         + Add New
                       </button>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                        <p className="text-gray-500 text-sm">You haven't saved any addresses yet.</p>
                    </div>
                 </div>
              )}

           </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;