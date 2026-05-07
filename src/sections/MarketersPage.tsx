import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  Search,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Download,
  TrendingUp,
  Lock,
  Save,
  Check,
  X,
  Menu,
  Link2,
  Copy
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'marketers', label: 'Marketers', icon: Users, active: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const payouts: any[] = [];

type MarketerDraft = {
  name: string;
  phone: string;
  code: string;
  commission: string;
};

const emptyMarketerDraft: MarketerDraft = {
  name: '',
  phone: '',
  code: '',
  commission: '',
};

const normalizeCouponCode = (value: string) => value.trim().toUpperCase();
const isMarketerDraftValid = (draft: MarketerDraft) =>
  Boolean(draft.name.trim() && draft.phone.trim() && normalizeCouponCode(draft.code) && draft.commission.trim());
const getCouponShareLink = (code: string) =>
  `${window.location.origin}/shop?coupon=${encodeURIComponent(normalizeCouponCode(code))}`;

// Reuse the modal components or similar logic from AdminDashboard
function CouponPreviewCard({ code }: { code: string }) {
  return (
    <div className="relative aspect-[2.4/1] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10 max-h-[120px] sm:max-h-[180px]">
      <img src="/coupons/clipped.svg" alt="Coupon preview artwork" className="h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="rounded-full bg-slate-950/70 px-4 py-1.5 sm:px-6 sm:py-3 shadow-lg backdrop-blur-sm border border-white/10">
          <span className="block text-center font-mono text-base font-black tracking-[0.25em] sm:text-2xl" style={{ color: '#FCB006' }}>
            {normalizeCouponCode(code)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CouponPreviewModalProps {
  open: boolean;
  draft: MarketerDraft;
  copiedField: 'code' | 'link' | null;
  onClose: () => void;
  onConfirm: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
}

function CouponPreviewModal({ open, draft, copiedField, onClose, onConfirm, onCopyCode, onCopyLink }: CouponPreviewModalProps) {
  if (!open) return null;
  const couponCode = normalizeCouponCode(draft.code);
  const shareLink = getCouponShareLink(couponCode);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl custom-scrollbar animate-in zoom-in duration-300">
        <div className="grid lg:grid-cols-2">
          <div className="bg-slate-50 p-4 sm:p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preview</p>
                 <h3 className="text-base font-bold text-slate-900">Partner Voucher</h3>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <CouponPreviewCard code={couponCode} />
             <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Code to share</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-[#9a6a00] tracking-widest">{couponCode}</span>
                  <button onClick={onCopyCode} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 btn-anim">
                    {copiedField === 'code' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'code' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
             </div>
          </div>
          <div className="p-4 sm:p-5 lg:p-6">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Share Link</p>
             <h3 className="text-base font-bold text-slate-900 mb-2">{draft.name}</h3>
             <p className="text-[11px] text-slate-500 leading-relaxed mb-4">Send this link to the marketer. Coupon stay attached through checkout.</p>
             <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tracking URL</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-2 mb-2">
                  <p className="text-[10px] font-mono text-slate-600 break-all">{shareLink}</p>
                </div>
                <button onClick={onCopyLink} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 btn-anim">
                  {copiedField === 'link' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'link' ? 'Copied' : 'Copy Link'}</span>
                </button>
             </div>
             <div className="flex gap-2 mt-4">
                <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 btn-anim"><span>Back</span></button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#0f5238] text-white rounded-2xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2 btn-anim"><Save className="w-3.5 h-3.5" /> <span>Save</span></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketersPage() {
  const { setCurrentView, marketers, isLoadingMarketers, addMarketer, removeMarketer, logout } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<MarketerDraft>(emptyMarketerDraft);

  const totalCommission = marketers.reduce((sum, m) => sum + (typeof m.earned === 'number' ? m.earned : 0), 0);

  const handleOpenCouponModal = () => {
    setAttemptedSubmit(true);
    if (!isMarketerDraftValid(form)) return;
    setShowCouponModal(true);
  };
  const inputClass = (val: string) => `w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
    attemptedSubmit && !val.trim() ? 'border-red-500 ring-2 ring-red-500/10 bg-red-50/30' : 'border-transparent focus:ring-[#0f5238]/20'
  }`;

  const handleCreateMarketer = () => {
    addMarketer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      code: normalizeCouponCode(form.code),
      commission: Number(form.commission),
      status: 'active',
    });
    setForm(emptyMarketerDraft);
    setShowAddForm(false);
    setShowCouponModal(false);
    setCopiedField(null);
  };

  const handleCopy = async (field: 'code' | 'link') => {
    const value = field === 'code' ? normalizeCouponCode(form.code) : getCouponShareLink(form.code);
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(current => (current === field ? null : current)), 1800);
  };

  const filtered = marketers.filter(m => {
    const matchFilter = filter === 'all' || m.status === 'active';
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f5238] text-white flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity text-left no-anim"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="font-bold text-gold">H</span>
            </div>
            <div>
              <p className="font-display font-bold">Haifly Trap</p>
              <p className="text-xs text-white/50">SUPER ADMIN</p>
            </div>
          </button>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                   if (item.id === 'dashboard') setCurrentView('admin-dashboard');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors btn-anim ${
                  item.active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 relative z-10" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FCB006] hover:bg-[#FCB006]/90 text-slate-900 rounded-xl transition-colors btn-anim">
            <Download className="w-4 h-4 relative z-10" />
            <span className="font-bold">Export Reports</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors btn-anim">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="font-bold relative z-10">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] lg:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0f5238] text-white z-[110] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => { setCurrentView('home'); setIsDrawerOpen(false); }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left no-anim"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="font-bold text-gold">H</span>
              </div>
              <div>
                <p className="font-display font-bold">Haifly Trap</p>
                <p className="text-xs text-white/50">SUPER ADMIN</p>
              </div>
            </button>
            <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg lg:hidden">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'dashboard') setCurrentView('admin-dashboard');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors btn-anim ${
                  item.active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 relative z-10" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FCB006] hover:bg-[#FCB006]/90 text-slate-900 rounded-xl transition-colors btn-anim">
              <Download className="w-4 h-4 relative z-10" />
              <span className="font-bold">Export Reports</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors btn-anim">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span className="font-bold relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-outline-variant sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors" aria-label="Open menu">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search marketers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-surface rounded-lg transition-colors no-anim">
                <Bell className="w-5 h-5 text-[#0f5238]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-forest">Adesola K.</p>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0f5238] text-white flex items-center justify-center font-semibold">
                  AK
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl text-forest">Partner Management</h1>
              <p className="text-muted-foreground">Manage and track performance of your marketing roster.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-5 py-3 bg-[#0f5238] text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all btn-anim"
            >
              <Plus className="w-4 h-4 relative z-10" />
              <span>{showAddForm ? 'Close Editor' : 'New Partner'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            {/* Marketers List */}
            <div className="space-y-6">
              <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h3 className="font-bold text-forest text-lg">Partner Roster</h3>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all btn-anim ${
                        filter === 'all' ? 'bg-white text-forest shadow-sm' : 'text-muted-foreground hover:text-forest'
                      }`}
                    >
                      <span>All Partners</span>
                    </button>
                    <button
                      onClick={() => setFilter('active')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all btn-anim ${
                        filter === 'active' ? 'bg-white text-forest shadow-sm' : 'text-muted-foreground hover:text-forest'
                      }`}
                    >
                      <span>Active Only</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        <th className="pb-4 px-2">Partner</th>
                        <th className="pb-4 px-2">Coupon Code</th>
                        <th className="pb-4 px-2">Comm.</th>
                        <th className="pb-4 px-2">Sales</th>
                        <th className="pb-4 px-2">Earned</th>
                        <th className="pb-4 px-2">Status</th>
                        <th className="pb-4 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoadingMarketers ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-surface-high"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-surface-high rounded w-24"></div>
                                  <div className="h-3 bg-surface-high rounded w-16"></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2"><div className="h-4 bg-surface-high rounded w-16"></div></td>
                            <td className="py-4 px-2"><div className="h-4 bg-surface-high rounded w-8"></div></td>
                            <td className="py-4 px-2"><div className="h-4 bg-surface-high rounded w-8"></div></td>
                            <td className="py-4 px-2"><div className="h-4 bg-surface-high rounded w-16"></div></td>
                            <td className="py-4 px-2"><div className="h-6 bg-surface-high rounded-full w-12"></div></td>
                            <td className="py-4 px-2">
                              <div className="flex gap-1">
                                <div className="w-8 h-8 bg-surface-high rounded-lg"></div>
                                <div className="w-8 h-8 bg-surface-high rounded-lg"></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 text-sm italic">No partners found.</td>
                        </tr>
                      ) : filtered.map((marketer) => (
                        <tr key={marketer.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#0f5238]/10 flex items-center justify-center text-xs font-bold text-[#0f5238]">
                                {marketer.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-forest text-sm truncate">{marketer.name}</p>
                                <p className="text-[10px] text-muted-foreground">{marketer.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                             <span className="font-mono text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-md tracking-wider">
                               {marketer.code}
                             </span>
                          </td>
                          <td className="py-4 px-2 text-sm font-semibold text-slate-700">{marketer.commission}%</td>
                          <td className="py-4 px-2 text-sm text-slate-600 font-medium">{marketer.sales}</td>
                          <td className="py-4 px-2 text-sm font-bold text-[#0f5238]">₦{marketer.earned.toLocaleString()}</td>
                          <td className="py-4 px-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              marketer.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {marketer.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex gap-1">
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors no-anim">
                                <Edit2 className="w-4 h-4 text-slate-400" />
                              </button>
                              <button onClick={() => removeMarketer(marketer.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors no-anim">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commission Payouts */}
              <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h3 className="font-bold text-forest text-lg">Commission Payout History</h3>
                  </div>
                  <button className="text-xs font-bold text-forest hover:underline btn-anim">
                    <span>View All History</span>
                  </button>
                </div>

                {payouts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-2xl">No payout history found.</div>
                ) : (
                  <>
                    {/* Mobile View (Cards) */}
                    <div className="md:hidden divide-y divide-slate-50 border border-slate-100 rounded-2xl bg-white overflow-hidden">
                      {payouts.map((payout, i) => (
                        <div key={i} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-[10px] font-bold text-forest">
                                {(payout as any).marketer.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-forest">{(payout as any).marketer}</p>
                                <p className="text-[10px] text-muted-foreground">{(payout as any).date}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">{(payout as any).period}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Amount</p>
                              <p className="font-bold text-[#0f5238]">{(payout as any).amount}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-medium">Approved By</p>
                              <div className="flex items-center gap-2 justify-end">
                                <div className="w-5 h-5 rounded bg-forest text-white flex items-center justify-center text-[8px] font-bold">A</div>
                                <span className="text-xs font-medium text-slate-600">{(payout as any).paidBy}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <th className="pb-4 px-2">Marketer</th>
                            <th className="pb-4 px-2">Amount</th>
                            <th className="pb-4 px-2">Period</th>
                            <th className="pb-4 px-2">Approved By</th>
                            <th className="pb-4 px-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {payouts.map((payout, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-[10px] font-bold text-forest">
                                    {(payout as any).marketer.split(' ').map((n: string) => n[0]).join('')}
                                  </div>
                                  <span className="text-sm font-semibold text-forest">{(payout as any).marketer}</span>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-sm font-bold text-[#0f5238]">{(payout as any).amount}</td>
                              <td className="py-4 px-2">
                                <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">{(payout as any).period}</span>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-forest text-white flex items-center justify-center text-[9px] font-bold">
                                    A
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">{(payout as any).paidBy}</span>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-[11px] text-muted-foreground font-medium">{(payout as any).date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button className="w-full mt-8 py-4 border border-slate-100 rounded-2xl text-xs font-bold text-forest hover:bg-slate-50 transition-all btn-anim">
                      <span>Load Full Transaction Log</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-forest rounded-[32px] p-8 text-white shadow-xl shadow-forest/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Commission Owed</p>
                <p className="text-4xl font-display font-black mb-4">₦{totalCommission.toLocaleString()}</p>
                <div className="flex items-center gap-2 text-fresh text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>System healthy · {marketers.filter(m => m.status === 'active').length} active partners</span>
                </div>
              </div>

              {/* Add Marketer Form */}
              {showAddForm && (
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#0f5238]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#0f5238]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-forest">Add Partner</h3>
                      <p className="text-xs text-muted-foreground">Create new tracking profile</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter partner name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass(form.name)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+234 ..."
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass(form.phone)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Code</label>
                        <input
                          type="text"
                          placeholder="TRAP20"
                          value={form.code}
                          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                          className={`w-full px-4 py-3 font-mono uppercase transition-all ${inputClass(form.code)}`}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Comm. %</label>
                        <input
                          type="number"
                          placeholder="15"
                          value={form.commission}
                          onChange={(e) => setForm({ ...form, commission: e.target.value })}
                          className={inputClass(form.commission)}
                          required
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleOpenCouponModal}
                      disabled={!isMarketerDraftValid(form)}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-2 btn-anim"
                    >
                      <Plus className="w-5 h-5 relative z-10" />
                      <span>Preview Voucher</span>
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
                      By saving, you generate a unique tracking URL that ensures this partner receives commission on all referred sales.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Security */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                   <Lock className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-800">Haifly Trap Internal Security</p>
                    <p className="text-[10px] text-slate-400">Secure Node Cluster · Dashboard v2.8.1</p>
                 </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-fresh rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-400 tracking-widest">ENCRYPTED</span>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-300">
                  <span>PAYSTACK</span>
                  <span>FLUTTERWAVE</span>
                  <span>STRIPE</span>
               </div>
            </div>
          </div>
        </div>
      </main>

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
