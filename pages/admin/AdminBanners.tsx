import React, { useEffect, useState } from 'react';
import { getBanners, addBanner, deleteBanner, getAllProducts } from '../../services/productService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { Banner, Product } from '../../types';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    imageUrl: '', title: '', subtitle: '', active: true
  });
  
  // Dropdown States for Route Building
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const bannerData = await getBanners();
    const productData = await getAllProducts();
    setBanners(bannerData);
    setProducts(productData);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadToCloudinary(e.target.files[0]);
        setForm(prev => ({ ...prev, imageUrl: url }));
      } catch (error) {
        alert("Upload failed. Please check console.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Link
    let link = '/shop';
    if (selectedProductId) {
      link = `/product/${selectedProductId}`;
    } else if (selectedCategory !== 'All') {
      link = `/shop/${selectedCategory}`;
    }

    await addBanner({ ...form, link, order: banners.length });
    
    // Reset
    setForm({ imageUrl: '', title: '', subtitle: '', active: true });
    setSelectedCategory('All');
    setSelectedProductId('');
    
    loadData();
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this banner?")) {
      await deleteBanner(id);
      loadData();
    }
  };

  // Filter products for the second dropdown based on first selection
  const availableProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const inputClass = "w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-dark-900">Hero Banners</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Form */}
          <div className="bg-white p-6 rounded shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Add New Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Image URL</label>
                
                <div className="flex gap-4 items-center mb-2">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-dark-900 px-3 py-2 rounded border border-gray-300 flex items-center gap-2 text-sm">
                    {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading}/>
                  </label>
                </div>

                <input 
                  required 
                  className={inputClass} 
                  value={form.imageUrl} 
                  onChange={e => setForm({...form, imageUrl: e.target.value})}
                  placeholder="https://..." 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input 
                  required 
                  className={inputClass} 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Essence of Elegance" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Subtitle</label>
                <input 
                  required 
                  className={inputClass} 
                  value={form.subtitle} 
                  onChange={e => setForm({...form, subtitle: e.target.value})}
                  placeholder="Discover your scent" 
                />
              </div>
              
              {/* Dynamic Link Builder */}
              <div className="bg-gray-50 p-4 rounded border">
                <label className="block text-sm font-bold mb-2">Link Destination</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-gray-500 uppercase">Category</label>
                     <select 
                        className={inputClass}
                        value={selectedCategory}
                        onChange={e => {
                          setSelectedCategory(e.target.value);
                          setSelectedProductId(''); // Reset product when category changes
                        }}
                     >
                       <option value="All">All Shop</option>
                       <option value="Men">Men</option>
                       <option value="Women">Women</option>
                       <option value="Unisex">Unisex</option>
                       <option value="Impression">Impression</option>
                       <option value="Testers">Testers</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs text-gray-500 uppercase">Product (Optional)</label>
                     <select 
                        className={inputClass}
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                     >
                       <option value="">-- Select Product --</option>
                       {availableProducts.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                     </select>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Preview: {selectedProductId ? `/product/${selectedProductId}` : (selectedCategory === 'All' ? '/shop' : `/shop/${selectedCategory}`)}
                </div>
              </div>

              <button className="w-full bg-dark-900 text-white py-3 rounded font-bold hover:bg-gold-600 transition-colors">
                Add Banner Slide
              </button>
            </form>
          </div>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Active Banners</h2>
            {banners.length === 0 ? (
              <div className="bg-white p-8 rounded shadow-sm text-center text-gray-500 border border-dashed border-gray-300">
                <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No banners configured.</p>
                <p className="text-sm">The default static hero image will be displayed on the homepage.</p>
              </div>
            ) : (
              banners.map((banner, idx) => (
              <div key={banner.id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col sm:flex-row h-full sm:h-32 relative group">
                <img src={banner.imageUrl} alt={banner.title} className="w-full sm:w-48 h-32 object-cover" />
                <div className="p-4 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{banner.subtitle}</div>
                  <h3 className="font-serif font-bold text-lg leading-tight">{banner.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                    <LinkIcon size={12} /> {banner.link}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  );
};