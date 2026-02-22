import React, { useEffect, useState } from 'react';
import { Package, ShoppingBag, Image, ArrowRight, AlertTriangle, Copy, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getAllOrders } from '../../services/productService';

export const AdminDashboard: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, aov: 0 });

  useEffect(() => {
    checkPermissions();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const orders = await getAllOrders();
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = validOrders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    setMetrics({ revenue: totalRevenue, orders: totalOrders, aov });
  };

  const checkPermissions = async () => {
    try {
      const testRef = await addDoc(collection(db, "products"), {
        name: "_PERMISSION_TEST_",
        test_doc: true,
        category: 'Test',
        price: 0,
        description: 'Temporary doc to check write permissions',
        image: '',
        images: [],
        notes: [],
        createdAt: new Date().toISOString()
      });
      await deleteDoc(doc(db, "products", testRef.id));
      setPermissionStatus('granted');
    } catch (error: any) {
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('granted'); 
      }
    }
  };

  const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} { allow read: if true; allow write: if request.auth != null; }
    match /banners/{id} { allow read: if true; allow write: if request.auth != null; }
    match /orders/{id} { allow create: if true; allow read, update: if request.auth != null; }
    match /reviews/{id} { allow read, write: if true; }
    match /settings/{id} { allow read: if true; allow write: if request.auth != null; }
    match /promo_codes/{id} { allow read: if true; allow write: if request.auth != null; }
    match /{document=**} { allow read, write: if false; }
  }
}`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-dark-900">Dashboard</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-gold-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-dark-900 mt-2">Rs. {metrics.revenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gold-50 text-gold-600 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-bold text-dark-900 mt-2">{metrics.orders}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Avg Order Value</p>
              <h3 className="text-3xl font-bold text-dark-900 mt-2">Rs. {metrics.aov.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/products" className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Package size={24} />
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-dark-900">Manage Products</h3>
          <p className="text-sm text-gray-500 mt-2">Update catalog, inventory, and pricing.</p>
        </Link>

        <Link to="/admin/orders" className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-all group">
           <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <ShoppingBag size={24} />
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-dark-900">Manage Orders</h3>
          <p className="text-sm text-gray-500 mt-2">Track shipments and update statuses.</p>
        </Link>

        <Link to="/admin/banners" className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-all group">
           <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <Image size={24} />
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-dark-900">Hero Banners</h3>
          <p className="text-sm text-gray-500 mt-2">Update homepage sliders and links.</p>
        </Link>

        <Link to="/admin/settings" className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-all group">
           <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-full">
              <Settings size={24} />
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-dark-900">Settings</h3>
          <p className="text-sm text-gray-500 mt-2">Configure store details and announcements.</p>
        </Link>
      </div>
      
      {/* Permission Warning Banner (Bottom) */}
      {permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">Database Configuration Required</h3>
              <p className="text-red-700 mb-4">
                Please update your Firebase Rules to allow these operations.
              </p>
              <div className="bg-white border border-red-100 rounded p-4 mb-4 relative">
                <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono">
                  {rulesCode}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(rulesCode)}
                  className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded"
                >
                  <Copy size={16} />
                </button>
              </div>
              <button 
                   onClick={checkPermissions}
                   className="text-red-700 font-bold text-sm hover:underline"
                 >
                   Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};