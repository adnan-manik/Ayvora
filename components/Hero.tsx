import React, { useEffect, useState } from 'react';
import { getBanners } from '../services/productService';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      const data = await getBanners();
      // Filter only active banners
      const activeBanners = data.filter(b => b.active);
      setBanners(activeBanners);
      setLoading(false);
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Fallback if no banners found in DB
  if (!loading && banners.length === 0) {
    return (
      <div className="relative h-[80vh] w-full bg-gray-100 overflow-hidden">
        <img
          src="https://picsum.photos/seed/luxuryperfume/1920/1080"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90 animate-fade-in-up">
            Discover Your Signature Scent
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight animate-fade-in-up delay-100">
            Essence of <br/> <span className="text-gold-400">Elegance</span>
          </h1>
          <Link to="/shop" className="bg-white text-dark-900 hover:bg-gold-500 hover:text-white px-8 py-4 uppercase tracking-widest text-sm font-bold transition-all duration-300 animate-fade-in-up delay-200">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="h-[80vh] w-full bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="relative h-[80vh] w-full bg-dark-900 overflow-hidden group">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90 translate-y-0 transition-transform duration-700 delay-100">
              {banner.subtitle}
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-8 leading-tight max-w-4xl">
              {banner.title}
            </h1>
            <Link 
              to={banner.link} 
              className="bg-white text-dark-900 hover:bg-gold-500 hover:text-white px-8 py-4 uppercase tracking-widest text-sm font-bold transition-all duration-300 transform hover:scale-105"
            >
              Shop Now
            </Link>
          </div>
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-gold-500 w-8' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};