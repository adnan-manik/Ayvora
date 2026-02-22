import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/productService';
import { Order } from '../../types';
import { ChevronDown, Package, Search, Gift, User, Phone, MapPin, MessageSquare, Tag } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { loadOrders(); }, []);
  const loadOrders = async () => setOrders(await getAllOrders());

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    await updateOrderStatus(id, newStatus);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
  };

  const filteredOrders = orders.filter(o => o.id.includes(filter) || o.recipient.fullName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      <div className="bg-white p-4 rounded shadow-sm mb-6 flex gap-4">
        <Search className="text-gray-400" size={20}/>
        <input placeholder="Search orders..." className="flex-1 border border-gray-200 bg-gray-50 p-2 rounded focus:bg-white focus:border-gold-500 transition-colors outline-none" value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-sm">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Note</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No orders found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-blue-600">{order.id}</td>
                <td className="p-4">
                   <div className="font-bold">{order.recipient.fullName}</div>
                   <div className="text-xs text-gray-400">{order.isGift ? 'Gift' : 'Personal'}</div>
                </td>
                <td className="p-4">Rs. {Number(order.total).toLocaleString()}</td>
                <td className="p-4">
                   <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value as any)} className="border p-1 text-xs">
                     {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </td>
                <td className="p-4">{order.specialNote ? <MessageSquare size={16} className="text-gold-500"/> : '-'}</td>
                <td className="p-4"><button onClick={() => setSelectedOrder(order)} className="text-blue-600 underline">View</button></td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold">Order Details: {selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}>X</button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
               <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold text-sm uppercase mb-2">Shipping Details</h3>
                  <p className="text-sm font-bold">{selectedOrder.recipient.fullName}</p>
                  <p className="text-sm">{selectedOrder.recipient.address}</p>
                  <p className="text-sm font-mono">{selectedOrder.recipient.contactNumber}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold text-sm uppercase mb-2">Financials</h3>
                  <div className="text-sm flex justify-between"><span>Subtotal:</span><span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span></div>
                  {selectedOrder.discountTotal > 0 && <div className="text-sm flex justify-between text-green-600"><span>Discount:</span><span>- Rs. {Number(selectedOrder.discountTotal).toLocaleString()}</span></div>}
                  <div className="text-sm flex justify-between"><span>Shipping:</span><span>Rs. {selectedOrder.shippingFee}</span></div>
                  <div className="text-sm flex justify-between font-bold border-t mt-1 pt-1"><span>Total:</span><span>Rs. {Number(selectedOrder.total).toLocaleString()}</span></div>
               </div>
            </div>

            {selectedOrder.specialNote && (
              <div className="mb-6 p-4 bg-gold-50 border border-gold-100 rounded">
                 <h4 className="font-bold text-xs uppercase mb-1 flex items-center gap-1"><MessageSquare size={12}/> Customer Note</h4>
                 <p className="text-sm italic">"{selectedOrder.specialNote}"</p>
              </div>
            )}

            {selectedOrder.promoCode && (
              <div className="mb-6 flex items-center gap-2 text-sm font-bold text-green-700">
                 <Tag size={16}/> Applied Promo: {selectedOrder.promoCode}
              </div>
            )}

            <div className="space-y-3">
               <h4 className="font-bold text-sm uppercase border-b pb-1">Items</h4>
               {selectedOrder.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-sm">
                   <div className="flex gap-3">
                      <img src={item.images?.[0] || ''} className="w-8 h-8 object-cover rounded"/>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      </div>
                   </div>
                   <span>Rs. {((Number(item.activePrice) || Number(item.price) || 0) * item.quantity).toLocaleString()}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};