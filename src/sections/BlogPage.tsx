import { useStore } from '@/hooks/useStore';
import { 
  ArrowUpRight, ArrowRight, Clock, ShieldCheck, Bug, Stethoscope, Beer, 
  Hotel, Trees, Dog, X, CheckCircle2, Search, ChevronRight,
  Calendar
} from 'lucide-react';
import { LeavesBackground } from '@/components/LeavesBackground';
import Lottie from 'lottie-react';
import truckAnimation from '../lotties/wired-outline-497-truck-delivery-in-reveal.json';
import { useState, useMemo, useRef, useEffect } from 'react';
import { WaveDivider } from '@/components/WaveDivider';

export function BlogPage() {
  const { setCurrentView, blogs, isLoadingBlogs, setSelectedBlog, searchQuery, setSearchQuery, isBackendDown } = useStore();
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit(prev => prev + 6);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = ['all', 'housefly control', 'health', 'hygiene', 'safety'];

  const filteredBlogs = useMemo(() => {
    return blogs.filter(post => {
      const matchesSearch = (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (post.content?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, activeCategory]);

  const handleBlogClick = (post: any) => {
    setSelectedBlog(post);
    setCurrentView('blog-post');
  };

  const useCases = [
    { 
      title: 'Veterinary Clinics', 
      icon: Stethoscope, 
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Spray on floors, examination tables, and kennels. It is safe for animals once the surface is dry. Effectively eliminates fleas, ticks, and carrier flies.'
    },
    { 
      title: 'Bars & Lounges', 
      icon: Beer, 
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Apply around entrances, waste disposal areas, and under furniture. The odorless formula ensures your customers enjoy their experience without chemical smells.'
    },
    { 
      title: 'Hospitals', 
      icon: ShieldCheck, 
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Designed for high-traffic waiting areas and kitchens. Provides a sterile barrier against disease-carrying flies while remaining safe for medical environments.'
    },
    { 
      title: 'Hotels & Public Spaces', 
      icon: Hotel, 
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Perfect for lobbies, guest rooms, and pool areas. Spray once every 48 hours for continuous protection in open environments.'
    },
    { 
      title: 'Horse Stables', 
      icon: Dog, 
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Spray directly on stable walls, stall doors, and around bedding. Prevents stable flies from irritating horses and maintains a hygienic environment.'
    },
    { 
      title: 'Farms & Ranches', 
      icon: Trees, 
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
      howToUse: 'Apply in barns, milking parlors, and storage sheds. Our botanical formula is safe for livestock and highly effective in large, open agricultural spaces.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20 overflow-x-hidden">
      {/* Breadcrumbs */}
      <nav className="pt-8 px-4 md:px-12 max-w-7xl mx-auto flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-forest font-medium">Blog</span>
      </nav>
      {/* Hero Section */}
      <section className="pt-6 md:pt-10 pb-8 px-4 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
        <LeavesBackground opacity={0.12} />
        {/* Floating Dead Fly */}
        <img
          src="/images/dead_house_fly_final.png"
          alt=""
          className="absolute top-4 right-[20%] w-12 h-12 opacity-80 rotate-[30deg] pointer-events-none mix-blend-multiply z-10"
          style={{ clipPath: 'circle(36%)' }}
        />
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-5xl md:text-6xl font-black text-forest leading-tight mb-8 tracking-tight">
              Protect Your <br className="hidden md:block" />
              <span className="text-gold">Space & Health</span>
            </h1>
            <p className="text-muted-foreground font-bold text-lg mb-8 max-w-lg leading-relaxed">
              Flies are more than just a nuisance—they are carriers of dangerous pathogens. Boardkiller surface spray is your ultimate defense, providing a safe and sterile environment since 2026.
            </p>
            {isBackendDown ? (
              <a 
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-forest text-white px-8 py-4 rounded-full font-bold hover:bg-forest/90 transition-all flex items-center gap-2 btn-anim"
              >
                Order on WhatsApp <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            ) : (
              <button 
                onClick={() => setCurrentView('shop')}
                className="bg-forest text-white px-8 py-4 rounded-full font-bold hover:bg-forest/90 transition-all flex items-center gap-2 btn-anim"
              >
                Shop Now <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}
          </div>
          <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
            <img 
              src="/images/Broadkillersurefacespray.png" 
              alt="Boardkiller Surface Spray" 
              className="rounded-2xl md:rounded-3xl object-cover h-48 md:h-96 w-full shadow-lg"
            />
            <div className="flex flex-col justify-end">
               <img 
                src="/images/TRAPIMG1.png" 
                alt="Fly Trap" 
                className="rounded-2xl md:rounded-3xl object-cover h-32 md:h-64 w-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Harms & Solution Section */}
      <section className="bg-forest text-white py-6 md:py-10 px-4 md:px-12 mt-4 md:mt-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-center mb-8 leading-tight">
            The Hidden Harms of Flies & <br className="hidden md:block" />
            Our Ultimate Solution
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            <div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-gold">
                <Bug className="w-6 h-6" />
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                Flies carry over 100 pathogens that can cause diseases in humans and animals, including typhoid, cholera, and dysentery. They contaminate food and surfaces instantly upon landing, making them a severe health hazard in any environment.
              </p>
            </div>
            <div>
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-fresh">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                Boardkiller surface spray is formulated to eliminate flies efficiently while leaving a protective barrier. It's designed for maximum potency against houseflies while ensuring safety for the surrounding environment when used as directed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Where to Use Section */}
      <section className="py-6 md:py-10 px-4 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
        <LeavesBackground opacity={0.08} />
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-forest mb-4">Where To Use Boardkiller</h2>
            <p className="text-muted-foreground max-w-2xl">Versatile protection designed for professional and commercial spaces.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div 
              key={index} 
              className="group cursor-pointer"
              onClick={() => setSelectedUseCase(useCase)}
            >
              <div className="relative h-64 mb-4 overflow-hidden rounded-2xl shadow-sm">
                <img 
                  src={useCase.image} 
                  alt={useCase.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <useCase.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">{useCase.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fast Delivery Section */}
      <section className="py-4 md:py-6 px-4 md:px-12 bg-gold/5 my-2 overflow-hidden relative">
        {/* Decorative Dead Fly */}
        <img
          src="/images/dead_house_fly_final.png"
          alt=""
          className="absolute bottom-10 left-[10%] w-16 h-16 opacity-100 rotate-[-45deg] pointer-events-none mix-blend-multiply z-10"
          style={{ clipPath: 'circle(36%)' }}
        />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
               <div className="w-12 h-12 mb-4">
                <Lottie animationData={truckAnimation} loop={true} autoplay={true} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-forest mb-4">Ultra-Fast Delivery</h2>
              <p className="text-base md:text-lg text-forest/80 mb-6 leading-relaxed font-medium">
                <span className="text-gold font-bold">Same day delivery in Lagos</span>; 24-48 hours delivery nationwide. <br className="hidden md:block" />
                We understand that housefly problems require immediate solutions.
              </p>
              <button 
                onClick={() => setCurrentView('shop')}
                className="bg-forest text-white px-8 py-3 rounded-xl font-bold hover:bg-forest/90 transition-all shadow-lg btn-anim"
              >
                Order Now
              </button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group max-w-md mx-auto">
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gold/10 rounded-[32px] blur-2xl group-hover:bg-gold/20 transition-colors duration-500 opacity-60" />
                
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white/50">
                  <img 
                    src="/images/delivery-modal.png" 
                    alt="Ultra Fast Delivery" 
                    className="w-full h-full object-cover aspect-video md:max-h-[280px] transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/20 to-transparent opacity-60" />
                </div>

                {/* Floating Badge Detail */}
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl hidden md:flex items-center gap-3 border border-outline-variant animate-bounce-slow">
                  <div className="w-10 h-10 bg-fresh/10 rounded-full flex items-center justify-center p-1">
                    <Lottie animationData={truckAnimation} loop={true} autoplay={true} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status</p>
                    <p className="text-sm font-black text-forest">On its way!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News / Blog Section */}
      <section className="py-8 md:py-12 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-forest">Latest News</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-forest text-white shadow-lg' 
                  : 'bg-white text-forest hover:bg-surface border border-outline-variant'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        {isLoadingBlogs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-surface-high h-48 rounded-2xl mb-4"></div>
                <div className="h-6 bg-surface-high rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-surface-high rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.slice(0, displayLimit).map((post) => (
                <article 
                  key={post.id} 
                  className="group cursor-pointer bg-white rounded-3xl p-4 border border-outline-variant hover:shadow-card transition-all"
                  onClick={() => handleBlogClick(post)}
                >
                  <div className="relative h-48 mb-6 overflow-hidden rounded-2xl shadow-sm">
                    <img 
                      src={post.image_url || '/images/Broadkillersurefacespray.png'} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gold shadow-sm">
                      {post.category || 'Housefly Control'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(post.content.split(' ').length / 200)} min read
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-forest mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 120) + '...'}
                  </p>
                  
                  <div className="flex items-center text-gold font-bold text-sm">
                    Read Article <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
            {filteredBlogs.length > displayLimit && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-10">
                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant">
            <p className="text-muted-foreground">No articles match your search or category.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
              className="mt-4 text-gold font-bold underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* How to Use Modal */}
      {selectedUseCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative h-48">
              <img 
                src={selectedUseCase.image} 
                alt={selectedUseCase.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUseCase(null);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 text-white mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                    <selectedUseCase.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Use Case</span>
                </div>
                <h3 className="text-2xl font-black text-white">{selectedUseCase.title}</h3>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-2 text-fresh font-bold mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>How To Apply</span>
              </div>
              <p className="text-forest/80 leading-relaxed text-lg mb-8">
                {selectedUseCase.howToUse}
              </p>
              <button 
                onClick={() => setSelectedUseCase(null)}
                className="w-full py-4 bg-forest text-white rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg hover:shadow-xl"
              >
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
