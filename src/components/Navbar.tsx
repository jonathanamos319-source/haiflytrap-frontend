import { useStore } from '@/hooks/useStore';
import { User, Search, Menu, X, ArrowLeft, ChevronDown, ShoppingBag, Settings, LogOut, LogIn, Shield, Truck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import cartAnimation from '../lotties/system-solid-6-shopping-hover-pinch.json';

export function Navbar() {
  const { cartCount, setCurrentView, currentView, searchQuery, setSearchQuery, isBackendDown, isCheckingBackend, user, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [currentView]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
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
                  {user ? (
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
         <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
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

           {/* User Account Menu (visible on both mobile & desktop) */}
           <div className="relative block" ref={userMenuRef}>
             <button
               onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
               className={`p-2 hover:bg-surface-high rounded-full transition-colors no-anim flex items-center justify-center relative ${
                 isUserMenuOpen || isActive('settings') || isActive('customer-login') || isActive('recent-orders')
                   ? 'bg-surface-high text-forest ring-2 ring-forest/20'
                   : 'text-forest'
               }`}
               title={user ? (user.name || user.email) : 'Account'}
             >
               {user ? (
                 <div className="w-6 h-6 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                   {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                 </div>
               ) : (
                 <User className="w-5 h-5 text-forest" />
               )}
               {user && (
                 <span className="absolute bottom-0 right-0 w-2 h-2 bg-fresh rounded-full ring-2 ring-white" />
               )}
             </button>

             {/* Account Dropdown */}
             {isUserMenuOpen && (
               <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-outline-variant py-2 flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                 {user ? (
                   <>
                     {/* User Info Header */}
                     <div className="px-4 py-3 border-b border-outline-variant/60 bg-surface/50">
                       <p className="text-sm font-bold text-forest truncate">
                         {user.name || 'Valued Customer'}
                       </p>
                       <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                       {user.role && user.role !== 'customer' && (
                         <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-forest">
                           {user.role}
                         </span>
                       )}
                     </div>

                     {/* Admin Portal link if admin */}
                     {user.role === 'admin' && (
                       <button
                         onClick={() => {
                           setCurrentView('admin-dashboard');
                           setIsUserMenuOpen(false);
                         }}
                         className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-semibold flex items-center gap-2.5 border-b border-outline-variant/40"
                       >
                         <Shield className="w-4 h-4 text-gold" />
                         <span>Admin Portal</span>
                       </button>
                     )}

                     {/* Handler Portal link if handler or admin */}
                     {(user.role === 'handler' || user.role === 'admin') && (
                       <button
                         onClick={() => {
                           setCurrentView('handler-portal');
                           setIsUserMenuOpen(false);
                         }}
                         className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-semibold flex items-center gap-2.5 border-b border-outline-variant/40"
                       >
                         <Truck className="w-4 h-4 text-forest" />
                         <span>Handler Portal</span>
                       </button>
                     )}

                     {/* Customer Links */}
                     <button
                       onClick={() => {
                         setCurrentView('recent-orders');
                         setIsUserMenuOpen(false);
                       }}
                       className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium flex items-center gap-2.5"
                     >
                       <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                       <span>My Orders</span>
                     </button>

                     <button
                       onClick={() => {
                         setCurrentView('settings');
                         setIsUserMenuOpen(false);
                       }}
                       className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium flex items-center gap-2.5"
                     >
                       <Settings className="w-4 h-4 text-muted-foreground" />
                       <span>Account Settings</span>
                     </button>

                     <div className="border-t border-outline-variant/60 my-1" />

                     <button
                       onClick={() => {
                         logout();
                         setIsUserMenuOpen(false);
                       }}
                       className="px-4 py-2.5 text-sm text-left hover:bg-red-50 transition-colors text-red-600 font-medium flex items-center gap-2.5"
                     >
                       <LogOut className="w-4 h-4 text-red-500" />
                       <span>Sign Out</span>
                     </button>
                   </>
                 ) : (
                   <>
                     <div className="px-4 py-2.5 border-b border-outline-variant/60 bg-surface/50">
                       <p className="text-xs font-semibold text-muted-foreground">Welcome to Haifly Trap</p>
                     </div>

                     <button
                       onClick={() => {
                         setCurrentView('customer-login');
                         setIsUserMenuOpen(false);
                       }}
                       className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-semibold flex items-center gap-2.5"
                     >
                       <LogIn className="w-4 h-4 text-forest" />
                       <span>Login / Sign Up</span>
                     </button>

                     <button
                       onClick={() => {
                         setCurrentView('track-order');
                         setIsUserMenuOpen(false);
                       }}
                       className="px-4 py-2.5 text-sm text-left hover:bg-surface-high transition-colors text-forest font-medium flex items-center gap-2.5"
                     >
                       <Truck className="w-4 h-4 text-muted-foreground" />
                       <span>Track an Order</span>
                     </button>
                   </>
                 )}
               </div>
             )}
           </div>

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
              {user ? (
                <>
                  <div className="px-4 py-3 rounded-xl bg-surface/70 border border-outline-variant/60 flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-forest text-white text-sm font-bold flex items-center justify-center flex-shrink-0 relative">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-fresh rounded-full ring-2 ring-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-forest truncate">
                        {user.name || 'Valued Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
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
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setCurrentView('admin-dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 text-left font-semibold rounded-xl transition-colors btn-anim text-gold bg-forest/5 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </button>
                  )}
                  {(user.role === 'handler' || user.role === 'admin') && (
                    <button
                      onClick={() => {
                        setCurrentView('handler-portal');
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 text-left font-semibold rounded-xl transition-colors btn-anim text-forest bg-forest/5 flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Handler Portal</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left font-medium rounded-xl transition-colors btn-anim text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
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
