import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Check, Lock } from 'lucide-react';
import Lottie from 'lottie-react';
import walletAnimation from '../lotties/system-solid-5-wallet-hover-wallet.json';
import api from '@/lib/api';

export function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart, setCurrentView, setActiveCouponCode } = useStore();
  const [promoInput, setPromoInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const tax = cartTotal * 0.075;
  const hasCarton = cart.some(item => item.product.name.toLowerCase().includes('carton'));
  const shipping = hasCarton ? 0 : 2500; // Estimated default, actual calculated at checkout
  const total = cartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="section-padding py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-forest mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button
              onClick={() => setCurrentView('shop')}
              className="btn-primary btn-anim"
            >
              <ArrowLeft className="w-4 h-4 relative z-10" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-outline-variant">
        <div className="section-padding py-6">
          <button
            onClick={() => setCurrentView('shop')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors btn-anim"
          >
            <ArrowLeft className="w-4 h-4 relative z-10" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      <div className="section-padding py-8">
        {/* Active Coupon Banner */}
        {useStore().activeCouponCode && (
          <div className="mb-8 relative aspect-[4/1] md:aspect-[6/1] w-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10 animate-in slide-in-from-top-4 duration-500">
            <img src="/coupons/clipped.svg" alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-slate-950/70 shadow-lg backdrop-blur-sm border border-white/10">
                  <Check className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Partner Referral Active</p>
                  <p className="text-sm md:text-xl font-display font-black text-white uppercase tracking-wider">{useStore().activeCouponCode}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">Tracking Orders</span>
              </div>
            </div>
          </div>
        )}

        <h1 className="font-display font-bold text-2xl md:text-3xl text-forest mb-8">
          Shopping Cart ({cart.length} items)
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl overflow-hidden">
              {cart.map((item, index) => (
                <div
                  key={item.product.id}
                  className={`p-4 md:p-6 flex gap-4 md:gap-6 ${
                    index !== cart.length - 1 ? 'border-b border-outline-variant' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-semibold text-forest line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.category.replace('-', ' ')}
                        </p>
                      </div>
                      <p className="font-display font-bold text-forest md:text-right">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3 bg-surface rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors no-anim"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-fresh/10 transition-colors no-anim"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors btn-anim"
                      >
                        <Trash2 className="w-4 h-4 relative z-10" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Lock className="w-5 h-5 text-fresh" />
              <span>Your transaction is secured with 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-semibold text-forest mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
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
                <div className="h-px bg-outline-variant" />
                <div className="flex justify-between">
                  <span className="font-semibold text-forest">Total</span>
                  <span className="font-display font-bold text-xl text-forest">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('checkout')}
                className="w-full py-3 bg-forest text-white font-semibold rounded-full hover:bg-forest-light transition-all mb-4 flex items-center justify-center gap-2 group"
              >
                <div className="w-8 h-8">
                  <Lottie 
                    animationData={walletAnimation} 
                    loop={true} 
                    autoplay={true}
                  />
                </div>
                <span>Proceed to Checkout</span>
              </button>

              <div className="text-center">
                <span className="text-xs text-muted-foreground">or</span>
              </div>

              <button
                onClick={() => setCurrentView('shop')}
                className="w-full py-3 text-forest font-medium hover:underline mt-4 btn-anim"
              >
                <span>Continue Shopping</span>
              </button>

              <div className="mt-6 pt-6 border-t border-outline-variant">
                <label className="text-sm font-medium text-forest mb-2 block">
                  Promo Code
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={useStore().activeCouponCode || promoInput}
                      disabled={!!useStore().activeCouponCode}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={useStore().activeCouponCode ? "Coupon Active" : "Enter code"}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all ${
                        useStore().activeCouponCode 
                          ? 'bg-surface-high text-muted-foreground border border-fresh/20 cursor-not-allowed' 
                          : 'bg-surface focus:ring-2 focus:ring-forest/20'
                      }`}
                    />
                    {!useStore().activeCouponCode ? (
                      <button 
                        disabled={couponLoading}
                        onClick={async () => {
                          const code = promoInput.trim().toUpperCase();
                          if (!code) return;
                          setCouponLoading(true);
                          setCouponError(null);
                          setCouponSuccess(null);
                          try {
                            const res = await api.get(`/marketers/validate/${code}`);
                            if (res.data?.success && res.data.data?.valid) {
                              setActiveCouponCode(code);
                              setCouponSuccess(`✓ Referral code "${code}" applied — ${res.data.data.discountPercent}% discount tracked`);
                              setPromoInput('');
                            } else {
                              setCouponError('Invalid or inactive coupon code.');
                            }
                          } catch (err: any) {
                            setCouponError(err?.response?.data?.error ?? 'Invalid or inactive coupon code.');
                          } finally {
                            setCouponLoading(false);
                          }
                        }}
                        className="px-6 py-3 bg-forest text-white font-medium rounded-xl hover:bg-forest-light transition-colors btn-anim disabled:opacity-60"
                      >
                        <span>{couponLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => useStore().clearActiveCouponCode()}
                        className="px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors btn-anim"
                      >
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Coupon feedback */}
                  {couponError && (
                    <p className="text-xs text-red-500 font-medium">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-fresh font-medium">{couponSuccess}</p>
                  )}

                  {useStore().activeCouponCode && (
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md animate-in fade-in zoom-in duration-300">
                      <img src="/coupons/clipped.svg" alt="" className="h-full w-full object-cover opacity-90" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <span className="block text-center font-mono text-sm font-black tracking-[0.2em]" style={{ color: '#FCB006', textShadow: '0 1px 0 rgba(15, 23, 42, 0.65), 0 0 12px rgba(252, 176, 6, 0.15)' }}>
                          {useStore().activeCouponCode}
                        </span>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1">Discount Applied</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
