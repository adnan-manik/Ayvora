import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, increment } from "firebase/firestore"; 
import { PERFUMES } from '../constants';
import { Product, Order, CartItem, Review, Banner, StoreSettings, PromoCode } from '../types';

// --- Local Storage Helpers for Fallback ---
const getLocalData = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const setLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { console.error(`LS Save Error (${key})`, e); }
};

const generateTrackingId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AYV-${result}`;
};

// --- Store Settings ---
export const getStoreSettings = async (): Promise<StoreSettings> => {
  const defaults: StoreSettings = { 
    deliveryCharge: 200, 
    freeDeliveryThreshold: 3000, 
    wrappingFee: 150,
    returnPolicy: "We offer a 7-day return policy for unused and unopened items in their original packaging. Return shipping charges may apply.",
    announcementText: "Welcome to Ayvora - Luxury Scents Redefined",
    showAnnouncement: true
  };
  try {
    const docRef = doc(db, "settings", "store_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { ...defaults, ...docSnap.data() } as StoreSettings;
  } catch (e) {
    console.warn("Using local settings fallback");
  }
  return getLocalData<StoreSettings>('ayvora_settings') || defaults;
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<void> => {
  try { await setDoc(doc(db, "settings", "store_config"), settings); } 
  catch (e) { setLocalData('ayvora_settings', settings); }
};

// --- Products ---
export const getAllProducts = async (): Promise<Product[]> => {
  let products: Product[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Validate/Normalize numeric fields to prevent crashes
      products.push({ 
        id: doc.id, 
        ...data,
        price: Number(data.price) || 0,
        originalPrice: Number(data.originalPrice) || 0
      } as Product);
    });
  } catch (e) {
    console.error("Error fetching products from DB:", e);
  }

  // If DB empty, seed with constants
  if (products.length === 0) {
    products = PERFUMES.map(p => ({ ...p, createdAt: p.createdAt || new Date().toISOString() }));
  }

  const localProducts = getLocalData<Product[]>('ayvora_products_local') || [];
  const localDeletedIds = getLocalData<string[]>('ayvora_products_deleted') || [];
  const localUpdatedProducts = getLocalData<Record<string, Product>>('ayvora_products_updated') || {};

  products = [...products, ...localProducts];
  products = products.map(p => localUpdatedProducts[p.id] ? { ...p, ...localUpdatedProducts[p.id] } : p);
  products = products.filter(p => !localDeletedIds.includes(p.id));

  const uniqueProducts = Array.from(new Map(products.map(item => [item.id, item])).values());
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return uniqueProducts.map(p => ({ 
    ...p, 
    price: Number(p.price) || 0, // Double check safety
    isNew: new Date(p.createdAt) > thirtyDaysAgo 
  }));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  try { await addDoc(collection(db, "products"), product); } 
  catch (e) {
    const newP = { ...product, id: `local-${Date.now()}` } as Product;
    const local = getLocalData<Product[]>('ayvora_products_local') || [];
    local.push(newP);
    setLocalData('ayvora_products_local', local);
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try { await updateDoc(doc(db, "products", id), updates); } 
  catch (e) {
    const localUpdates = getLocalData<Record<string, Product>>('ayvora_products_updated') || {};
    const all = await getAllProducts();
    const cur = all.find(p => p.id === id);
    if(cur) { localUpdates[id] = { ...cur, ...updates }; setLocalData('ayvora_products_updated', localUpdates); }
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try { await deleteDoc(doc(db, "products", id)); } 
  catch (e) {
    const del = getLocalData<string[]>('ayvora_products_deleted') || [];
    if (!del.includes(id)) { del.push(id); setLocalData('ayvora_products_deleted', del); }
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const all = await getAllProducts();
  return all.filter(p => p.isFeatured);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const all = await getAllProducts();
  return all.find(p => p.id === id);
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const all = await getAllProducts();
  if (!category || category === 'All') return all;
  return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

export const searchProducts = async (queryStr: string): Promise<Product[]> => {
  const all = await getAllProducts();
  const lowerQuery = queryStr.toLowerCase();
  return all.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery));
};

// --- Promo Codes ---
export const getAllPromoCodes = async (): Promise<PromoCode[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "promo_codes"));
    const promos: PromoCode[] = [];
    querySnapshot.forEach(doc => promos.push({ id: doc.id, ...doc.data() } as PromoCode));
    return promos;
  } catch (e) {
    return getLocalData<PromoCode[]>('ayvora_promos_local') || [];
  }
};

export const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
  try {
    // Check Firestore
    const q = query(collection(db, "promo_codes"), where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);
    let promoData: PromoCode | null = null;
    
    if (!snapshot.empty) {
      promoData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PromoCode;
    } else {
       // Fallback to local
      const promos = getLocalData<PromoCode[]>('ayvora_promos_local') || [];
      const found = promos.find(p => p.code.toUpperCase() === code.toUpperCase());
      if (found) promoData = found;
    }

    if (!promoData) return null;
    if (promoData.status !== 'active') return null;
    if (promoData.usageLimit === 'single' && promoData.usedCount >= 1) return null;
    if (promoData.usageLimit === 'multi' && promoData.maxUses && promoData.usedCount >= promoData.maxUses) return null;
      
    return promoData;
  } catch (e) {
    return null;
  }
};

export const createPromoCode = async (promo: Omit<PromoCode, 'id'>): Promise<void> => {
  try { await addDoc(collection(db, "promo_codes"), promo); } 
  catch (e) {
    const local = getLocalData<PromoCode[]>('ayvora_promos_local') || [];
    local.push({ ...promo, id: `local-promo-${Date.now()}-${Math.random()}` });
    setLocalData('ayvora_promos_local', local);
  }
};

export const deletePromoCode = async (id: string): Promise<void> => {
  try { await deleteDoc(doc(db, "promo_codes", id)); } 
  catch (e) {
    let local = getLocalData<PromoCode[]>('ayvora_promos_local') || [];
    local = local.filter(p => p.id !== id);
    setLocalData('ayvora_promos_local', local);
  }
};

const incrementPromoUsage = async (code: string) => {
  try {
    const q = query(collection(db, "promo_codes"), where("code", "==", code));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { usedCount: increment(1) });
    }
  } catch (e) {
    // Local fallback update
    const local = getLocalData<PromoCode[]>('ayvora_promos_local') || [];
    const idx = local.findIndex(p => p.code === code);
    if (idx > -1) {
      local[idx].usedCount += 1;
      setLocalData('ayvora_promos_local', local);
    }
  }
};

// --- Banners, Orders, Reviews --- (existing implementation remains stable)
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const q = query(collection(db, "banners"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    const banners: Banner[] = [];
    querySnapshot.forEach(doc => banners.push({ id: doc.id, ...doc.data() } as Banner));
    return banners;
  } catch (e) { return getLocalData<Banner[]>('ayvora_banners_local') || []; }
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<void> => {
  try { await addDoc(collection(db, "banners"), banner); } 
  catch (e) {
    const local = getLocalData<Banner[]>('ayvora_banners_local') || [];
    local.push({ ...banner, id: `local-banner-${Date.now()}` });
    setLocalData('ayvora_banners_local', local);
  }
};

export const deleteBanner = async (id: string): Promise<void> => {
  try { await deleteDoc(doc(db, "banners", id)); } 
  catch (e) {
    let local = getLocalData<Banner[]>('ayvora_banners_local') || [];
    local = local.filter(b => b.id !== id);
    setLocalData('ayvora_banners_local', local);
  }
};

export const createOrder = async (
  items: CartItem[], 
  total: number, 
  orderDetails: Omit<Order, 'id' | 'createdAt' | 'status' | 'items' | 'total'>
): Promise<string> => {
  const trackingId = generateTrackingId();
  const newOrder: Order = { id: trackingId, createdAt: new Date().toISOString(), status: 'Pending', total, items, ...orderDetails };
  
  try {
    await setDoc(doc(db, "orders", trackingId), newOrder);
    // If a promo code was used, increment its usage count
    if (orderDetails.promoCode) {
      await incrementPromoUsage(orderDetails.promoCode);
    }
  } catch (error) {
    const orders = getLocalData<Record<string, Order>>('ayvora_orders_local') || {};
    orders[trackingId] = newOrder;
    setLocalData('ayvora_orders_local', orders);
    if (orderDetails.promoCode) {
       await incrementPromoUsage(orderDetails.promoCode);
    }
  }
  return trackingId;
};

export const getAllOrders = async (): Promise<Order[]> => {
  let orders: Order[] = [];
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      const data = doc.data();
      orders.push({ 
        id: doc.id, 
        ...data,
        // Ensure items have activePrice
        items: (data.items || []).map((i: any) => ({ ...i, activePrice: Number(i.activePrice) || Number(i.price) || 0 })) 
      } as Order);
    });
  } catch (e) {}
  const localOrdersMap = getLocalData<Record<string, Order>>('ayvora_orders_local') || {};
  const combined = [...orders, ...Object.values(localOrdersMap)].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return Array.from(new Map(combined.map(o => [o.id, o])).values());
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const allOrders = await getAllOrders();
  return allOrders.filter(o => o.userId === userId);
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try { await updateDoc(doc(db, "orders", orderId), { status }); } 
  catch (e) {
    const orders = getLocalData<Record<string, Order>>('ayvora_orders_local') || {};
    if (orders[orderId]) { orders[orderId].status = status; setLocalData('ayvora_orders_local', orders); }
  }
};

export const trackOrder = async (trackingId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", trackingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as Order;
  } catch (error) {}
  const orders = getLocalData<Record<string, Order>>('ayvora_orders_local') || {};
  return orders[trackingId] || null;
};

export const addReview = async (productId: string, userName: string, rating: number, comment: string): Promise<void> => {
  const review: Omit<Review, 'id'> = { product_id: productId, user_id: 'guest', user_name: userName, rating, comment, created_at: new Date().toISOString() };
  try { await addDoc(collection(db, "reviews"), review); } 
  catch (e) {
    const reviews = getLocalData<Review[]>('ayvora_reviews_local') || [];
    reviews.push({ ...review, id: `local-${Date.now()}` } as Review);
    setLocalData('ayvora_reviews_local', reviews);
  }
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  let reviews: Review[] = [];
  try {
    const q = query(collection(db, "reviews"), where("product_id", "==", productId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() } as Review));
  } catch (e) {}
  const localReviews = getLocalData<Review[]>('ayvora_reviews_local') || [];
  return [...reviews, ...localReviews.filter(r => r.product_id === productId)];
};