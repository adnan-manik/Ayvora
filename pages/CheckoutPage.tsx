import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartItem, StoreSettings, PromoCode } from '../types';
import { createOrder, getStoreSettings, validatePromoCode } from '../services/productService';
import { Gift, User, Check, Tag, Loader2 } from 'lucide-react';
import { usePopup } from '../context/PopupContext';

interface CheckoutPageProps {
  cartItems: CartItem[];
  clearCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = usePopup();

  // Buy Now Logic: Check if we have a direct item from location state
  const buyNowItem = location.state?.buyNowItem as CartItem | undefined;
  // If buyNowItem exists, use only that. Otherwise use main cart.
  const activeItems = buyNowItem ? [buyNowItem] : cartItems;

  const [loading, setLoading] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [wrapGift, setWrapGift] = useState(false);
  const [specialNote, setSpecialNote] = useState('');
  const [fees, setFees] = useState<StoreSettings>({ deliveryCharge: 200, freeDeliveryThreshold: 3000, wrappingFee: 150 });

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Form States
  const [sender, setSender] = useState({ fullName: '', contactNumber: '' });
  const [recipient, setRecipient] = useState({ fullName: '', contactNumber: '', address: '', landmark: '' });

  useEffect(() => {
    getStoreSettings().then(setFees);
  }, []);

  const subtotal = activeItems.reduce((acc, item) => acc + item.activePrice * item.quantity, 0);
  
  // Calculate Discounts with new Logic
  let discountTotal = 0;
  if (appliedPromo) {
    let applicableSubtotal = subtotal;

    // Scope check: if specific products/category
    if (appliedPromo.scope === 'product' && appliedPromo.targetId) {
      const scopedItems = activeItems.filter(i => i.id === appliedPromo.targetId);
      applicableSubtotal = scopedItems.reduce((acc, i) => acc + i.activePrice * i.quantity, 0);
    } else if (appliedPromo.scope === 'category' && appliedPromo.targetId) {
      const scopedItems = activeItems.filter(i => i.category === appliedPromo.targetId);
      applicableSubtotal = scopedItems.reduce((acc, i) => acc + i.activePrice * i.quantity, 0);
    }

    if (appliedPromo.type === 'percentage') {
      let calcDiscount = Math.round(applicableSubtotal * (appliedPromo.value / 100));
      if (appliedPromo.maxDiscount && calcDiscount > appliedPromo.maxDiscount) {
        calcDiscount = appliedPromo.maxDiscount;
      }
      discountTotal = calcDiscount;
    } else {
      discountTotal = appliedPromo.value;
    }
  }

  const shipping = subtotal >= fees.freeDeliveryThreshold ? 0 : fees.deliveryCharge;
  const wrapping = (isGift && wrapGift) ? fees.wrappingFee : 0;
  const total = Math.max(0, subtotal - discountTotal + shipping + wrapping);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    
    const promo = await validatePromoCode(promoInput);
    if (promo) {
      // Check Min Order Value
      if (promo.minOrderValue && subtotal < promo.minOrderValue) {
        setPromoError(`Minimum order value of Rs. ${promo.minOrderValue} required.`);
        setAppliedPromo(null);
      } else {
        setAppliedPromo(promo);
        setPromoInput('');
      }
    } else {
      setPromoError('Invalid or expired code.');
    }
    setPromoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalSender = isGift ? sender : { fullName: recipient.fullName, contactNumber: recipient.contactNumber };
      const finalRecipient = recipient;

      const trackingId = await createOrder(activeItems, total, {
        subtotal,
        discountTotal,
        shippingFee: shipping,
        wrappingFee: wrapping,
        isGift,
        wrapGift: isGift ? wrapGift : false,
        sender: finalSender,
        recipient: finalRecipient,
        specialNote,
        promoCode: appliedPromo?.code
      });

      if (!buyNowItem) {
        clearCart();
      }
      navigate(`/order-success/${trackingId}`);
    } catch (error) {
      console.error(error);
      showAlert("Failed to place order. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className="pt-32 text-center pb-20 min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="text-gold-600 font-bold underline">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-serif font-bold text-center mb-12">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-bold mb-4">Order Details</h2>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsGift(false)}
                  className={`flex-1 py-4 px-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${!isGift ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-500'}`}>
                  <User size={24} /><span className="font-bold">Myself</span>
                </button>
                <button type="button" onClick={() => setIsGift(true)}
                  className={`flex-1 py-4 px-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${isGift ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-500'}`}>
                  <Gift size={24} /><span className="font-bold">Someone Else</span>
                </button>
              </div>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {isGift && (
                <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-gold-500">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18} /> Sender Details (You)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" placeholder="Your Name" className="w-full border p-3" value={sender.fullName} onChange={e => setSender({...sender, fullName: e.target.value})} />
                    <input required type="tel" placeholder="Your Contact No" className="w-full border p-3" value={sender.contactNumber} onChange={e => setSender({...sender, contactNumber: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-sm shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">{isGift ? <Gift size={18}/> : <User size={18}/>} Recipient Details</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" placeholder="Recipient Name" className="w-full border p-3" value={recipient.fullName} onChange={e => setRecipient({...recipient, fullName: e.target.value})} />
                    <input required type="tel" placeholder="Contact Number" className="w-full border p-3" value={recipient.contactNumber} onChange={e => setRecipient({...recipient, contactNumber: e.target.value})} />
                  </div>
                  <textarea required rows={2} placeholder="Full Delivery Address" className="w-full border p-3" value={recipient.address} onChange={e => setRecipient({...recipient, address: e.target.value})} />
                  <input required type="text" placeholder="Landmark" className="w-full border p-3" value={recipient.landmark} onChange={e => setRecipient({...recipient, landmark: e.target.value})} />
                  
                  {/* Special Note */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Special Instructions (Optional)</label>
                    <textarea rows={2} placeholder="Gift message, delivery time, gate code etc." className="w-full border p-3" value={specialNote} onChange={e => setSpecialNote(e.target.value)} />
                  </div>
                </div>
              </div>

              {isGift && (
                <div className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4 cursor-pointer" onClick={() => setWrapGift(!wrapGift)}>
                  <div className={`w-6 h-6 border-2 flex items-center justify-center rounded ${wrapGift ? 'bg-gold-500 border-gold-500' : 'border-gray-300'}`}>
                    {wrapGift && <Check size={16} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-dark-900">Add Premium Gift Wrapping</h3>
                    <p className="text-xs text-gray-500">Signature Ayvora black & gold paper.</p>
                  </div>
                  <span className="font-bold text-gold-600">Rs. {fees.wrappingFee}</span>
                </div>
              )}
            </form>
          </div>

          <div className="w-full lg:w-96">
             <div className="bg-white p-6 shadow-sm rounded-sm sticky top-24">
               <div className="flex justify-between items-center mb-6 pb-4 border-b">
                 <h2 className="text-xl font-bold">Summary</h2>
                 {buyNowItem && <span className="text-xs bg-dark-900 text-white px-2 py-1">Buy Now Item</span>}
               </div>
               
               <div className="space-y-4 mb-6">
                 {activeItems.map((item, idx) => (
                   <div key={`${item.id}-${item.selectedSize}-${idx}`} className="flex gap-4">
                     <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                       <img src={item.images[0]} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-sm font-bold">{item.name}</h4>
                       <p className="text-xs text-gray-500">{item.selectedSize} | x{item.quantity}</p>
                       <div className="text-xs font-semibold">Rs. {(item.activePrice * item.quantity).toLocaleString()}</div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Promo Code Input */}
               <div className="mb-6 border-t pt-4">
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Promo Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 border p-2 text-sm uppercase" 
                      placeholder="Enter code" 
                      value={promoInput} 
                      onChange={e => setPromoInput(e.target.value)}
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="bg-dark-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                      {promoLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                  {appliedPromo && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded border border-green-100">
                      <div className="flex items-center gap-1 text-green-700 font-bold text-xs uppercase">
                        <Tag size={12}/> {appliedPromo.code} Applied
                      </div>
                      <button onClick={() => setAppliedPromo(null)} className="text-xs text-gray-500 underline">Remove</button>
                    </div>
                  )}
               </div>
               
               <div className="space-y-3 text-sm border-t pt-4">
                 <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                 {appliedPromo && <div className="flex justify-between text-green-600 font-bold"><span>Discount</span><span>- Rs. {discountTotal.toLocaleString()}</span></div>}
                 <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
                 {isGift && wrapGift && <div className="flex justify-between text-gold-600"><span>Wrapping</span><span>Rs. {wrapping}</span></div>}
                 <div className="flex justify-between font-bold text-xl pt-4 border-t mt-2"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
               </div>

               <button form="checkout-form" disabled={loading} className="w-full bg-dark-900 text-white py-4 mt-8 font-bold uppercase tracking-widest hover:bg-gold-600">
                 {loading ? 'Processing...' : 'Order Now'}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};