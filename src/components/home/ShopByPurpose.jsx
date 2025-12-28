import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const purposes = [
  { 
    id: 'wealth', 
    title: 'Wealth & Prosperity', 
    sanskrit: 'Dhan Vriddhi', 
    description: 'Attract abundance and financial stability.',
    img: 'https://images.unsplash.com/photo-1621506821957-1b50ab77f739?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=wealth' 
  },
  { 
    id: 'health', 
    title: 'Health & Vitality', 
    sanskrit: 'Arogyam', 
    description: 'Boost immunity and physical well-being.',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=health' 
  },
  { 
    id: 'protection', 
    title: 'Protection Shield', 
    sanskrit: 'Raksha Kavach', 
    description: 'Ward off negative energies and evil eye.',
    img: 'https://images.unsplash.com/photo-1515966306806-03c73335e236?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=protection' 
  },
  { 
    id: 'love', 
    title: 'Love & Marriage', 
    sanskrit: 'Prem & Vivah', 
    description: 'Harmonize relationships and find love.',
    img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=marriage' 
  },
  { 
    id: 'peace', 
    title: 'Mental Peace', 
    sanskrit: 'Manah Shanti', 
    description: 'Relieve stress, anxiety and find calm.',
    img: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=peace' 
  },
  { 
    id: 'career', 
    title: 'Career & Success', 
    sanskrit: 'Karyasiddhi', 
    description: 'Remove obstacles in business and job.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=career' 
  }
];

const ShopByPurpose = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header - Cleaned Up */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-serif text-4xl md:text-6xl font-medium text-black">
            Shop by Purpose
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed font-light">
            Each artifact is chosen to resonate with specific energies, helping you manifest your deepest desires.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {purposes.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(item.link)}
              className="group relative h-[400px] overflow-hidden cursor-pointer rounded-sm"
            >
              {/* Image Layer */}
              <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Decorative Border (Gold Frame effect on hover) */}
              <div className="absolute inset-4 border border-white/20 group-hover:border-[#B08D55]/60 transition-colors duration-500 z-10"></div>

              {/* Content Layer */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white z-20">
                
                {/* Sanskrit Badge */}
                <div className="transform -translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest uppercase text-[#E5C580] mb-3 rounded-full">
                        {item.sanskrit}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-3xl text-white mb-2 leading-tight group-hover:text-[#F3E5AB] transition-colors duration-300">
                  {item.title}
                </h3>
                
                {/* Description & Link */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-[max-height] duration-500 ease-in-out">
                    <p className="text-sm text-gray-300 font-light leading-relaxed mb-4 border-l-2 border-[#B08D55] pl-3">
                        {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white group-hover:gap-4 transition-all">
                        Discover Collection <ArrowRight size={14} />
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByPurpose;