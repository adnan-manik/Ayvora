import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';
import { getProductById, getProductsByCategory, getStoreSettings } from '../services/productService';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  onAddToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState<string>('description');
  const [mainImage, setMainImage] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');

  // Derived price state
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentOriginalPrice, setCurrentOriginalPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      if (id) {
        const data = await getProductById(id);
        const settings = await getStoreSettings();
        setReturnPolicy(settings.returnPolicy || "We offer a 7-day return policy.");

        setProduct(data || null);
        if (data) {
          // Sort sizes by integer value
          const sortedSizes = data.sizes ? [...data.sizes].sort((a, b) => parseInt(a) - parseInt(b)) : [];
          
          if (sortedSizes.length > 0) {
            const firstSize = sortedSizes[0];
            setSelectedSize(firstSize);
            // Set initial prices based on first sorted size
            if (data.sizeVariants && data.sizeVariants[firstSize]) {
                setCurrentPrice(data.sizeVariants[firstSize].price);
                setCurrentOriginalPrice(data.sizeVariants[firstSize].originalPrice);
            } else {
                setCurrentPrice(data.price);
                setCurrentOriginalPrice(data.originalPrice);
            }
          } else {
              setCurrentPrice(data.price);
              setCurrentOriginalPrice(data.originalPrice);
          }

          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]);
          } else if ((data as any).image) {
            setMainImage((data as any).image);
          }
          
          const related = await getProductsByCategory(data.category);
          setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
        }
      }
      setLoading(false);
      setQuantity(1);
      window.scrollTo(0,0);
    };
    loadProduct();
  }, [id]);

  // Update price when size changes
  useEffect(() => {
    if (product && selectedSize && product.sizeVariants?.[selectedSize]) {
        setCurrentPrice(product.sizeVariants[selectedSize].price);
        setCurrentOriginalPrice(product.sizeVariants[selectedSize].originalPrice);
    }
  }, [selectedSize, product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-20">
        <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-gold-600 hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    // Navigate to checkout with special state
    navigate('/checkout', { 
        state: { 
            buyNowItem: {
                ...product,
                quantity,
                selectedSize,
                activePrice: currentPrice
            } 
        } 
    });
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? '' : section);
  };

  const productImages = product.images && product.images.length > 0 ? product.images : [(product as any).image];
  const sortedSizes = product.sizes ? [...product.sizes].sort((a, b) => parseInt(a) - parseInt(b)) : [];

  return (
    <div className="bg-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-gold-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-gold-600">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-dark-900 font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Image Gallery */}
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center">
             <img 
               src={mainImage} 
               alt={product.name} 
               className="w-full max-w-md h-auto object-cover shadow-lg mb-6" 
             />
             <div className="flex gap-2 justify-center">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 border-2 transition-all ${mainImage === img ? 'border-gold-500' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} className="w-full h-full object-cover"/>
                  </button>
                ))}
             </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-dark-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
               {product.concentration && (
                 <span className="px-3 py-1 border border-dark-900 text-xs font-bold uppercase tracking-widest">
                   {product.concentration}
                 </span>
               )}
               {product.rating && (
                 <div className="flex items-center space-x-1">
                   <div className="flex text-gold-500">
                     <Star size={16} fill="currentColor" />
                   </div>
                   <span className="text-sm text-gray-500">{product.rating}</span>
                 </div>
               )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-medium text-dark-900">Rs. {currentPrice.toLocaleString()}</span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && currentOriginalPrice > 0 && (
                <span className="text-xl text-gray-400 line-through">Rs. {currentOriginalPrice.toLocaleString()}</span>
              )}
              {currentOriginalPrice && currentOriginalPrice > currentPrice && currentOriginalPrice > 0 && (
                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">
                  SAVE {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </div>

            {/* Sizes */}
            {sortedSizes.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold uppercase tracking-wider mb-3">Select Size</span>
                <div className="flex gap-3">
                  {sortedSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 border text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-dark-900 bg-dark-900 text-white' 
                          : 'border-gray-200 text-gray-600 hover:border-dark-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 mb-8">
               {/* Quantity & Buttons */}
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex items-center border border-gray-300 w-32 h-12 flex-shrink-0">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex-1 text-center font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                 </div>
                 <button 
                    onClick={handleAddToCart}
                    className="flex-1 border border-dark-900 text-dark-900 h-12 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                 >
                    Add to Cart
                 </button>
                 <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-dark-900 text-white h-12 font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors"
                 >
                    Buy Now
                 </button>
               </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-200">
              {product.scentNotes && (
                 <div className="border-b border-gray-200">
                  <button 
                    onClick={() => toggleAccordion('notes')}
                    className="w-full py-4 flex justify-between items-center font-serif font-bold text-dark-900 hover:text-gold-600"
                  >
                    <span>Scent Notes</span>
                    {activeAccordion === 'notes' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'notes' ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <span className="block text-xs font-bold uppercase text-gray-400 mb-2">Top Notes</span>
                          <div className="flex flex-col gap-1">
                             {product.scentNotes.top.map(n => <span key={n} className="text-sm text-dark-900">{n}</span>)}
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-gray-400 mb-2">Heart Notes</span>
                          <div className="flex flex-col gap-1">
                             {product.scentNotes.heart.map(n => <span key={n} className="text-sm text-dark-900">{n}</span>)}
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-gray-400 mb-2">Base Notes</span>
                          <div className="flex flex-col gap-1">
                             {product.scentNotes.base.map(n => <span key={n} className="text-sm text-dark-900">{n}</span>)}
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

               <div className="border-b border-gray-200">
                <button 
                  onClick={() => toggleAccordion('delivery')}
                  className="w-full py-4 flex justify-between items-center font-serif font-bold text-dark-900 hover:text-gold-600"
                >
                  <span>Delivery & Returns</span>
                  {activeAccordion === 'delivery' ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'delivery' ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {returnPolicy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-dark-900 mb-4">You May Also Like</h2>
              <div className="w-16 h-1 bg-gold-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {relatedProducts.map(p => (
                 <ProductCard key={p.id} product={p} onAddToCart={(p) => onAddToCart(p, 1)} />
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};