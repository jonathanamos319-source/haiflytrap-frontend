import { useRef } from 'react';
import { ShoppingCart, Star, Heart, AlertCircle, Sparkles } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { triggerTransition, addToCart } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      // We want to animate the image specifically if possible
      const img = cardRef.current.querySelector('img');
      const rect = img ? img.getBoundingClientRect() : cardRef.current.getBoundingClientRect();
      triggerTransition(product, rect);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  if (variant === 'horizontal') {
    return (
      <div 
        ref={cardRef}
        onClick={handleClick}
        className="flex gap-4 bg-white rounded-2xl p-4 cursor-pointer hover:shadow-card transition-all"
      >
        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface relative">
          <img
            src={optimizeCloudinaryUrl(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {(product.manualOutOfStock || product.isLimited) && (
            <div className="absolute top-0 left-0 right-0 overflow-hidden h-5 flex items-center z-20 shadow-sm">
              <div className="flex w-full h-full animate-[slide_6s_linear_infinite]">
                {product.manualOutOfStock && (
                  <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[7px] tracking-tight shrink-0 gap-1">
                    <AlertCircle className="w-2 h-2 text-red-500" /> OUT OF STOCK
                  </div>
                )}
                {product.isLimited && (
                  <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[7px] tracking-tight shrink-0 gap-1">
                    <Sparkles className="w-2 h-2 text-gold" /> LIMITED
                  </div>
                )}
                {product.manualOutOfStock && (
                  <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[7px] tracking-tight shrink-0 gap-1">
                    <AlertCircle className="w-2 h-2 text-red-500" /> OUT OF STOCK
                  </div>
                )}
                {product.isLimited && (
                  <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[7px] tracking-tight shrink-0 gap-1">
                    <Sparkles className="w-2 h-2 text-gold" /> LIMITED
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-forest truncate">{product.name}</h3>
            </div>
            <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0">
              <p className="font-display font-bold text-forest">{product.priceLabel || formatPrice(product.price)}</p>
              {(product.originalPriceLabel || product.originalPrice) && (
                <p className="text-xs text-muted-foreground strike-anim">
                  {product.originalPriceLabel || formatPrice(product.originalPrice!)}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        ref={cardRef}
        onClick={handleClick}
        className="group cursor-pointer"
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface mb-3">
          <img
            src={optimizeCloudinaryUrl(product.image)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {(product.manualOutOfStock || product.isLimited) ? (
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-7 flex items-center z-20 shadow-sm">
              <div className="flex w-full h-full animate-[slide_8s_linear_infinite]">
                {product.manualOutOfStock && (
                  <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[9px] tracking-widest shrink-0 gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500" /> OUT OF STOCK
                  </div>
                )}
                {product.isLimited && (
                  <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[9px] tracking-widest shrink-0 gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold" /> LIMITED
                  </div>
                )}
                {product.manualOutOfStock && (
                  <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[9px] tracking-widest shrink-0 gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500" /> OUT OF STOCK
                  </div>
                )}
                {product.isLimited && (
                  <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[9px] tracking-widest shrink-0 gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold" /> LIMITED
                  </div>
                )}
              </div>
            </div>
          ) : product.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${
              product.badge === 'bestseller' ? 'bg-gold text-white' :
              product.badge === 'sale' ? 'bg-red-500 text-white' :
              product.badge === 'new' ? 'bg-fresh text-white' :
              'bg-forest/80 text-white'
            }`}>
              {product.badge === 'eco-friendly' ? 'ECO FRIENDLY' : product.badge.toUpperCase()}
            </span>
          )}
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 bg-forest text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all no-anim"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-display font-semibold text-forest text-sm truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <p className="font-display font-bold text-forest">{product.priceLabel || formatPrice(product.price)}</p>
            {(product.originalPriceLabel || product.originalPrice) && (
              <p className="text-[10px] text-muted-foreground strike-anim">
                {product.originalPriceLabel || formatPrice(product.originalPrice!)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-card transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <img
          src={optimizeCloudinaryUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Dynamic Status Carousel/Banner */}
        {(product.manualOutOfStock || product.isLimited) ? (
          <div className="absolute top-0 left-0 right-0 overflow-hidden h-7 md:h-8 flex items-center z-20 shadow-md">
            <div className="flex w-full h-full animate-[slide_10s_linear_infinite]">
              {product.manualOutOfStock && (
                <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[10px] md:text-[12px] tracking-[0.1em] shrink-0 gap-2">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" /> OUT OF STOCK
                </div>
              )}
              {product.isLimited && (
                <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[10px] md:text-[12px] tracking-[0.1em] shrink-0 gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold" /> LIMITED
                </div>
              )}
              {/* Loop */}
              {product.manualOutOfStock && (
                <div className="min-w-full h-full flex items-center justify-center bg-white text-slate-800 font-bold uppercase text-[10px] md:text-[12px] tracking-[0.1em] shrink-0 gap-2">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" /> OUT OF STOCK
                </div>
              )}
              {product.isLimited && (
                <div className="min-w-full h-full flex items-center justify-center bg-[#D9F99D] text-slate-800 font-bold uppercase text-[10px] md:text-[12px] tracking-[0.1em] shrink-0 gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold" /> LIMITED
                </div>
              )}
            </div>
          </div>
        ) : product.badge && (
          <span className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold rounded-full ${
            product.badge === 'bestseller' ? 'bg-gold text-white' :
            product.badge === 'sale' ? 'bg-red-500 text-white' :
            product.badge === 'new' ? 'bg-fresh text-white' :
            'bg-forest/80 text-white'
          }`}>
            {product.badge === 'eco-friendly' ? 'ECO FRIENDLY' : product.badge.toUpperCase()}
          </span>
        )}

        <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white no-anim">
          <Heart className="w-4 h-4 text-forest" />
        </button>

        {/* Proof of Efficacy: Small Dead Fly */}
        <img 
          src="/images/dead_house_fly_final.png" 
          alt="" 
          className="absolute bottom-2 left-2 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-10 rotate-12 mix-blend-multiply" 
          style={{ clipPath: 'circle(36%)' }}
        />
      </div>

      {/* Content */}
      <div className="p-3 md:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2 mb-1.5 md:mb-2">
          <h3 className="font-display font-semibold text-forest text-sm md:text-base line-clamp-1">{product.name}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 mb-2 md:mb-4 hidden sm:block">{product.description}</p>

        
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="min-w-0">
            <p className="font-display font-bold text-sm md:text-lg text-forest truncate">{product.priceLabel || formatPrice(product.price)}</p>
            {(product.originalPriceLabel || product.originalPrice) && (
              <p className="text-[10px] md:text-sm text-muted-foreground strike-anim truncate">
                {product.originalPriceLabel || formatPrice(product.originalPrice!)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2.5 bg-forest text-white text-xs md:text-sm font-semibold rounded-full transition-all btn-anim flex-shrink-0 shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
            <span className="hidden md:inline relative z-10">Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
}
