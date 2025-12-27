import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Ticket, Trash2, Percent, IndianRupee } from 'lucide-react';

export const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrder: '', description: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')), (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const createCoupon = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'coupons'), { ...form, code: form.code.toUpperCase(), value: Number(form.value), minOrder: Number(form.minOrder), createdAt: serverTimestamp(), isActive: true });
    setForm({ code: '', type: 'percent', value: '', minOrder: '', description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-lg border border-[#E1E3E5] shadow-sm">
          <h2 className="text-lg font-bold text-[#202223] mb-4 flex items-center gap-2"><Ticket size={20}/> Create Discount</h2>
          <form onSubmit={createCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-1"><input required placeholder="Code (e.g. SALE10)" className="w-full border p-2 rounded text-sm uppercase font-bold" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
             <div><select className="w-full border p-2 rounded text-sm bg-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="percent">Percentage %</option><option value="fixed">Fixed ₹</option></select></div>
             <div><input required type="number" placeholder="Value" className="w-full border p-2 rounded text-sm" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
             <div><input required type="number" placeholder="Min Order ₹" className="w-full border p-2 rounded text-sm" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})} /></div>
             <div className="md:col-span-3"><input required placeholder="Description (e.g. Summer Sale)" className="w-full border p-2 rounded text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
             <button className="md:col-span-1 bg-[#1A1A1A] text-white rounded text-sm font-bold uppercase hover:bg-black">Create</button>
          </form>
       </div>

       <div className="space-y-3">
          {coupons.map(c => (
             <div key={c.id} className="bg-white p-4 rounded-lg border border-[#E1E3E5] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center border border-green-100">{c.type === 'percent' ? <Percent size={16}/> : <IndianRupee size={16}/>}</div>
                   <div><h4 className="font-bold text-gray-900">{c.code}</h4><p className="text-xs text-gray-500">{c.description}</p></div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="font-bold">{c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}</span>
                   <button onClick={() => deleteDoc(doc(db, 'coupons', c.id))} className="text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};