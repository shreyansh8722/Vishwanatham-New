import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { Search, Plus, Minus, PackageCheck, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export default function InventoryManager() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleStockUpdate = async (id, delta) => {
    try {
        await updateDoc(doc(db, 'products', id), { stock: increment(delta) });
    } catch(e) { console.error(e); }
  };

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Inventory</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search SKU or Name..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#B08D55] outline-none shadow-sm"
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
              <tr>
                 <th className="p-4 pl-6">Product</th>
                 <th className="p-4">SKU</th>
                 <th className="p-4 text-right">Price</th>
                 <th className="p-4 text-center">Status</th>
                 <th className="p-4 text-center">Available</th>
                 <th className="p-4 text-center">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                   <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                        <img src={p.featuredImageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-bold text-gray-900">{p.name}</span>
                   </td>
                   <td className="p-4 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                   <td className="p-4 text-right font-medium">{formatPrice(p.price)}</td>
                   <td className="p-4 text-center">
                      {p.stock < 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-[10px] font-bold uppercase">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase">In Stock</span>
                      )}
                   </td>
                   <td className="p-4 text-center font-bold text-gray-900">{p.stock}</td>
                   <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                         <button onClick={() => handleStockUpdate(p.id, -1)} className="p-1.5 border border-gray-300 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"><Minus size={14}/></button>
                         <button onClick={() => handleStockUpdate(p.id, 1)} className="p-1.5 border border-gray-300 rounded hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"><Plus size={14}/></button>
                      </div>
                   </td>
                </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}