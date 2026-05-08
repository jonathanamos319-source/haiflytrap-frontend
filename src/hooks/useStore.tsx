import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product, CartItem, Order, View, AdminMarketer, HandlerProfile, BlogPost } from '@/types';
import api from '@/lib/api';
import { supabase, supabaseAdmin, supabaseHandler, supabaseUser } from '@/lib/supabase';

import type { User } from '@supabase/supabase-js';

// ─── CONTEXT TYPES ───────────────────────────────────────────────────────────

interface StoreContextType {
  // Navigation
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;

  // Auth
  user: User | null;
  isLoadingUser: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderLogistics: (id: string, logistics: { riderName: string; riderPhone: string }) => Promise<void>;
  activeCouponCode: string;
  setActiveCouponCode: (code: string) => void;
  clearActiveCouponCode: () => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  marketers: AdminMarketer[];
  isLoadingMarketers: boolean;
  handlers: HandlerProfile[];
  isLoadingHandlers: boolean;
  addMarketer: (marketer: Omit<AdminMarketer, 'id' | 'initials' | 'sales' | 'total' | 'earned'>) => Promise<void>;
  updateMarketer: (id: string, updates: Partial<AdminMarketer>) => Promise<void>;
  removeMarketer: (id: string) => Promise<void>;
  addHandler: (handler: Omit<HandlerProfile, 'id' | 'initials' | 'assignedOrders' | 'completedToday'>) => Promise<void>;
  updateHandler: (id: string, updates: Partial<HandlerProfile>) => Promise<void>;
  removeHandler: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => Promise<void>;

  // Blogs
  blogs: BlogPost[];
  isLoadingBlogs: boolean;
  addBlog: (blog: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBlog: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  selectedBlog: BlogPost | null;
  setSelectedBlog: (blog: BlogPost | null) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Transition
  isTransitioning: boolean;
  transitionData: { sourceRect: DOMRect | null; image: string | null } | null;
  triggerTransition: (product: Product, rect: DOMRect) => void;
  completeTransition: () => void;
  logout: () => void;
  isBackendDown: boolean;
  isCheckingBackend: boolean;
}



// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

const ADMIN_PATH = `/${import.meta.env.VITE_ADMIN_SECRET_PATH || 'admin-login'}`;

const getViewFromLocation = (): View => {
  const path = window.location.pathname;

  // ── Auth callbacks (separate for admin vs customer) ──
  if (path === '/auth/callback/admin') return 'admin-callback';
  if (path === '/auth/callback/customer') return 'customer-callback';
  // Legacy single callback (fallback)
  if (path === '/auth/callback') return 'auth-callback';

  // ── Admin portal (secret path only) ──
  if (path === ADMIN_PATH) return 'admin-login';
  if (path === '/admin') return 'admin-login';
  if (path === '/marketers') return 'admin-login';

  // ── Handler portal ──
  if (path === '/handler-login') return 'handler-login';
  if (path === '/handler' || path === '/handlers') return 'handler-login';

  // ── Customer auth ──
  if (path === '/login') return 'customer-login';

  // ── Storefront ──
  if (path === '/shop') return 'shop';
  if (path === '/reviews') return 'reviews';
  if (path === '/cart') return 'cart';
  if (path === '/checkout') return 'checkout';
  if (path === '/orders') return 'recent-orders';
  return 'home';
};

const readCouponFromLocation = () => {
  const coupon = new URLSearchParams(window.location.search).get('coupon');
  return coupon ? coupon.trim().toUpperCase() : '';
};

const readTrackedOrderFromStorage = (): Order | null => {
  const saved = localStorage.getItem('haifly_current_order');
  if (!saved) return null;

  try {
    return JSON.parse(saved) as Order;
  } catch {
    localStorage.removeItem('haifly_current_order');
    return null;
  }
};

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'bk-spray-001',
    name: 'Broadkiller Surface Spray',
    category: 'organic-sprays',
    price: 3000,
    image: '/images/Broadkillersurefacespray.png',
    description: 'Premium odourless botanical insecticide safe for families and pets. Highly effective against flies, mosquitoes, and crawling insects.',
    rating: 5,
    reviews: 120,
    inStock: true,
  },
  {
    id: 'hai-trap-001',
    name: 'Hai Fly Trap',
    category: 'mosquito-traps',
    price: 8500,
    image: '/images/TRAPIMG1.png',
    description: "The world's first commercially viable housefly trap. Eco-friendly and highly effective for both indoor and outdoor use.",
    rating: 5,
    reviews: 230,
    inStock: true,
  },
  {
    id: 'carton-bulk-001',
    name: 'Carton',
    category: 'accessories',
    price: 100000,
    image: '/images/a carton.png',
    description: 'Bulk carton pack for distributors and large facilities. Includes 6 units of Broadkiller Surface Spray.',
    rating: 4.8,
    reviews: 45,
    inStock: true,
  },
  {
    id: 'bk-30ml-001',
    name: 'Broadkiller Pocket Spray (30ML)',
    category: 'organic-sprays',
    price: 250,
    minQuantity: 10,
    image: 'https://res.cloudinary.com/decnpcsss/image/upload/v1778090660/haifly-trap-products/cyzloowys7vwtcmdqglz.jpg',
    description: 'Travel-sized 30ML pocket spray. Perfect for on-the-go protection against houseflies and mosquitoes. Highly effective botanical formula in a compact size.',
    rating: 4.9,
    reviews: 85,
    inStock: true,
    features: ['Travel Friendly', 'Pocket Sized', 'Minimum Order: 10 units']
  },
  {
    id: 'bk-100ml-001',
    name: 'Broadkiller Spray (100ML)',
    category: 'organic-sprays',
    price: 800,
    minQuantity: 3,
    image: 'https://res.cloudinary.com/decnpcsss/image/upload/v1778172697/Dajosh-7.jpg_j16wad.jpg',
    description: 'Standard 100ML spray bottle. High-potency botanical formulation for effective fly control in homes and offices.',
    rating: 4.8,
    reviews: 120,
    inStock: true,
    features: ['Standard Size', 'Easy Grip', 'Minimum Order: 3 units']
  }
];


// ─── PROVIDER ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>(getViewFromLocation());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('haifly_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [currentOrder, setCurrentOrderState] = useState<Order | null>(() => readTrackedOrderFromStorage());
  const [activeCouponCode, setActiveCouponCodeState] = useState(() => {
    return readCouponFromLocation() || localStorage.getItem('haifly_active_coupon') || '';
  });

  // ── Auth ──
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ── Products & Blogs (from API) ──
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);

  // ── Backend Health Check ──
  useEffect(() => {
    let checkInterval: number;

    const performHealthCheck = async (isInitial = false) => {
      if (isInitial) setIsCheckingBackend(true);

      const maxRetries = 2;
      let success = false;
      const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'https://api.haiflytrapng.com/api/v1'}/health`;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(HEALTH_URL, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && (data.status === 'ok' || data.data?.status === 'ok')) {
              success = true;
              break;
            }
          }
        } catch (err) {
          // Attempt failed (network error, timeout, etc.)
        }

        if (!success && attempt < maxRetries) {
          // Wait 1.5s before retry
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      setIsBackendDown(!success);
      if (isInitial) setIsCheckingBackend(false);
    };

    performHealthCheck(true);

    // Continue checking every 20 seconds
    checkInterval = window.setInterval(() => {
      performHealthCheck(false);
    }, 20000);

    return () => clearInterval(checkInterval);
  }, []);

  // ── Marketers & Handlers (from API) ──
  const [marketers, setMarketers] = useState<AdminMarketer[]>([]);
  const [isLoadingMarketers, setIsLoadingMarketers] = useState(true);
  const [handlers, setHandlers] = useState<HandlerProfile[]>([]);
  const [isLoadingHandlers, setIsLoadingHandlers] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<{ sourceRect: DOMRect | null; image: string | null } | null>(null);

  // ── Fetch products from API on mount ──
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [resProducts, resBlogs] = await Promise.all([
          api.get('/products'),
          api.get('/blogs')
        ]);
        if (!cancelled && resProducts.data?.success && Array.isArray(resProducts.data.data)) {
          const apiProducts = resProducts.data.data;
          // Merge API products with defaults, preferring API versions if IDs match
          setProducts(prev => {
            const merged = [...apiProducts];
            DEFAULT_PRODUCTS.forEach(dp => {
              if (!merged.some(p => p.id === dp.id)) {
                merged.push(dp);
              }
            });
            return merged;
          });
        }
        if (!cancelled && resBlogs.data?.success && Array.isArray(resBlogs.data.data)) {
          setBlogs(resBlogs.data.data);
        }
      } catch {
        // API unavailable
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
          setIsLoadingBlogs(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Rehydrate Sessions on mount ──
  useEffect(() => {
    const rehydrateSessions = async () => {
      const path = window.location.pathname;
      const tempToken = localStorage.getItem('temp_admin_token');

      // Admin Rehydration
      if (path.startsWith('/admin') || path.startsWith('/marketers')) {
        if (tempToken) {
          setCurrentView('admin-dashboard');
          window.history.pushState({}, '', '/admin');
        }

        const { data: { session } } = await supabaseAdmin.auth.getSession();
        if (session?.user) {
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && res.data.data?.role === 'admin') {
              setCurrentView('admin-dashboard');
              window.history.pushState({}, '', '/admin');
            } else {
              await supabaseAdmin.auth.signOut();
            }
          } catch (err: any) {
            // Silently catch initialization errors
            if (err.response?.status !== 401 && err.response?.status !== 400) {
              console.error('Admin rehydration failed:', err);
            }
          }
        }
      }


      // Handler Rehydration
      if (path.startsWith('/handler')) {
        const { data: { session } } = await supabaseHandler.auth.getSession();
        if (session?.user) {
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && res.data.data?.role === 'handler') {
              setCurrentView('handler-portal');
              window.history.pushState({}, '', '/handler');
            } else {
              await supabaseHandler.auth.signOut();
            }
          } catch (err: any) {
            // Silently catch initialization errors
            if (err.response?.status !== 401 && err.response?.status !== 400) {
              console.error('Handler rehydration failed:', err);
            }
          }
        }
      }


      // Customer Rehydration (Global User State)
      const { data: { session: userSession } } = await supabaseUser.auth.getSession();
      if (userSession?.user) {
        setUser(userSession.user);
      }
      setIsLoadingUser(false);
    };
    rehydrateSessions();
  }, []);

  // ── Listen to auth changes for EACH role independently ──
  useEffect(() => {
    // We only care about syncing the "user" state in useStore with the Customer session
    // because Admin and Handler views have their own Guard checks.
    const { data: { subscription: userSub } } = supabaseUser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
    });

    // Optional: Log transitions for other roles if needed for debug
    const { data: { subscription: adminSub } } = supabaseAdmin.auth.onAuthStateChange((event, session) => {
      console.log('Admin Auth Event:', event, session?.user?.email);
    });

    const { data: { subscription: handlerSub } } = supabaseHandler.auth.onAuthStateChange((event, session) => {
      console.log('Handler Auth Event:', event, session?.user?.email);
    });

    return () => {
      userSub.unsubscribe();
      adminSub.unsubscribe();
      handlerSub.unsubscribe();
    };
  }, []);


  // ── Auto-refresh Orders (Admin/Handler) ──
  useEffect(() => {
    let intervalId: number | undefined;

    const normalizeServerOrder = (serverOrder: any): Order => ({
      id: serverOrder.id,
      customerName: serverOrder.customerName || serverOrder.customer_name,
      customerPhone: serverOrder.customerPhone || serverOrder.customer_phone,
      altPhone: serverOrder.altPhone || serverOrder.alt_phone,
      whatsapp: serverOrder.whatsapp,
      customerEmail: serverOrder.customerEmail || serverOrder.customer_email,
      address: serverOrder.address,
      city: serverOrder.city,
      state: serverOrder.state,
      landmark: serverOrder.landmark,
      notes: serverOrder.notes,
      items: serverOrder.items,
      subtotal: serverOrder.subtotal,
      tax: serverOrder.tax,
      shipping: serverOrder.shipping,
      discount: serverOrder.discount || 0,
      total: serverOrder.total,
      status: serverOrder.status || 'pending',
      paymentMethod: serverOrder.paymentMethod || serverOrder.payment_method,
      createdAt: serverOrder.created_at || serverOrder.createdAt,
      trackingNumber: serverOrder.tracking_number || serverOrder.trackingNumber,
      couponCode: serverOrder.couponCode || serverOrder.coupon_code,
      riderName: serverOrder.rider_name || serverOrder.riderName || undefined,
      riderPhone: serverOrder.rider_phone || serverOrder.riderPhone || undefined,
    });

    const fetchOrders = async () => {
      const path = window.location.pathname;
      const tempToken = localStorage.getItem('temp_admin_token');
      const isAdminRoute = path.startsWith('/admin') || path.startsWith('/marketers');
      const isHandlerRoute = path.startsWith('/handler');
      const storedOrders = localStorage.getItem('haifly_orders');

      const [adminSession, handlerSession] = await Promise.all([
        supabaseAdmin.auth.getSession(),
        supabaseHandler.auth.getSession(),
      ]);

      const hasOrderAccess =
        !!user ||
        !!tempToken ||
        !!adminSession.data.session?.user ||
        !!handlerSession.data.session?.user;

      if (!hasOrderAccess) {
        return;
      }

      setIsLoadingOrders(true);
      try {
        const endpoint = (!isAdminRoute && !isHandlerRoute && user) ? '/orders/my-orders' : '/orders';
        const res = await api.get(endpoint);

        if (res.data?.success && Array.isArray(res.data.data)) {
          const serverOrders = res.data.data.map(normalizeServerOrder);

          setOrders(prev => {
            const merged = [...serverOrders];
            prev.forEach(localOrder => {
              if (!merged.some(so => so.id === localOrder.id)) {
                merged.push(localOrder);
              }
            });

            return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        }
      } catch (err) {
        if (storedOrders) {
          try {
            setOrders(JSON.parse(storedOrders));
          } catch {
            // ignore malformed local backup
          }
        }
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    void fetchOrders();
    intervalId = window.setInterval(() => {
      void fetchOrders();
    }, 15000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [user]);

  // ── Fetch marketers & handlers on mount (admin/handler data only) ──
  useEffect(() => {
    const fetchAdminData = async () => {
      // Check which role's session is active
      const [adminSession, handlerSession, userSession] = await Promise.all([
        supabaseAdmin.auth.getSession(),
        supabaseHandler.auth.getSession(),
        supabaseUser.auth.getSession()
      ]);

      const session = adminSession.data.session || handlerSession.data.session || userSession.data.session;
      const tempToken = localStorage.getItem('temp_admin_token');

      if (!session && !tempToken) {
        setIsLoadingMarketers(false);
        setIsLoadingHandlers(false);
        return;
      }

      // Check user role from the secure API
      let role = 'customer';
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          role = res.data.data.role;
        }
      } catch (err: any) {
        // Silently catch initialization errors
        if (err.response?.status !== 401 && err.response?.status !== 400) {
          console.error('Failed to fetch user role:', err);
        }
      }

      // Only admins and handlers can access these endpoints
      if (role !== 'admin' && role !== 'handler') {
        setIsLoadingMarketers(false);
        setIsLoadingHandlers(false);
        return;
      }

      try {
        const [mRes, hRes] = await Promise.all([
          api.get('/marketers'),
          api.get('/handlers'),
        ]);
        if (mRes.data?.success) setMarketers(mRes.data.data);
        if (hRes.data?.success) setHandlers(hRes.data.data);
      } catch {
        // Silently fail
      } finally {
        setIsLoadingMarketers(false);
        setIsLoadingHandlers(false);
      }
    };

    fetchAdminData();

    window.addEventListener('haifly_admin_login', fetchAdminData);
    return () => window.removeEventListener('haifly_admin_login', fetchAdminData);
  }, []);

  // ── Persist active coupon code ──
  useEffect(() => {
    if (activeCouponCode) {
      localStorage.setItem('haifly_active_coupon', activeCouponCode);
    } else {
      localStorage.removeItem('haifly_active_coupon');
    }
  }, [activeCouponCode]);

  // ── Persist orders locally for track-order page ──
  useEffect(() => {
    localStorage.setItem('haifly_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentOrder) {
      localStorage.setItem('haifly_current_order', JSON.stringify(currentOrder));
    } else {
      localStorage.removeItem('haifly_current_order');
    }
  }, [currentOrder]);

  // ── URL sync ──
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentView(getViewFromLocation());
      const coupon = readCouponFromLocation();
      if (coupon) setActiveCouponCodeState(coupon);
    };
    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // ── View handler (with URL sync) ──
  const handleSetView = useCallback((view: View) => {
    setCurrentView(view);
    const specialRoutes: Record<string, string> = {
      'home': '/',
      'shop': '/shop',
      'product': '/product',
      'cart': '/cart',
      'checkout': '/checkout',
      'reviews': '/reviews',
      'admin-dashboard': '/admin',
      'admin-marketers': '/marketers',
      'handler-portal': '/handler',
      // Admin portal uses secret path
      'admin-login': ADMIN_PATH,
      // Auth callbacks
      'auth-callback': '/auth/callback',
      'admin-callback': '/auth/callback/admin',
      'customer-callback': '/auth/callback/customer',
      // Customer auth
      'customer-login': '/login',
      // Settings & Blogs
      'blog': '/blog',
      'blog-post': '/blog-post',
      'settings': '/settings',
      'recent-orders': '/orders',
      'track-order': '/track-order',
      'handler-login': '/handler-login',
    };

    if (specialRoutes[view]) {
      let targetPath = specialRoutes[view];

      // If navigating TO a login page, preserve the current path in a 'from' query param
      if (view.includes('login')) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login') && currentPath !== '/') {
          targetPath += `?from=${encodeURIComponent(currentPath)}`;
        }
      }

      window.history.pushState({}, '', targetPath);
    } else if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }

  }, []);

  // ── Transitions ──
  const triggerTransition = useCallback((product: Product, rect: DOMRect) => {
    setTransitionData({ sourceRect: rect, image: product.image });
    setSelectedProduct(product);
    setIsTransitioning(true);
    setCurrentView('product');
  }, []);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionData(null);
  }, []);

  // ── Product updates (admin, optimistic) ──
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    api.patch(`/products/${id}`, updates).catch(() => {
      // Revert handled by admin reload if needed
    });
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      const res = await api.post('/products', product);
      if (res.data?.success) {
        setProducts(prev => [res.data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const previousProducts = products;
    setProducts(prev => prev.filter(product => product.id !== id));

    try {
      await api.delete(`/products/${id}`);
    } catch (err) {
      setProducts(previousProducts);
      console.error('Failed to delete product:', err);
      throw err;
    }
  }, [products]);


  // ── Blogs (admin, optimistic) ──
  const addBlog = useCallback(async (blog: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const res = await api.post('/blogs', blog);
      if (res.data?.success) {
        setBlogs(prev => [res.data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add blog:', err);
    }
  }, []);

  const updateBlog = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    try {
      setBlogs(prev => prev.map(b => b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b));
      await api.put(`/blogs/${id}`, updates);
    } catch (err) {
      console.error('Failed to update blog:', err);
    }
  }, []);

  const deleteBlog = useCallback(async (id: string) => {
    try {
      setBlogs(prev => prev.filter(b => b.id !== id));
      await api.delete(`/blogs/${id}`);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  }, []);

  // ── Marketers (API-backed) ──
  const addMarketer = useCallback(async (marketer: Omit<AdminMarketer, 'id' | 'initials' | 'sales' | 'total' | 'earned'>) => {
    try {
      const payload = {
        name: marketer.name,
        phone: marketer.phone,
        code: marketer.code,
        commission: marketer.commission,
        status: marketer.status,
      };
      const res = await api.post('/marketers', payload);
      if (res.data?.success) {
        const created = res.data.data;
        setMarketers(prev => [{
          id: created.id,
          name: created.name,
          initials: getInitials(created.name),
          phone: created.phone,
          code: created.code,
          commission: created.commission,
          sales: created.sales ?? 0,
          total: created.total ?? 0,
          earned: created.earned ?? 0,
          status: created.status,
        }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add marketer:', err);
    }
  }, []);

  const removeMarketer = useCallback(async (id: string) => {
    try {
      await api.delete(`/marketers/${id}`);
      setMarketers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to remove marketer:', err);
    }
  }, []);

  const updateMarketer = useCallback(async (id: string, updates: Partial<AdminMarketer>) => {
    try {
      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.code !== undefined ? { code: updates.code } : {}),
        ...(updates.commission !== undefined ? { commission: updates.commission } : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
      };

      const res = await api.patch(`/marketers/${id}`, payload);
      const updated = res.data?.data;
      if (updated) {
        setMarketers(prev => prev.map(marketer => marketer.id === id ? {
          ...marketer,
          name: updated.name,
          initials: getInitials(updated.name),
          phone: updated.phone,
          code: updated.code,
          commission: updated.commission,
          status: updated.status,
        } : marketer));
      }
    } catch (err) {
      console.error('Failed to update marketer:', err);
      throw err;
    }
  }, []);

  // ── Handlers (API-backed) ──
  const addHandler = useCallback(async (handler: Omit<HandlerProfile, 'id' | 'initials' | 'assignedOrders' | 'completedToday'>) => {
    try {
      const payload = {
        name: handler.name,
        phone: handler.phone,
        zone: handler.zone,
        status: handler.status,
      };
      const res = await api.post('/handlers', payload);
      if (res.data?.success) {
        const created = res.data.data;
        setHandlers(prev => [{
          id: created.id,
          name: created.name,
          initials: getInitials(created.name),
          phone: created.phone,
          zone: created.zone,
          assignedOrders: created.assigned_orders ?? 0,
          completedToday: created.completed_today ?? 0,
          status: created.status,
        }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add handler:', err);
    }
  }, []);

  const removeHandler = useCallback(async (id: string) => {
    try {
      await api.delete(`/handlers/${id}`);
      setHandlers(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to remove handler:', err);
    }
  }, []);

  const updateHandler = useCallback(async (id: string, updates: Partial<HandlerProfile>) => {
    try {
      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.zone !== undefined ? { zone: updates.zone } : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
      };

      const res = await api.patch(`/handlers/${id}`, payload);
      const updated = res.data?.data;
      if (updated) {
        setHandlers(prev => prev.map(handler => handler.id === id ? {
          ...handler,
          name: updated.name,
          initials: getInitials(updated.name),
          phone: updated.phone,
          zone: updated.zone,
          status: updated.status,
        } : handler));
      }
    } catch (err) {
      console.error('Failed to update handler:', err);
      throw err;
    }
  }, []);

  // ── Cart ──
  const addToCart = useCallback((product: Product, quantity?: number) => {
    const finalQuantity = quantity !== undefined ? quantity : (product.minQuantity || 1);
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + finalQuantity }
            : item
        );
      }
      return [...prev, { product, quantity: finalQuantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;

      const minQty = item.product.minQuantity || 1;
      if (quantity < minQty) {
        return prev.filter(item => item.product.id !== productId);
      }

      return prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => { setCart([]); }, []);

  // ── Orders ──
  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCurrentOrderState(order);
  }, []);

  const setCurrentOrder = useCallback((order: Order | null) => {
    setCurrentOrderState(order);

    if (order?.trackingNumber) {
      localStorage.setItem('last_tracked_waybill', order.trackingNumber);
    } else {
      localStorage.removeItem('last_tracked_waybill');
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      // 1. Optimistic UI update
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      setCurrentOrderState(prev => (prev?.id === id ? { ...prev, status } : prev));

      // 2. API call
      const res = await api.patch(`/orders/${id}/status`, { status });

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      // The 15s auto-refresh will re-sync state from server
    }
  }, []);

  const updateOrderLogistics = useCallback(async (id: string, logistics: { riderName: string; riderPhone: string }) => {
    try {
      // 1. Optimistic UI update
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...logistics } : o)));
      setCurrentOrderState(prev => (prev?.id === id ? { ...prev, ...logistics } : prev));

      // 2. API call
      const res = await api.patch(`/orders/${id}/logistics`, logistics);

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to update order logistics');
      }
    } catch (err) {
      console.error('Failed to update logistics:', err);
      // The 15s auto-refresh will re-sync state from server
    }
  }, []);

  // ── Coupon ──
  const setActiveCouponCode = useCallback((code: string) => {
    setActiveCouponCodeState(code.trim().toUpperCase());
  }, []);

  const clearActiveCouponCode = useCallback(() => {
    setActiveCouponCodeState('');
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const logout = useCallback(async () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/marketers')) {
      await supabaseAdmin.auth.signOut();
    } else if (path.startsWith('/handler')) {
      await supabaseHandler.auth.signOut();
    } else {
      await supabaseUser.auth.signOut();
    }

    setCurrentView('home');
    window.location.href = '/';
  }, []);


  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView: handleSetView,
        selectedProduct,
        setSelectedProduct,
        addProduct,
        user,
        isLoadingUser,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        addOrder,
        currentOrder,
        setCurrentOrder,
        updateOrderStatus,
        updateOrderLogistics,
        activeCouponCode,
        setActiveCouponCode,
        clearActiveCouponCode,
        products,
        isLoadingProducts,
        marketers,
        isLoadingMarketers,
        handlers,
        isLoadingHandlers,
        addMarketer,
        updateMarketer,
        removeMarketer,
        addHandler,
        updateHandler,
        removeHandler,
        updateProduct,
        deleteProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isTransitioning,
        transitionData,
        triggerTransition,
        completeTransition,
        blogs,
        isLoadingBlogs,
        addBlog,
        updateBlog,
        deleteBlog,
        selectedBlog,
        setSelectedBlog,
        logout,
        isBackendDown,
        isCheckingBackend,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
