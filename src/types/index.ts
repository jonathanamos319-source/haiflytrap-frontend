export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  priceLabel?: string;
  originalPriceLabel?: string;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  badge?: 'bestseller' | 'new' | 'eco-friendly' | 'sale';
  inStock: boolean;
  isLimited?: boolean;
  manualOutOfStock?: boolean;
  features?: string[];
  specifications?: Record<string, string>;
  hasIndoorOutdoorVariants?: boolean;
  indoorPrice?: number;
  outdoorPrice?: number;
  freeDelivery?: boolean;
  minQuantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  altPhone?: string;
  whatsapp?: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'pending-payment' | 'processing' | 'packed' | 'in-transit' | 'delivered';
  paymentMethod: string;
  createdAt: string;
  trackingNumber?: string;
  couponCode?: string;
  riderName?: string;
  riderPhone?: string;
}

export interface Review {
  id: string;
  customerName: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Marketer {
  id: string;
  name: string;
  phone: string;
  couponCode: string;
  commission: number;
  totalSales: number;
  conversions: number;
  status: 'active' | 'inactive';
}

export interface AdminMarketer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  code: string;
  commission: number;
  sales: number;
  total: number;
  earned: number;
  status: 'active' | 'inactive';
}

export interface HandlerProfile {
  id: string;
  name: string;
  initials: string;
  phone: string;
  zone: string;
  assignedOrders: number;
  completedToday: number;
  status: 'active' | 'inactive';
}

export interface HandlerOrder {
  id: string;
  orderId: string;
  customerName: string;
  location: string;
  items: number;
  total: number;
  status: 'pending' | 'packed' | 'in-transit' | 'delivered';
  products: {
    name: string;
    quantity: number;
    price: number;
    icon: string;
  }[];
  shippingMethod: string;
  riderName?: string;
  riderPhone?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url: string | null;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type View = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'order-confirmation' 
  | 'track-order'
  | 'reviews'
  | 'admin-dashboard'
  | 'admin-orders'
  | 'admin-marketers'
  | 'handler-portal'
  | 'admin-login'
  | 'handler-login'
  | 'auth-callback'
  | 'admin-callback'
  | 'customer-callback'
  | 'customer-login'
  | 'blog'
  | 'blog-post'
  | 'settings'
  | 'recent-orders'
  | 'admin-blog';
