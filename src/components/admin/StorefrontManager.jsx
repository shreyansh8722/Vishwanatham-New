import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, Image as ImageIcon, LayoutTemplate, MousePointerClick, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StorefrontManager() {
  const [content, setContent] = useState({ spotlight: { title: "", subtitle: "", buttonText: "", image: "" } });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('spotlight');

  useEffect(() => {
    return onSnapshot(doc(db, 'storefront', 'home_content'), (snap) => {
      if (snap.exists()) setContent(prev => ({ ...prev, ...snap.data() }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, 'storefront', 'home_content'), content, { merge: true });
    setSaving(false);
    toast.success("Saved successfully");
  };

  const uploadImage = async (file, section, field) => {
    const sRef = ref(storage, `storefront/${section}_${field}_${Date.now()}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: url } }));
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
       <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full">
          <h3 className="font-bold text-gray-900 mb-4 px-2 uppercase text-xs tracking-wider">Theme Editor</h3>
          <nav className="space-y-1">
             <button onClick={() => setActiveSection('spotlight')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'spotlight' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                <LayoutTemplate size={16} /> Hero Section
             </button>
             {/* Add more sections as needed */}
          </nav>
       </div>

       <div className="col-span-9 flex flex-col gap-4 h-full">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 overflow-y-auto relative">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold capitalize">{activeSection} Settings</h2>
                <button onClick={handleSave} disabled={saving} className="bg-[#B08D55] text-white px-6 py-2 rounded-lg text-sm font-bold uppercase disabled:opacity-50 flex items-center gap-2">
                   {saving && <Loader2 className="animate-spin" size={14}/>} Save Changes
                </button>
             </div>

             {activeSection === 'spotlight' && (
                <div className="space-y-6 max-w-2xl">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Heading</label><input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" value={content.spotlight?.title} onChange={e => setContent({...content, spotlight: {...content.spotlight, title: e.target.value}})} /></div>
                      <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Button Text</label><input className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" value={content.spotlight?.buttonText} onChange={e => setContent({...content, spotlight: {...content.spotlight, buttonText: e.target.value}})} /></div>
                   </div>
                   <div><label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Subheading</label><textarea className="w-full border border-gray-300 p-2.5 rounded-lg text-sm" rows="3" value={content.spotlight?.subtitle} onChange={e => setContent({...content, spotlight: {...content.spotlight, subtitle: e.target.value}})} /></div>
                   
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative hover:bg-gray-50 transition-colors">
                      {content.spotlight?.image ? <img src={content.spotlight.image} className="h-40 w-full object-cover rounded-lg shadow-sm" /> : <div className="h-40 flex items-center justify-center text-gray-400 flex-col gap-2"><ImageIcon size={32}/><span className="text-xs font-bold uppercase">Upload Banner</span></div>}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'spotlight', 'image')} />
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}