import React, { useState, useEffect, useMemo } from 'react';
import { db, storage } from '../../lib/firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, Search, Filter, Trash2, X, Save, UploadCloud, Globe, Loader2, ArrowUpDown 
} from 'lucide-react';
import { compressImage } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- DND Imports ---
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Image Component ---
const SortableImage = ({ id, url, isNew, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group cursor-grab active:cursor-grabbing hover:border-[#B08D55] transition-all">
      <img src={url} className={`w-full h-full object-cover ${isNew ? 'opacity-90' : ''}`} alt="thumbnail" />
      <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="absolute top-1 right-1 bg-white shadow-sm text-red-500 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"><Trash2 size={12} /></button>
    </div>
  );
};

export const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Drawer State
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. LISTEN TO DATABASE (Not JSON)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // 2. PUBLISH FUNCTION (Updates JSON)
  const handlePublish = async () => {
    if (!confirm("Update live website with these changes?")) return;
    setPublishing(true);
    try {
      // Fetch fresh data from DB
      const snap = await getDocs(collection(db, 'products'));
      const allProducts = snap.docs.map(d => d.data());

      // Save to Storage (JSON)
      const jsonString = JSON.stringify(allProducts);
      const blob = new Blob([jsonString], { type: "application/json" });
      const storageRef = ref(storage, 'database/products.json');
      await uploadBytes(storageRef, blob);

      alert("Website Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert("Publish Failed");
    } finally {
      setPublishing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleDelete = async (id) => {
    if(confirm('Delete this product?')) await deleteDoc(doc(db, 'products', id));
  };

  const openDrawer = (product = null) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Products</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <p className="text-xs text-gray-500 font-medium">Database Connected</p>
            </div>
         </div>
         <div className="flex gap-2">
            {/* PUBLISH BUTTON */}
            <button 
              onClick={handlePublish} 
              disabled={publishing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all"
            >
              {publishing ? <Loader2 className="animate-spin" size={16}/> : <Globe size={16}/>}
              {publishing ? "Publishing..." : "Publish to Site"}
            </button>
            <button onClick={() => openDrawer()} className="bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
              <Plus size={16} /> Add Product
            </button>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-black" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="p-4 w-16">Img</th>
                <th className="p-4">Name</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => (
                <tr key={p.id} onClick={() => openDrawer(p)} className="hover:bg-gray-50 cursor-pointer group transition-colors">
                  <td className="p-4">
                    <img src={p.featuredImageUrl} className="w-10 h-10 rounded-md border border-gray-200 object-cover bg-gray-100" />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{p.name}</td>
                  <td className="p-4 font-medium text-gray-600">{p.stock}</td>
                  <td className="p-4 text-right font-bold">₹{p.price}</td>
                  <td className="p-4 text-center">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} product={editingProduct} />
    </div>
  );
};

// --- DRAWER COMPONENT ---
const ProductDrawer = ({ isOpen, onClose, product }) => {
  const isNew = !product;
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]); 
  const [saving, setSaving] = useState(false);
  
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    if (isOpen) {
      setForm(product || { name: '', price: '', stock: '', category: 'Rudraksha', description: '', mukhi: '', origin: 'Nepal' });
      const existing = (product?.imageUrls || []).map((url, i) => ({ id: `exist-${i}`, type: 'existing', url, file: null }));
      setImages(existing);
    }
  }, [isOpen, product]);

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file, i) => ({
        id: `new-${Date.now()}-${i}`, type: 'new', url: URL.createObjectURL(file), file: file
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalUrls = await Promise.all(images.map(async (img) => {
        if (img.type === 'existing') return img.url;
        const compressed = await compressImage(img.file);
        const sRef = ref(storage, `products/${Date.now()}_${img.id}`);
        await uploadBytes(sRef, compressed);
        return getDownloadURL(sRef);
      }));

      const payload = {
        ...form,
        id: product?.id || Date.now().toString(),
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrls: finalUrls,
        featuredImageUrl: finalUrls[0] || '',
        updatedAt: serverTimestamp()
      };
      if (isNew) payload.createdAt = serverTimestamp();

      // SAVE TO DATABASE (Not JSON)
      await setDoc(doc(db, 'products', payload.id), payload, { merge: true });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#F6F6F7] z-[9999] shadow-2xl flex flex-col border-l border-gray-200"
          >
             <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">{isNew ? 'Add Product' : 'Edit Product'}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form id="product-form" onSubmit={handleSave} className="space-y-6">
                   <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label><input required className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-black" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea rows={4} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-black" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
                   </div>

                   <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
                      <h4 className="font-bold text-sm text-gray-900 uppercase">Media</h4>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={images} strategy={rectSortingStrategy}>
                          <div className="grid grid-cols-4 gap-4">
                            {images.map((item) => <SortableImage key={item.id} id={item.id} url={item.url} isNew={item.type === 'new'} onDelete={() => setImages(prev => prev.filter(i => i.id !== item.id))} />)}
                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                              <UploadCloud className="text-gray-400 mb-1" size={24} /><span className="text-[10px] font-bold text-gray-500">Add</span>
                            </label>
                          </div>
                        </SortableContext>
                      </DndContext>
                   </div>
                   
                   <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label><input type="number" required className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-black" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} /></div>
                      <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label><input type="number" required className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-black" value={form.stock || ''} onChange={e => setForm({...form, stock: e.target.value})} /></div>
                   </div>
                </form>
             </div>

             <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button form="product-form" disabled={saving} className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-bold hover:bg-black flex items-center gap-2">
                   {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save
                </button>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};