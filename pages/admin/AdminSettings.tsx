import React, { useEffect, useState } from 'react';
import { getStoreSettings, updateStoreSettings } from '../../services/productService';
import { StoreSettings } from '../../types';
import { usePopup } from '../../context/PopupContext';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showAlert } = usePopup();
  const [settings, setSettings] = useState<StoreSettings>({ 
    deliveryCharge: 0, 
    freeDeliveryThreshold: 0, 
    wrappingFee: 0, 
    returnPolicy: '',
    announcementText: '',
    showAnnouncement: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getStoreSettings();
    setSettings(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (settings.deliveryCharge < 0 || settings.wrappingFee < 0) {
        showAlert("Fees cannot be negative.", "error");
        return;
    }

    setIsSaving(true);
    await updateStoreSettings(settings);
    setIsSaving(false);
    showAlert("Store settings updated successfully.", "success");
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-900">Store Configuration</h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Fees & Logistics */}
        <div className="bg-white p-6 rounded shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-dark-900 border-b pb-4">
             <Settings size={20} />
             <h3 className="text-lg font-bold">Logistics & Fees</h3>
          </div>
          
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Standard Delivery Charge (Rs)</label>
               <input 
                 type="number" 
                 min="0"
                 required
                 className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" 
                 value={settings.deliveryCharge} 
                 onChange={e => setSettings({...settings, deliveryCharge: Number(e.target.value)})}
               />
            </div>
            <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Free Delivery Threshold (Rs)</label>
               <input 
                 type="number"
                 min="0"
                 required 
                 className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" 
                 value={settings.freeDeliveryThreshold} 
                 onChange={e => setSettings({...settings, freeDeliveryThreshold: Number(e.target.value)})}
               />
               <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping.</p>
            </div>
            <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gift Wrapping Fee (Rs)</label>
               <input 
                 type="number"
                 min="0"
                 required 
                 className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" 
                 value={settings.wrappingFee} 
                 onChange={e => setSettings({...settings, wrappingFee: Number(e.target.value)})}
               />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white p-6 rounded shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-dark-900 border-b pb-4">
             <AlertCircle size={20} />
             <h3 className="text-lg font-bold">Top Announcement Bar</h3>
          </div>
          
          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-3 rounded">
                <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-gold-500"
                    checked={settings.showAnnouncement || false}
                    onChange={e => setSettings({...settings, showAnnouncement: e.target.checked})}
                />
                <span className="font-bold text-sm">Enable Moving Text Strip</span>
             </label>

             <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Announcement Text</label>
                <input 
                    type="text"
                    className="w-full border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none"
                    placeholder="e.g., Free Shipping on orders above Rs. 3000"
                    value={settings.announcementText || ''}
                    onChange={e => setSettings({...settings, announcementText: e.target.value})}
                    disabled={!settings.showAnnouncement}
                />
             </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white p-6 rounded shadow-sm md:col-span-2">
            <h3 className="text-lg font-bold mb-4 border-b pb-4">Return Policy Text</h3>
            <textarea 
                 rows={6}
                 required
                 className="w-full border border-gray-200 bg-gray-50 p-4 rounded focus:bg-white focus:border-gold-500 outline-none font-sans transition-colors" 
                 value={settings.returnPolicy || ''} 
                 onChange={e => setSettings({...settings, returnPolicy: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-2">This text appears in the "Delivery & Returns" accordion on product pages.</p>
        </div>

        <div className="md:col-span-2">
             <button 
              type="submit" 
              disabled={isSaving}
              className="bg-dark-900 text-white px-8 py-4 rounded font-bold uppercase tracking-wider text-sm hover:bg-gold-600 transition-colors flex items-center gap-2 ml-auto"
            >
              {isSaving ? 'Saving...' : <><Save size={18} /> Save Configurations</>}
            </button>
        </div>

      </form>
    </div>
  );
};