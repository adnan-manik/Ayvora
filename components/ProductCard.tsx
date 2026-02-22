import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isDarkBg?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isDarkBg = false }) => {
  // Use first image from array, fallback to old image property if exists (for backward compatibility)
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : (product as any).image;

  // Determine display price: Smallest size price
  // Safeguard: Ensure product.price is a number
  let displayPrice = Number(product.price) || 0;
  let displayOriginalPrice = Number(product.originalPrice) || 0;
  
  if (product.sizes && product.sizes.length > 0) {
      // Parse integers and sort
      const sortedSizes = [...product.sizes].sort((a, b) => parseInt(a) - parseInt(b));
      const smallestSize = sortedSizes[0];
      if (product.sizeVariants && product.sizeVariants[smallestSize]) {
          displayPrice = Number(product.sizeVariants[smallestSize].price) || 0;
          displayOriginalPrice = Number(product.sizeVariants[smallestSize].originalPrice) || 0;
      }
  }

  // Hide original price if less than or equal to zero or not greater than price
  const showOriginalPrice = displayOriginalPrice > displayPrice && displayOriginalPrice > 0;

  return (
    <div className="group relative flex flex-col items-center">
      <div className="relative w-full aspect-square overflow-hidden mb-4 bg-gray-100">
        {/* Badges */}
        {product.isBestSeller && (
          <span className="absolute top-2 left-2 bg-gold-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10">
            Best Seller
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-dark-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10" style={{ top: product.isBestSeller ? '2.5rem' : '0.5rem' }}>
            New
          </span>
        )}

        <Link to={`/product/${product.id}`} className="block w-full h-full cursor-pointer">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-6 pointer-events-none">
          <button 
            onClick={() => onAddToCart(product)}
            className="pointer-events-auto translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white text-dark-900 hover:bg-dark-900 hover:text-white px-6 py-3 uppercase text-xs font-bold tracking-widest shadow-lg flex items-center gap-2"
          >
            <Plus size={14} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category} - {product.type}</p>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className={`text-lg font-serif font-medium transition-colors cursor-pointer ${isDarkBg ? 'text-white group-hover:text-gold-400' : 'text-dark-900 group-hover:text-gold-600'}`}>
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center gap-2">
           {showOriginalPrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs. {displayOriginalPrice.toLocaleString()}
            </span>
          )}
          <span className={`text-sm font-semibold ${isDarkBg ? 'text-gold-400' : 'text-dark-900'}`}>
            {product.sizes && product.sizes.length > 1 ? 'From ' : ''}Rs. {displayPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};