import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { useStore } from '@/hooks/useStore';
import { WaveDivider } from '@/components/WaveDivider';
import { ArrowUpRight, ArrowRight, Leaf, Check, Star, Dog, Zap, Sparkles, Lock, MapPin, Clock } from 'lucide-react';
import { LeavesBackground } from '@/components/LeavesBackground';
import Lottie from 'lottie-react';
import beeAnimation from '../lotties/wired-outline-1148-bee-hover-pinch.json';
import { loadGSAP } from '@/utils/gsap-loader';
import { FAQSection } from '@/components/FAQSection';


export function HomePage() {
  const { setCurrentView, isBackendDown } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const heroWords = ['Home', 'Outdoor Space', 'Restaurant'];
  const [wordIndex, setWordIndex] = useState(0);
  const wordRef = useRef<HTMLSpanElement>(null);

  // const trustBadges = [
  //   { icon: Truck, title: 'Same-Day Delivery', desc: 'Lagos Metropolis' },
  //   { icon: CheckCircle, title: 'Secure Payment', desc: 'NAFDAC Registry' },
  //   { icon: Leaf, title: '100% Non-Toxic', desc: 'Family & Pet Safe' },
  //   { icon: Clock, title: 'Expert Support', desc: '24/7 Assistance' },
  // ];

  const [textState, setTextState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setTextState('out');
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % heroWords.length);
        setTextState('in');
      }, 400);
    }, 4500);

    return () => clearInterval(interval);
  }, [heroWords.length]);




  // Simple CSS Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          // Once revealed, we can stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters
    });

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);




  // Spotlight Fly Swarm Animation
  useEffect(() => {
    const flies = document.querySelectorAll('.spotlight-fly');
    const animations: any[] = [];

    flies.forEach((fly, i) => {
      const anim = animate(fly, {
        translateX: () => Math.random() * 200 - 100,
        translateY: () => Math.random() * 200 - 100,
        rotate: () => Math.random() * 360,
        duration: () => 3000 + Math.random() * 3000,
        direction: 'alternate',
        loop: true,
        ease: 'inOutSine',
        delay: i * 150
      });
      animations.push(anim);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('fly-swarm-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relX > 0 && relX < rect.width && relY > 0 && relY < rect.height) {
        animate('.spotlight-fly', {
          translateX: () => (Math.random() - 0.5) * 400,
          translateY: () => (Math.random() - 0.5) * 400,
          opacity: [1, 0.4, 1],
          duration: 800,
          ease: 'outExpo'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="overflow-hidden">
      <section
        ref={heroRef}
        className="hero-background relative pt-20 pb-24 sm:pt-24 sm:pb-32 md:pt-36 md:pb-32 lg:pt-52 lg:pb-56 min-h-[70vh] flex items-center overflow-hidden bg-cover bg-[position:85%_center] md:bg-right-bottom lg:bg-center bg-no-repeat"
      >
        {/* Premium Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/90 via-forest/40 to-transparent md:bg-none md:bg-forest/20 z-0" />

        {/* Decorative Leaf Branch */}
        <div className="absolute top-10 -right-16 w-80 h-80 md:w-96 md:h-96 opacity-30 pointer-events-none rotate-45 select-none z-10">
          <img src="/products/image%206.png" alt="Haifly Trap decorative" loading="lazy" className="w-full h-full object-contain" />
        </div>

        <div className="section-padding relative z-10">
          <div className="max-w-4xl relative">
            <h1 className="font-display font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-2 md:mb-3">
              <span className="hero-title-main block animate-fade-in-up stagger-2">Total Housefly Control</span>
              <span className="hero-title-animated flex items-center flex-wrap gap-x-3 text-white animate-fade-in-up stagger-3">
                For Every
                <span className="relative inline-block min-w-[280px] sm:min-w-[320px]">
                  <span
                    ref={wordRef}
                    className={`inline-block text-gold font-black ${textState === 'in' ? 'animate-text-in' : 'animate-text-out'}`}
                  >
                    {heroWords[wordIndex]}.
                  </span>
                </span>
              </span>
            </h1>

            <p className="hero-text text-white/90 font-bold text-sm sm:text-base md:text-lg max-w-xl mb-4 md:mb-5 leading-relaxed animate-fade-in-up stagger-4">
              Premium non-toxic, odourless housefly control solutions designed for the Nigerian market. Fast, effective, and safe for your family and pets.

              {/* Extra Subtle Proof Fly in Hero Text area - White focus */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="inline-block w-8 h-8 opacity-60 ml-2 rotate-45 transform translate-y-1 mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
            </p>

            <div className="hero-buttons flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-0 mb-4 md:mb-5 relative animate-fade-in-up stagger-5">
              {isBackendDown ? (
                <a
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 md:px-8 md:py-4 bg-white hover:bg-white/90 text-forest font-bold text-sm md:text-base rounded-full transition-all flex items-center gap-2 group btn-anim"
                >
                  <span>Order on WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                </a>
              ) : (
                <button
                  onClick={() => setCurrentView('shop')}
                  className="px-6 py-3.5 md:px-8 md:py-4 bg-white hover:bg-white/90 text-forest font-bold text-sm md:text-base rounded-full transition-all flex items-center gap-2 group btn-anim"
                >
                  <span>Shop</span>
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                </button>
              )}
              <button
                onClick={() => setCurrentView('track-order')}
                className="px-6 py-3.5 md:px-8 md:py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm md:text-base rounded-full border border-white/20 backdrop-blur-sm transition-all"
              >
                <span>Track Your Order</span>
              </button>

              {/* Proof of Efficacy: Dead Fly */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="absolute -bottom-16 right-0 md:-bottom-20 md:-right-24 w-24 h-24 md:w-40 md:h-40 opacity-100 pointer-events-none select-none z-[60] rotate-[130deg] transform mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Proof of Efficacy: Dead Fly near trust badges */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="absolute -top-12 left-1/4 w-20 h-20 opacity-100 pointer-events-none select-none z-[60] rotate-[-15deg] mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
              {/* {trustBadges.map((badge, i) => (
                <div
                  key={i}
                  className="floating-badge group bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fresh/20 rounded-xl flex items-center justify-center text-black group-hover:bg-fresh transition-colors">
                      <badge.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight">{badge.title}</h4>
                      <p className="text-white/40 text-[11px] leading-tight mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </section>

      {/* Did You Know Section (Inspired by User Image) */}
      <section className="py-6 md:py-10 bg-white relative overflow-hidden">
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 w-full h-4 bg-surface-low flex items-center justify-around opacity-40 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Leaf className="w-2.5 h-2.5 text-fresh/40" />
              <div className="w-3 h-3 opacity-40">
                <Lottie animationData={beeAnimation} loop={true} autoplay={true} />
              </div>
              <Sparkles className="w-2.5 h-2.5 text-forest/20" />
            </div>
          ))}
        </div>

        {/* Decorative Leaf Accents */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.05] pointer-events-none -rotate-12 select-none z-0">
          <img src="/products/image%206.png" alt="Haifly Trap decorative" loading="lazy" className="w-full h-full object-contain" />
        </div>

        <div className="section-padding relative z-10">
          <div className="flex flex-col items-center justify-center">
            {/* Tilted Header Boxes */}
            <div className="relative mb-3 flex flex-col items-center did-you-know-header scroll-reveal reveal-up">
              <div className="bg-gold text-forest font-display font-black text-xl md:text-4xl px-6 py-2 rounded-xl md:rounded-2xl shadow-lg transform -rotate-3 hover:translate-y-[-2px] transition-transform duration-500 z-20">
                DID YOU
              </div>
              <div className="bg-fresh text-white font-display font-black text-xl md:text-4xl px-6 py-2 rounded-xl md:rounded-2xl shadow-lg transform rotate-2 -mt-2 ml-5 md:ml-10 hover:translate-y-[2px] transition-transform duration-500 z-10 border-[3px] border-white">
                KNOW?
              </div>

              {/* Proof of Efficacy: Dead Fly */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="absolute -top-16 -left-28 w-28 h-28 opacity-100 pointer-events-none select-none z-[60] -rotate-12 mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
            </div>

            {/* Fact Card - Ultra Compact */}
            <div className="w-full max-w-2xl bg-surface-low border border-outline-variant rounded-[24px] p-4 md:p-8 text-center shadow-soft relative group fact-card scroll-reveal reveal-up">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-forest">
                <Star className="w-4 h-4 fill-forest" />
              </div>

              <div className="fact-container flex items-center justify-center">
                <p className="text-base md:text-lg text-forest leading-relaxed font-body">
                  Did you know a single housefly can carry thousands of harmful bacteria from waste straight to your food and surfaces?
                  <span className="text-fresh font-bold"> Haifly Trap is specifically engineered to stop this threat instantly</span> — providing Nigeria's most effective botanical, odourless defense against houseflies while remaining safe for your family.
                </p>
              </div>
            </div>

            {isBackendDown ? (
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-7 py-3 bg-forest text-white rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 btn-anim group"
              >
                <span className="relative z-10">Order on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            ) : (
              <button
                onClick={() => setCurrentView('shop')}
                className="mt-4 px-7 py-3 bg-forest text-white rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 btn-anim group"
              >
                <span className="relative z-10">Shop Now</span>
                <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative Bottom Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-surface-low flex items-center justify-around opacity-40 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Leaf className="w-2.5 h-2.5 text-gold/40 rotate-180" />
              <Sparkles className="w-2.5 h-2.5 text-forest/20 rotate-180" />
            </div>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-6 md:py-10 bg-forest relative overflow-hidden promo-section">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute inset-0 opacity-5">
            <Leaf className="absolute top-10 left-10 w-32 h-32 rotate-12" />
            <div className="absolute bottom-20 right-20 w-48 h-48 -rotate-45">
              <Lottie animationData={beeAnimation} loop={true} autoplay={true} />
            </div>
            <Sparkles className="absolute top-1/2 left-1/3 w-24 h-24 rotate-[20deg]" />
          </div>
          {/* image6 moved above the opacity overlay */}
          <img src="/products/image%206.png" alt="Haifly Trap decorative" loading="lazy" className="absolute bottom-[-10%] -right-16 w-64 h-64 rotate-[-30deg] opacity-20 z-10" />
        </div>

        <div className="section-padding relative z-10">
          <div className="bg-fresh/5 p-5 md:p-8 rounded-[40px] border border-white/10 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left promo-content scroll-reveal reveal-left">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                Protect Your Space <br />
                <span className="text-gold">And Even Your Pets.</span>
              </h2>
              <p className="text-white/70 text-lg mb-5 max-w-xl mx-auto lg:mx-0">
                Use our odourless products that work perfectly <span className="text-gold font-bold">Outdoor</span> and <span className="text-gold font-bold">Indoor</span> for your space. Protect your pets like Dogs, Cats, Rabbits, and even <span className="text-gold font-bold">Horses</span> with our 100% botanical formula.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-4">
                <div className="flex items-center gap-3 text-white group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-fresh/20 transition-colors relative z-10">
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <span className="font-semibold">Instant Results</span>
                </div>
                <div className="flex items-center gap-3 text-white group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-fresh/20 transition-colors relative z-10">
                    <Dog className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Pet Safe</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative group">
              {/* Pet Flier Container */}
              <div className="relative h-[420px] md:h-[600px] w-full rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transform rotate-1 hover:rotate-0 transition-all duration-700 ease-out border-[6px] border-white/10 backdrop-blur-sm">
                <img
                  src="/images/SAFERPOST.png"
                  alt="Pet Protection"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-forest/20 via-transparent to-forest/60" />

                {/* Top Actions */}
                <div className="absolute top-4 left-6 right-4 flex justify-end items-start">
                  <div className="bg-gold text-forest font-bold text-[10px] px-3 py-1 rounded-full shadow-lg tracking-wider">
                    #noflyzone
                  </div>
                </div>

                {/* Shop Now Button - Bottom Right */}
                <div className="absolute bottom-6 right-6 z-30">
                  {isBackendDown ? (
                    <a
                      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white text-forest font-bold rounded-full shadow-2xl hover:bg-gold hover:text-white transition-all flex items-center gap-2 group/btn btn-anim"
                    >
                      <span>Order on WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform relative z-10" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setCurrentView('shop')}
                      className="px-6 py-3 bg-white text-forest font-bold rounded-full shadow-2xl hover:bg-gold hover:text-white transition-all flex items-center gap-2 group/btn btn-anim"
                    >
                      <span>Shop Now</span>
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform relative z-10" />
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative Floating Elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold rounded-full flex items-center justify-center text-forest shadow-2xl animate-bounce pointer-events-none z-20">
                <Dog className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Shipment Tracking Section */}
      <section className="relative flex items-center overflow-hidden shipment-tracking-section">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/tracking-bg.png')" }}
        />
        {/* Dark Black Overlay for extra contrast */}
        <div className="absolute inset-0 bg-black/75" />

        <div className="section-padding relative z-10 w-full py-4">
          <div className="max-w-3xl text-left">
            <h2 className="text-white text-2xl md:text-4xl font-display font-black mb-2 leading-tight">
              Track Your <span className="text-gold">Shipment</span>
            </h2>

            <p className="text-white/90 text-sm md:text-base font-medium mb-4 leading-relaxed max-w-2xl">
              <span className="text-gold font-bold">Same day delivery in Lagos</span>; 24-48 hours delivery outside Lagos. <br className="hidden md:block" />
              Enter your waybill to keep an eye on your order.
            </p>

            {/* Rectangular Tracking Bar */}
            <div className="flex flex-col sm:flex-row max-w-2xl shadow-2xl w-full">
              <input
                type="text"
                placeholder="Enter waybill number / Alphacode"
                className="w-full sm:flex-1 px-4 py-3 bg-white text-forest font-semibold placeholder:text-forest/30 focus:outline-none border-none rounded-none text-sm"
              />
              <button
                onClick={() => setCurrentView('track-order')}
                className="w-full sm:w-auto bg-gold text-white font-bold px-8 py-3 transition-all flex items-center justify-center gap-3 active:scale-[0.98] rounded-none uppercase tracking-wider text-sm btn-gold-inverse"
              >
                <span className="relative z-10">Track Now</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 opacity-70">
              <div className="flex items-center gap-2 text-white text-[10px] sm:text-xs font-bold">
                <Check className="w-3 h-3 text-gold" />
                Real-time updates
              </div>
              <div className="flex items-center gap-2 text-white text-[10px] sm:text-xs font-bold">
                <Check className="w-3 h-3 text-gold" />
                Doorstep delivery
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-white/70">
              <Lock className="w-4 h-4 text-fresh" />
              <span>Your transaction is secured with 256-bit SSL encryption</span>
            </div>

            {/* Corner Proof Fly removed - non-white background */}
          </div>
        </div>
      </section>

      {/* Head Office Map Section */}
      <section className="py-8 md:py-12 bg-white relative overflow-hidden">
        <LeavesBackground opacity={0.1} />
        <div className="section-padding">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 scroll-reveal reveal-up">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-forest mb-4">
                Visit Our <span className="text-fresh">Head Office</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Stop by our Lagos headquarters for consultations, product pickups, and expert advice on housefly control.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-0 items-stretch bg-surface-low rounded-[32px] overflow-hidden border border-outline-variant shadow-soft scroll-reveal reveal-up delay-100">
              {/* Map Information */}
              <div className="w-full lg:w-1/3 p-6 md:p-8 flex flex-col justify-center bg-forest text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Location</h4>
                    <p className="text-white/70 font-medium text-sm">Block D1181HFP, Eastline Complex<br />Abraham Adesanya, Ajah, Lagos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center text-gold shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Hours</h4>
                    <p className="text-white/70 font-medium text-sm">Mon - Fri: 9:00 AM - 5:00 PM<br />Sat: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-gold text-forest rounded-xl font-bold hover:bg-gold-light transition-colors flex items-center justify-center gap-2 btn-gold mt-auto"
                  onClick={() => window.open('https://maps.google.com/?q=Eastline+Complex,+Abraham+Adesanya,+Ajah,+Lagos', '_blank')}
                >
                  <span className="relative z-10">Get Directions</span>
                  <ArrowRight className="w-5 h-5 relative z-10" />
                </button>
              </div>

              {/* Map Iframe */}
              <div className="w-full lg:w-2/3 h-[300px] lg:h-[400px]">
                <iframe
                  title="Haifly Trap Head Office"
                  src="https://maps.google.com/maps?q=Eastline%20Complex,%20Abraham%20Adesanya,%20Ajah,%20Lagos&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover filter contrast-125 saturate-150"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Instagram Spotlight Section */}
      <section ref={testimonialsRef} className="py-10 bg-surface relative overflow-hidden instagram-section">
        <LeavesBackground opacity={0.1} />
        {/* Decorative Leaf Branch - Subtle Top Corner */}
        <div className="absolute -top-10 -left-10 w-48 h-48 opacity-10 pointer-events-none rotate-180 select-none z-10">
          <img src="/products/image%206.png" alt="Haifly Trap decorative" loading="lazy" className="w-full h-full object-contain" />
        </div>

        <div className="section-padding text-center instagram-content relative scroll-reveal reveal-up">
          {/* Subtle Proof Fly near Header */}
          <img
            src="/images/dead_house_fly_final.png"
            alt=""
            className="absolute top-0 right-[20%] w-28 h-28 opacity-100 rotate-12 z-[60] mix-blend-multiply"
            style={{ clipPath: 'circle(36%)' }}
          />

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-forest mb-4">Join Our Community</h2>
            <p className="text-muted-foreground text-base mb-6">Follow us on Instagram <a href="https://www.instagram.com/haiflytrap/" target="_blank" rel="noopener noreferrer" className="text-fresh font-bold hover:underline">@haiflytrap</a></p>

            {/* Instagram Profile Container - Balanced Crop with Green Fog */}
            <div className="relative max-w-2xl mx-auto overflow-hidden bg-transparent border-none group instagram-phone scroll-reveal reveal-up delay-200">
              {/* Profile Image - Balanced view to fit content */}
              <a 
                href="https://www.instagram.com/haiflytrap/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block aspect-video md:aspect-[16/9] overflow-hidden cursor-pointer"
              >
                <img
                  src="/products/Instagram%20Profile.svg"
                  alt="Haifly Instagram Profile"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
