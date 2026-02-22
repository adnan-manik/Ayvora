import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product, SortOption } from '../types';
import { getProductsByCategory } from '../services/productService';
import { Loader2, ChevronDown } from 'lucide-react';

interface ShopPageProps {
  onAddToCart: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart }) => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Relevance);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Collection';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductsByCategory(category || 'All');
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case SortOption.PriceLowHigh:
        return a.price - b.price;
      case SortOption.PriceHighLow:
        return b.price - a.price;
      case SortOption.Newest:
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  const categories = ['All', 'Men', 'Women', 'Impression', 'Testers'];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Ayvora Store</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-dark-900 mb-6">{displayCategory}</h1>
          <div className="w-16 h-1 bg-gold-500 mx-auto"></div>
        </div>

        {/* Filter Tabs (Sub-navigation) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
            {categories.map(cat => {
              const isActive = cat === 'All' ? !category : category?.toLowerCase() === cat.toLowerCase();
              const target = cat === 'All' ? '/shop' : `/shop/${cat}`;
              
              return (
                <Link
                  key={cat}
                  to={target}
                  className={`text-sm uppercase tracking-widest pb-2 border-b-2 transition-all ${
                    isActive
                      ? 'border-gold-500 text-dark-900 font-bold' 
                      : 'border-transparent text-gray-500 hover:text-dark-900'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-sm font-medium border border-gray-200 px-4 py-2 rounded-sm hover:border-dark-900 transition-colors bg-white min-w-[200px] justify-between"
            >
              <span>{sortOption}</span>
              <ChevronDown size={16} />
            </button>
            
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-100 shadow-lg z-20 py-2 rounded-sm">
                {Object.values(SortOption).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortOption(option);
                      setIsSortOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-dark-800"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gold-500" size={48} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {sortedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart} 
                />
              ))}
            </div>
            
            {sortedProducts.length === 0 && (
              <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-lg">
                <p className="text-lg">No products found in this category currently.</p>
                <Link to="/shop" className="text-gold-600 font-bold mt-4 inline-block hover:underline">
                  Browse all products
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};