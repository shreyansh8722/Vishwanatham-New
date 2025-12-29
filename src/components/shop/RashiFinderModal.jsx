import React, { useState } from 'react';
import { X, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import { RASHI_MAPPING } from '../../data/rashiMapping';

// IMPORTANT: Replace this with your actual Firebase Project ID later
// You can find it in your .firebaserc file
const FIREBASE_PROJECT_ID = "vishwanatham-739fe"; 
const API_URL = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/getHoroscope`;

export default function RashiFinderModal({ isOpen, onClose, onRashiSelected }) {
  const [mode, setMode] = useState('select'); // 'select' | 'calculate' | 'result'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ dob: '', time: '', city: '' });
  const [calculatedRashi, setCalculatedRashi] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Formating DateTime as ISO: YYYY-MM-DDTHH:MM:SS+05:30
      const datetime = `${formData.dob}T${formData.time}:00+05:30`;
      
      // Defaulting to Varanasi coordinates if they don't have a geocoding setup yet
      // In production, you'd use a Places API here
      const coordinates = "25.3176,82.9739"; 

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime, coordinates })
      });

      const result = await response.json();
      
      if (result.success && result.data?.sign) {
        setCalculatedRashi(result.data.sign); 
        setMode('result');
      } else {
        setError("Could not calculate. Please try again or select manually.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSelect = (rashiName) => {
    onRashiSelected(rashiName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-[#B08D55]/20">
        
        {/* Header */}
        <div className="bg-[#1F362A] p-5 flex justify-between items-center text-white relative overflow-hidden">
          <div className="relative z-10">
             <h3 className="font-serif font-bold text-xl text-[#F4EBD9]">
               {mode === 'result' ? 'Your Cosmic Identity' : 'Find Your Rashi'}
             </h3>
             <p className="text-[10px] text-gray-300 uppercase tracking-widest opacity-80">Vedic Calculation</p>
          </div>
          <button onClick={onClose} className="relative z-10 hover:text-[#B08D55] transition-colors"><X size={24} /></button>
          
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#B08D55]/20 rounded-full blur-2xl"></div>
        </div>

        <div className="p-6">
          
          {/* 1. SELECTION MODE */}
          {mode === 'select' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                   Select your Moon Sign (Rashi) to reveal your personalized Rudraksha and Gemstone recommendations.
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(RASHI_MAPPING).map((rashi) => (
                    <button 
                      key={rashi}
                      onClick={() => handleManualSelect(rashi)}
                      className="group p-2 border border-gray-100 bg-gray-50 rounded-lg text-sm hover:bg-[#1F362A] hover:border-[#1F362A] transition-all duration-300"
                    >
                      <span className="block font-bold text-gray-900 group-hover:text-white transition-colors">{rashi}</span>
                      <span className="block text-[10px] text-gray-500 group-hover:text-[#F4EBD9] transition-colors uppercase tracking-wider">
                        {RASHI_MAPPING[rashi].indianName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or Calculate</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                onClick={() => setMode('calculate')}
                className="w-full bg-[#B08D55] text-white py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:bg-[#967645] transition-all flex items-center justify-center gap-2 group"
              >
                <Calendar size={18} className="group-hover:scale-110 transition-transform" /> 
                Find by Date of Birth
              </button>
            </div>
          )}

          {/* 2. CALCULATION FORM */}
          {mode === 'calculate' && (
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">Date of Birth</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B08D55] focus:bg-white outline-none transition-all"
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">Time of Birth</label>
                <input 
                  type="time" 
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B08D55] focus:bg-white outline-none transition-all"
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">City of Birth</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 focus-within:border-[#B08D55] focus-within:bg-white transition-all">
                  <MapPin size={18} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Varanasi"
                    required
                    className="w-full p-3 bg-transparent outline-none placeholder:text-gray-400"
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1F362A] text-white py-4 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <> <Sparkles size={18} /> Reveal My Rashi </>}
              </button>
              
              <button 
                 type="button" 
                 onClick={() => setMode('select')} 
                 className="w-full text-xs text-gray-500 hover:text-gray-900 font-bold underline"
              >
                 Back to Selection
              </button>
            </form>
          )}

          {/* 3. RESULT VIEW */}
          {mode === 'result' && calculatedRashi && (
            <div className="text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-[#F4EBD9] to-[#E6D5B8] rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border-4 border-white">
                <span className="text-4xl">🕉️</span>
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-[#2E4F3E] mb-1">
                {calculatedRashi}
              </h2>
              <p className="text-sm text-[#B08D55] font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4 mx-10">
                {RASHI_MAPPING[calculatedRashi]?.indianName}
              </p>
              
              <div className="bg-[#F9F7F2] p-5 rounded-xl border border-[#E6D5B8] mb-6 text-left relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                   <p className="text-sm text-gray-800">
                     <span className="font-bold text-[#B08D55]">Ruling Planet:</span> {RASHI_MAPPING[calculatedRashi]?.planet}
                   </p>
                   <p className="text-sm text-gray-600 leading-relaxed italic">
                     "{RASHI_MAPPING[calculatedRashi]?.description}"
                   </p>
                </div>
              </div>

              <button 
                onClick={() => handleManualSelect(calculatedRashi)}
                className="w-full bg-[#B08D55] text-white py-4 rounded-lg font-bold shadow-lg shadow-[#B08D55]/30 hover:bg-[#967645] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Show Recommended Products <Sparkles size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}