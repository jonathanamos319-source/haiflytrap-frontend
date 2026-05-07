import { useStore } from '@/hooks/useStore';
import { useState } from 'react';
import { Check, Clock, Package, MapPin, Phone, MessageSquare, ArrowRight, ShoppingBag } from 'lucide-react';

export function OrderConfirmationPage() {
  const { currentOrder, setCurrentView } = useStore();
  const [paymentReported, setPaymentReported] = useState(false);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  if (!currentOrder) {
    setCurrentView('shop');
    return null;
  }

  const isPending = currentOrder.status === 'pending-payment';

  return (
    <div className="min-h-screen bg-surface">
      <div className="section-padding py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success/Pending Icon */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 ${isPending ? 'bg-gold/10' : 'bg-fresh/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {isPending ? (
                <Clock className="w-10 h-10 text-gold" />
              ) : (
                <Check className="w-10 h-10 text-fresh" />
              )}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-forest mb-2">
              {isPending ? 'Order Pending' : 'Order Confirmed!'}
            </h1>
            <p className="text-muted-foreground">
              {isPending 
                ? 'Please complete your payment to finalize your order. Your items have been reserved.'
                : 'Thank you for choosing botanical protection. Your organic fortress is being prepared.'}
            </p>
          </div>

          {/* Order Card */}
          <div className="bg-white rounded-2xl overflow-hidden mb-6">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Confirmation Number
                  </p>
                  <p className="font-display font-bold text-forest bg-forest/10 px-3 py-1.5 rounded-lg inline-block">
                    {currentOrder.trackingNumber}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span className={isPending ? 'badge-warning' : 'badge-info'}>
                    {isPending ? 'Pending Payment' : 'Processing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 border-b border-outline-variant">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-forest" />
                <h2 className="font-display font-semibold text-forest">Order Summary</h2>
              </div>

              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-forest text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-forest">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-outline-variant my-4" />

              <div className="space-y-3">
                {currentOrder.couponCode && (
                  <div className="flex items-center justify-between rounded-xl bg-[#FCB006]/10 px-4 py-3">
                    <span className="text-sm text-slate-600">Referral code</span>
                    <span className="font-mono text-sm font-bold text-[#9a6a00]">{currentOrder.couponCode}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (7.5%)</span>
                  <span className="font-medium text-forest">{formatPrice(currentOrder.tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-forest">Total Paid</span>
                  <span className="font-display font-bold text-xl text-forest">
                    {formatPrice(currentOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-forest" />
                <h2 className="font-display font-semibold text-forest">Delivery Address</h2>
              </div>
              <div className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                <MapPin className="w-5 h-5 text-fresh flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-forest">{currentOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentOrder.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentOrder.city}, {currentOrder.state}, Nigeria
                  </p>
                </div>
              </div>

              {currentOrder.paymentMethod === 'Bank Transfer' && (
                <div className="mt-6 p-6 bg-gold/10 rounded-2xl border-2 border-dashed border-gold/30 animate-pulse-subtle">
                  <h3 className="font-display font-bold text-forest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    Complete Your Payment
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bank Name</span>
                      <span className="font-bold text-forest">Access Bank</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="font-bold text-forest text-lg tracking-wider">0823273153</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account Name</span>
                      <span className="font-bold text-forest uppercase text-xs">Haifly trap ventures</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gold/20">
                      <span className="text-muted-foreground">Amount to Pay</span>
                      <span className="font-bold text-gold">{formatPrice(currentOrder.total)}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-muted-foreground leading-tight">
                    * Please use your tracking number <strong>{currentOrder.trackingNumber}</strong> as reference. Send proof of payment to WhatsApp for faster processing.
                  </p>

                  {!paymentReported ? (
                    <button 
                      onClick={() => setPaymentReported(true)}
                      className="w-full mt-5 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold/90 transition-colors shadow-sm"
                    >
                      I have paid
                    </button>
                  ) : (
                    <div className="mt-5 p-3 bg-forest/10 text-forest text-center text-sm font-semibold rounded-xl border border-forest/20">
                      Payment reported! Admin is verifying...
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 p-4 bg-fresh/5 rounded-xl">
                <div className="w-8 h-8 bg-fresh/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-fresh" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You will receive an SMS with your rider's details shortly
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setCurrentView('track-order')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-forest text-white font-semibold rounded-full hover:bg-forest-light transition-colors btn-anim"
            >
              <span>Track My Order</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </button>
            <button
              onClick={() => setCurrentView('shop')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-outline-variant text-forest font-semibold rounded-full hover:bg-white transition-colors btn-anim"
            >
              <ShoppingBag className="w-4 h-4 relative z-10" />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Support */}
          <div className="bg-white rounded-2xl p-6">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Questions? Reach our expert team:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:08031301311"
                className="flex items-center gap-2 text-forest hover:text-fresh transition-colors"
              >
                <Phone className="w-4 h-4" />
                08031301311
              </a>
              <a
                href="https://wa.me/2348031301311?text=Hi%2C%20I%20have%20a%20question%20about%20my%20recent%20order."
                className="flex items-center gap-2 text-forest hover:text-fresh transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
