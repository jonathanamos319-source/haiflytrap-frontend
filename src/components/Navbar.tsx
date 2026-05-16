import { useStore } from '@/hooks/useStore';
import { User, Search, Menu, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import cartAnimation from '../lotties/system-solid-6-shopping-hover-pinch.json';
import { supabaseUser } from '@/lib/supabase';

export function Navbar() {
  const { cartCount, setCurrentView, currentView, searchQuery, setSearchQuery, isBackendDown, isCheckingBackend } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    supabaseUser.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabaseUser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });


    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { label: 'Home', view: 'home' as const },
    { label: 'Shop', view: 'shop' as const, disabled: isBackendDown && !isCheckingBackend },
    { label: 'About', view: 'reviews' as const },
    { label: 'Track Order', view: 'track-order' as const, disabled: isBackendDown && !isCheckingBackend },
  ];

  const showBackButton = currentView !== 'home';

  const isActive = (view: string) => currentView === view;

  return (
      <nav 
        className={`fixed left-1/2 -translate-x-1/2 z-50 flex flex-col transition-[width,background-color,backdrop-filter,border-color,border-radius,box-shadow,transform] duration-300 ease-in-out ${
          isScrolled && !isMenuOpen && !isSearchOpen
            ? 'top-0 translate-y-4 w-[calc(100%-2rem)] max-w-7xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl md:rounded-full px-4 md:px-8' 
            : 'top-0 translate-y-0 w-full bg-white border-b border-outline-variant rounded-none px-4 md:px-12 shadow-sm'
        }`}
      >
      <div className="flex items-center justify-between min-h-[64px] md:min-h-[80px] w-full">
        <div className="flex items-center gap-2">
          {/* Back Button - Mobile Only */}
          <div className="md:hidden">
            {showBackButton && (
              <button 
                onClick={() => setCurrentView('home')}
                className="p-1.5 hover:bg-surface-high rounded-full transition-colors flex items-center justify-center -ml-1 no-anim"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 text-forest" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center group overflow-hidden no-anim"
          >
            <img 
              src="/products/HAIFLYLOGO.webp" 
              alt="Haifly Logo" 
              width="150"
              height="56"
              className="h-9 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => !link.disabled && setCurrentView(link.view)}
              disabled={link.disabled}
              className={`px-3.5 py-2 text-sm font-medium transition-all relative btn-anim rounded-xl ${
                link.disabled ? 'opacity-40 cursor-not-allowed' :
                isActive(link.view)
                  ? 'text-forest font-bold'
                  : 'text-muted-foreground hover:text-forest'
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {isActive(link.view) && !link.disabled && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gold rounded-full z-10" />
              )}
            </button>
          ))}
          
          {/* More Dropdown */}
            <div className="relative group">
              <button 
                disabled={isBackendDown && !isCheckingBackend}
                className={`px-3.5 py-2 text-sm font-medium transition-all btn-anim rounded-xl flex items-center gap-1 ${
                  isBackendDown ? 'opacity-40 cursor-not-allowed' :
                  isActive('blog') || isActive('settings') || isActive('customer-login')
                    ? 'text-forest font-bold'
                    : 'text-muted-foreground hover:text-forest'
                }`}>
                <span>More</span>
                <ChevronDown className="w-4 h-4" />
                {!isBackendDown && (isActive('blog') || isActive('settings') || isActive('customer-login')) && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gold rounded-full z-10" />
                )}
              </button>
              {!(isBackendDown && !isCheckingBackend) && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col overflow-hidden z-50">
                  <button 
                    onClick={() => setCurrentView('blog')} 
                    className="px-4 py-3 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium border-b border-outline-variant/50"
                  >
                    Blog
                  </button>
                  {session ? (
                    <>
                      <button 
                        onClick={() => setCurrentView('recent-orders')} 
                        className="px-4 py-3 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium border-b border-outline-variant/50"
                      >
                        Recent Orders
                      </button>
                      <button 
                        onClick={() => setCurrentView('settings')} 
                        className="px-4 py-3 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium"
                      >
                        Account Settings
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setCurrentView('customer-login')} 
                      className="px-4 py-3 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium"
                    >
                      Login / Sign up
                    </button>
                  )}
                </div>
              )}
            </div>
        </div>

         {/* Right Actions */}
         <div className="flex items-center gap-2 md:gap-4">
           {/* Search - Desktop */}
           <div className="hidden lg:flex items-center relative">
             <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
             <input
               type="text"
               placeholder="Search eco-friendly solutions..."
                 value={searchQuery}
                 onChange={(e) => {
                   const val = e.target.value;
                   setSearchQuery(val);
                   if (val && currentView !== 'shop' && currentView !== 'blog' && currentView !== 'blog-post' && currentView !== 'product') {
                     setCurrentView('shop');
                   }
                 }}
               className="pl-10 pr-4 py-2 w-48 xl:w-64 bg-surface-high rounded-full text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all border border-transparent focus:border-forest/10"
             />
           </div>

           {/* Search - Mobile/Tablet Toggle */}
           <button
             onClick={() => setIsSearchOpen(!isSearchOpen)}
             className="lg:hidden p-2 hover:bg-surface-high rounded-full transition-colors no-anim"
           >
             <Search className="w-5 h-5 text-forest" />
           </button>

            <button
              onClick={() => setCurrentView('cart')}
              className="relative p-1 hover:bg-surface-high rounded-full transition-colors no-anim flex items-center justify-center"
            >
              <div className="w-7 h-7">
                <Lottie 
                  animationData={cartAnimation} 
                  loop={cartCount === 0} 
                  autoplay={cartCount === 0}
                />
              </div>
             {cartCount > 0 && (
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-fresh text-white text-xs font-bold rounded-full flex items-center justify-center">
                 {cartCount}
               </span>
             )}
           </button>

           {/* User */}
           <button className="hidden sm:flex p-2 hover:bg-surface-high rounded-full transition-colors no-anim">
             <User className="w-5 h-5 text-forest" />
           </button>

           {/* Mobile Menu Toggle */}
           <button
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="md:hidden p-2 hover:bg-surface-high rounded-full transition-colors no-anim"
           >
             {isMenuOpen ? (
               <X className="w-5 h-5 text-forest" />
             ) : (
               <Menu className="w-5 h-5 text-forest" />
             )}
           </button>
         </div>
      </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val && currentView !== 'shop' && currentView !== 'blog' && currentView !== 'blog-post' && currentView !== 'product') {
                    setCurrentView('shop');
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-surface-high rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-outline-variant bg-white">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => {
                    setCurrentView(link.view);
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim ${
                    isActive(link.view)
                      ? 'bg-forest/10 text-forest'
                      : 'text-muted-foreground hover:bg-surface-high'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              ))}
              <div className="h-px bg-outline-variant my-1" />
              <button
                onClick={() => {
                  setCurrentView('blog');
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim ${
                  isActive('blog')
                    ? 'bg-forest/10 text-forest'
                    : 'text-muted-foreground hover:bg-surface-high'
                }`}
              >
                <span>Blog</span>
              </button>
              {session ? (
                <>
                  <button
                    onClick={() => {
                      setCurrentView('recent-orders');
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim ${
                      isActive('recent-orders')
                        ? 'bg-forest/10 text-forest'
                        : 'text-muted-foreground hover:bg-surface-high'
                    }`}
                  >
                    <span>Recent Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim ${
                      isActive('settings')
                        ? 'bg-forest/10 text-forest'
                        : 'text-muted-foreground hover:bg-surface-high'
                    }`}
                  >
                    <span>Account Settings</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setCurrentView('customer-login');
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim ${
                    isActive('customer-login')
                      ? 'bg-forest/10 text-forest'
                      : 'text-muted-foreground hover:bg-surface-high'
                  }`}
                >
                  <span>Login / Sign up</span>
                </button>
              )}
            </div>
          </div>
        )}
    </nav>
  );
}
