import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  DollarSign, ShoppingBag, Package, Users, ArrowUpRight, 
  TrendingUp, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatPrice } from '../../lib/utils';

export const AdminDashboard = ({ onChangeTab }) => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch All Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        
        let totalRev = 0;
        const uniqueCustomers = new Set();
        
        // Prepare Chart Data Skeleton (Last 7 Days)
        const chartMap = new Map();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); // e.g., "27 Oct"
          chartMap.set(key, 0);
        }

        // Process Orders
        ordersSnap.forEach(doc => {
          const data = doc.data();
          
          // Revenue
          totalRev += (Number(data.totalAmount) || 0);
          
          // Customers (Count unique emails)
          if (data.userEmail) uniqueCustomers.add(data.userEmail);
          
          // Chart Data Aggregation
          if (data.createdAt) {
            // Convert Firestore Timestamp to Date
            const dateObj = data.createdAt.toDate(); 
            const dateKey = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            
            if (chartMap.has(dateKey)) {
              chartMap.set(dateKey, chartMap.get(dateKey) + (Number(data.totalAmount) || 0));
            }
          }
        });

        // Convert Map back to Array for Recharts
        const finalChartData = Array.from(chartMap).map(([date, sales]) => ({ date, sales }));

        // 2. Fetch Product Count
        const productsSnap = await getDocs(collection(db, 'products'));

        // 3. Fetch Recent 5 Orders
        const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);

        // Update State
        setStats({
          revenue: totalRev,
          orders: ordersSnap.size,
          products: productsSnap.size,
          customers: uniqueCustomers.size
        });
        setSalesData(finalChartData);
        setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin" /> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={formatPrice(stats.revenue)} icon={DollarSign} trend="+12.5%" />
        <KpiCard title="Total Orders" value={stats.orders} icon={ShoppingBag} trend="+5.2%" />
        <KpiCard title="Active Products" value={stats.products} icon={Package} />
        <KpiCard title="Customers" value={stats.customers} icon={Users} trend="+8.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- SALES CHART --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Sales Overview</h3>
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">Last 7 Days</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08D55" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#B08D55" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [formatPrice(value), 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#B08D55" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
             <button onClick={() => onChangeTab('products')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <Package size={16} className="text-[#B08D55]" /> Add New Product
             </button>
             <button onClick={() => onChangeTab('orders')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <ShoppingBag size={16} className="text-[#B08D55]" /> Process Orders
             </button>
             <button onClick={() => onChangeTab('storefront')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <TrendingUp size={16} className="text-[#B08D55]" /> View Analytics
             </button>
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <button onClick={() => onChangeTab('orders')} className="text-xs font-bold text-[#B08D55] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 font-medium bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-normal">Order ID</th>
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal">Customer</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No orders yet.</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">#{order.id.slice(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just Now'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 
                          order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                          'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Stats
const KpiCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-gray-50 rounded-md text-gray-500">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          <ArrowUpRight size={12} className="mr-0.5" /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-xs text-gray-500 mt-1">{title}</p>
  </div>
);