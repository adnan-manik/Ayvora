import React, { useState } from 'react';
import { Search, Package, MapPin, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { trackOrder } from '../services/productService';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const result = await trackOrder(trackingId.trim());
      if (result) {
        setOrder(result);
      } else {
        setError('Order not found. Please check your tracking ID.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-serif font-bold text-center mb-8">Track Your Order</h1>

        {/* Search Box */}
        <div className="bg-white p-6 shadow-sm rounded-sm mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Enter Tracking ID (e.g., AYV-X8Y2Z)" 
              className="flex-1 border border-gray-300 p-4 rounded-sm focus:border-gold-500 outline-none font-mono uppercase"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gold-500 text-white px-8 font-bold uppercase tracking-wider hover:bg-gold-600 transition-colors disabled:opacity-70"
            >
              {loading ? '...' : 'Track'}
            </button>
          </form>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Result */}
        {order && (
          <div className="bg-white p-8 shadow-sm rounded-sm animate-fade-in">
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                <p className="text-xl font-mono font-bold text-dark-900">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Status Bar */}
            {order.status !== 'Cancelled' ? (
              <div className="mb-10 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-1000 -z-0"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>

                <div className="flex justify-between relative z-10">
                  {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep >= stepNum;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {stepNum === 1 && <Package size={14} />}
                          {stepNum === 2 && <Search size={14} />}
                          {stepNum === 3 && <Truck size={14} />}
                          {stepNum === 4 && <CheckCircle size={14} />}
                        </div>
                        <span className={`text-xs font-bold uppercase ${isCompleted ? 'text-dark-900' : 'text-gray-400'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-4 text-center rounded mb-8 font-bold">
                This order has been cancelled.
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold border-b pb-2 mb-4">Items</h3>
                <ul className="space-y-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">Rs. {item.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold border-t pt-2 mt-4">
                  <span>Total</span>
                  <span>Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold border-b pb-2 mb-4">Shipping To</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-bold text-dark-900">{order.recipient.fullName}</p>
                  <p>{order.recipient.contactNumber}</p>
                  <p>{order.recipient.address}</p>
                  <p className="text-xs text-gray-500 mt-1">Near {order.recipient.landmark}</p>
                </div>
                {order.isGift && (
                   <div className="mt-4 bg-gold-50 p-3 rounded text-xs text-gold-700">
                     <p className="font-bold">Gift Order</p>
                     <p>From: {order.sender.fullName}</p>
                     {order.wrapGift && <p>+ Premium Wrapping</p>}
                   </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};