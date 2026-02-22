import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 shadow-sm max-w-lg w-full text-center rounded-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-dark-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for choosing Ayvora. Your order has been placed successfully and is being processed.
        </p>

        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Your Tracking Number</p>
          <div className="text-3xl font-mono font-bold text-dark-900 tracking-wider select-all">
            {trackingId}
          </div>
          <p className="text-xs text-gray-400 mt-2">Save this ID to track your parcel.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            to="/track-order" 
            className="w-full bg-dark-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={20} /> Track Order
          </Link>
          <Link 
            to="/" 
            className="w-full border-2 border-dark-900 text-dark-900 py-4 font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};