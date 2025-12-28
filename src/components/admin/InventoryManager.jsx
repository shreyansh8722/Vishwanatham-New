import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Save, AlertCircle } from 'lucide-react';

export const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [changes, setChanges] = useState({}); // Track local changes before saving

  // Listen to Live Data
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleChange = (id, newStock) => {
    setChanges(prev => ({ ...prev, [id]: Number(newStock) }));
  };

  const saveStock = async (id) => {
    const newStock = changes[id];
    if (newStock === undefined) return;

    try {
      // Direct Write to Firebase
      await updateDoc(doc(db, 'products', id), { stock: newStock });
      
      // Clear local change indicator
      const newChanges = { ...changes };
      delete newChanges[id];
      setChanges(newChanges);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quick Inventory</h2>
      
      <div className="grid gap-4">
        {products.map(p => {
          const hasChange = changes[p.id] !== undefined;
          const currentVal = hasChange ? changes[p.id] : p.stock;

          return (
            <div key={p.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <img src={p.featuredImageUrl} className="w-12 h-12 rounded bg-gray-100 object-cover" alt="" />
                <div>
                  <h4 className="font-bold text-gray-900">{p.name}</h4>
                  <p className="text-xs text-gray-500">Live DB Stock: {p.stock}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0"
                  className={`w-24 p-2 border rounded font-bold text-center outline-none transition-all ${currentVal === 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                  value={currentVal}
                  onChange={(e) => handleChange(p.id, e.target.value)}
                />
                
                {hasChange && (
                  <button 
                    onClick={() => saveStock(p.id)}
                    className="p-2 bg-black text-white rounded hover:bg-green-600 transition-colors animate-fade-in"
                    title="Save to Firebase"
                  >
                    <Save size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};