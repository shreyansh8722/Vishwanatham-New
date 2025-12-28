import React, { useState, useEffect, useMemo } from 'react';
import { db, storage } from '../../lib/firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, Search, Trash2, X, Save, UploadCloud, Download, Loader2 
} from 'lucide-react';
import { compressImage } from '../../lib/utils'; // Assuming you have this helper
import { motion, AnimatePresence } from 'framer-motion';

export const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. LISTEN TO FIREBASE (Real-time)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // 2. DOWNLOAD JSON (For your Code Repo)
  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "products.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product permanently?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const openDrawer = (product = null) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Product Manager</h2>
          <p className="text-sm text-gray-500">Manage inventory and details</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
            title="Download for src/data/products.json"
          >
            <Download size={16} /> Download JSON
          </button>
          <button 
            onClick={() => openDrawer()}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-500">Image</th>
              <th className="p-4 font-bold text-gray-500">Name</th>
              <th className="p-4 font-bold text-gray-500">Stock</th>
              <th className="p-4 font-bold text-gray-500">Price</th>
              <th className="p-4 font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => (
              <tr key={p.id} onClick={() => openDrawer(p)} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4">
                  <img src={p.featuredImageUrl} alt="" className="w-10 h-10 rounded bg-gray-100 object-cover border" />
                </td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Drawer */}
      <ProductDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        product={editingProduct} 
      />
    </div>
  );
};

// --- DRAWER COMPONENT ---
const ProductDrawer = ({ isOpen, onClose, product }) => {
  const isNew = !product;
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(product || { 
        name: '', price: '', stock: 10, category: 'Rudraksha', description: '' 
      });
      setPreview(product?.featuredImageUrl || '');
      setImageFile(null);
    }
  }, [isOpen, product]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = preview;

      // 1. Upload Image if changed
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, compressed);
        imageUrl = await getDownloadURL(storageRef);
      }

      // 2. Prepare Payload
      const payload = {
        ...form,
        id: product?.id || `prod_${Date.now()}`,
        price: Number(form.price), // Ensure Number
        stock: Number(form.stock), // Ensure Number (Critical for logic)
        featuredImageUrl: imageUrl,
        imageUrls: [imageUrl], // Simple single image support
        updatedAt: serverTimestamp()
      };

      if (isNew) payload.createdAt = serverTimestamp();

      // 3. WRITE TO FIRESTORE
      await setDoc(doc(db, 'products', payload.id), payload, { merge: true });
      
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{isNew ? 'New Product' : 'Edit Product'}</h3>
              <button onClick={onClose}><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleSave} className="space-y-4">
                
                {/* Image Upload */}
                <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-black transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if(file) {
                        setImageFile(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud className="mx-auto mb-2" />
                      <span className="text-xs font-bold uppercase">Upload Image</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                  <input required className="w-full p-3 border rounded-lg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price (₹)</label>
                    <input type="number" required className="w-full p-3 border rounded-lg text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stock Qty</label>
                    <input type="number" required className="w-full p-3 border rounded-lg text-sm" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select className="w-full p-3 border rounded-lg text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="Rudraksha">Rudraksha</option>
                    <option value="Gemstones">Gemstones</option>
                    <option value="Yantra">Yantra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                  <textarea rows={4} className="w-full p-3 border rounded-lg text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

              </form>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button 
                type="submit" 
                form="product-form"
                disabled={saving}
                className="w-full py-3 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                Save to Database
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};