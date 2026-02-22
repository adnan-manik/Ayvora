import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { searchProducts } from '../services/productService';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const data = await searchProducts(query);
          setResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-dark-900/60 z-[90] transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide Down Search Panel */}
      <div 
        className={`fixed top-0 left-0 w-full bg-white z-[100] transform transition-transform duration-300 shadow-xl ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-gray-500 hover:text-dark-900 transition-colors">
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for scents, notes, or collections..."
              className="w-full text-2xl md:text-4xl font-serif font-bold text-dark-900 border-b-2 border-gray-200 py-4 focus:outline-none focus:border-gold-500 placeholder-gray-300 bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-12 min-h-[40vh] max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="text-center text-gray-400 mt-10">
                <p>Start typing to discover your next signature scent.</p>
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p>No matches found for "{query}".</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {results.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`} 
                    onClick={onClose}
                    className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0 rounded-sm overflow-hidden">
                      <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-dark-900 group-hover:text-gold-600 transition-colors">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <p className="text-sm font-semibold">Rs. {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {results.length > 0 && (
              <div className="text-center border-t border-gray-100 pt-6">
                <Link 
                  to="/shop" 
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-gold-600 font-bold uppercase tracking-widest text-xs hover:text-gold-700"
                >
                  View All Products <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};