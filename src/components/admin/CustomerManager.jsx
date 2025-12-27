import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, UserCheck } from 'lucide-react';

export const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      const uniqueMap = new Map();
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      snap.forEach(doc => {
        const data = doc.data();
        const email = data.shippingDetails?.email;
        if (email && !uniqueMap.has(email)) {
          uniqueMap.set(email, {
             email, 
             name: `${data.shippingDetails.firstName} ${data.shippingDetails.lastName}`,
             phone: data.shippingDetails.phone,
             totalSpent: data.totalAmount
          });
        }
      });
      setCustomers(Array.from(uniqueMap.values()));
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Customers</h2>
       </div>
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
             <div className="relative w-full max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-black" />
             </div>
          </div>
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
               <tr>
                 <th className="p-4">Customer</th>
                 <th className="p-4">Contact</th>
                 <th className="p-4 text-center">Status</th>
                 <th className="p-4 text-right">Spent</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filtered.map((c, i) => (
                 <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#B08D55]/10 text-[#B08D55] flex items-center justify-center text-xs font-bold">{c.name.charAt(0)}</div>
                          {c.name}
                       </div>
                    </td>
                    <td className="p-4 text-gray-500">
                       <div className="text-xs">{c.email}</div>
                       <div className="text-xs">{c.phone}</div>
                    </td>
                    <td className="p-4 text-center"><span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase"><UserCheck size={12}/> Active</span></td>
                    <td className="p-4 text-right font-medium">₹{c.totalSpent.toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};