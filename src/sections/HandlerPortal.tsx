import { useState, useRef } from 'react';
import { LayoutDashboard, ShoppingCart, Package, HelpCircle, LogOut, Plus, ChevronDown, ChevronUp, Check, MessageSquare, Target, Bell, Menu, X } from 'lucide-react';


const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'queue', label: 'Order Queue', icon: ShoppingCart, active: true },
  { id: 'dispatched', label: 'Dispatched', icon: Package },
  { id: 'returns', label: 'Returns', icon: Package },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

import { useStore } from '@/hooks/useStore';

export function HandlerPortal() {
  const { logout, orders: rawOrders, updateOrderStatus, updateOrderLogistics } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Transform store orders to Handler format and filter out unapproved ones
  const handlerOrders = rawOrders
    .filter(o => o.status !== 'pending' && o.status !== 'pending-payment')
    .map(o => ({
      id: o.id,
      customerName: o.customerName,
      location: o.city || 'Unknown',
      items: o.items.reduce((acc, item) => acc + item.quantity, 0),
      total: `₦${o.total.toLocaleString()}`,
      status: o.status,
      products: o.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        icon: <Target className="w-5 h-5" />
      })),
      shippingMethod: 'Standard Delivery',
      riderName: o.riderName || '',
      riderPhone: o.riderPhone || '',
    }));

  const filteredOrders = activeFilter === 'all' 
    ? handlerOrders 
    : handlerOrders.filter(o => o.status === activeFilter);

  const statusFilters = [
    { id: 'all', label: 'All', count: handlerOrders.length },
    { id: 'processing', label: 'Processing', count: handlerOrders.filter(o => o.status === 'processing').length },
    { id: 'packed', label: 'Packed', count: handlerOrders.filter(o => o.status === 'packed').length },
    { id: 'in-transit', label: 'In Transit', count: handlerOrders.filter(o => o.status === 'in-transit').length },
    { id: 'delivered', label: 'Delivered', count: handlerOrders.filter(o => o.status === 'delivered').length },
  ];

  const handleUpdateStatus = async (orderId: string, currentStatus: string, riderInfo?: { riderName: string; riderPhone: string }) => {
    let nextStatus: any = 'processing';
    if (currentStatus === 'processing') nextStatus = 'packed';
    else if (currentStatus === 'packed') nextStatus = 'in-transit';
    else if (currentStatus === 'in-transit') nextStatus = 'delivered';
    
    if (nextStatus) {
      if (riderInfo) {
        await updateOrderLogistics(orderId, riderInfo);
      }
      updateOrderStatus(orderId, nextStatus);
      setNotificationMsg(`Order ${orderId} updated to ${nextStatus.toUpperCase()}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }
  };


  return (
    <div ref={containerRef} className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside ref={sidebarRef} className="w-64 bg-forest/5 flex-shrink-0 hidden lg:flex flex-col animate-fade-in-left">
        <div className="p-6">
          <div className="mb-8">
            <p className="font-display font-bold text-forest">Handler Portal</p>
            <p className="text-xs text-muted-foreground">Lagos Distribution Center</p>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors sidebar-item btn-anim ${
                  item.active
                    ? 'bg-forest text-white'
                    : 'text-muted-foreground hover:bg-forest/10 hover:text-forest'
                }`}
              >
                <item.icon className="w-5 h-5 relative z-10" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-forest hover:bg-forest-light text-white rounded-xl transition-colors btn-anim">
            <Plus className="w-4 h-4 relative z-10" />
            <span>New Dispatch</span>
          </button>

          <div className="mt-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-forest/10 hover:text-forest transition-colors btn-anim">
              <HelpCircle className="w-5 h-5 relative z-10" />
              <span>Help</span>
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors btn-anim">
              <LogOut className="w-5 h-5 relative z-10" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] lg:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white z-[110] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-display font-bold text-forest">Handler Portal</p>
              <p className="text-xs text-muted-foreground">Lagos HQ</p>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setIsDrawerOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors btn-anim ${
                  item.active
                    ? 'bg-forest text-white'
                    : 'text-muted-foreground hover:bg-forest/10 hover:text-forest'
                }`}
              >
                <item.icon className="w-5 h-5 relative z-10" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-outline-variant space-y-1">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-forest hover:bg-forest-light text-white rounded-xl transition-colors btn-anim mb-4">
              <Plus className="w-4 h-4 relative z-10" />
              <span>New Dispatch</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-forest/10 hover:text-forest transition-colors btn-anim">
              <HelpCircle className="w-5 h-5 relative z-10" />
              <span>Help</span>
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors btn-anim">
              <LogOut className="w-5 h-5 relative z-10" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-outline-variant sticky top-0 z-10 portal-header">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors" aria-label="Open menu">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-forest">Haify Trap</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-surface rounded-lg transition-colors no-anim">
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                <Bell className="w-5 h-5 text-forest" />
              </button>
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-semibold">
                H
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 portal-header">
            <h1 className="font-display font-bold text-2xl text-forest mb-2">Incoming Orders</h1>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {statusFilters.map((filter, i) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors status-filter btn-anim animate-fade-in-up stagger-${(i % 6) + 1} ${
                  activeFilter === filter.id
                    ? 'bg-forest text-white'
                    : 'bg-white text-muted-foreground hover:bg-surface'
                }`}
              >
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div ref={ordersRef} className="space-y-4">
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No orders found for this status.</div>
            )}
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isExpanded={expandedOrder === order.id}
                onToggle={() => toggleOrder(order.id)}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>

          {/* Notification Toast */}
          {showNotification && (
            <div className="fixed bottom-6 right-6 bg-forest rounded-xl p-4 text-white shadow-lg max-w-sm animate-slide-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notificationMsg}</p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderCard({ order, isExpanded, onToggle, onUpdateStatus }: any) {
  const [riderName, setRiderName] = useState(order.riderName);
  const [riderPhone, setRiderPhone] = useState(order.riderPhone);

  return (
    <div className="bg-white rounded-2xl overflow-hidden order-card">
      {/* Order Header */}
      <div
        onClick={onToggle}
        className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{order.id}</p>
            <p className="font-display font-semibold text-forest">{order.customerName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
            <p className="text-sm text-forest">{order.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Items</p>
            <p className="text-sm text-forest">{order.items} Units</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-sm font-semibold text-forest">{order.total}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              order.status === 'in-transit' ? 'bg-fresh/10 text-fresh' :
              order.status === 'pending' ? 'bg-gold/10 text-gold' :
              order.status === 'packed' ? 'bg-forest/10 text-forest' :
              'bg-muted/50 text-muted-foreground'
            }`}>
              {order.status.replace('-', ' ').toUpperCase()}
            </span>
            <button className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-colors no-anim">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-6 border-t border-outline-variant">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
            {/* Order Details */}
            <div>
              <h4 className="label-sm mb-4">ORDER DETAILS</h4>
              <div className="space-y-3">
                {order.products.map((product: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-xl">
                     <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                       {product.icon}
                     </div>
                    <div className="flex-1">
                      <p className="font-medium text-forest text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Eco-friendly housefly barrier</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-forest">x{product.quantity}</p>
                      <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-forest rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Shipping Method</p>
                    <p className="font-medium">{order.shippingMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 uppercase tracking-wider">Balance Due</p>
                    <p className="font-medium">₦0.00 <span className="text-xs text-white/60">(Paid)</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div>
              <h4 className="label-sm mb-4">LOGISTICS & ASSIGNMENT</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Logistics Partner</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-surface rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest/20">
                      <option>E-hailing</option>
                      <option>Own Rider</option>
                      <option>Express Shipping</option>
                      <option>DHL</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Rider Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Babatunde John"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Rider Phone</label>
                    <input
                      type="tel"
                      placeholder="+234 ..."
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onUpdateStatus(order.id, order.status, { riderName, riderPhone })} 
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-forest text-white font-semibold rounded-full hover:bg-forest-light transition-colors btn-anim"
                >
                  <Check className="w-5 h-5 relative z-10" />
                  <span>Update Status & Notify Customer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
