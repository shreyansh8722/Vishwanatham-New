import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Search, Filter, Package } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search) || o.shippingDetails?.firstName?.toLowerCase().includes(search));

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Orders</h2>
       </div>
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-black" />
             </div>
          </div>
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
               <tr>
                 <th className="p-4">Order</th>
                 <th className="p-4">Date</th>
                 <th className="p-4">Customer</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filtered.map(order => (
                 <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                   <td className="p-4 font-bold">#{order.id.slice(0,6)}</td>
                   <td className="p-4 text-gray-500">{order.createdAt?.toDate().toLocaleDateString()}</td>
                   <td className="p-4">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</td>
                   <td className="p-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-xs rounded-md p-1.5 outline-none focus:border-black"
                      >
                        <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option>
                      </select>
                   </td>
                   <td className="p-4 text-right font-bold">{formatPrice(order.totalAmount)}</td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};