import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { ArrowLeft, CreditCard, Building2 } from 'lucide-react';
import Lottie from 'lottie-react';
import truckAnimation from '../lotties/wired-outline-497-truck-delivery-in-reveal.json';
import walletAnimation from '../lotties/system-solid-5-wallet-hover-wallet.json';
import type { Order } from '@/types';
import api from '@/lib/api';


const nigerianStates = [
  'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Kaduna', 'Ogun', 'Ondo', 'Enugu',
  'Anambra', 'Kwara', 'Plateau', 'Imo', 'Edo', 'Katsina', 'Borno', 'Niger', 'Akwa Ibom', 'Bauchi'
];

export function CheckoutPage() {
  const {
    cart,
    cartTotal,
    clearCart,
    setCurrentView,
    addOrder,
    activeCouponCode,
    clearActiveCouponCode,
    user,
    isLoadingUser,
  } = useStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    altPhone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: 'Lagos',
    lagosArea: 'Mainland' as 'Island' | 'Mainland' | '',
    deliveryMethod: 'Home Delivery' as 'Home Delivery' | 'Park Pickup',
    landmark: '',
    notes: '',
  });

  // Ensure user is logged in before checking out
  useEffect(() => {
    if (!isLoadingUser && !user) {
      setCurrentView('customer-login');
    } else if (user) {
      setFormData(prev => ({ 
        ...prev, 
        email: prev.email || user.email || '',
        firstName: prev.firstName || user.user_metadata?.first_name || '',
        lastName: prev.lastName || user.user_metadata?.last_name || '',
      }));
    }
  }, [user, isLoadingUser, setCurrentView]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
  
  const calculateShipping = () => {
    // Check if there is a Carton in the cart
    const hasCarton = cart.some(item => item.product.name.toLowerCase().includes('carton'));
    if (hasCarton) return 0;

    if (formData.state === 'Lagos') {
      return formData.lagosArea === 'Island' ? 1500 : 2500;
    } else {
      // For other states
      return formData.deliveryMethod === 'Park Pickup' ? 2000 : 3500;
    }
  };

  const shipping = calculateShipping();
  const tax = cartTotal * 0.075;
  const total = cartTotal + shipping + tax;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate all required fields, returns true if valid
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim())  errors.lastName  = 'Last name is required';
    if (!formData.email.trim())     errors.email     = 'Email address is required';
    if (!formData.phone.trim())     errors.phone     = 'Phone number is required';
    if (!formData.address.trim())   errors.address   = 'Street address is required';
    if (!formData.city.trim())      errors.city      = 'City is required';
    if (!formData.state.trim())     errors.state     = 'State is required';
    if (!formData.landmark?.trim()) errors.landmark  = 'Nearest landmark is required';
    if (formData.state === 'Lagos' && !formData.lagosArea) {
      errors.lagosArea = 'Please select your Lagos area';
    }
    if (cart.length === 0) errors.cart = 'Your cart is empty';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Client-side validation gate — never reaches API if incomplete
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);

    const tax = cartTotal * 0.075;
    const shipping = calculateShipping();
    const total = cartTotal + shipping + tax;

    const orderPayload = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerPhone: formData.phone,
      altPhone: formData.altPhone || undefined,
      whatsapp: formData.whatsapp || undefined,
      customerEmail: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      landmark: formData.landmark || undefined,
      notes: formData.notes || undefined,
      items: cart,
      subtotal: cartTotal,
      tax,
      shipping,
      discount: 0,
      total,
      paymentMethod: paymentMethod === 'paystack' ? 'Paystack' : 'Bank Transfer',
      createdAt: new Date().toISOString(),
      couponCode: activeCouponCode || undefined,
    };

    try {
      const res = await api.post('/orders', orderPayload);
      if (res.data?.success) {
        // Map server snake_case fields back to our Order type
        const serverOrder = res.data.data;
        const order: Order = {
          id: serverOrder.id,
          customerName: serverOrder.customerName ?? orderPayload.customerName,
          customerPhone: serverOrder.customerPhone ?? orderPayload.customerPhone,
          altPhone: serverOrder.altPhone,
          whatsapp: serverOrder.whatsapp,
          customerEmail: serverOrder.customerEmail ?? orderPayload.customerEmail,
          address: serverOrder.address ?? orderPayload.address,
          city: serverOrder.city ?? orderPayload.city,
          state: serverOrder.state ?? orderPayload.state,
          landmark: serverOrder.landmark,
          notes: serverOrder.notes,
          items: serverOrder.items ?? orderPayload.items,
          subtotal: serverOrder.subtotal ?? orderPayload.subtotal,
          tax: serverOrder.tax ?? orderPayload.tax,
          shipping: serverOrder.shipping ?? orderPayload.shipping,
          discount: serverOrder.discount ?? 0,
          total: serverOrder.total ?? orderPayload.total,
          status: serverOrder.status ?? 'pending',
          paymentMethod: serverOrder.paymentMethod ?? orderPayload.paymentMethod,
          createdAt: serverOrder.created_at ?? orderPayload.createdAt,
          trackingNumber: serverOrder.tracking_number ?? serverOrder.trackingNumber,
          couponCode: serverOrder.couponCode ?? orderPayload.couponCode,
        };
        addOrder(order);
        clearCart();
        clearActiveCouponCode();
        setCurrentView('order-confirmation');
      } else {
        setSubmitError(res.data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.error ?? 'Could not place your order. Please check your connection and try again.';
      setSubmitError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the field error as user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
    }
  };


  if (cart.length === 0) {
    setCurrentView('shop');
    return null;
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0f5238] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-outline-variant">
        <div className="section-padding py-6">
          <button
            onClick={() => setCurrentView('cart')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors btn-anim"
          >
            <ArrowLeft className="w-4 h-4 relative z-10" />
            <span>Back to Cart</span>
          </button>
        </div>
      </div>

      <div className="section-padding py-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-forest mb-2">
          Checkout
        </h1>
        <p className="text-muted-foreground mb-8">
          Secure your home with premium protection.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Details */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center">
                    <Lottie animationData={truckAnimation} loop={true} autoplay={true} className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-forest text-xl">Delivery Details</h2>
                    <p className="text-sm text-muted-foreground">Where should we send your protection?</p>
                  </div>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-forest mb-2 block">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Chinelo"
                      required
                      className={`input-modern ${fieldErrors.firstName ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-forest mb-2 block">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Adebayo"
                      required
                      className={`input-modern ${fieldErrors.lastName ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-forest mb-2 block">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="chinelo@example.com"
                      required
                      className={`input-modern ${fieldErrors.email ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-forest mb-2 block">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 text-muted-foreground font-medium border-r border-outline-variant bg-surface rounded-l-xl">
                        +234
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="801 234 5678"
                        required
                        className={`w-full pl-20 pr-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all ${fieldErrors.phone ? 'ring-2 ring-red-400' : ''}`}
                      />
                    </div>
                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-forest mb-2 block">Alternative Phone</label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 text-muted-foreground font-medium border-r border-outline-variant bg-surface rounded-l-xl text-xs">
                        +234
                      </div>
                      <input
                        type="tel"
                        name="altPhone"
                        value={formData.altPhone}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="w-full pl-16 pr-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-forest mb-2 block flex items-center gap-2">
                      WhatsApp Number
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 text-muted-foreground font-medium border-r border-outline-variant bg-surface rounded-l-xl text-xs">
                        +234
                      </div>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="WhatsApp Number"
                        className="w-full pl-16 pr-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all border border-transparent focus:border-[#25D366]/30"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-forest mb-2 block">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Plot 12, Lekki Phase 1"
                      required
                      className={`input-modern ${fieldErrors.address ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-forest mb-2 block">Nearest Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark || ''}
                      onChange={handleChange}
                      placeholder="e.g. Near Zenith Bank or Enyo Filling Station"
                      required
                      className={`input-modern ${fieldErrors.landmark ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.landmark && <p className="text-red-500 text-xs mt-1">{fieldErrors.landmark}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-forest mb-2 block">City / Town</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Ikeja"
                      required
                      className={`input-modern ${fieldErrors.city ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-forest mb-2 block">State</label>
                    <div className="relative">
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 appearance-none cursor-pointer"
                      >
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </div>

                  {formData.state === 'Lagos' ? (
                    <div>
                      <label className="text-sm font-semibold text-forest mb-2 block">Lagos Area</label>
                      <div className="relative">
                        <select
                          name="lagosArea"
                          value={formData.lagosArea}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 appearance-none cursor-pointer"
                        >
                          <option value="Mainland">Mainland (₦2,500)</option>
                          <option value="Island">Island (₦1,500)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-forest mb-2 block">Delivery Method</label>
                      <div className="relative">
                        <select
                          name="deliveryMethod"
                          value={formData.deliveryMethod}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 appearance-none cursor-pointer"
                        >
                          <option value="Home Delivery">Home Delivery (₦3,500)</option>
                          <option value="Park Pickup">Park Pickup (₦2,000)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-forest mb-2 block">Delivery Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e as any)}
                      placeholder="Tell our rider anything specific..."
                      className="w-full px-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 min-h-[100px] resize-none"
                    />
                  </div>
                </div>
 
                <div className="mt-8 p-5 bg-forest/[0.03] rounded-2xl border border-forest/5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-fresh/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lottie animationData={truckAnimation} loop={true} autoplay={true} className="w-6 h-6" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-forest">Dispatch Coverage</p>
                    <p className="text-muted-foreground mt-0.5">
                      Lagos Island: ₦1,500 | Lagos Mainland: ₦2,500. Other states from ₦2,000. <strong>FREE delivery on all Cartons!</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-forest" />
                  </div>
                  <h2 className="font-display font-semibold text-forest">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-outline-variant bg-surface-low relative opacity-60 cursor-not-allowed"
                  >
                    <div className="absolute top-3 right-3 bg-gold text-forest text-[10px] font-black px-3 py-1 rounded-full shadow-sm z-10 uppercase tracking-wider">
                      Coming Soon
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="w-5 h-5 text-muted-foreground"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest">Paystack (Card, USSD, Bank)</p>
                      <p className="text-sm text-muted-foreground">
                        Secure instant payment via Paystack gateway
                      </p>
                    </div>
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'bank'
                        ? 'border-forest bg-forest/5'
                        : 'border-outline-variant hover:border-forest/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="w-5 h-5 text-forest"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        Pay manually to our Access Bank account
                      </p>
                    </div>
                    <Building2 className="w-6 h-6 text-fresh" />
                  </label>
                </div>
              </div>

              {/* Mobile Order Summary */}
              <div className="lg:hidden bg-white rounded-2xl p-6">
                <h2 className="font-display font-semibold text-forest mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-forest truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-outline-variant my-4" />
                <div className="space-y-2">
                  {activeCouponCode && (
                    <div className="mb-4 relative aspect-[4/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md">
                      <img src="/coupons/clipped.svg" alt="" className="h-full w-full object-cover opacity-90" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referral Active</p>
                        <span className="block text-center font-mono text-sm font-black tracking-[0.2em]" style={{ color: '#FCB006' }}>
                          {activeCouponCode}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (7.5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-forest pt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Validation Summary + Error Banner */}
              {Object.keys(fieldErrors).length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 animate-in fade-in duration-300">
                  <p className="font-semibold mb-1">⚠️ Please fix the following before placing your order:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.values(fieldErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-in fade-in duration-300">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isProcessing || Object.keys(fieldErrors).length > 0}
                className="w-full py-4 bg-forest text-white font-semibold rounded-full hover:bg-forest-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-anim"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8">
                      <Lottie animationData={walletAnimation} loop={true} autoplay={true} />
                    </div>
                    Complete Order — {formatPrice(total)}
                  </span>
                )}
              </button>


              <p className="text-center text-xs text-muted-foreground">
                By clicking 'Complete Order', you agree to our Terms of Service.
              </p>
            </form>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block lg:w-96">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-semibold text-forest mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-forest text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-forest">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-outline-variant my-6" />

              <div className="space-y-3 mb-6">
                {activeCouponCode && (
                  <div className="mb-4 relative aspect-[4/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md">
                    <img src="/coupons/clipped.svg" alt="" className="h-full w-full object-cover opacity-90" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referral Applied</p>
                      <span className="block text-center font-mono text-sm font-black tracking-[0.2em]" style={{ color: '#FCB006' }}>
                        {activeCouponCode}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (7.5%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-fresh">You qualified for free shipping!</p>
                )}
              </div>

              <div className="h-px bg-outline-variant" />

              <div className="flex justify-between py-4">
                <span className="font-semibold text-forest">Total</span>
                <span className="font-display font-bold text-xl text-forest">
                  {formatPrice(total)}
                </span>
              </div>



              <div className="mt-4 p-4 bg-surface rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex-shrink-0">
                    <Lottie animationData={truckAnimation} loop={true} autoplay={true} />
                  </div>
                  <div>
                    <p className="font-medium text-forest text-sm">Fast Nigeria Delivery</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dispatched within 24-48 hours across major cities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
