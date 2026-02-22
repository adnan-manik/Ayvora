import React, { useEffect, useState } from 'react';
import { getAllPromoCodes, createPromoCode, deletePromoCode, getAllProducts } from '../../services/productService';
import { PromoCode, Product } from '../../types';
import { Plus, Trash2, Tag, Copy, X, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { usePopup } from '../../context/PopupContext';

export const AdminPromoCodes: React.FC = () => {
  const { showConfirm } = usePopup();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<string[] | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    title: '', code: '', type: 'percentage', value: 0, scope: 'all', usageLimit: 'multi', status: 'active', usedCount: 0, maxUses: 100,
    minOrderValue: 0, maxDiscount: 0
  });

  // Batch specific state
  const [batchCount, setBatchCount] = useState(1);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setPromos(await getAllPromoCodes());
    setProducts(await getAllProducts());
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.usageLimit === 'single') {
       const codes: string[] = [];
       for (let i = 0; i < batchCount; i++) {
         const code = (formData.code || 'PROMO') + Math.random().toString(36).substring(2, 6).toUpperCase();
         await createPromoCode({ ...formData as any, code, maxUses: 1 });
         codes.push(code);
       }
       setBatchResult(codes);
    } else {
       await createPromoCode(formData as Omit<PromoCode, 'id'>);
       setIsModalOpen(false);
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm("Are you sure you want to delete this promo code?")) {
      await deletePromoCode(id);
      loadData();
    }
  };

  // Group Promos
  const groupedPromos = promos.reduce((acc, promo) => {
    const title = promo.title || 'Untitled';
    if (!acc[title]) acc[title] = [];
    acc[title].push(promo);
    return acc;
  }, {} as Record<string, PromoCode[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Promo Codes</h1>
        <button onClick={() => { setIsModalOpen(true); setBatchResult(null); }} className="bg-gold-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><Plus size={20}/> New Promo</button>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedPromos).length === 0 ? (
          <div className="bg-white p-8 rounded shadow-sm text-center text-gray-500">
            No promo codes found. Click "New Promo" to create one.
          </div>
        ) : (
          Object.keys(groupedPromos).map(title => (
          <div key={title} className="bg-white rounded shadow-sm overflow-hidden">
            <div 
              className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b"
              onClick={() => toggleGroup(title)}
            >
              <div className="flex items-center gap-3">
                 <Folder size={20} className="text-gold-500" />
                 <h3 className="font-bold text-dark-900">{title}</h3>
                 <span className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-600">{groupedPromos[title].length}</span>
              </div>
              {expandedGroups[title] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
            </div>

            {expandedGroups[title] && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {groupedPromos[title].map(p => (
                  <div key={p.id} className={`bg-white p-4 rounded border-2 relative ${p.status === 'expired' || (p.maxUses && p.usedCount >= p.maxUses) ? 'border-gray-200 opacity-60' : 'border-gold-100'}`}>
                    <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-gold-500"/>
                      <span className="font-mono font-bold text-lg">{p.code}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {p.type === 'percentage' ? `${p.value}% OFF` : `Rs. ${p.value} OFF`} 
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1 mb-4">
                      {p.minOrderValue && <p>Min Order: Rs. {p.minOrderValue}</p>}
                      {p.maxDiscount && p.type === 'percentage' && <p>Max Cap: Rs. {p.maxDiscount}</p>}
                      <p>Scope: {p.scope === 'all' ? 'All Shop' : p.targetId}</p>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2 text-xs font-bold uppercase tracking-wider">
                      <span className={p.usageLimit === 'single' ? 'text-blue-600' : 'text-purple-600'}>{p.usageLimit}</span>
                      <span className="text-gray-400">Used: {p.usedCount} / {p.maxUses || '∞'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><X size={20}/></button>
            
            {batchResult ? (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">Codes Generated!</h2>
                <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto font-mono text-sm space-y-2 mb-6">
                   {batchResult.map(c => <div key={c} className="border-b border-gray-200 pb-1">{c}</div>)}
                </div>
                <button onClick={() => { setIsModalOpen(false); setBatchResult(null); }} className="w-full bg-dark-900 text-white py-2 font-bold uppercase">Close</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Create Promo Code</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="text-xs font-bold uppercase text-gray-400">Campaign Title (Group)</label>
                      <input required placeholder="e.g. Ramadan Sale 2024" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-xs font-bold uppercase text-gray-400">Code Prefix / Name</label>
                      <input required placeholder="E.G. SALE2024" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none font-mono uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                  </div>
                  <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-gray-400">Type</label>
                        <select className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed (Rs)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-gray-400">Value</label>
                        <input type="number" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-gray-400">Min Order (Rs)</label>
                        <input type="number" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.minOrderValue || ''} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} placeholder="Optional" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase text-gray-400">Max Discount (Rs)</label>
                        <input type="number" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.maxDiscount || ''} onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})} placeholder="Optional (% only)" />
                      </div>
                  </div>

                  <div>
                      <label className="text-xs font-bold uppercase text-gray-400">Scope</label>
                      <select className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value as any})}>
                        <option value="all">Apply to All Products</option>
                        <option value="category">Specific Category</option>
                        <option value="product">Specific Product</option>
                      </select>
                  </div>
                  
                  {formData.scope === 'category' && (
                     <select className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" onChange={e => setFormData({...formData, targetId: e.target.value})}>
                        <option value="">Select Category</option>
                        {['Men','Women','Impression','Testers'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  )}

                  {formData.scope === 'product' && (
                     <select className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" onChange={e => setFormData({...formData, targetId: e.target.value})}>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                  )}

                  <div className="pt-2 border-t">
                    <label className="text-xs font-bold uppercase text-gray-400">Usage Limit</label>
                    <select className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value as any})}>
                      <option value="multi">Multi-Use (General Code)</option>
                      <option value="single">Single-Use (Unique Codes)</option>
                    </select>
                  </div>
                  
                  {formData.usageLimit === 'multi' ? (
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Max Redemptions</label>
                        <input type="number" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: Number(e.target.value)})} />
                     </div>
                  ) : (
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Number of Codes to Generate</label>
                        <input type="number" min="1" max="50" className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={batchCount} onChange={e => setBatchCount(Number(e.target.value))} />
                     </div>
                  )}

                  <button type="submit" className="w-full bg-dark-900 text-white py-3 font-bold uppercase text-sm mt-4">
                    {formData.usageLimit === 'single' ? `Generate ${batchCount} Codes` : 'Create Code'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};