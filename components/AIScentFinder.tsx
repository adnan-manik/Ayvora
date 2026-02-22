import React, { useState } from 'react';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { getPerfumeRecommendation } from '../services/geminiService';
import { Product } from '../types';

interface AIScentFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const AIScentFinder: React.FC<AIScentFinderProps> = ({ isOpen, onClose, onAddToCart }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{ product: Product | null, reason: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setRecommendation(null);
    
    const result = await getPerfumeRecommendation(input);
    setRecommendation(result);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-dark-900 z-10"
        >
          <X size={24} />
        </button>

        <div className="bg-gold-50 p-8 text-center border-b border-gold-100">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full text-gold-600 mb-4 shadow-sm">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-dark-900 mb-2">Ayvora AI Perfumer</h2>
          <p className="text-gray-600">Describe your mood, occasion, or favorite notes, and let our AI find your signature scent.</p>
        </div>

        <div className="p-8 overflow-y-auto">
          {!recommendation && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  className="w-full border border-gray-300 p-4 rounded-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none h-32"
                  placeholder="e.g., 'I want something fresh and citrusy for a summer beach wedding' or 'I love sandalwood and vanilla, looking for something sexy for date night.'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-full bg-dark-900 text-white py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-gold-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Analyzing Scent Profile...
                  </>
                ) : (
                  'Find My Scent'
                )}
              </button>
            </form>
          )}

          {recommendation && (
            <div className="animate-fade-in">
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gold-500 rounded-r-sm">
                <h4 className="font-bold text-gold-600 mb-1 text-sm uppercase tracking-wide">Why this match?</h4>
                <p className="text-gray-700 italic">"{recommendation.reason}"</p>
              </div>

              {recommendation.product ? (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-48 h-48 bg-gray-100 flex-shrink-0">
                    <img 
                      src={recommendation.product.images?.[0] || ''} 
                      alt={recommendation.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-serif font-bold text-dark-900 mb-2">{recommendation.product.name}</h3>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {recommendation.product.notes.map(note => (
                        <span key={note} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{note}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      <span className="text-xl font-semibold text-dark-900">Rs. {recommendation.product.price.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        onAddToCart(recommendation.product!);
                        onClose();
                      }}
                      className="bg-gold-500 text-white px-6 py-2 rounded-sm font-bold uppercase tracking-wide hover:bg-gold-600 transition-colors w-full md:w-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button 
                    onClick={() => setRecommendation(null)} 
                    className="text-gold-600 hover:text-gold-700 font-bold flex items-center justify-center gap-1 mx-auto"
                  >
                     Try another description <ArrowRight size={16}/>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};