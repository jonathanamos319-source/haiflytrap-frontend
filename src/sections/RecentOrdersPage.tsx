import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { Package, ChevronRight, Clock, CheckCircle, Truck, PackageCheck, CreditCard, ArrowLeft, RefreshCw, ShoppingBag, Copy } from 'lucide-react';
import api from '@/lib/api';
import type { Order } from '@/types';
import { toast } from 'sonner';

export function RecentOrdersPage() {
  const { setCurrentView, addToCart, user, isLoadingUser, setCurrentOrder, orders: storedOrders } = useStore();
  const [orders, setOrders] = useState<Order[]>(storedOrders);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingUser) return;

    const fetchOrders = async () => {
      if (!user) {
        setError('Please log in to view your order history.');
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          const normalized = (res.data.data || []).map((o: any) => ({
            ...o,
            customerName: o.customer_name ?? o.customerName,
            customerPhone: o.customer_phone ?? o.customerPhone,
            customerEmail: o.customer_email ?? o.customerEmail,
            altPhone: o.alt_phone ?? o.altPhone,
            paymentMethod: o.payment_method ?? o.paymentMethod,
            trackingNumber: o.tracking_number ?? o.trackingNumber,
            couponCode: o.coupon_code ?? o.couponCode,
            createdAt: o.created_at ?? o.createdAt,
          }));
          setOrders(normalized);
        } else {
          if (storedOrders.length > 0) {
            setOrders(storedOrders);
            setError(null);
          } else {
            setError(res.data?.error || 'Failed to fetch orders');
          }
        }
      } catch {
        if (storedOrders.length > 0) {
          setOrders(storedOrders);
          setError(null);
        } else {
          setError('Could not connect to the server. Please check you are logged in.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrders();
  }, [user, isLoadingUser, storedOrders]);

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Processing' };
      case 'pending-payment':
        return { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Payment Pending' };
      case 'processing':
        return { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' };
      case 'packed':
        return { icon: PackageCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Ready for Pickup' };
      case 'in-transit':
        return { icon: Truck, color: 'text-fresh', bg: 'bg-fresh/10', label: 'In Transit' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-forest', bg: 'bg-forest/10', label: 'Delivered' };
      default:
        return { icon: Package, color: 'text-slate-600', bg: 'bg-slate-50', label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const copyOrderId = async (order: Order) => {
    const value = order.trackingNumber || (order as any).tracking_number || order.id;

    try {
      await navigator.clipboard.writeText(value);
      toast.success('Order ID copied');
    } catch {
      toast.error('Could not copy order ID');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin mb-4" />
        <p className="text-forest font-medium animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-display font-black text-forest">Order History</h1>
                <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-forest/5 text-forest text-xs font-bold px-3 py-1.5 rounded-full border border-forest/10">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold shadow-lg shadow-red-600/20"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[40px] p-12 text-center shadow-soft border border-outline-variant">
              <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center text-forest/20 mx-auto mb-6">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-forest mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Looks like you haven't placed any orders yet. Start protecting your home today!
              </p>
              <button
                onClick={() => setCurrentView('shop')}
                className="px-8 py-3 bg-forest text-white rounded-full font-bold shadow-xl shadow-forest/20 btn-anim"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-[32px] border border-outline-variant shadow-soft hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${status.bg} ${status.color} rounded-2xl flex items-center justify-center`}>
                            <status.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-black text-muted-foreground">Order ID</p>
                            <p className="font-mono text-sm font-bold text-forest">#{order.trackingNumber || (order as any).tracking_number || order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className={`w-fit px-4 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color} border border-current/10`}>
                          {status.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mb-1">Date</p>
                          <p className="text-sm font-bold text-forest">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mb-1">Total</p>
                          <p className="text-sm font-black text-forest">{formatPrice(order.total)}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mb-1">Items</p>
                          <p className="text-sm font-bold text-forest">{order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setCurrentOrder(order);
                            setCurrentView('track-order');
                          }}
                          className="flex-1 py-3 bg-surface-high hover:bg-forest hover:text-white text-forest text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Track Shipment
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                          onClick={() => copyOrderId(order)}
                          className="flex-1 py-3 bg-white text-forest text-sm font-bold rounded-2xl border border-outline-variant hover:bg-surface transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Order ID
                        </button>
                        <button
                          onClick={() => {
                            // Re-order logic: add items to cart and go to cart
                            order.items.forEach(item => {
                              addToCart(item.product, item.quantity);
                            });
                            setCurrentView('cart');
                          }}
                          className="flex-1 py-3 bg-forest/5 text-forest text-sm font-bold rounded-2xl hover:bg-forest/10 transition-colors flex items-center justify-center gap-2"
                        >
                          Buy Again
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
