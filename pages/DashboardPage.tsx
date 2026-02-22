
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../services/productService';
import { Order } from '../types';
import { Package, User, LogOut, MapPin } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    country: '',
    phone: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user && profile) {
      setAddressForm({
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        phone: profile.phone || ''
      });
      fetchOrders();
    }
  }, [user, loading, profile]);

  const fetchOrders = async () => {
    if (user) {
      try {
        const data = await getUserOrders(user.uid);
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, addressForm);
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white p-6 shadow-sm rounded-sm h-fit">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gold-600">
                <User size={32} />
              </div>
              <h3 className="font-bold text-dark-900">{profile?.full_name || user?.email}</h3>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${activeTab === 'orders' ? 'bg-dark-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <Package size={18} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${activeTab === 'profile' ? 'bg-dark-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <MapPin size={18} /> Shipping Address
              </button>
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm hover:bg-red-50 text-red-600 transition-colors mt-8"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'orders' ? (
              <div className="bg-white p-8 shadow-sm rounded-sm">
                <h2 className="text-2xl font-serif font-bold mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-sm p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">Order ID</span>
                            <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                          </div>
                          <div className="text-right">
                             <span className="text-xs text-gray-400 block mb-1">Date</span>
                             <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block mb-1">Total</span>
                            <span className="font-bold text-gold-600">Rs. {order.total.toLocaleString()}</span>
                          </div>
                           <div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product_name || item.name}</span>
                              <span>Rs. {item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 shadow-sm rounded-sm">
                <h2 className="text-2xl font-serif font-bold mb-6">Shipping Details</h2>
                <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Address</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 p-3" 
                      value={addressForm.address}
                      onChange={e => setAddressForm({...addressForm, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">City</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 p-3" 
                        value={addressForm.city}
                        onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">Country</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 p-3" 
                        value={addressForm.country}
                        onChange={e => setAddressForm({...addressForm, country: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full border border-gray-300 p-3" 
                      value={addressForm.phone}
                      onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                    />
                  </div>
                  <button className="bg-dark-900 text-white px-8 py-3 uppercase text-xs font-bold tracking-widest hover:bg-gold-600 transition-colors">
                    Update Address
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
