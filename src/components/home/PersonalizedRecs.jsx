import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { RASHI_MAPPING } from '../../data/rashiMapping';

// Use your actual Firebase function URL here
const API_URL = "https://us-central1-vishwanatham-739fe.cloudfunctions.net/getHoroscope";

const PersonalizedRecs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rashi'); // 'rashi' | 'dob'
  const [loading, setLoading] = useState(false);
  
  // DOB Form State
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  
  const handleDobSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // 1. Prepare Data for API
        const datetime = `${dob}T${time}:00+05:30`;
        const coordinates = "25.3176,82.9739"; // Default to Kashi (Varanasi) for now

        // 2. Fetch from your Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ datetime, coordinates })
        });
        
        const result = await response.json();
        
        if (result.success && result.data?.sign) {
            // 3. Navigate to Shop with Rashi pre-selected
            // We use the English name from API (e.g., "Aries") to match our mapping
            navigate(`/shop?rashi=${result.data.sign}`);
        } else {
            alert("Could not calculate. Please try selecting your Rashi manually.");
        }
    } catch (error) {
        console.error(error);
        alert("Connection error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#F9F7F2] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#B08D55]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E4F3E]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <span className="text-[#B08D55] font-bold text-xs uppercase tracking-widest mb-2 block">
            Vedic Wisdom
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2E4F3E] font-bold mb-4">
            Discover Your Spiritual Profile
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Not sure what to wear? Get personalized Rudraksha & Gemstone recommendations based on your Vedic birth chart or Moon Sign.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E6D5B8]">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('rashi')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'rashi' ? 'bg-[#2E4F3E] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Select Your Rashi
            </button>
            <button 
              onClick={() => setActiveTab('dob')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'dob' ? 'bg-[#2E4F3E] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Calculate by DOB
            </button>
          </div>

          <div className="p-8 md:p-12">
            {/* TAB 1: RASHI SELECTOR */}
            {activeTab === 'rashi' && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {Object.keys(RASHI_MAPPING).map((rashi) => (
                  <button
                    key={rashi}
                    onClick={() => navigate(`/shop?rashi=${rashi}`)}
                    className="group flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:border-[#B08D55] hover:bg-[#FFFBF0] transition-all"
                  >
                    <div className="w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#B08D55] group-hover:text-white transition-colors">
                      {/* Placeholder Icons - You can replace with SVGs later */}
                      <span className="text-xl">🕉️</span>
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{rashi}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{RASHI_MAPPING[rashi].indianName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* TAB 2: DOB CALCULATOR */}
            {activeTab === 'dob' && (
              <div className="flex flex-col md:flex-row gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-1 space-y-4 w-full">
                  <h3 className="font-serif text-xl text-[#2E4F3E] font-bold">
                    Get a Free Vedic Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter your birth details to generate your accurate Moon Sign (Rashi) and find the Rudraksha that aligns with your ruling planet.
                  </p>
                  
                  <form onSubmit={handleDobSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Birth Date</label>
                            <input 
                                type="date" 
                                required
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B08D55] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Birth Time</label>
                            <input 
                                type="time" 
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B08D55] outline-none"
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#B08D55] hover:bg-[#967645] text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <> <Sparkles size={18} /> Calculate & Recommend </>}
                    </button>
                  </form>
                </div>

                {/* Decorative Side Image */}
                <div className="hidden md:block w-1/3">
                    <div className="aspect-[3/4] bg-[#2E4F3E] rounded-2xl relative overflow-hidden flex items-center justify-center text-center p-6">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        <div className="relative z-10 text-[#F4EBD9]">
                            <Star className="w-12 h-12 mx-auto mb-4 text-[#B08D55]" fill="currentColor" />
                            <h4 className="font-serif font-bold text-lg mb-2">100% Accurate</h4>
                            <p className="text-xs opacity-80">
                                We use the Prokerala Vedic Astrology API to calculate your exact planetary positions.
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecs;