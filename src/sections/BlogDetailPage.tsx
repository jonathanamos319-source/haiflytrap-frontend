import React, { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { 
  Clock, Calendar, User, ArrowLeft, 
  ChevronRight, ShoppingBag, X,
  Sparkles
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export function BlogDetailPage() {
  const { 
    selectedBlog, setSelectedBlog, setCurrentView, blogs, 
    products, triggerTransition, isBackendDown, isCheckingBackend 
  } = useStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [dismissedSticky, setDismissedSticky] = useState(false);

  // Helper for Cloudinary optimization
  const optimizeImage = (url: string | null) => {
    if (!url) return '/images/Broadkillersurefacespray.png';
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
    }
    return url;
  };

  // Internal Linking Logic
  const renderContentWithLinks = (content: string) => {
    let linkedContent = content;
    
    // Link products
    products.forEach(product => {
      const regex = new RegExp(`\\b${product.name}\\b`, 'gi');
      linkedContent = linkedContent.replace(regex, (match) => 
        `<span class="text-gold font-bold cursor-pointer hover:underline" data-product-id="${product.id}">${match}</span>`
      );
    });

    return linkedContent.split('\n\n');
  };

  const relatedPosts = blogs
    .filter(b => b.id !== selectedBlog?.id && (b.category === selectedBlog?.category || !selectedBlog?.category))
    .slice(0, 3);

  // SEO & Head injection
  useEffect(() => {
    if (!selectedBlog) return;

    const brandName = 'Haifly Trap';
    const title = `${selectedBlog.title} | ${brandName}`;
    const description = selectedBlog.excerpt || selectedBlog.content.substring(0, 155) + '...';
    const keywords = `${selectedBlog.category || 'Housefly Control'}, ${selectedBlog.tags?.join(', ') || 'Boardkiller'}`;
    const url = window.location.href;
    const image = selectedBlog.image_url || '/images/Broadkillersurefacespray.png';

    // Basic Meta
    document.title = title;
    
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'article' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ];

    const elements: HTMLMetaElement[] = [];
    metaTags.forEach(tag => {
      let el = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        if (tag.name) el.setAttribute('name', tag.name);
        if (tag.property) el.setAttribute('property', tag.property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', tag.content!);
      elements.push(el);
    });

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Schema Markup
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": selectedBlog.title,
      "image": image,
      "author": { "@type": "Organization", "name": brandName },
      "publisher": { "@type": "Organization", "name": brandName },
      "datePublished": selectedBlog.created_at,
      "dateModified": selectedBlog.updated_at,
      "description": description
    };
    
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);

    return () => {
      // Cleanup optionally, or leave for next page
    };
  }, [selectedBlog]);

  // Scroll & Exit Intent
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      if (scrolled > 30 && !dismissedSticky) setShowStickyCTA(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitPopupShown) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitPopupShown, dismissedSticky]);

  if (!selectedBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => setCurrentView('blog')} className="text-gold font-bold flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Blog
        </button>
      </div>
    );
  }

  // Reading time estimate
  const wordsPerMinute = 200;
  const words = selectedBlog.content.split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  const trapProduct = products.find(p => p.id === 'hai-trap-001');
  const tenLitreProduct = products.find(p => p.id === 'bk-10l-001');

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20 overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[110] bg-outline-variant">
        <div 
          className="h-full bg-gold transition-all duration-150" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Breadcrumbs */}
      <nav className="pt-8 px-4 md:px-12 max-w-4xl mx-auto flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => setCurrentView('blog')} className="hover:text-forest">Blog</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-forest font-medium truncate">{selectedBlog.title}</span>
      </nav>

      <article className="px-4 md:px-12 max-w-4xl mx-auto relative">
        {/* Decorative Dead Fly */}
        <img
          src="/images/dead_house_fly_final.png"
          alt=""
          className="absolute top-10 right-0 w-14 h-14 opacity-100 rotate-[45deg] pointer-events-none mix-blend-multiply z-10"
          style={{ clipPath: 'circle(36%)' }}
        />
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-outline-variant">
              <Calendar className="w-4 h-4 text-gold" />
              {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-outline-variant">
              <Clock className="w-4 h-4 text-gold" />
              {readingTime} min read
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-outline-variant">
              <User className="w-4 h-4 text-gold" />
              Ifidon Alufohai, Founder and CEO
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-forest leading-tight mb-8">
            {selectedBlog.title}
          </h1>

          {selectedBlog.image_url && (
            <div className="relative rounded-[32px] overflow-hidden aspect-video shadow-2xl mb-12 border-8 border-white">
              <img 
                src={optimizeImage(selectedBlog.image_url)} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover"
                loading="eager"
              />
              <link rel="preload" as="image" href={optimizeImage(selectedBlog.image_url)} />
            </div>
          )}
        </header>

        {/* Distributor CTA */}
        <section className="relative flex items-center overflow-hidden rounded-3xl mb-12">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/bulk-order-bg.png')" }}
          />
          {/* Dark Black Overlay for extra contrast */}
          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-10 w-full p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left flex-1 w-full">
                <h2 className="text-white text-2xl md:text-3xl font-display font-black leading-tight">
                  Want to become a <span className="text-gold">Distributor?</span>
                </h2>
                <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed mt-2">
                  Got a bulk order? We offer special rates for wholesalers and distributors.
                </p>
              </div>

              <button
                onClick={() => window.open('https://wa.me/2348031301311?text=Hi%2C%20I%20am%20interested%20in%20becoming%20a%20Haifly%20Trap%20distributor.', '_blank')}
                className="group bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-3 hover:bg-[#20ba5a] active:scale-[0.98] shadow-xl w-full md:w-auto flex-shrink-0"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 md:w-6 md:h-6 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-base md:text-lg">Talk on WhatsApp</span>
              </button>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none text-forest/80 leading-relaxed mb-16">
          {renderContentWithLinks(selectedBlog.content).map((paragraph, i) => (
            <React.Fragment key={i}>
              <p className="mb-6" dangerouslySetInnerHTML={{ __html: paragraph }} onClick={(e) => {
                const target = e.target as HTMLElement;
                const productId = target.getAttribute('data-product-id');
                if (productId) {
                  const product = products.find(p => p.id === productId);
                  if (product) triggerTransition(product, target.getBoundingClientRect());
                }
              }} />
              
              {/* MIDDLE CTA: Specific Product Cards (shows after 2nd paragraph) */}
              {i === 1 && (trapProduct || tenLitreProduct) && (
                <div className="my-12 p-1 bg-gradient-to-br from-gold/30 to-fresh/30 rounded-[28px] shadow-lg">
                  <div className="bg-white rounded-[24px] p-2 flex flex-col gap-4">
                    {trapProduct && <ProductCard product={trapProduct} variant="horizontal" />}
                    {tenLitreProduct && <ProductCard product={tenLitreProduct} variant="horizontal" />}
                    <div className="p-2 pt-0 flex justify-center">
                      {isBackendDown && !isCheckingBackend ? (
                        <a 
                          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gold text-white px-8 py-4 rounded-xl font-bold hover:bg-forest transition-all flex items-center justify-center gap-2 w-full md:w-auto shadow-md"
                        >
                          Order on WhatsApp <ShoppingBag className="w-5 h-5" />
                        </a>
                      ) : (
                        <button 
                          onClick={() => setCurrentView('shop')}
                          className="bg-gold text-white px-8 py-4 rounded-xl font-bold hover:bg-forest transition-all flex items-center justify-center gap-2 w-full md:w-auto shadow-md"
                        >
                          Shop Now <ShoppingBag className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* END CTA: Closing Section */}
        <div className="relative rounded-[40px] p-10 md:p-16 text-center mb-16 border border-gold/20 overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/restaurant_bar_bg.png')" }}
          />
          {/* Dark Black Overlay for extra contrast */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Too much house flies in your restaurant or lounge?</h2>
            <p className="text-white/90 mb-8 text-lg font-medium">
              Join thousands of protected homes and businesses. Get free shipping on all orders over ₦50,000 today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isBackendDown && !isCheckingBackend ? (
                <a 
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold text-forest px-10 py-5 rounded-2xl font-black hover:bg-white hover:text-forest transition-all shadow-lg w-full sm:w-auto"
                >
                  Order on WhatsApp
                </a>
              ) : (
                <button 
                  onClick={() => setCurrentView('shop')}
                  className="bg-gold text-forest px-10 py-5 rounded-2xl font-black hover:bg-white hover:text-forest transition-all shadow-lg w-full sm:w-auto"
                >
                  Shop the Collection
                </button>
              )}
              <button 
                onClick={() => isBackendDown && !isCheckingBackend ? window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`, '_blank') : setCurrentView('shop')}
                className="bg-transparent text-white border-2 border-white px-10 py-5 rounded-2xl font-bold hover:bg-white hover:text-forest transition-all w-full sm:w-auto"
              >
                {isBackendDown && !isCheckingBackend ? 'Order via WhatsApp' : 'View All Products'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <section className="border-t border-outline-variant pt-16">
          <h2 className="text-2xl md:text-3xl font-black text-forest mb-8">Related Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map(post => (
              <article 
                key={post.id} 
                className="group cursor-pointer bg-white rounded-3xl p-4 border border-outline-variant hover:shadow-card transition-all"
                onClick={() => {
                  setSelectedBlog(post);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="relative h-40 mb-4 overflow-hidden rounded-2xl">
                  <img 
                    src={optimizeImage(post.image_url)} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-bold text-forest line-clamp-2 group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
              </article>
            ))}
            {relatedPosts.length === 0 && (
              <p className="text-muted-foreground italic col-span-full">Loading more insights for you...</p>
            )}
          </div>
        </section>
      </article>

      {/* Floating Sticky CTA */}
      {showStickyCTA && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[105] animate-in slide-in-from-bottom-10 duration-500 px-4 w-full max-w-md">
          <div className="bg-forest text-white py-3 px-4 md:px-6 rounded-full shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-md">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => isBackendDown && !isCheckingBackend ? window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`, '_blank') : setCurrentView('shop')}
            >
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs md:text-sm font-bold truncate">{isBackendDown && !isCheckingBackend ? '💬 Chat to order from this post →' : '🛍️ Shop looks from this post →'}</span>
            </div>
            <button 
              onClick={() => {
                setShowStickyCTA(false);
                setDismissedSticky(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-surface rounded-full flex items-center justify-center text-forest hover:bg-outline-variant transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative h-48">
              <img src="/images/Broadkillersurefacespray.png" alt="Discount" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-black">Wait! Before you go...</h3>
              </div>
            </div>
            <div className="p-8 text-center">
              <p className="text-forest/70 mb-6">
                Get <span className="text-fresh font-bold text-xl">10% OFF</span> your first order. Use code <span className="text-gold font-bold">WELCOME10</span> at checkout.
              </p>
              <div className="bg-surface rounded-2xl p-4 mb-6 border-2 border-dashed border-gold/30">
                <span className="text-2xl font-black text-forest tracking-widest uppercase">WELCOME10</span>
              </div>
              <button 
                onClick={() => {
                  if (isBackendDown && !isCheckingBackend) {
                    window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20use%20code%20WELCOME10`, '_blank');
                  } else {
                    setCurrentView('shop');
                  }
                  setShowExitPopup(false);
                }}
                className="w-full py-4 bg-forest text-white rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg"
              >
                {isBackendDown && !isCheckingBackend ? 'Claim via WhatsApp' : 'Claim Discount Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
