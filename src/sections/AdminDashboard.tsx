// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Settings,
  TrendingUp, Download, Bell, Search, ChevronLeft, ChevronRight,
  FileDown, ArrowUpRight, ArrowDownRight, ExternalLink, Menu, X,
  Plus, Edit2, Trash2, Eye, Filter, Save, AlertCircle, Check,
  Lock, ToggleLeft, ToggleRight, Image as ImageIcon, UploadCloud, Sparkles,
  Copy, Link2, FileText, Truck, MessageSquare,
} from 'lucide-react';
import { AdminBlogPage } from './AdminBlogPage';

// ─── SHARED DATA ──────────────────────────────────────────────────────────────

const revenueData: Record<string, { month: string; orders: number; revenue: string; avg: string; growth: string; trend: 'up' | 'down' }[]> = {
  'Q4 2024': [
    { month: 'October', orders: 0, revenue: '₦0', avg: '₦0', growth: '0%', trend: 'up' },
    { month: 'November', orders: 0, revenue: '₦0', avg: '₦0', growth: '0%', trend: 'up' },
    { month: 'December', orders: 0, revenue: '₦0', avg: '₦0', growth: '0%', trend: 'up' },
  ],
};

const allOrders: any[] = [];

// dashboardStats is now calculated dynamically inside the component

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'marketers', label: 'Marketers', icon: Users },
  { id: 'handlers', label: 'Handlers', icon: Package },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
const orderTabs = ['All', 'Delivered', 'Processing', 'Pending', 'In-Transit'] as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function downloadTableAsPDF(quarter: string, customRows?: any[]) {
  const rows = customRows || revenueData[quarter] || [];
  const html = `<html><head><title>Revenue Report - ${quarter}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:22px;margin-bottom:4px}p{color:#666;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:10px 12px;background:#f5f5f5;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#555}td{padding:12px;border-bottom:1px solid #eee;font-size:14px}.up{color:#16a34a}.down{color:#dc2626}tfoot td{font-weight:bold;background:#f9f9f9}</style></head><body><h1>Revenue Report — ${quarter}</h1><p>Generated on ${new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })} · Haifly Trap Admin</p><table><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg. Value</th><th>Growth</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.month}</td><td>${r.orders}</td><td>${r.revenue}</td><td>${r.avg}</td><td class="${r.trend}">${r.growth}</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td>${rows.reduce((s, r) => s + (Number(r.orders) || 0), 0)}</td><td colspan="3">&mdash;</td></tr></tfoot></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url); }; }
}

const statusStyle = (status: string) => {
  const map: Record<string, string> = {
    delivered: 'bg-green-50 text-green-700 border border-green-200',
    processing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    packed: 'bg-purple-50 text-purple-700 border border-purple-200',
    pending: 'bg-slate-100 text-slate-600 border border-slate-200',
    'pending-payment': 'bg-amber-50 text-amber-700 border border-amber-200',
    'in-transit': 'bg-blue-50 text-blue-700 border border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
    'out-of-stock': 'bg-red-50 text-red-600 border border-red-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);

type MarketerDraft = {
  name: string;
  phone: string;
  code: string;
  commission: string;
  status?: 'active' | 'inactive';
};

const emptyMarketerDraft: MarketerDraft = {
  name: '',
  phone: '',
  code: '',
  commission: '',
  status: 'active',
};

const normalizeCouponCode = (value: string) => value.trim().toUpperCase();

const isMarketerDraftValid = (draft: MarketerDraft) =>
  Boolean(draft.name.trim() && draft.phone.trim() && normalizeCouponCode(draft.code) && draft.commission.trim());

const getCouponShareLink = (code: string) =>
  `${window.location.origin}/shop?coupon=${encodeURIComponent(normalizeCouponCode(code))}`;

function CouponPreviewCard({ code }: { code: string }) {
  return (
    <div className="relative aspect-[2.4/1] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10 max-h-[120px] sm:max-h-[180px]">
      <img
        src="/coupons/clipped.svg"
        alt="Coupon preview artwork"
        className="h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="rounded-full bg-slate-950/70 px-4 py-1.5 sm:px-6 sm:py-3 shadow-lg backdrop-blur-sm border border-white/10">
          <span
            className="block text-center font-mono text-base font-black tracking-[0.25em] sm:text-2xl"
            style={{ color: '#FCB006', textShadow: '0 1px 0 rgba(15, 23, 42, 0.65), 0 0 18px rgba(252, 176, 6, 0.15)' }}
          >
            {normalizeCouponCode(code)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CouponPreviewModal({
  open,
  draft,
  copiedField,
  onClose,
  onConfirm,
  onCopyCode,
  onCopyLink,
}: {
  open: boolean;
  draft: MarketerDraft;
  copiedField: 'code' | 'link' | null;
  onClose: () => void;
  onConfirm: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
}) {
  if (!open) return null;

  const couponCode = normalizeCouponCode(draft.code);
  const shareLink = getCouponShareLink(couponCode);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl custom-scrollbar animate-in zoom-in duration-300">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Preview</p>
                <h3 className="text-base font-bold text-slate-900">Marketer voucher</h3>
              </div>
              <button onClick={onClose} className="rounded-2xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <CouponPreviewCard code={couponCode} />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Coupon code</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-lg font-black tracking-[0.25em] text-[#9a6a00]">{couponCode}</span>
                <button onClick={onCopyCode} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 btn-anim">
                  {copiedField === 'code' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedField === 'code' ? 'Copied' : 'Copy code'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Share Link</p>
            <h3 className="text-base font-bold text-slate-900">{draft.name.trim() || 'New marketer'}</h3>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              Send this link to the marketer. Coupon stays attached through checkout.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Marketer details</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Phone</p>
                    <p className="text-xs font-semibold text-slate-700">{draft.phone.trim()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Commission</p>
                    <p className="text-xs font-semibold text-slate-700">{draft.commission.trim()}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Link2 className="h-3 w-3 text-slate-400" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Customer link</p>
                </div>
                <div className="mt-2 rounded-xl bg-slate-50 p-2 sm:p-3">
                  <p className="break-all font-mono text-[10px] leading-tight text-slate-600">{shareLink}</p>
                </div>
                <button onClick={onCopyLink} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 btn-anim">
                  {copiedField === 'link' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedField === 'link' ? 'Copied' : 'Copy link'}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 btn-anim">
                Back
              </button>
              <button onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f5238] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 btn-anim">
                <Save className="h-4 w-4" />
                <span>Save marketer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-VIEW COMPONENTS ──────────────────────────────────────────────────────

function OrdersView() {
  const { orders, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<typeof orderTabs[number]>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const mappedStoreOrders = orders.map(o => ({
    id: o.id,
    customer: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    product: o.items.length > 1 ? `${o.items[0].product.name} +${o.items.length - 1}` : o.items[0]?.product.name || 'Unknown',
    amount: `₦${o.total.toLocaleString()}`,
    date: new Date(o.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    status: o.status,
    city: o.city,
    couponCode: o.couponCode
  }));

  const combinedOrders = [...mappedStoreOrders, ...allOrders];

  const filtered = combinedOrders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab.toLowerCase().replace('-', '-');
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} orders total</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors btn-anim">
            <Filter className="w-3.5 h-3.5 relative z-10" /> <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors btn-anim">
            <Download className="w-3.5 h-3.5 relative z-10" /> <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: orders.length.toString(), color: 'text-slate-800' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length.toString(), color: 'text-green-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing').length.toString(), color: 'text-yellow-600' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending' || o.status === 'pending-payment').length.toString(), color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label} Orders</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-50">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-50 rounded-xl p-1 overflow-x-auto flex-shrink-0">
            {orderTabs.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all btn-anim ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}>
                <span>{tab}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search by name, ID, city..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20" />
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-50">
          {paged.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No orders found.</div>
          ) : paged.map(order => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-[#0f5238]">{order.id}</span>
                  {(order as { couponCode?: string }).couponCode && (
                    <span className="text-[9px] font-black text-amber-600 tracking-tighter uppercase leading-none mt-0.5">REF: {(order as { couponCode?: string }).couponCode}</span>
                  )}
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize border cursor-pointer focus:outline-none transition-colors ${statusStyle(order.status)}`}
                >
                  <option value="pending" className="bg-white text-slate-700">Pending</option>
                  <option value="pending-payment" className="bg-white text-slate-700">Pending Payment</option>
                  <option value="processing" className="bg-white text-slate-700">Processing</option>
                  <option value="packed" className="bg-white text-slate-700">Packed</option>
                  <option value="in-transit" className="bg-white text-slate-700">In Transit</option>
                  <option value="delivered" className="bg-white text-slate-700">Delivered</option>
                  <option value="cancelled" className="bg-white text-slate-700">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    {order.customer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{order.customer}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{order.amount}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="truncate max-w-[150px]">{order.product}</span>
                <span className="text-slate-400">{order.date}</span>
              </div>
              <div className="flex gap-2 pt-1">
                {['pending', 'pending-payment'].includes(order.status) ? (
                  <button onClick={() => updateOrderStatus(order.id, 'processing')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0f5238] text-white rounded-lg text-xs font-semibold hover:bg-[#0f5238]/90 transition-colors btn-anim">
                    <Check className="w-3.5 h-3.5" /> Approve Payment
                  </button>
                ) : ['processing', 'packed'].includes(order.status) ? (
                  <button onClick={() => updateOrderStatus(order.id, 'in-transit')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors btn-anim">
                    <Truck className="w-3.5 h-3.5" /> Move to In Transit
                  </button>
                ) : order.status === 'in-transit' ? (
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors btn-anim">
                    <Check className="w-3.5 h-3.5" /> Mark Delivered
                  </button>
                ) : (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Order ID', 'Customer', 'Product', 'City', 'Amount', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">No orders found.</td></tr>
              ) : paged.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[#0f5238]">{order.id}</span>
                      {(order as { couponCode?: string }).couponCode && (
                        <span className="text-[9px] font-black text-amber-600 tracking-tighter uppercase leading-none mt-0.5">REF: {(order as { couponCode?: string }).couponCode}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                        {order.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[130px] truncate">{order.product}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{order.city}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-800 whitespace-nowrap">{order.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">{order.date}</td>
                  <td className="px-4 py-3.5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize border cursor-pointer focus:outline-none transition-colors ${statusStyle(order.status)}`}
                    >
                      <option value="pending" className="bg-white text-slate-700">Pending</option>
                      <option value="pending-payment" className="bg-white text-slate-700">Pending Payment</option>
                      <option value="processing" className="bg-white text-slate-700">Processing</option>
                      <option value="packed" className="bg-white text-slate-700">Packed</option>
                      <option value="in-transit" className="bg-white text-slate-700">In Transit</option>
                      <option value="delivered" className="bg-white text-slate-700">Delivered</option>
                      <option value="cancelled" className="bg-white text-slate-700">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 items-center">
                      {['pending', 'pending-payment'].includes(order.status) && (
                        <button onClick={() => updateOrderStatus(order.id, 'processing')} title="Approve Payment" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0f5238] hover:bg-[#0f5238]/90 text-white rounded-lg text-xs font-semibold transition-colors no-anim">
                          <Check className="w-3 h-3 text-white" />
                          <span>Approve</span>
                        </button>
                      )}
                      {['processing', 'packed'].includes(order.status) && (
                        <button onClick={() => updateOrderStatus(order.id, 'in-transit')} title="Dispatch / Move to In Transit" className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors no-anim">
                          <Truck className="w-3 h-3 text-white" />
                          <span>Dispatch</span>
                        </button>
                      )}
                      {order.status === 'in-transit' && (
                        <button onClick={() => updateOrderStatus(order.id, 'delivered')} title="Confirm Delivered" className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors no-anim">
                          <Check className="w-3 h-3 text-white" />
                          <span>Deliver</span>
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors no-anim" title="View"><Eye className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors no-anim" title="Download Receipt"><Download className="w-3.5 h-3.5 text-slate-400" /></button>
                      <a
                        href={`https://wa.me/${(order.customerPhone || '2348031301311').replace(/\D/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
                          `Hello ${order.customer}! 🚚\n\nYour Haifly Trap order (#${order.id}) has been dispatched and is on its way to ${order.city || 'your delivery address'}.\n\nTrack your delivery in real-time here:\nhttps://www.haiflytrap.com/track-order?id=${order.id}\n\nThank you for choosing Haifly Trap!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors no-anim flex items-center gap-1"
                        title="Notify Customer via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-50">
          <p className="text-xs text-slate-400">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors no-anim">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${page === i + 1 ? 'bg-[#0f5238] text-white font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors no-anim">
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsView() {
  const { products, updateProduct, addProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '' });
  const [toast, setToast] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setForm({ name: '', category: '', price: '', stock: '' });
    setProductImage(null);
    setAttemptedSubmit(false);
    setShowAddModal(true);
  };

  const handleSaveProduct = async () => {
    setAttemptedSubmit(true);
    if (!form.name || !form.category || !form.price || !form.stock) return;

    try {
      await addProduct({
        name: form.name,
        category: form.category.toLowerCase().replace(/\s+/g, '-'),
        price: Number(form.price),
        image: productImage || '/images/placeholder.png',
        description: `Premium ${form.name} for housefly control.`,
        rating: 5,
        reviews: 0,
        inStock: true,
        manualOutOfStock: false,
        isLimited: false
      });
      setShowAddModal(false);
      setToast('✅ Product added successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast('❌ Failed to add product');
      setTimeout(() => setToast(null), 3000);
    }
  };


  const inputClass = (val: string) => `w-full px-3 py-2.5 border rounded-xl text-sm transition-all ${attemptedSubmit && !val.trim() ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10' : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20'
    }`;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = [
    { label: 'Total Products', value: products.length, color: 'text-slate-800' },
    { label: 'Active', value: products.filter(p => !p.manualOutOfStock).length, color: 'text-green-600' },
    { label: 'Out of Stock', value: products.filter(p => p.manualOutOfStock === true).length, color: 'text-red-500' },
    { label: 'Total Reviews', value: products.reduce((s, p) => s + (p.reviews || 0), 0), color: 'text-[#0f5238]' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products</h2>
          <p className="text-xs text-slate-400 mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto btn-anim">
          <Plus className="w-3.5 h-3.5 relative z-10" /> <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-50">
          <div className="flex gap-1 bg-slate-50 rounded-xl p-1 overflow-x-auto flex-shrink-0">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all btn-anim ${categoryFilter === cat ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}>
                <span>{cat}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20" />
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No products found.</div>
          ) : filtered.map(p => (
            <div key={p.id} onClick={() => setSelectedProduct(p)} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{p.category.replace('-', ' ')}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${p.manualOutOfStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {p.manualOutOfStock ? 'Out of Stock' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Price</p>
                  <p className="font-bold text-slate-800">₦{p.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Stock</p>
                  <p className={`font-bold ${p.manualOutOfStock ? 'text-red-500' : 'text-slate-700'}`}>{p.manualOutOfStock ? 0 : 'In Stock'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['SKU', 'Product Name', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} onClick={() => setSelectedProduct(p)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold text-slate-400">{p.id}</span></td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      {p.badge && (
                        <span className="text-[10px] font-bold text-[#C9A84C] capitalize">{p.badge}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 capitalize">{p.category.replace('-', ' ')}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-800">₦{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-bold ${p.manualOutOfStock ? 'text-red-500' : 'text-slate-700'}`}>{p.manualOutOfStock ? 0 : 'In Stock'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{p.reviews}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize whitespace-nowrap ${p.manualOutOfStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {p.manualOutOfStock ? 'Out of Stock' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors no-anim"><Edit2 className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProduct(p.id).then(() => {
                              setToast('✅ Product deleted');
                              setTimeout(() => setToast(null), 3000);
                            }).catch(() => {
                              setToast('❌ Failed to delete product');
                              setTimeout(() => setToast(null), 3000);
                            });
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors no-anim"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Product Image</label>
                {!productImage ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 group-hover:border-[#0f5238]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                        <UploadCloud className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">Click or drag to upload</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border border-slate-200 overflow-hidden group">
                    <img
                      src={productImage}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition-colors shadow-lg">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </label>
                      <button
                        onClick={handleRemoveImage}
                        className="p-2 bg-white rounded-xl hover:bg-red-50 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Product Name</label>
                  <input type="text" placeholder="e.g. Guard Pro Max" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputClass(form.name)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Category</label>
                  <input type="text" placeholder="e.g. Organic Sprays" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className={inputClass(form.category)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Price (₦)</label>
                    <input type="number" placeholder="12500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className={inputClass(form.price)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Stock</label>
                    <input type="number" placeholder="100" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                      className={inputClass(form.stock)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 btn-anim"><span>Cancel</span></button>
                <button onClick={handleSaveProduct} className="flex-1 py-2.5 bg-[#0f5238] text-white rounded-xl text-sm font-semibold hover:opacity-90 btn-anim"><span>Save Product</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Left: Visual Preview */}
            <div className="w-full md:w-1/2 bg-slate-50 flex flex-col p-8 relative">
              {/* Dynamic Status Carousel/Banner */}
              {(selectedProduct.manualOutOfStock || selectedProduct.isLimited) && (
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-9 flex items-center z-20 shadow-sm">
                  <div className="flex w-full h-full animate-[slide_10s_linear_infinite]">
                    {selectedProduct.manualOutOfStock && (
                      <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[12px] md:text-[14px] tracking-[0.2em] px-4 shrink-0 gap-2">
                        <AlertCircle className="w-6 h-6 text-red-500" /> OUT OF STOCK
                      </div>
                    )}
                    {selectedProduct.isLimited && (
                      <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[12px] md:text-[14px] tracking-[0.2em] px-4 shrink-0 gap-2">
                        <Sparkles className="w-6 h-6 text-gold" /> LIMITED
                      </div>
                    )}
                    {selectedProduct.manualOutOfStock && (
                      <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[12px] md:text-[14px] tracking-[0.2em] px-4 shrink-0 gap-2">
                        <AlertCircle className="w-6 h-6 text-red-500" /> OUT OF STOCK
                      </div>
                    )}
                    {selectedProduct.isLimited && (
                      <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[12px] md:text-[14px] tracking-[0.2em] px-4 shrink-0 gap-2">
                        <Sparkles className="w-6 h-6 text-gold" /> LIMITED
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="w-full aspect-square bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden relative mt-2">
                <ImageIcon className="w-12 h-12 text-slate-200" />
                <p className="absolute text-[10px] text-slate-400 bottom-12">Product Preview Image</p>
              </div>
            </div>

            {/* Right: Info & Controls */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#0f5238] uppercase tracking-wider mb-1">{selectedProduct.category}</p>
                  <h3 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">ID: {selectedProduct.id}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 bg-slate-50 hover:bg-gold hover:text-white flex items-center justify-center rounded-full transition-all duration-300 group shadow-sm hover:shadow-gold-glow"
                >
                  <X className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[550px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Price (₦)</p>
                    <input
                      type="number"
                      value={selectedProduct.price}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                      className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-800 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Product Name</p>
                    <input
                      type="text"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>


                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Out of Stock</p>
                      <p className="text-[10px] text-slate-400">Manually hide from customers</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct({ ...selectedProduct, manualOutOfStock: !selectedProduct.manualOutOfStock })}
                      className="transition-colors no-anim"
                    >
                      {selectedProduct.manualOutOfStock ? <ToggleRight className="w-8 h-8 text-red-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Limited Edition</p>
                      <p className="text-[10px] text-slate-400">Shows gold badge to customers</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct({ ...selectedProduct, isLimited: !selectedProduct.isLimited })}
                      className="transition-colors no-anim"
                    >
                      {selectedProduct.isLimited ? <ToggleRight className="w-8 h-8 text-[#C9A84C]" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                    </button>
                  </div>
                </div>

                {/* Mock Customer View Preview */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Customer Side Preview
                  </p>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-700/50 relative overflow-hidden">
                    {/* Mini Carousel for Customer View */}
                    {(selectedProduct.manualOutOfStock || selectedProduct.isLimited) && (
                      <div className="absolute top-0 left-0 right-0 h-5 shadow-sm overflow-hidden flex items-center z-10">
                        <div className="flex w-full h-full animate-[slide_8s_linear_infinite]">
                          {selectedProduct.manualOutOfStock && (
                            <div className="min-w-full flex items-center justify-center bg-white text-slate-800 font-bold text-[8px] tracking-tight shrink-0 gap-1.5">
                              <AlertCircle className="w-3 h-3 text-red-500" /> OUT OF STOCK
                            </div>
                          )}
                          {selectedProduct.isLimited && (
                            <div className="min-w-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold text-[8px] tracking-tight shrink-0 gap-1.5">
                              <Sparkles className="w-3 h-3 text-gold" /> LIMITED
                            </div>
                          )}
                          {/* Repeat */}
                          {selectedProduct.manualOutOfStock && (
                            <div className="min-w-full flex items-center justify-center bg-white text-slate-800 font-bold text-[8px] tracking-tight shrink-0 gap-1.5">
                              <AlertCircle className="w-3 h-3 text-red-500" /> OUT OF STOCK
                            </div>
                          )}
                          {selectedProduct.isLimited && (
                            <div className="min-w-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold text-[8px] tracking-tight shrink-0 gap-1.5">
                              <Sparkles className="w-3 h-3 text-gold" /> LIMITED
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0 relative overflow-hidden">
                        <ImageIcon className="w-6 h-6 text-slate-200" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{selectedProduct.name}</p>
                        <p className="text-[10px] font-bold text-[#0f5238] mt-1">{selectedProduct.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors btn-anim">
                    <Eye className="w-4 h-4 relative z-10" /> <span>Preview Label</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await updateProduct(selectedProduct.id, {
                            name: selectedProduct.name,
                            price: Number(selectedProduct.price),
                            manualOutOfStock: selectedProduct.manualOutOfStock,
                            isLimited: selectedProduct.isLimited
                          });
                          setSelectedProduct(null);
                          setToast('✅ Product updated successfully!');
                          setTimeout(() => setToast(null), 3000);
                        } catch (err: any) {
                          setToast(`❌ Failed to save: ${err.response?.data?.error || err.message}`);
                          setTimeout(() => setToast(null), 4000);
                        }
                      }}

                      className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl text-sm font-semibold hover:bg-slate-900 transition-colors btn-anim"
                    >
                      <Save className="w-4 h-4 relative z-10" /> <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Delete ${selectedProduct.name}?`)) return;
                        deleteProduct(selectedProduct.id).then(() => {
                          setSelectedProduct(null);
                          setToast('✅ Product deleted');
                          setTimeout(() => setToast(null), 3000);
                        }).catch(() => {
                          setToast('❌ Failed to delete product');
                          setTimeout(() => setToast(null), 3000);
                        });
                      }}
                      className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold hover:bg-red-100 transition-colors btn-anim"
                    >
                      <Trash2 className="w-4 h-4 relative z-10" /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl flex items-center gap-2">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketersView({ onManage }: { onManage: () => void }) {
  const { marketers, isLoadingMarketers, addMarketer, updateMarketer, removeMarketer } = useStore();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);
  const [form, setForm] = useState<MarketerDraft>(emptyMarketerDraft);

  const filtered = marketers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoadingMarketers) {
    return (
      <div className="p-4 md:p-6 space-y-5">
        <div className="h-10 bg-slate-100 rounded-xl w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex justify-between">
            <div className="h-4 bg-slate-50 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-slate-50 rounded w-1/4 animate-pulse"></div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-50 rounded w-32 animate-pulse"></div>
                  <div className="h-2 bg-slate-50 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-50 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleOpenCouponModal = () => {
    setAttemptedSubmit(true);
    if (!isMarketerDraftValid(form)) return;
    setShowCouponModal(true);
  };

  const handleCreateMarketer = () => {
    addMarketer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      code: normalizeCouponCode(form.code),
      commission: Number(form.commission),
      status: form.status ?? 'active',
    });
    setForm(emptyMarketerDraft);
    setShowAddForm(false);
    setShowCouponModal(false);
    setCopiedField(null);
    setAttemptedSubmit(false);
  };

  const handleEditMarketer = async (marketer: typeof marketers[number]) => {
    const name = window.prompt('Marketer name', marketer.name);
    if (name === null) return;
    const phone = window.prompt('Phone number', marketer.phone);
    if (phone === null) return;
    const code = window.prompt('Coupon code', marketer.code);
    if (code === null) return;
    const commission = window.prompt('Commission %', String(marketer.commission));
    if (commission === null) return;
    const status = window.prompt('Status (active/inactive)', marketer.status);
    if (status === null) return;

    await updateMarketer(marketer.id, {
      name: name.trim(),
      phone: phone.trim(),
      code: normalizeCouponCode(code),
      commission: Number(commission),
      status: status.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active',
    });
  };

  const inputClass = (val: string) => `w-full px-3 py-2.5 border rounded-xl text-sm transition-all ${attemptedSubmit && !val.trim() ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10' : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20'
    }`;

  const handleCopy = async (field: 'code' | 'link') => {
    const value = field === 'code' ? normalizeCouponCode(form.code) : getCouponShareLink(form.code);
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(current => (current === field ? null : current)), 1800);
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Marketers</h2>
          <p className="text-xs text-slate-400 mt-0.5">{marketers.filter(m => m.status === 'active').length} active partners</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onManage} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 btn-anim">
            <ExternalLink className="w-3.5 h-3.5 relative z-10" /> <span>Full Portal</span>
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity btn-anim">
            <Plus className="w-3.5 h-3.5 relative z-10" /> <span>Add Marketer</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Marketers', value: marketers.length, color: 'text-slate-800' },
          { label: 'Active', value: marketers.filter(m => m.status === 'active').length, color: 'text-green-600' },
          { label: 'Total Sales', value: marketers.reduce((s, m) => s + m.sales, 0), color: 'text-[#0f5238]' },
          { label: 'Commission Owed', value: formatCurrency(marketers.reduce((s, m) => s + m.earned, 0)), color: 'text-[#C9A84C]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add Marketer Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4">New Marketer Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name</label>
              <input type="text" placeholder="e.g. Chidi Okoro" value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass(form.name)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
              <input type="tel" placeholder="+234 ..." value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className={inputClass(form.phone)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Coupon Code</label>
              <input type="text" placeholder="e.g. CHIDI20" value={form.code}
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className={inputClass(form.code)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Commission %</label>
              <input type="number" min="1" max="100" placeholder="e.g. 15" value={form.commission}
                onChange={e => setForm(prev => ({ ...prev, commission: e.target.value }))}
                className={inputClass(form.commission)} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setShowAddForm(false); setAttemptedSubmit(false); }} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 btn-anim"><span>Cancel</span></button>
            <button onClick={handleOpenCouponModal} className="flex items-center gap-1.5 px-4 py-2 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 btn-anim"><Save className="w-3.5 h-3.5 relative z-10" /> <span>Preview Coupon</span></button>
          </div>
        </div>
      )}

      {/* Mobile View (Cards) */}
      <div className="md:hidden divide-y divide-slate-50 border border-slate-100 rounded-2xl bg-white overflow-hidden">
        {filtered.map(m => (
          <div key={m.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f5238]/10 flex items-center justify-center text-xs font-bold text-[#0f5238]">
                  {m.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.phone}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyle(m.status)}`}>
                {m.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Coupon</p>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{m.code}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium">Earnings</p>
                <p className="font-bold text-[#0f5238]">{formatCurrency(typeof m.earned === 'number' ? m.earned : 0)}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => void handleEditMarketer(m)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => removeMarketer(String(m.id))} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search marketers..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Marketer', 'Phone', 'Coupon Code', 'Commission', 'Sales', 'Total Earned', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0f5238]/10 flex items-center justify-center text-xs font-bold text-[#0f5238] flex-shrink-0">{m.initials}</div>
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{m.phone}</td>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{m.code}</span></td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{m.commission}%</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{m.sales}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-[#0f5238]">{formatCurrency(typeof m.earned === 'number' ? m.earned : 0)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(m.status)}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => void handleEditMarketer(m)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-slate-400" /></button>
                      <button onClick={() => removeMarketer(String(m.id))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CouponPreviewModal
        open={showCouponModal}
        draft={form}
        copiedField={copiedField}
        onClose={() => {
          setShowCouponModal(false);
          setCopiedField(null);
        }}
        onConfirm={handleCreateMarketer}
        onCopyCode={() => void handleCopy('code')}
        onCopyLink={() => void handleCopy('link')}
      />
    </div>
  );
}

function HandlersView() {
  const { handlers, isLoadingHandlers, addHandler, updateHandler, removeHandler } = useStore();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', zone: '' });
  const [toast, setToast] = useState<string | null>(null);

  const filtered = handlers.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.phone.includes(search) || h.zone.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateHandler = async () => {
    setAttemptedSubmit(true);
    if (!form.name.trim() || !form.phone.trim() || !form.zone.trim()) return;

    try {
      await addHandler({
        name: form.name.trim(),
        phone: form.phone.trim(),
        zone: form.zone.trim(),
        status: 'active'
      });
      setForm({ name: '', phone: '', zone: '' });
      setShowAddForm(false);
      setAttemptedSubmit(false);

      setToast('✅ Handler added successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to add handler:', error);
    }
  };

  const handleEditHandler = async (handler: typeof handlers[number]) => {
    const name = window.prompt('Handler name', handler.name);
    if (name === null) return;
    const phone = window.prompt('Phone number', handler.phone);
    if (phone === null) return;
    const zone = window.prompt('Zone / Location', handler.zone);
    if (zone === null) return;
    const status = window.prompt('Status (active/inactive)', handler.status);
    if (status === null) return;

    try {
      await updateHandler(handler.id, {
        name: name.trim(),
        phone: phone.trim(),
        zone: zone.trim(),
        status: status.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active',
      });
      setToast('✅ Handler updated successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to update handler:', error);
      setToast('❌ Failed to update handler');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const inputClass = (val: string) => `w-full px-3 py-2.5 border rounded-xl text-sm transition-all ${attemptedSubmit && !val.trim() ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10' : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20'
    }`;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Handlers</h2>
          <p className="text-xs text-slate-400 mt-0.5">{handlers.length} delivery handlers registered</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity btn-anim">
          <Plus className="w-3.5 h-3.5 relative z-10" /> <span>Add Handler</span>
        </button>
      </div>

      {/* Add Handler Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4">New Handler Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name</label>
              <input type="text" placeholder="e.g. John Doe" value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass(form.name)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
              <input type="tel" placeholder="+234 ..." value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className={inputClass(form.phone)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Zone / Location</label>
              <input type="text" placeholder="e.g. Lagos Island" value={form.zone}
                onChange={e => setForm(prev => ({ ...prev, zone: e.target.value }))}
                className={inputClass(form.zone)} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 italic">* Note: Handler's phone number will be used as their login password.</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setShowAddForm(false); setAttemptedSubmit(false); }} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 btn-anim"><span>Cancel</span></button>
            <button onClick={handleCreateHandler} className="flex items-center gap-1.5 px-4 py-2 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 btn-anim"><Save className="w-3.5 h-3.5 relative z-10" /> <span>Save Handler</span></button>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search handlers..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Name', 'Phone', 'Zone', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoadingHandlers ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-high"></div>
                      <div className="h-4 bg-surface-high rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-surface-high rounded w-24"></div></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-surface-high rounded w-20"></div></td>
                    <td className="px-4 py-3.5"><div className="h-6 bg-surface-high rounded-full w-12"></div></td>
                    <td className="px-4 py-3.5">
                      <div className="w-8 h-8 bg-surface-high rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No handlers found.</td></tr>
              ) : filtered.map(h => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{h.initials}</div>
                    <span className="text-sm font-medium text-slate-700">{h.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{h.phone}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{h.zone}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusStyle(h.status)}`}>{h.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => void handleEditHandler(h)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeHandler(String(h.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl flex items-center gap-2">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  return <OperationsSettingsView />;
}

function OperationsSettingsView() {
  const { setCurrentView, marketers, handlers, addMarketer, removeMarketer, addHandler, removeHandler } = useStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [attemptedSubmitMarketer, setAttemptedSubmitMarketer] = useState(false);
  const [attemptedSubmitHandler, setAttemptedSubmitHandler] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; type: 'marketer' | 'handler' } | null>(null);
  const [marketerForm, setMarketerForm] = useState<MarketerDraft>(emptyMarketerDraft);
  const [handlerForm, setHandlerForm] = useState({ name: '', phone: '', zone: '' });

  const activeHandlers = handlers.filter(handler => handler.status === 'active').length;
  const activeMarketers = marketers.filter(marketer => marketer.status === 'active').length;
  const totalCommission = marketers.reduce((sum, marketer) => sum + marketer.earned, 0);

  const handlePasswordSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowPasswordForm(false);
    }, 2000);
  };

  const handleOpenCouponModal = () => {
    setAttemptedSubmitMarketer(true);
    if (!isMarketerDraftValid(marketerForm)) return;
    setShowCouponModal(true);
  };

  const handleCreateMarketer = () => {
    addMarketer({
      name: marketerForm.name.trim(),
      phone: marketerForm.phone.trim(),
      code: normalizeCouponCode(marketerForm.code),
      commission: Number(marketerForm.commission),
      status: 'active',
    });
    setMarketerForm(emptyMarketerDraft);
    setShowCouponModal(false);
    setCopiedField(null);
    setAttemptedSubmitMarketer(false);
  };

  const handleCopy = async (field: 'code' | 'link') => {
    const value = field === 'code' ? normalizeCouponCode(marketerForm.code) : getCouponShareLink(marketerForm.code);
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(current => (current === field ? null : current)), 1800);
  };

  const handleCreateHandler = () => {
    setAttemptedSubmitHandler(true);
    if (!handlerForm.name.trim() || !handlerForm.phone.trim() || !handlerForm.zone.trim()) return;
    addHandler({
      name: handlerForm.name.trim(),
      phone: handlerForm.phone.trim(),
      zone: handlerForm.zone.trim(),
      status: 'active',
    });
    setHandlerForm({ name: '', phone: '', zone: '' });
    setAttemptedSubmitHandler(false);
  };

  const inputClass = (val: string, attempted: boolean) => `w-full rounded-2xl border px-4 py-3 text-sm transition-all ${attempted && !val.trim() ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10' : 'border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5238]/15'
    }`;

  const closeDeleteModal = () => {
    setPendingDelete(null);
    setDeleteConfirmText('');
  };

  const confirmDelete = () => {
    if (!pendingDelete || deleteConfirmText !== 'DELETE') return;
    if (pendingDelete.type === 'marketer') removeMarketer(pendingDelete.id);
    else removeHandler(pendingDelete.id);
    closeDeleteModal();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-20">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0f5238] p-6 md:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Operations Control</p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Run handler and marketer admin tasks from one clean workspace.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200/85">Add handlers, remove handlers, add marketers, remove marketers, and update your security settings without bouncing between panels.</p>
          </div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Handlers</p>
              <p className="mt-2 text-2xl font-bold">{handlers.length}</p>
              <p className="text-xs text-emerald-200">{activeHandlers} active</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Marketers</p>
              <p className="mt-2 text-2xl font-bold">{marketers.length}</p>
              <p className="text-xs text-emerald-200">{activeMarketers} active</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Commission</p>
              <p className="mt-2 text-2xl font-bold">{formatCompactCurrency(totalCommission)}</p>
              <p className="text-xs text-slate-200">Outstanding</p>
            </div>
          </div>
        </div>
      </section>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
            <Check className="h-4 w-4" />
          </div>
          <p className="font-medium">Password updated successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Team management</h3>
              <p className="mt-1 text-sm text-slate-500">Persistent roster controls for your operations and growth teams.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Handlers</h4>
                  <p className="text-xs text-slate-500">Dispatch and delivery operations</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{activeHandlers} active</span>
              </div>
              <div className="mt-4 space-y-3">
                <input value={handlerForm.name} onChange={e => setHandlerForm(prev => ({ ...prev, name: e.target.value }))} type="text" placeholder="Handler full name" className={inputClass(handlerForm.name, attemptedSubmitHandler)} />
                <input value={handlerForm.phone} onChange={e => setHandlerForm(prev => ({ ...prev, phone: e.target.value }))} type="tel" placeholder="Phone number" className={inputClass(handlerForm.phone, attemptedSubmitHandler)} />
                <input value={handlerForm.zone} onChange={e => setHandlerForm(prev => ({ ...prev, zone: e.target.value }))} type="text" placeholder="Coverage zone" className={inputClass(handlerForm.zone, attemptedSubmitHandler)} />
                <button onClick={handleCreateHandler} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5238] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 btn-anim">
                  <Plus className="h-4 w-4" />
                  <span>Add Handler</span>
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {handlers.map(handler => (
                  <div key={handler.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f5238]/10 text-sm font-bold text-[#0f5238]">{handler.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{handler.name}</p>
                      <p className="truncate text-xs text-slate-500">{handler.zone} · {handler.phone}</p>
                    </div>
                    <button onClick={() => setPendingDelete({ id: handler.id, name: handler.name, type: 'handler' })} className="rounded-xl p-2 text-red-500 transition hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Marketers</h4>
                  <p className="text-xs text-slate-500">Referral and performance team</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{formatCompactCurrency(totalCommission)}</span>
              </div>
              <div className="mt-4 space-y-3">
                <input value={marketerForm.name} onChange={e => setMarketerForm(prev => ({ ...prev, name: e.target.value }))} type="text" placeholder="Marketer full name" className={inputClass(marketerForm.name, attemptedSubmitMarketer)} />
                <input value={marketerForm.phone} onChange={e => setMarketerForm(prev => ({ ...prev, phone: e.target.value }))} type="tel" placeholder="Phone number" className={inputClass(marketerForm.phone, attemptedSubmitMarketer)} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={marketerForm.code} onChange={e => setMarketerForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} type="text" placeholder="Coupon code" className={`${inputClass(marketerForm.code, attemptedSubmitMarketer)} uppercase font-mono`} />
                  <input value={marketerForm.commission} onChange={e => setMarketerForm(prev => ({ ...prev, commission: e.target.value }))} type="number" min="1" max="100" placeholder="Comm. %" className={inputClass(marketerForm.commission, attemptedSubmitMarketer)} />
                </div>
                <button onClick={handleOpenCouponModal} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 btn-anim">
                  <Plus className="h-4 w-4" />
                  <span>Add Marketer</span>
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {marketers.map(marketer => (
                  <div key={marketer.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/10 text-sm font-bold text-slate-800">{marketer.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{marketer.name}</p>
                      <p className="truncate text-xs text-slate-500">{marketer.code} · {marketer.commission}% commission</p>
                    </div>
                    <button onClick={() => setPendingDelete({ id: marketer.id, name: marketer.name, type: 'marketer' })} className="rounded-xl p-2 text-red-500 transition hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security</h3>
                <p className="mt-1 text-sm text-slate-500">Keep admin access protected and session control predictable.</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <button onClick={() => setShowPasswordForm(prev => !prev)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 btn-anim">
              {showPasswordForm ? 'Hide password form' : 'Update password'}
            </button>
            {showPasswordForm && (
              <div className="mt-4 space-y-3">
                <input type="password" placeholder="Current password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f5238]/15" />
                <input type="password" placeholder="New password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f5238]/15" />
                <input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f5238]/15" />
                <button onClick={handlePasswordSave} className="w-full rounded-2xl bg-[#0f5238] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 btn-anim">
                  Save new password
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Session</h3>
                <p className="mt-1 text-sm text-slate-500">End the current admin session when you are done.</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-3 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <button onClick={() => setShowLogoutModal(true)} className="mt-5 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 btn-anim">
              Log out of admin dashboard
            </button>
          </section>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-center text-xl font-bold text-slate-900">Ready to log out?</h3>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">This will end the current admin session and return you to the storefront.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 btn-anim">Cancel</button>
              <button onClick={() => setCurrentView('home')} className="rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white transition hover:bg-red-600 btn-anim">Log Out</button>
            </div>
          </div>
        </div>
      )}

      <CouponPreviewModal
        open={showCouponModal}
        draft={marketerForm}
        copiedField={copiedField}
        onClose={() => {
          setShowCouponModal(false);
          setCopiedField(null);
        }}
        onConfirm={handleCreateMarketer}
        onCopyCode={() => void handleCopy('code')}
        onCopyLink={() => void handleCopy('link')}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDeleteModal} />
          <div className="relative w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <button onClick={closeDeleteModal} className="rounded-full p-2 transition hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Delete {pendingDelete.type}?</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              You are removing <span className="font-semibold text-slate-700">{pendingDelete.name}</span> from the admin roster. This action cannot be undone.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-800">Confirm action</p>
                <p className="text-sm text-red-700">Type <span className="font-black">DELETE</span> to continue.</p>
              </div>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE here" autoFocus className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20" />
            </div>
            <button disabled={deleteConfirmText !== 'DELETE'} onClick={confirmDelete} className="mt-6 w-full rounded-2xl bg-red-500 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30 btn-anim">
              Confirm permanent deletion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ setActiveSidebarItem }: { setActiveSidebarItem: (id: string) => void }) {
  const { marketers, orders, products, updateOrderStatus, activeVisitors } = useStore();
  const [activeOrderTab, setActiveOrderTab] = useState<typeof orderTabs[number]>('All');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 4;

  // ── Compute Live Dynamic Quarterly Revenue from real orders ──
  const { availableQuarters, liveRevenueData } = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending-payment');
    const now = new Date();
    const currentYear = now.getFullYear();

    const quarterKeys = [`Q1 ${currentYear}`, `Q2 ${currentYear}`, `Q3 ${currentYear}`, `Q4 ${currentYear}`];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const store: Record<string, { month: string; orders: number; revenue: number }[]> = {};
    quarterKeys.forEach((qk, qIdx) => {
      store[qk] = [
        { month: monthNames[qIdx * 3], orders: 0, revenue: 0 },
        { month: monthNames[qIdx * 3 + 1], orders: 0, revenue: 0 },
        { month: monthNames[qIdx * 3 + 2], orders: 0, revenue: 0 },
      ];
    });

    for (const o of validOrders) {
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) continue;
      const y = d.getFullYear();
      const m = d.getMonth();
      const qNum = Math.floor(m / 3) + 1;
      const qKey = `Q${qNum} ${y}`;

      if (!store[qKey]) {
        const startM = (qNum - 1) * 3;
        store[qKey] = [
          { month: monthNames[startM], orders: 0, revenue: 0 },
          { month: monthNames[startM + 1], orders: 0, revenue: 0 },
          { month: monthNames[startM + 2], orders: 0, revenue: 0 },
        ];
      }

      const entry = store[qKey].find(item => item.month === monthNames[m]);
      if (entry) {
        entry.orders += 1;
        entry.revenue += Number(o.total) || 0;
      }
    }

    const result: Record<string, { month: string; orders: number; revenue: string; rawRevenue: number; avg: string; growth: string; trend: 'up' | 'down' }[]> = {};

    for (const [qk, mList] of Object.entries(store)) {
      result[qk] = mList.map((item, idx) => {
        const prevRev = idx > 0 ? mList[idx - 1].revenue : 0;
        let growth = '0%';
        let trend: 'up' | 'down' = 'up';
        if (prevRev > 0) {
          const diff = Math.round(((item.revenue - prevRev) / prevRev) * 100);
          growth = `${diff >= 0 ? '+' : ''}${diff}%`;
          trend = diff >= 0 ? 'up' : 'down';
        } else if (item.revenue > 0) {
          growth = '+100%';
          trend = 'up';
        }

        const avg = item.orders > 0 ? Math.round(item.revenue / item.orders) : 0;
        return {
          month: item.month,
          orders: item.orders,
          revenue: `₦${item.revenue.toLocaleString()}`,
          rawRevenue: item.revenue,
          avg: `₦${avg.toLocaleString()}`,
          growth,
          trend,
        };
      });
    }

    return { availableQuarters: Object.keys(result), liveRevenueData: result };
  }, [orders]);

  const currentQuarterKey = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarterKey);

  const activeQuarterRows = liveRevenueData[selectedQuarter] || liveRevenueData[currentQuarterKey] || [];

  // ── Compute Best-Selling Products from live orders ──
  const topProducts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; image: string; unitsSold: number; revenue: number; price: number; inStock: boolean }>();

    for (const p of products) {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        image: p.image,
        unitsSold: 0,
        revenue: 0,
        price: p.price,
        inStock: p.inStock,
      });
    }

    for (const o of orders) {
      if (o.status === 'cancelled' || o.status === 'pending-payment') continue;
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const pid = item.product?.id;
          if (!pid) continue;
          const existing = map.get(pid) || {
            id: pid,
            name: item.product?.name || 'Product',
            image: item.product?.image || '',
            unitsSold: 0,
            revenue: 0,
            price: item.product?.price || 0,
            inStock: true,
          };
          const qty = Number(item.quantity) || 1;
          existing.unitsSold += qty;
          existing.revenue += qty * (Number(item.product?.price) || existing.price || 0);
          map.set(pid, existing);
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 4);
  }, [orders, products]);

  // ── Compute Marketer ROI & Conversion from live orders ──
  const liveMarketers = useMemo(() => {
    return marketers.map(m => {
      const code = (m.code || '').trim().toUpperCase();
      const mOrders = orders.filter(o =>
        (o.couponCode || '').trim().toUpperCase() === code &&
        o.status !== 'cancelled' &&
        o.status !== 'pending-payment'
      );
      const grossSales = mOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const commRate = parseFloat(m.commission) || 10;
      const earned = Math.round(grossSales * (commRate / 100));

      return {
        ...m,
        sales: mOrders.length || m.sales,
        grossSales,
        earned: earned || m.earned,
      };
    }).sort((a, b) => b.sales - a.sales).slice(0, 4);
  }, [marketers, orders]);

  const mappedStoreOrders = orders.map(o => ({
    id: o.id,
    customer: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    product: o.items.length > 1 ? `${o.items[0].product.name} +${o.items.length - 1}` : o.items[0]?.product.name || 'Unknown',
    amount: `₦${o.total.toLocaleString()}`,
    date: new Date(o.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    status: o.status,
    city: o.city,
    couponCode: o.couponCode
  }));

  const combinedOrders = [...mappedStoreOrders, ...allOrders];

  const filteredOrders = activeOrderTab === 'All'
    ? combinedOrders
    : combinedOrders.filter(o => o.status === activeOrderTab.toLowerCase().replace('-', '-'));
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const pagedOrders = filteredOrders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Performance Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time metrics from the Haifly Trap ecosystem</p>
        </div>
        <button onClick={() => downloadTableAsPDF(selectedQuarter, activeQuarterRows)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90 self-start sm:self-auto">
          <FileDown className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Revenue', value: formatCompactCurrency(orders.reduce((acc, o) => acc + (o.status !== 'pending-payment' ? o.total : 0), 0)), change: 'live', trend: 'up' as const, sub: 'from live orders', icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Orders', value: orders.length.toString(), change: 'live', trend: 'up' as const, sub: 'in database', icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
          { label: 'Live Shoppers', value: activeVisitors.toString(), change: 'real-time', trend: 'up' as const, sub: 'active in Redis', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Dispatch', value: orders.filter(o => o.status === 'processing' || o.status === 'packed').length.toString(), change: 'live', trend: 'up' as const, sub: 'awaiting transit', icon: Package, color: 'bg-orange-50 text-orange-600' },
          { label: 'Active Marketers', value: marketers.length.toString(), change: 'live', trend: 'up' as const, sub: 'registered affiliates', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon style={{ width: '18px', height: '18px' }} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-800 mb-0.5">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className="text-[10px] text-slate-300 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Table + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live sales breakdown from PostgreSQL</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
                {availableQuarters.map(q => (
                  <button key={q} onClick={() => setSelectedQuarter(q)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedQuarter === q ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}>
                    {q}
                  </button>
                ))}
              </div>
              <button onClick={() => downloadTableAsPDF(selectedQuarter, activeQuarterRows)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0f5238] text-white rounded-xl text-xs font-semibold hover:opacity-90">
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  {['Month', 'Orders', 'Revenue (₦)', 'Avg. Value', 'Growth'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeQuarterRows.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{row.month}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.orders}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-800">{row.revenue}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{row.avg}</td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-0.5 text-xs font-bold w-fit ${row.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {row.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{row.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/60 border-t border-slate-100">
                  <td className="px-5 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide">Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-slate-800">{activeQuarterRows.reduce((s, r) => s + r.orders, 0).toLocaleString()}</td>
                  <td colSpan={3} className="px-5 py-3 text-xs text-slate-400">{selectedQuarter}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Order Status</h3>
          <p className="text-xs text-slate-400 mb-5">Current fulfillment rate</p>
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#0f5238" strokeWidth="10" strokeDasharray="179 239" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#C9A84C" strokeWidth="10" strokeDasharray="35.9 239" strokeDashoffset="-179" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#94a3b8" strokeWidth="10" strokeDasharray="23.9 239" strokeDashoffset="-214.9" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">75%</span>
                <span className="text-[10px] text-slate-400 font-medium">Delivered</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length.toLocaleString(), pct: orders.length ? `${Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100)}%` : '0%', color: 'bg-[#0f5238]' },
              { label: 'Processing', value: orders.filter(o => o.status === 'processing').length.toLocaleString(), pct: orders.length ? `${Math.round((orders.filter(o => o.status === 'processing').length / orders.length) * 100)}%` : '0%', color: 'bg-[#C9A84C]' },
              { label: 'Pending', value: orders.filter(o => o.status === 'pending' || o.status === 'pending-payment').length.toLocaleString(), pct: orders.length ? `${Math.round((orders.filter(o => o.status === 'pending' || o.status === 'pending-payment').length / orders.length) * 100)}%` : '0%', color: 'bg-slate-300' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-xs font-bold text-slate-700">{item.pct}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-10 text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{orders.length.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#0f5238]">{formatCompactCurrency(orders.reduce((acc, o) => acc + (o.status !== 'pending-payment' ? o.total : 0), 0))}</p>
              <p className="text-[10px] text-slate-400">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">{filteredOrders.length} orders found</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-50 rounded-xl p-1 overflow-x-auto">
              {orderTabs.map(tab => (
                <button key={tab} onClick={() => { setActiveOrderTab(tab); setOrderPage(1); }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeOrderTab === tab ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => setActiveSidebarItem('orders')} className="text-xs font-semibold text-[#0f5238] hover:underline whitespace-nowrap flex items-center gap-1">
              View All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-50">
          {pagedOrders.map(order => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-[#0f5238]">{order.id}</span>
                  {(order as any).couponCode && (
                    <span className="text-[9px] font-black text-amber-600 tracking-tighter uppercase leading-none mt-0.5">REF: {(order as any).couponCode}</span>
                  )}
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize border cursor-pointer focus:outline-none transition-colors ${statusStyle(order.status)}`}
                >
                  <option value="pending" className="bg-white text-slate-700">Pending</option>
                  <option value="pending-payment" className="bg-white text-slate-700">Pending Payment</option>
                  <option value="processing" className="bg-white text-slate-700">Processing</option>
                  <option value="packed" className="bg-white text-slate-700">Packed</option>
                  <option value="in-transit" className="bg-white text-slate-700">In Transit</option>
                  <option value="delivered" className="bg-white text-slate-700">Delivered</option>
                  <option value="cancelled" className="bg-white text-slate-700">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    {order.customer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-medium text-slate-700">{order.customer}</span>
                </div>
                <span className="font-bold text-slate-800">{order.amount}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="truncate max-w-[150px]">{order.product}</span>
                <span>{order.date}</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> Download Receipt
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Order ID', 'Customer', 'Product', 'City', 'Amount', 'Date', 'Status', 'Receipt'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[#0f5238]">{order.id}</span>
                      {(order as any).couponCode && (
                        <span className="text-[9px] font-black text-amber-600 tracking-tighter uppercase leading-none mt-0.5">REF: {(order as any).couponCode}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{order.customer.split(' ').map(n => n[0]).join('')}</div>
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[140px] truncate">{order.product}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{order.city}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-800 whitespace-nowrap">{order.amount}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{order.date}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize border cursor-pointer focus:outline-none transition-colors ${statusStyle(order.status)}`}
                    >
                      <option value="pending" className="bg-white text-slate-700">Pending</option>
                      <option value="pending-payment" className="bg-white text-slate-700">Pending Payment</option>
                      <option value="processing" className="bg-white text-slate-700">Processing</option>
                      <option value="packed" className="bg-white text-slate-700">Packed</option>
                      <option value="in-transit" className="bg-white text-slate-700">In Transit</option>
                      <option value="delivered" className="bg-white text-slate-700">Delivered</option>
                      <option value="cancelled" className="bg-white text-slate-700">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 hover:border-slate-300 transition-all">
                        <Download className="w-3 h-3" /> Download
                      </button>
                      <a
                        href={`https://wa.me/${(order.customerPhone || '2348031301311').replace(/\D/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
                          `Hello ${order.customer}! 🚚\n\nYour Haifly Trap order (#${order.id}) has been dispatched and is on its way to ${order.city || 'your delivery address'}.\n\nTrack your delivery in real-time here:\nhttps://www.haiflytrap.com/track-order?id=${order.id}\n\nThank you for choosing Haifly Trap!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-100 transition-all"
                        title="Send WhatsApp Delivery Update"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-50">
          <p className="text-xs text-slate-400">Showing {Math.min((orderPage - 1) * ordersPerPage + 1, filteredOrders.length)}–{Math.min(orderPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-slate-500" /></button>
            {Array.from({ length: totalOrderPages }, (_, i) => (
              <button key={i + 1} onClick={() => setOrderPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${orderPage === i + 1 ? 'bg-[#0f5238] text-white font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))} disabled={orderPage === totalOrderPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight className="w-3.5 h-3.5 text-slate-500" /></button>
          </div>
        </div>
      </div>

      {/* Best-Selling Products & Top Marketers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best-Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Best-Selling Products</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by units sold from live orders</p>
            </div>
            <button onClick={() => setActiveSidebarItem('products')} className="flex items-center gap-1.5 text-xs font-semibold text-[#0f5238] hover:underline">
              Inventory <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No products sold yet.</div>
            ) : topProducts.map((p, i) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-300 w-4">#{i + 1}</span>
                  <img src={p.image || '/images/Broadkillersurefacespray.png'} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">₦{p.price.toLocaleString()} · <span className="font-semibold text-slate-600">{p.unitsSold} sold</span></p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-black text-[#0f5238]">₦{p.revenue.toLocaleString()}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${p.inStock ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {p.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Marketers */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Performing Marketers</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated commissions from live referral orders</p>
            </div>
            <button onClick={() => setActiveSidebarItem('marketers')} className="flex items-center gap-1.5 text-xs font-semibold text-[#0f5238] hover:underline">
              Manage All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  {['#', 'Marketer', 'Code', 'Sales', 'Earned', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {liveMarketers.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No marketers found.</td></tr>
                ) : liveMarketers.map((m, i) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5"><span className="text-xs font-bold text-slate-300">#{i + 1}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0f5238]/10 flex items-center justify-center text-xs font-bold text-[#0f5238] flex-shrink-0">{m.initials}</div>
                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{m.code}</span></td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{m.sales}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-[#0f5238] whitespace-nowrap">{formatCurrency(m.earned)}</td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle(m.status)}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs text-slate-500">All systems operational · Secure Cloud Monitoring Active</p>
        </div>
        <p className="text-[10px] text-slate-300 font-mono hidden sm:block">SERVER: LAGOS-HQ-01</p>
      </div>
    </div>
  );
}

// ─── SHARED SIDEBAR CONTENT ───────────────────────────────────────────────────

function SidebarContent({ activeSidebarItem, setActiveSidebarItem, setCurrentView, onClose, logout }: {
  activeSidebarItem: string;
  setActiveSidebarItem: (id: string) => void;
  setCurrentView: (v: any) => void;
  onClose?: () => void;
  logout?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <button onClick={() => { setCurrentView('home'); onClose?.(); }}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left">
        <div className="w-9 h-9 rounded-xl bg-[#0f5238] flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-[#C9A84C] text-lg">H</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">Haifly Trap</p>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Admin Portal</p>
        </div>
      </button>

      <div className="mt-6 mb-2">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase px-1">Menu</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {sidebarItems.map(item => {
          const isActive = activeSidebarItem === item.id;
          return (
            <button key={item.id}
              onClick={() => {
                setActiveSidebarItem(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#0f5238] text-white shadow-sm shadow-[#0f5238]/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.id === 'orders' && (
                <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 rounded-full px-1.5 py-0.5">Live</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { setCurrentView, logout, activeVisitors } = useStore();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const pageTitle: Record<string, string> = {
    dashboard: 'Overview', orders: 'Orders', products: 'Products', marketers: 'Marketers', handlers: 'Handlers', blog: 'Blog', settings: 'Settings',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 flex flex-col p-5 transition-transform duration-300 ease-in-out lg:hidden ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setIsDrawerOpen(false)} className="absolute top-5 right-5 p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SidebarContent activeSidebarItem={activeSidebarItem} setActiveSidebarItem={item => { setActiveSidebarItem(item); }} setCurrentView={setCurrentView} onClose={() => setIsDrawerOpen(false)} logout={logout} />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="w-8 h-8 rounded-full bg-[#0f5238] text-white flex items-center justify-center text-xs font-bold">AH</div>
            <div><p className="text-xs font-semibold text-slate-700">Admin Haifly</p><p className="text-[10px] text-slate-400">Super Administrator</p></div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex-shrink-0 hidden lg:flex flex-col p-5">
        <SidebarContent activeSidebarItem={activeSidebarItem} setActiveSidebarItem={setActiveSidebarItem} setCurrentView={setCurrentView} logout={logout} />
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="w-8 h-8 rounded-full bg-[#0f5238] text-white flex items-center justify-center text-xs font-bold">AH</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">Admin Haifly</p>
              <p className="text-[10px] text-slate-400 truncate">Super Administrator</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 md:px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors" aria-label="Open menu">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-base md:text-lg font-bold text-slate-800">{pageTitle[activeSidebarItem]}</h1>
                <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">
                  Welcome back, Admin · {new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Real-time Redis Visitor Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-800 whitespace-nowrap">
                  {activeVisitors} online
                </span>
              </div>
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 w-48 focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20" />
              </div>
              <button className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <Bell style={{ width: '18px', height: '18px' }} className="text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#0f5238] text-white flex items-center justify-center text-xs font-bold">AH</div>
            </div>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 overflow-auto">
          {activeSidebarItem === 'dashboard' && <DashboardView setActiveSidebarItem={setActiveSidebarItem} />}
          {activeSidebarItem === 'orders' && <OrdersView />}
          {activeSidebarItem === 'products' && <ProductsView />}
          {activeSidebarItem === 'marketers' && <MarketersView onManage={() => setCurrentView('admin-marketers')} />}
          {activeSidebarItem === 'handlers' && <HandlersView />}
          {activeSidebarItem === 'blog' && <div className="p-4 md:p-6"><AdminBlogPage /></div>}
          {activeSidebarItem === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
