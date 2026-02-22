import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { getFeaturedProducts, getAllProducts } from '../services/productService';
import { Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomePageProps {
  onAddToCart: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const featured = await getFeaturedProducts();
        const all = await getAllProducts();
        setFeaturedProducts(featured.slice(0, 4));
        setBestSellers(all.filter(p => p.isBestSeller).slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Hero />
      
      {/* Featured Collection */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-20 bg-dark-900 text-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
               <div>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">The Featured Collection</h2>
                  <p className="text-gray-400 max-w-lg">Exquisite impressions of world-class fragrances, curated for the most discerning noses.</p>
               </div>
               <Link to="/shop" className="text-gold-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mt-4 md:mt-0 group">
                 Explore All <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
               </Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-6 snap-x scrollbar-hide">
               {featuredProducts.map(product => (
                 <div key={product.id} className="relative group min-w-[200px] w-[200px] flex-shrink-0 snap-start">
                    <ProductCard product={product} onAddToCart={onAddToCart} isDarkBg={true} />
                 </div>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark-900 mb-4">Best Sellers</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our community's favorites. Discover the scents that everyone is talking about.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-gold-500" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {bestSellers.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Promise Section */}
      <section className="py-20 bg-gray-50">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500 shadow-sm">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
               </div>
               <h3 className="font-serif font-bold text-lg mb-2">Long Lasting</h3>
               <p className="text-sm text-gray-600">Formulated with high concentration oils to ensure your scent stays with you all day.</p>
            </div>
            <div className="p-6">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500 shadow-sm">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
               </div>
               <h3 className="font-serif font-bold text-lg mb-2">Premium Quality</h3>
               <p className="text-sm text-gray-600">Sourced from the finest ingredients worldwide, creating the perfect impressions.</p>
            </div>
            <div className="p-6">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500 shadow-sm">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
               </div>
               <h3 className="font-serif font-bold text-lg mb-2">Fast Delivery</h3>
               <p className="text-sm text-gray-600">Swift shipping across the country with secure packaging and tracking.</p>
            </div>
         </div>
      </section>
    </>
  );
};