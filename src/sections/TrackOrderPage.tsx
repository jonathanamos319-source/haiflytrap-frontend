import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { usePWA } from '@/hooks/usePWA';
import type { Order } from '@/types';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  CreditCard,
  Check,
  ShoppingBag,
  Phone,
  MessageSquare,
  Copy,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

type StepId = 'pending' | 'placed' | 'confirmed' | 'preparing' | 'shipped' | 'delivered';

interface TimelineStep {
  id: StepId;
  label: string;
  sublabel: string;
  Icon: React.ElementType;
}

const STEPS: TimelineStep[] = [
  { id: 'pending', label: 'Awaiting', sublabel: 'Payment pending', Icon: CreditCard },
  { id: 'placed', label: 'Placed', sublabel: 'Order received', Icon: CreditCard },
  { id: 'confirmed', label: 'Confirmed', sublabel: 'Payment verified', Icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparing', sublabel: 'Getting ready', Icon: Package },
  { id: 'shipped', label: 'Shipped', sublabel: 'On the way', Icon: Truck },
  { id: 'delivered', label: 'Delivered', sublabel: 'Completed', Icon: Home },
];

const STEP_ORDER: StepId[] = ['pending', 'placed', 'confirmed', 'preparing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<StepId, { label: string; sublabel: string; color: string; bg: string; dot: string; progress: number }> = {
  pending: { label: 'Payment Pending', sublabel: 'Awaiting confirmation', color: 'text-white', bg: 'from-[#d4a017] to-[#b0850f]', dot: 'bg-white/90', progress: 5 },
  placed: { label: 'Order Placed', sublabel: 'We received your order', color: 'text-white', bg: 'from-[#4B7BEC] to-[#3A60D7]', dot: 'bg-white/90', progress: 20 },
  confirmed: { label: 'Confirmed', sublabel: 'Payment verified', color: 'text-white', bg: 'from-[#4B7BEC] to-[#3A60D7]', dot: 'bg-white/90', progress: 40 },
  preparing: { label: 'Preparing', sublabel: 'Getting ready', color: 'text-white', bg: 'from-[#4B7BEC] to-[#3A60D7]', dot: 'bg-white/90', progress: 60 },
  shipped: { label: 'Shipped', sublabel: 'On the way', color: 'text-white', bg: 'from-[#5DADE2] to-[#3498DB]', dot: 'bg-white/90', progress: 80 },
  delivered: { label: 'Delivered', sublabel: 'Completed', color: 'text-white', bg: 'from-[#27AE60] to-[#1E8449]', dot: 'bg-white/90', progress: 100 },
};

function normalizeOrder(order: any): Order {
  return {
    ...order,
    customerName: order.customer_name ?? order.customerName,
    customerPhone: order.customer_phone ?? order.customerPhone,
    customerEmail: order.customer_email ?? order.customerEmail,
    altPhone: order.alt_phone ?? order.altPhone,
    paymentMethod: order.payment_method ?? order.paymentMethod,
    trackingNumber: order.tracking_number ?? order.trackingNumber,
    couponCode: order.coupon_code ?? order.couponCode,
    createdAt: order.created_at ?? order.createdAt,
    riderName: order.rider_name ?? order.riderName,
    riderPhone: order.rider_phone ?? order.riderPhone,
  };
}

function formatTimelineTime(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTimelineTime(order: Order | null, stepId: StepId, currentStep: StepId) {
  if (!order) return null;

  const createdAt = formatTimelineTime(order.createdAt);
  const updatedAt = formatTimelineTime((order as any).updated_at ?? (order as any).updatedAt);
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const stepIdx = STEP_ORDER.indexOf(stepId);

  if (stepIdx > currentIdx) return null;
  if (stepId === 'pending' || stepId === 'placed') return createdAt;
  if (stepId === currentStep) return updatedAt ?? createdAt ?? 'Live update';
  return null;
}

function getContactLinks(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return { tel: null, whatsapp: null };
  }

  if (digits.startsWith('234')) {
    return { tel: `+${digits}`, whatsapp: digits };
  }

  if (digits.startsWith('0') && digits.length === 11) {
    const normalized = `234${digits.slice(1)}`;
    return { tel: `+${normalized}`, whatsapp: normalized };
  }

  if (trimmed.startsWith('+')) {
    return { tel: trimmed, whatsapp: digits };
  }

  return { tel: `+${digits}`, whatsapp: digits };
}

function CircularProgress({ percentage, color }: { percentage: number; color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-gray-700">{Math.round(percentage)}%</span>
    </div>
  );
}

function ProgressBar({ currentStep, isDelivered }: { currentStep: StepId; isDelivered: boolean }) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  const dotCount = STEP_ORDER.length;

  return (
    <div className="relative h-4 mt-6 mb-2 flex items-center">
      <div className="absolute inset-x-0 h-[2px] bg-white/20 rounded-full" />
      <div
        className="absolute left-0 h-[2px] bg-white rounded-full transition-all duration-700 ease-out z-10"
        style={{ width: `${STATUS_CONFIG[currentStep].progress}%` }}
      />
      <div className="absolute inset-x-0 flex items-center justify-between z-20">
        {Array.from({ length: dotCount }).map((_, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={idx}
              className={`rounded-full transition-all duration-500 flex items-center justify-center ${
                isPassed || isCurrent ? 'bg-white w-2.5 h-2.5' : 'bg-transparent w-2 h-2 border border-white/60'
              } ${isCurrent && !isDelivered ? 'ring-4 ring-white/30' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

interface TimelineItemProps {
  step: { Icon: React.ElementType; label: string; sublabel: string };
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
  currentStep: StepId;
  time: string | null;
}

function TimelineItem({ step, isCompleted, isCurrent, isLast, currentStep, time }: TimelineItemProps) {
  const { Icon } = step;
  const isDelivered = currentStep === 'delivered';
  const isPending = currentStep === 'pending';
  const dotBg = isCompleted || isCurrent
    ? (isDelivered ? 'bg-[#27AE60] border-[#27AE60]' : isPending ? 'bg-[#d4a017] border-[#d4a017]' : 'bg-[#4B7BEC] border-[#4B7BEC]')
    : 'bg-white border-gray-200';
  const iconColor = isCompleted || isCurrent ? 'text-white' : 'text-gray-300';
  const labelColor = isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400';
  const subColor = isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300';
  const lineColor = isCompleted ? (isDelivered ? 'bg-[#27AE60]' : isPending ? 'bg-[#d4a017]' : 'bg-[#4B7BEC]') : 'bg-gray-200';

  return (
    <div className="flex items-start gap-4 relative">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 shadow-sm ${dotBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.2} />
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[32px] mt-1 transition-all duration-700 ${lineColor}`} />}
      </div>
      <div className="flex-1 pb-7 flex justify-between items-start pt-1.5">
        <div>
          <p className={`text-sm font-semibold leading-tight ${labelColor}`}>{step.label}</p>
          <p className={`text-xs mt-0.5 ${subColor}`}>{step.sublabel}</p>
        </div>
        {(isCompleted || isCurrent) && time && <span className="text-xs ml-4 whitespace-nowrap mt-0.5 font-medium text-gray-400">{time}</span>}
      </div>
    </div>
  );
}

export function TrackOrderPage() {
  const { currentOrder, setCurrentOrder, user, isLoadingUser, isBackendDown, isCheckingBackend, isRetrying } = useStore();
  const { isPWA } = usePWA();
  const [orderId, setOrderId] = useState(currentOrder?.trackingNumber || '');
  const [isTracking, setIsTracking] = useState(!!currentOrder);
  const [demoStep] = useState<StepId>('pending');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(currentOrder ?? null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackingDismissed, setTrackingDismissed] = useState(false);

  const applyTrackedOrder = (order: Order) => {
    setTrackingDismissed(false);
    setTrackedOrder(order);
    setCurrentOrder(order);
    setOrderId(order.trackingNumber || order.id);
    setIsTracking(true);
    setTrackError(null);
  };

  const clearTrackedOrder = (opts?: { notify?: boolean }) => {
    setTrackingDismissed(true);
    setTrackedOrder(null);
    setCurrentOrder(null);
    setOrderId('');
    setIsTracking(false);
    setTrackError(null);

    if (opts?.notify) {
      toast.success('Stopped tracking this order');
    }
  };

  const copyOrderId = async (value: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success('Order ID copied');
    } catch {
      toast.error('Could not copy order ID');
    }
  };

  useEffect(() => {
    if (!currentOrder) return;
    applyTrackedOrder(currentOrder);
  }, [currentOrder]);

  useEffect(() => {
    if (isLoadingUser) return;
    if (trackingDismissed) return;
    if (trackedOrder) return;

    const savedTrackingId = localStorage.getItem('last_tracked_waybill')?.trim();

    const loadLatestOrder = async () => {
      if (!user) return;

      setTrackLoading(true);
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.success && res.data.data?.length > 0) {
          const active = res.data.data.find((o: any) => !['delivered'].includes(o.status)) || res.data.data[0];
          if (active) {
            applyTrackedOrder(normalizeOrder(active));
          }
        }
      } catch {
        // user can still search manually
      } finally {
        setTrackLoading(false);
      }
    };

    const loadSavedOrder = async () => {
      if (!savedTrackingId) {
        await loadLatestOrder();
        return;
      }

      setTrackLoading(true);
      try {
        const res = await api.get(`/orders/track/${savedTrackingId}`);
        if (res.data?.success && res.data.data) {
          applyTrackedOrder(normalizeOrder(res.data.data));
          return;
        }
      } catch {
        localStorage.removeItem('last_tracked_waybill');
      } finally {
        setTrackLoading(false);
      }

      await loadLatestOrder();
    };

    void loadSavedOrder();
  }, [trackedOrder, user, isLoadingUser, trackingDismissed]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;

    setTrackLoading(true);
    setTrackError(null);
    try {
      const res = await api.get(`/orders/track/${id}`);
      if (res.data?.success && res.data.data) {
        applyTrackedOrder(normalizeOrder(res.data.data));
        toast.success('Now tracking this order');
      } else {
        setTrackError('Order not found. Please check your tracking number.');
      }
    } catch (err: unknown) {
      if ((err as any)?.response?.status === 404) {
        setTrackError('Order not found. Please check your tracking number.');
      } else {
        setTrackError('Unable to reach the server. Please try again later.');
      }
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    if (!trackedOrder?.trackingNumber) return;
    if (trackedOrder.status === 'delivered') return;

    let cancelled = false;

    const refreshTrackedOrder = async () => {
      try {
        const res = await api.get(`/orders/track/${trackedOrder.trackingNumber}`);
        if (!res.data?.success || !res.data.data || cancelled) return;

        const normalized = normalizeOrder(res.data.data);
        if (normalized.status === 'delivered') {
          toast.success(`Order ${normalized.trackingNumber || normalized.id} has been delivered`);
          clearTrackedOrder();
          return;
        }

        setTrackedOrder(normalized);
        setCurrentOrder(normalized);
      } catch {
        // keep current UI when refresh fails
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshTrackedOrder();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [trackedOrder, setCurrentOrder]);

  const displayOrder = trackedOrder ?? currentOrder;

  const activeStep: StepId = displayOrder?.status
    ? (displayOrder.status === 'pending' || displayOrder.status === 'pending-payment' ? 'pending'
      : displayOrder.status === 'processing' ? 'confirmed'
      : displayOrder.status === 'packed' ? 'preparing'
      : displayOrder.status === 'in-transit' ? 'shipped'
      : displayOrder.status === 'delivered' ? 'delivered'
      : 'placed')
    : demoStep;

  const activeConfig = STATUS_CONFIG[activeStep];
  const currentIdx = STEP_ORDER.indexOf(activeStep);
  const isDelivered = activeStep === 'delivered';
  const BannerIcon = STEPS.find(s => s.id === activeStep)?.Icon ?? Package;

  const orderNumber = displayOrder?.trackingNumber ?? displayOrder?.id ?? '';
  const itemCount = displayOrder?.items?.length ?? 0;
  const orderTotal = displayOrder?.total ? `₦${Number(displayOrder.total).toLocaleString()}` : '';

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24 lg:pb-0">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-800">Track Order</h1>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex flex-col items-center justify-center gap-1">
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-16 relative">
        <img
          src="/images/dead_house_fly_final.png"
          alt=""
          className="absolute top-10 right-10 w-16 h-16 opacity-100 rotate-[60deg] pointer-events-none mix-blend-multiply z-0"
          style={{ clipPath: 'circle(36%)' }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          <div className="lg:col-span-7 space-y-4 lg:space-y-6">
            {!displayOrder && (
              <div className="space-y-4 mb-2 lg:mb-6">
                {isBackendDown && !isCheckingBackend && !isRetrying ? (
                  <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Tracking Temporarily Unavailable</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      Our tracking system is currently undergoing maintenance. Please contact us on WhatsApp to get a live update on your order status.
                    </p>
                    <a
                      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%2C%20I%20want%20to%20track%20my%20order.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl shadow-lg shadow-[#25D366]/20 hover:bg-[#20ba5a] transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Track via WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleTrack} className="flex gap-2 lg:gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                          placeholder="Enter Tracking Number..."
                          className="w-full pl-4 pr-4 py-3 lg:py-4 bg-white rounded-2xl text-sm lg:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4a017]/30 border border-gray-100 shadow-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={trackLoading}
                        className="px-5 lg:px-8 py-3 lg:py-4 bg-[#d4a017] text-white text-sm lg:text-base font-bold rounded-2xl shadow-lg shadow-gold/20 disabled:opacity-60 flex items-center justify-center min-w-[100px]"
                      >
                        {trackLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Track'}
                      </button>
                    </form>
                    {trackError && (
                      <p className="text-sm text-red-500 font-medium px-1">⚠️ {trackError}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {displayOrder && (
              <>
                <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="w-12 lg:w-14 h-12 lg:h-14 bg-[#EBF0FF] rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 lg:w-7 h-6 lg:h-7 text-[#4B7BEC]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5 hidden lg:block">Order Details</p>
                        <p className="text-sm lg:text-xl font-bold lg:font-extrabold text-gray-800">Order {orderNumber}</p>
                        <p className="text-xs lg:text-sm text-gray-400 lg:text-gray-500 mt-0.5 lg:mt-1 font-medium">{itemCount} items · {orderTotal}</p>
                      </div>
                    </div>
                    <CircularProgress percentage={activeConfig.progress} color={isDelivered ? 'text-[#27AE60]' : 'text-[#4B7BEC]'} />
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-gray-50/80 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Order ID</p>
                        <p className="mt-1 break-all font-mono text-sm font-bold text-gray-800">{orderNumber}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => copyOrderId(orderNumber)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Order ID
                        </button>
                        <button
                          type="button"
                          onClick={() => clearTrackedOrder({ notify: true })}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <X className="w-4 h-4" />
                          Stop Tracking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`bg-gradient-to-br ${activeConfig.bg} rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 shadow-lg relative overflow-hidden`}>
                  <div className="absolute -top-6 lg:-top-10 -right-6 lg:-right-10 w-24 lg:w-40 h-24 lg:h-40 rounded-full bg-white/10 blur-xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 lg:gap-5 mb-4 lg:mb-6">
                      <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white/20 rounded-2xl lg:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30">
                        <BannerIcon className="w-6 lg:w-8 h-6 lg:h-8 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-white font-extrabold lg:font-black text-xl lg:text-3xl leading-tight tracking-tight">{activeConfig.label}</p>
                        <p className="text-white/80 text-xs lg:text-base font-medium">{activeConfig.sublabel}</p>
                      </div>
                    </div>
                    <ProgressBar currentStep={activeStep} isDelivered={isDelivered} />
                    <div className="flex justify-end mt-1 px-1">
                      <span className="text-white/60 text-[10px] lg:text-xs font-bold lg:font-black uppercase tracking-wider">{activeConfig.progress}% Complete</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="lg:hidden space-y-4">
              {isTracking && (
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-800 mb-5">Timeline</p>
                  <div className="relative">
                    {STEPS.map((step, idx) => (
                      <TimelineItem
                        key={step.id}
                        step={step}
                        isCompleted={STEP_ORDER.indexOf(step.id) < currentIdx}
                        isCurrent={STEP_ORDER.indexOf(step.id) === currentIdx}
                        isLast={idx === STEPS.length - 1}
                        currentStep={activeStep}
                        time={getTimelineTime(displayOrder, step.id, activeStep)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {displayOrder && (
                <ShippingPartner order={displayOrder} />
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 space-y-6">
            {isTracking && (
              <div className="bg-white rounded-[32px] p-8 shadow-soft border border-gray-100">
                <p className="text-base font-black text-gray-800 mb-8">Timeline</p>
                <div className="relative">
                  {STEPS.map((step, idx) => (
                    <TimelineItem
                      key={step.id}
                      step={step}
                      isCompleted={STEP_ORDER.indexOf(step.id) < currentIdx}
                      isCurrent={STEP_ORDER.indexOf(step.id) === currentIdx}
                      isLast={idx === STEPS.length - 1}
                      currentStep={activeStep}
                      time={getTimelineTime(displayOrder, step.id, activeStep)}
                    />
                  ))}
                </div>
              </div>
            )}
            {displayOrder && <ShippingPartner order={displayOrder} />}
            <HelpCard />
          </div>
        </div>

        <div 
          className="lg:hidden fixed z-50" 
          style={{ 
            bottom: 'calc(110px + env(safe-area-inset-bottom))', 
            left: isPWA ? '20px' : 'auto',
            right: isPWA ? 'auto' : '20px'
          }}
        >
          <a
            href="https://wa.me/2348031301311?text=Hi%2C%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl shadow-[#25D366]/40 animate-bounce-subtle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-sm font-bold">Need help?</span>
          </a>
        </div>

        <p className="text-center text-[10px] lg:text-xs text-gray-400 mt-12 font-medium">
          Haifly Trap - Protecting your space, one delivery at a time.
        </p>
      </div>
    </div>
  );
}

function ShippingPartner({ order }: { order: Order }) {
  const isPending = order.status === 'pending' || order.status === 'pending-payment';
  if (isPending) return null;

  const hasRider = order.riderName && order.riderPhone;
  const riderPhone = order.riderPhone ?? '';
  const contactLinks = getContactLinks(riderPhone);

  return (
    <div className="bg-white rounded-[32px] p-4 lg:p-6 shadow-sm border border-gray-100 group">
      <p className="text-xs lg:text-sm font-bold lg:font-black text-gray-800 mb-4 lg:mb-5 uppercase tracking-widest">Shipping Partner</p>
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="relative">
          <div className="w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br from-[#4B7BEC] to-[#3A60D7] rounded-2xl flex items-center justify-center">
            <span className="text-lg lg:text-xl font-black text-white">{order.riderName?.[0] || 'S'}</span>
          </div>
          {hasRider && (
            <div className="absolute -bottom-1 -right-1 w-4 lg:w-5 h-4 lg:h-5 bg-fresh border-2 border-white rounded-full flex items-center justify-center">
              <Check className="w-2 lg:w-3 h-2 lg:h-3 text-white" strokeWidth={3} />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm lg:text-base font-bold lg:font-black text-gray-800">
            {order.riderName || 'Awaiting Rider Assignment'}
          </p>
          <p className="text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-wide">
            {hasRider ? 'Verified Dispatch Rider' : 'Logistics in progress'}
          </p>
        </div>
      </div>
      {hasRider && (
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <a href={contactLinks.tel ?? '#'} className="flex items-center justify-center gap-2 py-3 lg:py-4 bg-gray-50 text-gray-800 text-xs lg:text-sm font-bold lg:font-black rounded-2xl border border-gray-100">
            <Phone className="w-4 h-4" /> Call
          </a>
          <a href={contactLinks.whatsapp ? `https://wa.me/${contactLinks.whatsapp}?text=Hi%2C%20I%20need%20assistance%20tracking%20my%20order%20${order.trackingNumber || order.id}.` : '#'} className="flex items-center justify-center gap-2 py-3 lg:py-4 bg-[#25D366]/10 text-[#25D366] text-xs lg:text-sm font-bold lg:font-black rounded-2xl border border-[#25D366]/20">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

function HelpCard() {
  return (
    <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden group hidden lg:block">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
      <div className="relative z-10">
        <p className="text-xl font-black mb-2">Need help?</p>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">Our support team is available 24/7 to help you with your order delivery.</p>
        <button className="w-full py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-gold hover:text-white transition-all flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" /> Chat with Support
        </button>
      </div>
    </div>
  );
}
