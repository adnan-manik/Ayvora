import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.activePrice || item.price) * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-dark-900/60 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-serif font-bold text-xl text-dark-900">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-dark-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="mt-4 text-gold-600 underline text-sm uppercase font-bold tracking-wide"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              // Generate composite key for removal and updates logic in App.tsx
              const itemKey = `${item.id}-${item.selectedSize}`;
              
              return (
                <div key={`${itemKey}-${idx}`} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                    <img 
                      src={item.images && item.images.length > 0 ? item.images[0] : (item as any).image} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-medium text-dark-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      {item.selectedSize && <p className="text-xs text-gray-400 mt-1">Size: {item.selectedSize}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200">
                        <button 
                          onClick={() => onUpdateQuantity(itemKey, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(itemKey, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        Rs. {((item.activePrice || item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(itemKey)}
                    className="text-gray-400 hover:text-red-500 self-start"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">Subtotal</span>
              <span className="text-lg font-bold text-dark-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Shipping & taxes calculated at checkout.</p>
            <Link 
              to="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-dark-900 text-white py-4 uppercase text-sm font-bold tracking-widest hover:bg-gold-600 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};