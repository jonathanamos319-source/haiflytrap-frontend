import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '@/components/ProductCard';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Check, 
  CheckCircle, 
  CreditCard, 
  Minus,
  Plus,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Lottie from 'lottie-react';
import truckAnimation from '../lotties/wired-outline-497-truck-delivery-in-reveal.json';

export function ProductDetailPage() {
  const { selectedProduct, setCurrentView, addToCart, products, isLoadingProducts, isTransitioning, activeCouponCode, isBackendDown, isCheckingBackend, isRetrying } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [variant, setVariant] = useState<'indoor' | 'outdoor'>('indoor');

  useEffect(() => {
    if (selectedProduct?.minQuantity) {
      setQuantity(selectedProduct.minQuantity);
    } else {
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="section-padding py-12 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-surface-high rounded-[32px]"></div>
            <div className="space-y-6">
              <div className="h-4 bg-surface-high rounded w-24"></div>
              <div className="h-10 bg-surface-high rounded-2xl w-3/4"></div>
              <div className="h-6 bg-surface-high rounded w-1/4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-surface-high rounded w-full"></div>
                <div className="h-4 bg-surface-high rounded w-full"></div>
                <div className="h-4 bg-surface-high rounded w-2/3"></div>
              </div>
              <div className="h-14 bg-surface-high rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    setCurrentView('shop');
    return null;
  }

  const relatedProducts = products
    .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const currentPrice = selectedProduct.hasIndoorOutdoorVariants 
    ? (variant === 'indoor' ? selectedProduct.indoorPrice : selectedProduct.outdoorPrice) || selectedProduct.price
    : selectedProduct.price;

  const handleAddToCart = () => {
    const productToCart = { 
      ...selectedProduct, 
      price: currentPrice,
      name: selectedProduct.hasIndoorOutdoorVariants 
        ? `${selectedProduct.name} (${variant === 'indoor' ? 'Indoor' : 'Outdoor'})`
        : selectedProduct.name
    };
    addToCart(productToCart, quantity);
  };

  const handleBuyNow = () => {
    if (isBackendDown && !isCheckingBackend && !isRetrying) {
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311';
      const productName = selectedProduct.hasIndoorOutdoorVariants 
        ? `${selectedProduct.name} (${variant === 'indoor' ? 'Indoor' : 'Outdoor'})`
        : selectedProduct.name;
      const text = `Hi, I want to buy ${quantity} unit(s) of ${productName} (Price: ${formatPrice(currentPrice)})`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
      return;
    }
    handleAddToCart();
    setCurrentView('cart');
  };

  const productImages = (selectedProduct.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image]).map(optimizeCloudinaryUrl);

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-outline-variant">
        <div className="section-padding py-2 md:py-4">
          <button
            onClick={() => setCurrentView('shop')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors no-anim"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </button>
        </div>
      </div>

      <div className="section-padding py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              {/* Dynamic Status Banner */}
              {(selectedProduct.manualOutOfStock || selectedProduct.isLimited) && (
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-9 flex items-center z-20 shadow-md">
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
              <img
                id="product-detail-hero-image"
                src={productImages[selectedImage]}
                alt={selectedProduct.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden bg-white border-2 transition-colors no-anim ${
                    selectedImage === i ? 'border-forest' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div id="product-detail-content" className={isTransitioning ? 'opacity-0' : 'opacity-100'}>
            {selectedProduct.badge && (
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
                selectedProduct.badge === 'bestseller' ? 'bg-gold/10 text-gold' :
                selectedProduct.badge === 'sale' ? 'bg-red-500/10 text-red-500' :
                selectedProduct.badge === 'new' ? 'bg-fresh/10 text-fresh' :
                'bg-forest/10 text-forest'
              }`}>
                {selectedProduct.badge.toUpperCase()}
              </span>
            )}

            <h1 className="font-display font-bold text-2xl md:text-3xl text-forest mb-2">
              {selectedProduct.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-display font-bold text-forest">
                {formatPrice(currentPrice)}
              </span>
              {(selectedProduct.originalPriceLabel || selectedProduct.originalPrice) && (
                <span className="text-lg text-muted-foreground strike-anim">
                  {selectedProduct.originalPriceLabel || formatPrice(selectedProduct.originalPrice!)}
                </span>
              )}
            </div>

            {/* Indoor/Outdoor Switch */}
            {selectedProduct.hasIndoorOutdoorVariants && (
              <div className="mb-8">
                <span className="text-sm font-bold text-forest uppercase tracking-widest block mb-4">Select Environment</span>
                <div className="flex p-1.5 bg-white/50 backdrop-blur rounded-2xl border border-outline-variant w-fit">
                  <button
                    onClick={() => setVariant('indoor')}
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                      variant === 'indoor' 
                        ? 'bg-forest text-white shadow-lg' 
                        : 'text-muted-foreground hover:text-forest'
                    }`}
                  >
                    <span>Indoor</span>
                  </button>
                  <button
                    onClick={() => setVariant('outdoor')}
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                      variant === 'outdoor' 
                        ? 'bg-fresh text-white shadow-lg' 
                        : 'text-muted-foreground hover:text-forest'
                    }`}
                  >
                    <span>Outdoor</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground font-medium italic">
                  *Price adjusted for {variant} formulation strength.
                </p>
              </div>
            )}

            {/* Active Coupon Banner */}
            {activeCouponCode && (
              <div className="mb-6 relative aspect-[3/1] max-w-[320px] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-950 shadow-lg shadow-slate-900/5 animate-in slide-in-from-left-4 duration-500">
                <img src="/coupons/clipped.svg" alt="Active Coupon Applied" loading="lazy" className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Active Voucher Applied</p>
                  <div className="rounded-full bg-slate-950/70 px-4 py-2 shadow-lg backdrop-blur-sm border border-white/10">
                    <span className="block text-center font-mono text-base font-black tracking-[0.25em]" style={{ color: '#FCB006', textShadow: '0 1px 0 rgba(15, 23, 42, 0.65), 0 0 18px rgba(252, 176, 6, 0.15)' }}>
                      {activeCouponCode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { icon: CheckCircle, text: 'NAFDAC: A10-101283' },
                { icon: CreditCard, text: 'Secure Payment' },
                { lottie: truckAnimation, text: selectedProduct.freeDelivery ? 'FREE Delivery' : 'Fast Delivery' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {badge.lottie ? (
                    <div className="w-5 h-5">
                      <Lottie animationData={badge.lottie} loop={true} autoplay={true} />
                    </div>
                  ) : (
                    <badge.icon className="w-4 h-4 text-black" />
                  )}
                  <span className={badge.text === 'FREE Delivery' ? 'text-fresh font-bold' : ''}>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-forest">Quantity</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 bg-white rounded-full p-1 border border-outline-variant">
                  <button
                    onClick={() => setQuantity(Math.max(selectedProduct.minQuantity || 1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors no-anim"
                  >
                    <Minus className="w-4 h-4 relative z-10" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors no-anim"
                  >
                    <Plus className="w-4 h-4 relative z-10" />
                  </button>
                </div>
                {selectedProduct.minQuantity && (
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-2">
                    Min. Order: {selectedProduct.minQuantity} units
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-forest text-white font-semibold rounded-full hover:bg-forest-light transition-colors btn-primary"
              >
                <ShoppingCart className="w-5 h-5 relative z-10" />
                <span>Add to Cart</span>
              </button>
              {isBackendDown && !isCheckingBackend && !isRetrying ? (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20ba5a] transition-all shadow-lg flex items-center gap-2 group"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Order on WhatsApp</span>
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-colors btn-gold"
                >
                  <span>Buy Now</span>
                </button>
              )}
              <button className="w-14 h-14 flex items-center justify-center border border-outline-variant rounded-full hover:bg-surface transition-colors no-anim">
                <Heart className="w-5 h-5 text-forest" />
              </button>
            </div>

            {/* Features */}
            {selectedProduct.features && (
              <div className="space-y-3">
                {selectedProduct.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-fresh" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-6 border-b border-outline-variant mb-6">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${selectedProduct.reviews})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'description' | 'specs' | 'reviews')}
                className={`pb-4 text-sm font-medium relative btn-anim ${
                  activeTab === tab.id
                    ? 'text-forest'
                    : 'text-muted-foreground hover:text-forest'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full z-[1]" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                {selectedProduct.category === 'mosquito-traps' || selectedProduct.id === 'hai-trap-001' ? (
                  <>
                    <h3 className="font-display font-semibold text-forest mb-4">
                      The Ultimate Outdoor Fly Trap
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {selectedProduct.name} is a highly effective, eco-friendly solution for managing houseflies outdoors. Each trap comes with a powerful 500ml liquid refill that attracts and eliminates flies before they enter your home or business.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface rounded-xl p-5">
                        <h4 className="font-semibold text-forest mb-3">How to Use</h4>
                        <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                          <li><strong className="text-forest">Pour:</strong> Empty the 500ml refill directly into the trap container.</li>
                          <li><strong className="text-forest">Hang:</strong> Suspend the trap outdoors, approximately 2 feet above the ground.</li>
                          <li><strong className="text-forest">Reuse:</strong> Once full, throw away the dead flies, clean the container, and reuse.</li>
                        </ol>
                      </div>
                      <div className="bg-surface rounded-xl p-5">
                        <h4 className="font-semibold text-forest mb-3">Best For</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Outdoor spaces & gardens</li>
                          <li>• Farms and livestock areas</li>
                          <li>• Restaurant patios</li>
                          <li>• High-density fly areas</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display font-semibold text-forest mb-4">
                      Uncompromising Protection
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {selectedProduct.name} uses a proprietary blend of botanical extracts that 
                      specifically target the nervous systems of common houseflies without 
                      affecting mammals. Our advanced odourless formula creates an invisible barrier that 
                      lasts up to 24 hours.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface rounded-xl p-5">
                        <h4 className="font-semibold text-forest mb-3">How It Works</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Disrupts fly nervous system</li>
                          <li>• Creates protective barrier</li>
                          <li>• Odourless protection</li>
                          <li>• Safe for humans and pets</li>
                          <li>• Biodegradable formula</li>
                        </ul>
                      </div>
                      <div className="bg-surface rounded-xl p-5">
                        <h4 className="font-semibold text-forest mb-3">Best For</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Indoor housefly control</li>
                          <li>• Homes with children</li>
                          <li>• Pet-friendly households</li>
                          <li>• Eco-conscious families</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specs' && selectedProduct.specifications && (
              <div className="max-w-xl">
                <h3 className="font-display font-semibold text-forest mb-4">Specifications</h3>
                <div className="divide-y divide-outline-variant">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-4">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-forest">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-forest mb-2">
                  Customer Reviews
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedProduct.rating} out of 5 stars based on {selectedProduct.reviews} reviews
                </p>
                <button className="btn-primary">Write a Review</button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-forest">Related Products</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Hand-picked additions for your home protection
                </p>
              </div>
              <button
                onClick={() => setCurrentView('shop')}
                className="flex items-center gap-2 text-forest font-semibold no-anim"
              >
                View All
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
