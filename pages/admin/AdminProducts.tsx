import React, { useEffect, useState } from 'react';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { Product } from '../../types';
import { Edit2, Trash2, Plus, X, Star, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { usePopup } from '../../context/PopupContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminProducts: React.FC = () => {
  const { showConfirm } = usePopup();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Complex Form State
  const initialFormState: Partial<Product> = {
    name: '', category: 'Men', type: 'Perfume', price: 0, originalPrice: 0,
    description: '', images: [], isBestSeller: false, isFeatured: false, notes: [],
    sizeVariants: {}, sizes: [], concentration: 'EDP',
    scentNotes: { top: [], heart: [], base: [] }
  };
  
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  
  // Helper states for inputs
  const [imageInput, setImageInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  
  // Size Helper
  const [newSize, setNewSize] = useState(''); // Stores number string
  const [newSizePrice, setNewSizePrice] = useState(0);
  const [newSizeOrig, setNewSizeOrig] = useState(0);

  // Scent Helper
  const [scentTop, setScentTop] = useState('');
  const [scentHeart, setScentHeart] = useState('');
  const [scentBase, setScentBase] = useState('');

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => { 
    setLoading(true);
    const data = await getAllProducts(); 
    setProducts(data); 
    setLoading(false);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImageInput(product.images.join(', '));
      setNotesInput(product.notes.join(', '));
      setScentTop(product.scentNotes?.top.join(', ') || '');
      setScentHeart(product.scentNotes?.heart.join(', ') || '');
      setScentBase(product.scentNotes?.base.join(', ') || '');
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
      setImageInput('');
      setNotesInput('');
      setScentTop('');
      setScentHeart('');
      setScentBase('');
      setNewSize(''); setNewSizePrice(0); setNewSizeOrig(0);
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadToCloudinary(e.target.files[0]);
        setImageInput(prev => prev ? `${prev}, ${url}` : url);
      } catch (error) {
        alert("Upload failed. Please check console and ensure Cloud Name is set.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddSize = () => {
    if (!newSize.trim() || isNaN(Number(newSize)) || newSizePrice <= 0) {
      alert("Please enter a valid integer size and price.");
      return;
    }
    const sizeKey = `${newSize.trim()}ml`;
    const variants = { ...formData.sizeVariants } || {};
    variants[sizeKey] = { price: newSizePrice, originalPrice: newSizeOrig || undefined };
    setFormData({ ...formData, sizeVariants: variants, sizes: Object.keys(variants) });
    setNewSize(''); setNewSizePrice(0); setNewSizeOrig(0);
  };

  const handleRemoveSize = (size: string) => {
    const variants = { ...formData.sizeVariants };
    delete variants[size];
    setFormData({ ...formData, sizeVariants: variants, sizes: Object.keys(variants) });
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm("Delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process Arrays
    const images = imageInput.split(',').map(s => s.trim()).filter(s => s);
    const notes = notesInput.split(',').map(s => s.trim()).filter(s => s);
    const scentNotes = {
      top: scentTop.split(',').map(s => s.trim()).filter(s => s),
      heart: scentHeart.split(',').map(s => s.trim()).filter(s => s),
      base: scentBase.split(',').map(s => s.trim()).filter(s => s),
    };

    const finalData = {
      ...formData,
      images: images.length > 0 ? images : ['https://via.placeholder.com/500'],
      notes,
      scentNotes,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    } as Product;

    // Default price to the first size variant if exists
    if (finalData.sizes && finalData.sizes.length > 0) {
      // Sort sizes to find smallest to set as base price
      const sortedSizes = [...finalData.sizes].sort((a, b) => parseInt(a) - parseInt(b));
      const firstSize = sortedSizes[0];
      finalData.price = finalData.sizeVariants[firstSize].price;
      finalData.originalPrice = finalData.sizeVariants[firstSize].originalPrice;
    }

    if (editingProduct) await updateProduct(editingProduct.id, finalData);
    else await addProduct(finalData);
    
    setIsModalOpen(false);
    fetchProducts();
  };

  const inputClass = "w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button onClick={() => handleOpenModal()} className="bg-gold-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gold-600"><Plus size={20}/> Add Product</button>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden min-h-[200px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images[0]} className="w-10 h-10 object-cover rounded" alt={p.name} />
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.type}</div>
                    </div>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{p.isFeatured ? <Star size={16} fill="#D4AF37" className="text-gold-500"/> : '-'}</td>
                  <td className="p-4">Rs. {p.price?.toLocaleString()}</td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold uppercase mb-1">Name</label>
                   <input required className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase mb-1">Category</label>
                     <select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                       {['Men','Women','Unisex','Impression','Testers'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase mb-1">Type</label>
                     <select className={inputClass} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                       <option value="Perfume">Perfume</option>
                       <option value="Ittar">Ittar</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase mb-1">Concentration</label>
                   <select className={inputClass} value={formData.concentration} onChange={e => setFormData({...formData, concentration: e.target.value as any})}>
                      <option value="EDP">EDP</option>
                      <option value="EDT">EDT</option>
                      <option value="Parfum">Parfum</option>
                      <option value="Extrait">Extrait</option>
                      <option value="Custom">Custom</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold uppercase mb-1">Description</label>
                   <textarea required className={inputClass} rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              {/* Pricing & Sizes */}
              <div className="bg-blue-50 p-6 rounded border border-blue-100">
                <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2"><Plus size={20}/> Pricing & Size Variants</h3>
                <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
                   <div className="flex-1 relative">
                      <label className="block text-xs font-bold uppercase mb-1">Size (Integer)</label>
                      <input type="number" className={inputClass} value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="e.g. 50"/>
                      <span className="absolute right-8 top-8 text-gray-500 text-sm">ml</span>
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase mb-1">Price (Rs)</label>
                      <input type="number" className={inputClass} value={newSizePrice || ''} onChange={e => setNewSizePrice(Number(e.target.value))} placeholder="2500"/>
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase mb-1">Original Price (Optional)</label>
                      <input type="number" className={inputClass} value={newSizeOrig || ''} onChange={e => setNewSizeOrig(Number(e.target.value))} placeholder="3000"/>
                   </div>
                   <button type="button" onClick={handleAddSize} className="bg-blue-600 text-white px-4 py-2 rounded font-bold uppercase text-xs h-[42px]">Add Variant</button>
                </div>

                <div className="space-y-2">
                   {(formData.sizes || []).length === 0 && <p className="text-sm text-gray-500 italic">No size variants added. Please add at least one.</p>}
                   {(formData.sizes || []).map(size => (
                     <div key={size} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                        <div className="flex gap-4">
                           <span className="font-bold text-dark-900 w-20">{size}</span>
                           <span className="text-green-600 font-bold">Rs. {formData.sizeVariants?.[size]?.price}</span>
                           {formData.sizeVariants?.[size]?.originalPrice && <span className="text-gray-400 line-through text-sm">Rs. {formData.sizeVariants?.[size]?.originalPrice}</span>}
                        </div>
                        <button type="button" onClick={() => handleRemoveSize(size)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                     </div>
                   ))}
                </div>
              </div>

              {/* Scent Profile */}
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Scent Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <div>
                      <label className="block text-xs font-bold uppercase mb-1">Top Notes</label>
                      <input className={inputClass} value={scentTop} onChange={e => setScentTop(e.target.value)} placeholder="Citrus, Bergamot..." />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase mb-1">Heart Notes</label>
                      <input className={inputClass} value={scentHeart} onChange={e => setScentHeart(e.target.value)} placeholder="Rose, Jasmine..." />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase mb-1">Base Notes</label>
                      <input className={inputClass} value={scentBase} onChange={e => setScentBase(e.target.value)} placeholder="Musk, Vanilla..." />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase mb-1">General Notes (Tags)</label>
                   <input className={inputClass} value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Woody, Spicy, Fresh..." />
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-bold border-b pb-2 mb-4">Images</h3>
                <label className="block text-xs font-bold uppercase mb-1">Upload Image (Cloudinary)</label>
                <div className="flex gap-4 items-center mb-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-dark-900 px-4 py-2 rounded border border-gray-300 flex items-center gap-2">
                    {uploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>}
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading}/>
                  </label>
                  <span className="text-xs text-gray-500">Uploads to Cloudinary and appends URL below.</span>
                </div>

                <label className="block text-xs font-bold uppercase mb-1">Image URLs (Comma separated)</label>
                <textarea className={inputClass} rows={2} value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="https://..." />
              </div>

              {/* Flags */}
              <div className="flex gap-6 p-4 bg-gray-50 rounded">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5"/>
                    <span className="font-bold">Best Seller</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-5 h-5"/>
                    <span className="font-bold">Featured Collection</span>
                 </label>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border font-bold uppercase text-sm hover:bg-gray-50">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-dark-900 text-white font-bold uppercase text-sm hover:bg-gold-600 transition-colors">Save Product</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};