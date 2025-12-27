import React, { useState, Suspense, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, ShoppingBag, Tag, Users, Package, 
  Monitor, Settings, LogOut, Menu, Bell, Search, 
  X, Ticket, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SMART LAZY LOADER ---
// This prevents the "Element type is invalid" crash by finding the correct export automatically.
const smartLazy = (importPromise, name) => {
  return React.lazy(async () => {
    try {
      const module = await importPromise;
      // If the file has "export default", use it. If it has "export const Name", use that.
      const Component = module.default || module[name];
      
      if (!Component) {
        console.error(`AdminPage Error: Could not find component "${name}" in the file.`);
        return { default: () => <div className="p-6 text-red-600 font-bold bg-red-50 rounded">Error: Component {name} not exported correctly.</div> };
      }
      return { default: Component };
    } catch (error) {
      console.error(`AdminPage Error: Failed to load file for "${name}".`, error);
      return { default: () => <div className="p-6 text-red-600 font-bold bg-red-50 rounded">Error: File not found for {name}.</div> };
    }
  });
};

// --- IMPORT COMPONENTS ---
const AdminDashboard = smartLazy(import('../components/admin/AdminDashboard'), 'AdminDashboard');
const ProductManager = smartLazy(import('../components/admin/ProductManager'), 'ProductManager');
const OrderManager = smartLazy(import('../components/admin/OrderManager'), 'OrderManager');
const CustomerManager = smartLazy(import('../components/admin/CustomerManager'), 'CustomerManager');
const InventoryManager = smartLazy(import('../components/admin/InventoryManager'), 'InventoryManager');
const StorefrontManager = smartLazy(import('../components/admin/StorefrontManager'), 'StorefrontManager');
const ContentManager = smartLazy(import('../components/admin/ContentManager'), 'ContentManager');
const CouponManager = smartLazy(import('../components/admin/CouponManager'), 'CouponManager');
const MessageInbox = smartLazy(import('../components/admin/MessageInbox'), 'MessageInbox');
const SettingsManager = smartLazy(import('../components/admin/SettingsManager'), 'SettingsManager');

// --- LOADING SPINNER ---
const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#1A1A1A]"></div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Module...</span>
    </div>
  </div>
);

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Security Check
  useEffect(() => {
    if (user && user.role !== 'admin') {
       navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
     return <div className="flex h-screen items-center justify-center text-gray-500 font-medium">Verifying Access Permissions...</div>;
  }

  // Navigation Structure
  const menuGroups = [
    {
      label: 'Core',
      items: [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'products', label: 'Products', icon: Tag },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'customers', label: 'Customers', icon: Users },
      ]
    },
    {
      label: 'Sales Channels',
      items: [
        { id: 'storefront', label: 'Online Store', icon: Monitor },
        { id: 'content', label: 'Content & CMS', icon: ImageIcon },
        { id: 'coupons', label: 'Discounts', icon: Ticket },
      ]
    },
    {
      label: 'Communication',
      items: [
        { id: 'inbox', label: 'Inbox', icon: MessageSquare },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const handleTabChange = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F6F6F7] font-sans text-[#202223] overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden md:flex flex-col bg-[#1A1A1A] text-[#E3E3E3] transition-all duration-300 z-50 shadow-xl ${isSidebarOpen ? 'w-60' : 'w-16'}`}>
        <div className="h-14 flex items-center px-4 bg-[#202020] border-b border-[#333] flex-shrink-0">
           <div className="w-8 h-8 bg-[#B08D55] rounded-md flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0">V</div>
           <div className={`ml-3 overflow-hidden transition-all duration-300 ${!isSidebarOpen && 'opacity-0 w-0'}`}>
             <h1 className="font-bold tracking-wide text-sm leading-tight">Vishwanatham</h1>
           </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {isSidebarOpen && (
                <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{group.label}</h4>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-[13px] font-medium transition-all rounded-md group relative
                        ${activeTab === item.id ? 'bg-[#303030] text-white' : 'text-[#A1A1A1] hover:bg-[#303030] hover:text-white'}`}
                    >
                      <item.icon size={18} strokeWidth={2} className={activeTab === item.id ? 'text-[#B08D55]' : 'text-gray-500 group-hover:text-gray-300'} />
                      {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                      {!isSidebarOpen && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-[#333] bg-[#202020]">
           <button onClick={logout} className="flex items-center w-full px-2 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#303030] rounded-md transition-colors">
              <LogOut size={16} className="mr-3" />
              {isSidebarOpen && "Log Out"}
           </button>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] text-white z-50 md:hidden flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#333]">
                 <span className="font-bold">Menu</span>
                 <button onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {menuGroups.map(g => g.items).flat().map(item => (
                   <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center p-3 rounded-lg ${activeTab === item.id ? 'bg-[#B08D55]' : 'hover:bg-[#333]'}`}>
                      <item.icon size={20} className="mr-3"/> {item.label}
                   </button>
                 ))}
              </div>
              <div className="p-4 border-t border-[#333]">
                 <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400"><LogOut size={16}/> Sign Out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="h-14 bg-white border-b border-[#E1E3E5] flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-md"><Menu size={18}/></button>
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:block p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"><Menu size={18}/></button>
              <h1 className="text-sm font-bold text-gray-700 capitalize">{activeTab}</h1>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative hidden lg:block">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input type="text" placeholder="Search" className="pl-8 pr-3 py-1.5 bg-[#F1F2F3] border border-transparent focus:bg-white focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] rounded-md text-sm outline-none transition-all w-64" />
              </div>
              <div className="w-7 h-7 rounded bg-[#B08D55] text-white flex items-center justify-center font-bold text-xs">{user.email?.[0].toUpperCase()}</div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F6F6F7]">
           <div className="max-w-[1600px] mx-auto min-h-full pb-20">
             <Suspense fallback={<LoadingFallback />}>
                {activeTab === 'dashboard' && <AdminDashboard onChangeTab={setActiveTab} />}
                {activeTab === 'products' && <ProductManager />}
                {activeTab === 'orders' && <OrderManager />}
                {activeTab === 'customers' && <CustomerManager />}
                {activeTab === 'inventory' && <InventoryManager />}
                {activeTab === 'storefront' && <StorefrontManager />}
                {activeTab === 'content' && <ContentManager />}
                {activeTab === 'coupons' && <CouponManager />}
                {activeTab === 'inbox' && <MessageInbox />}
                {activeTab === 'settings' && <SettingsManager />}
             </Suspense>
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;