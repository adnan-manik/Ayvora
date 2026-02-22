import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, increment } from "firebase/firestore"; 
import { PERFUMES } from '../constants';
import { Product, Order, CartItem, Review, Banner, StoreSettings, PromoCode } from '../types';

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
    // Silent fallback to defaults on permission error
    console.warn("Using default settings (DB access denied or empty)");
  }
  return defaults;
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<void> => {
  await setDoc(doc(db, "settings", "store_config"), settings);
};

// --- Products ---
export const getAllProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({ 
        id: doc.id, 
        ...data,
        price: Number(data.price) || 0,
        originalPrice: Number(data.originalPrice) || 0
      } as Product);
    });
  } catch (e) {
    console.warn("Error fetching products from DB (using fallback):", e);
  }

  // Fallback to constants if DB is empty or failed
  if (products.length === 0) {
    return PERFUMES.map(p => ({ 
      ...p, 
      price: Number(p.price) || 0,
      isNew: true 
    }));
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return products.map(p => ({ 
    ...p, 
    price: Number(p.price) || 0,
    isNew: new Date(p.createdAt) > thirtyDaysAgo 
  }));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  await addDoc(collection(db, "products"), product);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  await updateDoc(doc(db, "products", id), updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const all = await getAllProducts();
  return all.filter(p => p.isFeatured);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as Product;
    }
  } catch (e) {
    console.error("Error fetching product by ID:", e);
  }
  return undefined;
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
  const promos: PromoCode[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "promo_codes"));
    querySnapshot.forEach(doc => promos.push({ id: doc.id, ...doc.data() } as PromoCode));
  } catch (e) {
    console.error("Error fetching promo codes:", e);
  }
  return promos;
};

export const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
  try {
    const q = query(collection(db, "promo_codes"), where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const promoData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PromoCode;

    if (promoData.status !== 'active') return null;
    if (promoData.usageLimit === 'single' && promoData.usedCount >= 1) return null;
    if (promoData.usageLimit === 'multi' && promoData.maxUses && promoData.usedCount >= promoData.maxUses) return null;
      
    return promoData;
  } catch (e) {
    console.error("Error validating promo code:", e);
    return null;
  }
};

export const createPromoCode = async (promo: Omit<PromoCode, 'id'>): Promise<void> => {
  await addDoc(collection(db, "promo_codes"), promo);
};

export const deletePromoCode = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "promo_codes", id));
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
    console.error("Error incrementing promo usage:", e);
  }
};

// --- Banners ---
export const getBanners = async (): Promise<Banner[]> => {
  const banners: Banner[] = [];
  try {
    const q = query(collection(db, "banners"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => banners.push({ id: doc.id, ...doc.data() } as Banner));
  } catch (e) {
    console.error("Error fetching banners:", e);
  }
  return banners;
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<void> => {
  await addDoc(collection(db, "banners"), banner);
};

export const deleteBanner = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "banners", id));
};

// --- Orders ---
export const createOrder = async (
  items: CartItem[], 
  total: number, 
  orderDetails: Omit<Order, 'id' | 'createdAt' | 'status' | 'items' | 'total'>
): Promise<string> => {
  const trackingId = generateTrackingId();
  const newOrder: Order = { id: trackingId, createdAt: new Date().toISOString(), status: 'Pending', total, items, ...orderDetails };
  
  // Sanitize undefined values
  Object.keys(newOrder).forEach(key => {
    if ((newOrder as any)[key] === undefined) {
      delete (newOrder as any)[key];
    }
  });

  await setDoc(doc(db, "orders", trackingId), newOrder);
  
  if (orderDetails.promoCode) {
    await incrementPromoUsage(orderDetails.promoCode);
  }
  
  return trackingId;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const orders: Order[] = [];
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      const data = doc.data();
      orders.push({ 
        id: doc.id, 
        ...data,
        items: (data.items || []).map((i: any) => ({ ...i, activePrice: Number(i.activePrice) || Number(i.price) || 0 })) 
      } as Order);
    });
  } catch (e) {
    console.error("Error fetching orders:", e);
  }
  return orders;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const orders: Order[] = [];
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      const data = doc.data();
      orders.push({ 
        id: doc.id, 
        ...data,
        items: (data.items || []).map((i: any) => ({ ...i, activePrice: Number(i.activePrice) || Number(i.price) || 0 })) 
      } as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error("Error fetching user orders:", e);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  await updateDoc(doc(db, "orders", orderId), { status });
};

export const trackOrder = async (trackingId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", trackingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as Order;
  } catch (error) {
    console.error("Error tracking order:", error);
  }
  return null;
};

// --- Reviews ---
export const addReview = async (productId: string, userName: string, rating: number, comment: string): Promise<void> => {
  const review: Omit<Review, 'id'> = { product_id: productId, user_id: 'guest', user_name: userName, rating, comment, created_at: new Date().toISOString() };
  await addDoc(collection(db, "reviews"), review);
};

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const reviews: Review[] = [];
  try {
    const q = query(collection(db, "reviews"), where("product_id", "==", productId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() } as Review));
  } catch (e) {
    console.error("Error fetching reviews:", e);
  }
  return reviews;
};