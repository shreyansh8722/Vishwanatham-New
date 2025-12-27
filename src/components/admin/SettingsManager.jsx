import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Loader2, Globe, Shield, Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: "Pahnawa Banaras",
    supportEmail: "", supportPhone: "", address: "",
    instagram: "", facebook: "", twitter: "",
    shippingPolicy: "", returnPolicy: ""
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setSettings(prev => ({ ...prev, ...doc.data() }));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { ...settings, updatedAt: new Date() });
      toast.success("Settings saved!");
    } catch (err) { toast.error("Save failed"); } 
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-[#202223]">Store Settings</h2>
         <button onClick={handleSave} disabled={saving} className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-black disabled:opacity-50 flex items-center gap-2">
           {saving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Save
         </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E1E3E5] space-y-4">
         <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2"><Globe size={18}/> General Details</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label><input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-[#B08D55]" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Support Phone</label><input value={settings.supportPhone} onChange={e => setSettings({...settings, supportPhone: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-[#B08D55]" /></div>
         </div>
         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label><textarea rows="2" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-[#B08D55]" /></div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E1E3E5] space-y-4">
         <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2"><Shield size={18}/> Policies</h3>
         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shipping Text</label><input value={settings.shippingPolicy} onChange={e => setSettings({...settings, shippingPolicy: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-[#B08D55]" /></div>
         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Returns Text</label><input value={settings.returnPolicy} onChange={e => setSettings({...settings, returnPolicy: e.target.value})} className="w-full border p-2 rounded text-sm outline-none focus:border-[#B08D55]" /></div>
      </div>
    </div>
  );
};