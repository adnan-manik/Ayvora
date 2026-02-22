export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface SizeVariant {
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string; 
  type: 'Ittar' | 'Perfume';
  price: number; // Default/Starting price
  originalPrice?: number;
  sizeVariants: Record<string, SizeVariant>; // Map: { "30ml": { price: 3000 }, "50ml": { ... } }
  description: string;
  notes: string[];
  scentNotes?: ScentNotes;
  images: string[];
  isBestSeller?: boolean;
  isFeatured?: boolean; // New: Featured flag
  isNew?: boolean;
  concentration?: 'EDP' | 'EDT' | 'Parfum' | 'Extrait' | 'Custom';
  sizes?: string[]; // Kept for quick access to keys
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  activePrice: number; // The specific price for the selected size at add-time
}

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  wrappingFee: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  isGift: boolean;
  wrapGift: boolean;
  sender: ContactDetails;
  recipient: ShippingDetails;
  specialNote?: string; // New: Optional customer note
  promoCode?: string;
  userId?: string;
}

export interface PromoCode {
  id: string;
  title: string; // Grouping Title
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number; // Threshold
  maxDiscount?: number; // Cap for %
  scope: 'all' | 'category' | 'product';
  targetId?: string; // Category name or Product ID
  usageLimit: 'multi' | 'single';
  maxUses?: number; // For multi-use
  usedCount: number;
  status: 'active' | 'expired';
}

export interface StoreSettings {
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  wrappingFee: number;
  returnPolicy?: string;
  announcementText?: string;
  showAnnouncement?: boolean;
}

export interface ContactDetails {
  fullName: string;
  contactNumber: string;
}

export interface ShippingDetails extends ContactDetails {
  address: string;
  landmark: string;
  city?: string;
}

export enum SortOption {
  Relevance = 'Relevance',
  PriceLowHigh = 'Price: Low to High',
  PriceHighLow = 'Price: High to Low',
  Newest = 'Newest Arrivals'
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  order: number;
  active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
}