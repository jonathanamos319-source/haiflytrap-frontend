import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { Star, Play, ArrowUpRight, ArrowRight, ArrowLeft, Check, Quote, Phone, Instagram } from 'lucide-react';
import { WaveDivider } from '@/components/WaveDivider';
import { LeavesBackground } from '@/components/LeavesBackground';
import Lottie from 'lottie-react';
import leavesAnimation from '../lotties/leaves.json';
import { FAQSection } from '@/components/FAQSection';


const row1Testimonials = [
  {
    initials: 'OA',
    name: 'Oluwale Adeyemi',
    location: 'Lagos',
    handle: '@oluwale_a',
    rating: 5,
    text: "The Broadkiller is simply incredible. I've tried many brands in Lagos, but Haifly Trap actually delivers. My home is completely fly-free.",
    verified: true,
  },
  {
    initials: 'CN',
    name: 'Chioma Nwachukwu',
    location: 'Abuja',
    handle: '@chioma_home',
    rating: 5,
    text: "Fast delivery to Abuja and excellent packaging. Love that it's safe for my pets. Truly the best insecticides in Nigeria right now.",
    verified: true,
  },
  {
    initials: 'TK',
    name: 'Tunde Kolade',
    location: 'Ibadan',
    handle: '@tunde_vibes',
    rating: 5,
    text: 'The UV Zapper works silently overnight and I wake up to zero mosquitoes. A total game-changer for malaria season in our house.',
    verified: true,
  },
  {
    initials: 'FO',
    name: 'Fatima Okonkwo',
    location: 'Kano',
    handle: '@fatima_ok',
    rating: 5,
    text: 'No chemical smell, no dead bugs everywhere. It just works quietly and cleanly. My in-laws were so impressed they ordered two more.',
    verified: true,
  },
  {
    initials: 'EI',
    name: 'Emeka Ike',
    location: 'Onitsha',
    handle: '@emeka_ike',
    rating: 5,
    text: 'I was skeptical but after one week my kitchen is cockroach-free. Zero harsh smells, completely safe around my kids.',
    verified: true,
  },
];

const row2Testimonials = [
  {
    initials: 'IE',
    name: 'Ibrahim Edet',
    location: 'Port Harcourt',
    handle: '@ibrahimedet',
    rating: 5,
    text: 'Excellent customer support. They helped me choose the right product for my warehouse. Very professional, very effective.',
    verified: true,
  },
  {
    initials: 'AN',
    name: 'Amaka Nwosu',
    location: 'Enugu',
    handle: '@mama_safety',
    rating: 5,
    text: "Safe for the kids and pets. That's my number one priority and Haifly delivers on that promise every single time.",
    verified: true,
  },
  {
    initials: 'BI',
    name: 'Blessing Idowu',
    location: 'Benin City',
    handle: '@blessing_i',
    rating: 5,
    text: 'Ordered for my restaurant and the difference was immediate. Guests stopped complaining — peace of mind is priceless.',
    verified: true,
  },
  {
    initials: 'SO',
    name: 'Sola Ogunleye',
    location: 'Lagos',
    handle: '@abuja_lifestyle',
    rating: 5,
    text: 'The peace of mind is actually underrated. No more uninvited guests at 2am. Worth every single naira spent.',
    verified: true,
  },
  {
    initials: 'KA',
    name: 'Kemi Adebayo',
    location: 'Abeokuta',
    handle: '@kemi_home',
    rating: 5,
    text: 'Aesthetics and utility in one product. Who knew housefly control could look this good sitting on my kitchen counter?',
    verified: true,
  },
];

type Testimonial = (typeof row1Testimonials)[number];

function TestimonialCard({ review }: { review: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-64 bg-surface rounded-2xl p-5 flex flex-col gap-3 border border-outline-variant">
      {/* Stars removed */}
      <p className="text-sm leading-relaxed text-foreground line-clamp-3">"{review.text}"</p>
      <div className="flex items-center gap-2.5 mt-auto">
        <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
          {review.initials}
        </div>
        <div>
          <p className="font-semibold text-forest text-xs">{review.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground">{review.location}</p>
            {review.verified && (
              <span className="flex items-center gap-0.5 text-xs text-fresh">
                <Check className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const videoCards = [
  { video: 'https://res.cloudinary.com/decnpcsss/video/upload/v1777843153/review1_pddz16.mp4', rotate: '-rotate-3', bg: 'bg-forest', playBg: 'bg-gold/90', playIcon: 'text-white fill-white', label: '@tunde_vibes' },
  { video: 'https://res.cloudinary.com/decnpcsss/video/upload/v1777843173/review2_zk4ti0.mp4', rotate: 'rotate-2', bg: 'bg-fresh', playBg: 'bg-gold/90', playIcon: 'text-white fill-white', label: '@chioma_home' },
  { video: 'https://res.cloudinary.com/decnpcsss/video/upload/v1777843125/review3_hc3g9k.mp4', rotate: '-rotate-1', bg: 'bg-gold', playBg: 'bg-white/90', playIcon: 'text-forest fill-forest', label: '@abuja_lifestyle' },
];

function VideoStoryCard({ card, index, isActive, onIntersect }: { card: any, index: number, isActive: boolean, onIntersect: (index: number, isIntersecting: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        onIntersect(index, entry.isIntersecting);
      },
      { 
        threshold: 0.6, // Higher threshold to ensure it's well in view
        rootMargin: '0px'
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [index, onIntersect]);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(err => console.log("Play blocked:", err));
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

  return (
    <div
      className="sticky group w-[200px] max-w-full mx-auto lg:ml-auto"
      style={{
        top: `${130 + index * 25}px`,
        zIndex: index + 10,
        marginTop: index > 0 ? '10px' : '0'
      }}
    >
      <div className={`relative w-full aspect-[4/5] ${card.bg} rounded-2xl border-4 border-white overflow-hidden shadow-2xl ${card.rotate} hover:rotate-0 hover:-translate-y-2 hover:scale-105 transition-transform duration-500`}>
        <video
          ref={videoRef}
          src={card.video}
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <p className="text-white font-bold text-xs">{card.label}</p>
        </div>
      </div>
    </div>
  );
}

export function ReviewsPage() {
  const { setCurrentView, isBackendDown, isCheckingBackend } = useStore();
  const [wordIndex, setWordIndex] = useState(0);
  const wordRef = useRef<HTMLSpanElement>(null);
  const words = ['Home?', 'Restaurants?', 'Pets?'];

  const [textState, setTextState] = useState<'in' | 'out'>('in');

  const [instructionType, setInstructionType] = useState<'spray' | 'trap'>('spray');

  const [intersectingIndices, setIntersectingIndices] = useState<number[]>([]);
  const activeVideoIndex = intersectingIndices.length > 0 ? Math.max(...intersectingIndices) : null;

  const handleIntersect = (index: number, isIntersecting: boolean) => {
    setIntersectingIndices(prev => {
      if (isIntersecting) {
        return prev.includes(index) ? prev : [...prev, index];
      } else {
        return prev.filter(i => i !== index);
      }
    });
  };

  // Stats arrayd cycling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTextState('out');
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setTextState('in');
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [words.length]);


  return (
    <div className="min-h-screen bg-surface">
      {/* New Bento Hero Section */}
      <section className="relative bg-surface border-b border-outline-variant pb-20 md:pb-32 overflow-hidden">
        {/* Background Tree Branch */}
        <div className="absolute top-[-5%] -right-20 w-[600px] h-[600px] opacity-[0.08] pointer-events-none select-none z-0">
          <img src="/products/image%206.png" alt="Haifly Trap graphic" loading="lazy" className="w-full h-full object-contain rotate-[-15deg]" />
        </div>
        <div className="absolute bottom-[-10%] -left-20 w-[400px] h-[400px] opacity-[0.05] pointer-events-none select-none z-0">
          <img src="/products/image%206.png" alt="Haifly Trap graphic" loading="lazy" className="w-full h-full object-contain rotate-[165deg]" />
        </div>

        <div className="section-padding py-12 md:py-20 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">

            {/* Responsive House Fly Bento Grid */}
            <div className="relative w-full max-w-[260px] md:max-w-[400px] aspect-[4/5] mx-auto lg:mx-0 flex-shrink-0 mb-8 sm:mb-0">

              <div className="relative w-full h-full transform scale-100 origin-center transition-transform duration-500">

                {/* Center Glow Backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-forest/10 rounded-full blur-3xl z-0 pointer-events-none" />

                {/* Left Eye */}
                <div className="absolute top-[8%] left-[26%] w-[22%] h-[18%] rounded-[40%_60%_50%_50%] overflow-hidden shadow-lg z-30 animate-fly-antenna-1 hover:scale-110 transition-transform duration-300 border-[3px] border-white">
                  <img src="https://res.cloudinary.com/decnpcsss/image/upload/v1778172698/Dajosh-9.jpg_bewxxx.jpg" alt="Broadkiller Pocket Spray" className="w-full h-full object-cover" />
                </div>

                {/* Right Eye */}
                <div className="absolute top-[8%] right-[26%] w-[22%] h-[18%] rounded-[60%_40%_50%_50%] overflow-hidden shadow-lg z-30 animate-fly-antenna-2 hover:scale-110 transition-transform duration-300 border-[3px] border-white">
                  <img src="https://res.cloudinary.com/decnpcsss/image/upload/v1778172697/Dajosh-7.jpg_j16wad.jpg" alt="Broadkiller Spray" className="w-full h-full object-cover" />
                </div>

                {/* Body (Thorax) */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[26%] h-[55%] rounded-full overflow-hidden shadow-2xl z-20 animate-fly-body hover:scale-[1.03] transition-transform duration-300 border-[4px] border-white bg-forest group">
                  <img src="/images/TRAPIMG1.png" alt="Hai Fly Trap" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
                </div>

                {/* Lower Abdomen (Tail) */}
                <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[20%] h-[25%] rounded-[50%_50%_45%_45%] overflow-hidden shadow-xl z-10 animate-fly-antenna-1 hover:scale-[1.05] transition-transform duration-300 border-[3px] border-white group">
                  <img src="/images/a carton.png" alt="Haifly Carton" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>

                {/* Left Wing (Angled backwards) */}
                <div className="absolute top-[22%] left-[16%] w-[32%] h-[62%] rounded-[50%_50%_40%_60%] overflow-hidden shadow-2xl z-30 animate-fly-wing-left hover:scale-[1.02] transition-transform duration-300 border-[4px] border-white backdrop-blur-sm group origin-[80%_10%] rotate-[12deg]">
                  <img src="/images/Broadkillersurefacespray.png" alt="Broadkiller Surface Spray" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                </div>

                {/* Right Wing (Angled backwards) */}
                <div className="absolute top-[22%] right-[16%] w-[32%] h-[62%] rounded-[50%_50%_60%_40%] overflow-hidden shadow-2xl z-30 animate-fly-wing-right hover:scale-[1.02] transition-transform duration-300 border-[4px] border-white backdrop-blur-sm group origin-[20%_10%] rotate-[-12deg]">
                  <img src="/images/Broadkillersurefacespray.png" alt="Broadkiller Surface Spray" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent pointer-events-none" />
                </div>

              </div>
            </div>

            {/* Right: Text Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative flex-1 min-w-0 w-full mt-4 lg:mt-0">
              {/* Proof of Efficacy: Dead Fly */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="absolute -top-4 -right-4 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-24 sm:h-24 opacity-100 pointer-events-none select-none z-[60] rotate-[15deg] mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.1] mb-4 lg:mb-6 animate-fade-in-up stagger-1">
                Flies in your <br />
                <span className="relative inline-block mt-2">
                  <span
                    ref={wordRef}
                    className={`text-gold relative z-10 inline-block ${textState === 'in' ? 'animate-text-in' : 'animate-text-out'}`}
                  >
                    {words[wordIndex]}
                  </span>
                </span>
              </h1>

              <p className="text-muted-foreground font-bold text-base sm:text-lg lg:text-xl max-w-xl mb-6 lg:mb-8 leading-snug sm:leading-relaxed">
                Welcome to the official Haifly Trap Community. We are a diverse alliance of homes and businesses dedicated to safe, botanical housefly control experiences—from homeowners to professional facility managers.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-forest/70 text-[10px] font-black uppercase tracking-widest mb-6">
                <Check className="w-4 h-4 text-fresh" />
                <span>NAFDAC: A10-101283</span>
              </div>

              <div className="flex flex-row justify-center lg:justify-start gap-2 sm:gap-3 mb-4 lg:mb-8 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentView('shop')}
                  className="flex-1 sm:flex-none px-2 sm:px-8 py-2.5 sm:py-3 bg-forest text-white font-bold rounded-none shadow-gold-glow hover:bg-forest-light transition-all flex items-center justify-center text-xs sm:text-sm lg:text-base btn-anim"
                >
                  <span>Join Us</span>
                </button>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="flex-1 sm:flex-none px-2 sm:px-8 py-2.5 sm:py-3 bg-transparent border-2 border-forest text-forest font-bold rounded-none hover:bg-surface-high transition-all text-xs sm:text-sm lg:text-base btn-anim"
                >
                  <span>Consult Solutions</span>
                </button>
              </div>

              <div className="border-t border-outline-variant pt-4 sm:pt-8 w-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-2 mb-1 sm:mb-2 text-muted-foreground font-bold text-base sm:text-lg">
                  Have any questions? Contact our experts!
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-5">
                  <Phone className="w-6 h-6 sm:w-10 sm:h-10 text-gold fill-gold flex-shrink-0" />
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-forest whitespace-nowrap">
                    +234 803 130 1311
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Overlapping About Us Section */}
      <section className="relative z-20 -mt-8 sm:-mt-16 md:-mt-24 px-3 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto bg-white rounded-[20px] md:rounded-[32px] shadow-2xl p-5 md:p-12 border border-outline-variant">
          <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-10">

            {/* Left Content */}
            <div className="flex-1 text-left w-full">
              <span className="label-sm mb-1.5 md:mb-2 block text-forest text-[10px] md:text-xs">WHO WE ARE</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-forest mb-4 md:mb-6 relative">
                About us
                {/* Subtle Proof Fly */}
                <img
                  src="/images/dead_house_fly_final.png"
                  alt=""
                  className="absolute -top-3 -right-4 w-8 h-8 md:-top-6 md:-right-12 md:w-16 md:h-16 opacity-100 rotate-[-25deg] mix-blend-multiply"
                  style={{ clipPath: 'circle(36%)' }}
                />
              </h2>

              <div className="space-y-6 text-black text-base md:text-lg leading-relaxed">
                <p>
                  <span className="font-bold text-forest">Ifidon Alufohai</span> founded Hai Fly Trap in September 2018, driven by a deep passion for building and nurturing businesses from the ground up. With decades of experience in the business world, he has consistently demonstrated innovation and resilience.
                </p>
                <p>
                  He pioneered Hai Fly Trap, which became <span className="text-fresh font-bold">Nigeria’s first commercially viable housefly trap</span>.
                  Expanding on this success, he introduced the <span className="text-fresh font-bold">Anti-Maggot solution for houseflies</span>—recognized as the <span className="text-fresh font-bold">first of its kind globally</span>.
                </p>
                <p>
                  Further advancing the industry, he developed <span className="text-fresh font-bold">Nigeria’s first odourless, water-based insecticide</span>, carefully formulated to be safe for humans, dogs, horses, and plants without compromising effectiveness.
                </p>
                <p>
                  In just eight years, Hai Fly Trap has earned the trust and loyalty of a growing customer base, establishing itself as a reliable name in environmentally conscious insect control solutions.
                </p>
              </div>

              <button
                onClick={() => setCurrentView('blog')}
                className="mt-4 md:mt-8 px-8 md:px-10 py-3 md:py-4 bg-forest text-white font-bold rounded-full hover:bg-forest-light transition-all text-sm md:text-lg btn-anim"
              >
                <span>Read more</span>
                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
              </button>
            </div>

            {/* Right Image */}
            <div className="flex-1 w-full max-w-3xl mt-1 md:mt-0 flex justify-center items-center relative">
              {/* Very Visible Leaves Lottie */}
              <div className="hidden md:block absolute -inset-10 md:-inset-20 z-0 opacity-80 scale-110 md:scale-150 pointer-events-none">
                <Lottie animationData={leavesAnimation} loop={true} />
              </div>
              <img
                src="/images/Broadkillersurefacespray-removebg-preview.png"
                alt="Broadkiller Surface Spray"
                className="w-full h-auto max-h-[750px] object-contain transform -rotate-3 -translate-y-6 hover:rotate-0 hover:-translate-y-10 transition-all duration-700 drop-shadow-[0_35px_55px_rgba(0,0,0,0.2)] scale-90 sm:scale-110 relative z-10"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Fumigation Service Section */}
      <section className="py-8 md:py-12 bg-surface relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fresh/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="section-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">

              {/* Video Side */}
              <div className="flex-1 w-full order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white group">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover aspect-video lg:aspect-[4/3]"
                  >
                    <source src="https://res.cloudinary.com/decnpcsss/video/upload/v1777740180/haiflytrap_2_ky2p8q.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Floating Proof Fly */}
                  <img
                    src="/images/dead_house_fly_final.png"
                    alt=""
                    className="absolute bottom-2 right-2 w-12 h-12 opacity-100 rotate-[45deg] z-20 mix-blend-multiply"
                    style={{ clipPath: 'circle(36%)' }}
                  />
                </div>
              </div>

              {/* Text Side */}
              <div className="flex-1 text-left order-1 lg:order-2">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-forest mb-3 leading-tight">
                  Professional <span className="text-gold">Fumigation Services</span>
                </h2>

                <div className="space-y-3 text-black/80 text-sm md:text-base lg:text-lg leading-relaxed">
                  <p>
                    Searching for the <span className="font-bold text-forest">best housefly control in Lagos</span>? Haifly Trap provides expert, high-grade housefly management solutions tailored for Nigerian homes and businesses.
                  </p>
                  <p>
                    Our <span className="text-fresh font-bold">professional fumigation services</span> utilize safe, non-toxic, botanical treatments that are effective against termites, bed bugs, cockroaches, and rodents.
                  </p>
                  <p className="hidden md:block">
                    From residential apartments to large-scale industrial facilities, we deliver <span className="text-forest font-bold">safe housefly control in Nigeria</span> that guarantees results.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => window.open('https://wa.me/2348031301311?text=Hi%2C%20I%20would%20like%20to%20book%20a%20fumigation%20service.', '_blank')}
                    className="px-6 py-3 bg-forest text-white font-bold rounded-xl shadow-lg hover:bg-forest-light transition-all flex items-center gap-2 btn-anim"
                  >
                    <span>Book Fumigation</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </button>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-outline-variant">
                    <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Call Now</p>
                      <p className="text-lg font-black text-forest">08031301311</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-forest py-8 md:py-12 -mt-12 z-10">
        <div className="section-padding relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <span className="label-sm mb-3 block text-fresh tracking-[0.2em]">VERY EASY TO USE</span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-4">
              How to Use {instructionType === 'spray' ? <><span className="text-gold">Broadkiller</span> Spray</> : <><span className="text-gold">Haifly</span> Trap</>}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              {instructionType === 'spray' 
                ? "Experience instant results with our non-toxic botanical formula. Follow these three simple steps to reclaim your space."
                : "The world's first commercially viable housefly trap. Set it up in minutes and enjoy a fly-free environment."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 max-w-7xl mx-auto">
            {instructionType === 'spray' ? (
              <>
                {/* Step 1 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">1</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> SHAKE WELL
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Give the bottle a firm shake for 5-10 seconds to activate our powerful botanical ingredients.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">2</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> SPRAY SURFACE
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Hold 15cm away and spray directly onto surfaces where flies crawl, hide, or gather.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">3</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> WATCH THEM DIE
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Eliminates houseflies on contact and keeps working for days without leaving toxic odors.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 1 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">1</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> POUR 500ML REFILL
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Each trap comes with a 500ml liquid refill. Simply pour the entire content directly into the trap container to activate it.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">2</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> HANG OUTDOORS
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Find a suitable spot outside and hang the trap approximately 2 feet above the ground for maximum effectiveness.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-4 relative group">
                  <span className="text-6xl md:text-7xl font-display font-black text-white/5 absolute -top-8 -left-2 select-none group-hover:text-gold/10 transition-colors">3</span>
                  <div className="relative pl-4">
                    <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-3">
                      <span className="w-8 h-px bg-gold" /> EMPTY & REUSE
                    </h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      Once the trap is full, simply throw away the dead flies inside, clean the container, and it's ready to be reused.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setInstructionType(instructionType === 'spray' ? 'trap' : 'spray')}
              className="group flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
            >
              {instructionType === 'trap' && <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-gold" />}
              <span className="font-bold">How to use the {instructionType === 'spray' ? 'trap' : 'spray'}</span>
              {instructionType === 'spray' && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gold" />}
            </button>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Satisfied Customers Section (Refined Design) */}
      <section className="section-padding py-12 bg-white relative">
        <LeavesBackground opacity={0.1} />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left: Heading & Description */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 relative">
              {/* Corner Proof Fly */}
              <img
                src="/images/dead_house_fly_final.png"
                alt=""
                className="absolute top-0 right-0 w-20 h-20 opacity-100 rotate-[200deg] mix-blend-multiply"
                style={{ clipPath: 'circle(36%)' }}
              />
              <h2 className="text-3xl md:text-4xl font-display font-black text-forest leading-[1.1] mb-4">
                Hear from Our <span className="text-gold">Satisfied Customers</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Join thousands of homeowners who trust Haifly Trap for effective, non-toxic housefly control.
              </p>

              <button
                onClick={() => setCurrentView('shop')}
                className="mt-6 flex items-center gap-2 text-fresh font-bold hover:gap-3 transition-all group text-sm btn-anim"
              >
                <span>Experience the difference</span> <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
              </button>
            </div>

            {/* Middle: Testimonials */}
            <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32 relative">
              {/* Testimonial 1 */}
              <div className="flex flex-col gap-3">
                <Quote className="w-8 h-8 text-fresh fill-fresh opacity-20 -ml-1" />
                <p className="text-sm md:text-lg text-forest/90 leading-relaxed font-medium italic">
                  "Haifly Trap helped my business grow by providing a fly-free environment that my customers love. Effective and safe for everyone."
                </p>
                <div className="mt-1">
                  <p className="font-bold text-forest text-base">Chinwekene Oyigbo</p>
                  <p className="text-xs text-muted-foreground">CEO, Bochins Gadgets</p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex flex-col gap-3">
                <Quote className="w-8 h-8 text-fresh fill-fresh opacity-20 -ml-1" />
                <p className="text-sm md:text-lg text-forest/90 leading-relaxed font-medium italic">
                  "The Haifly Trap App and delivery have been a game-changer for our home safety. No more worrying about mosquitoes."
                </p>
                <div className="mt-1">
                  <p className="font-bold text-forest text-base">Sola Ogunleye</p>
                  <p className="text-xs text-muted-foreground">Homeowner, Lagos</p>
                </div>
              </div>
            </div>

            {/* Right: Video Stories Pure CSS Sticky Stack */}
            <div className="lg:col-span-3 flex flex-col lg:pt-10 relative">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-8 text-center lg:text-right w-full lg:max-w-[200px] lg:ml-auto">
                Video Stories
              </p>

              {/* Scroll container that gives room for stacking */}
              <div className="relative pb-48 lg:pb-32">
                {videoCards.map((card, i) => (
                  <VideoStoryCard 
                    key={i} 
                    card={card} 
                    index={i} 
                    isActive={activeVideoIndex === i}
                    onIntersect={handleIntersect}
                  />
                ))}
              </div>

              {/* Mobile See More on Instagram */}
              <div className="lg:hidden flex justify-center -mt-20 mb-12 relative z-20">
                <a 
                  href="https://instagram.com/haiflytrap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gold text-white font-bold rounded-full shadow-gold-glow flex items-center gap-3 btn-anim animate-bounce-subtle"
                >
                  <Instagram className="w-5 h-5" />
                  <span>See More Stories</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials — infinite scroll marquee */}
      <div className="py-12 bg-white overflow-hidden relative">
        <LeavesBackground opacity={0.08} />
        <div className="text-center mb-10 section-padding relative">
          <h2 className="font-display font-bold text-forest mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground">Verified reviews from real Nigerian homes</p>
          {/* Proof of Efficacy: Dead Fly near reviews header */}
          <img
            src="/images/dead_house_fly_final.png"
            alt=""
            className="absolute top-0 right-[15%] w-16 h-16 opacity-100 rotate-12 z-[20] mix-blend-multiply"
            style={{ clipPath: 'circle(36%)' }}
          />
        </div>

        {/* Marquee rows */}
        <div className="relative flex flex-col gap-4 group">
          {/* Fog gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-64 z-10 bg-gradient-to-r from-white via-white/90 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-64 z-10 bg-gradient-to-l from-white via-white/90 to-transparent" />

          {/* Row 1 — scrolls left */}
          <div className="flex gap-4 w-max animate-marquee-left group-hover:[animation-play-state:paused]">
            {[...row1Testimonials, ...row1Testimonials].map((review, i) => (
              <TestimonialCard key={`r1-${i}`} review={review} />
            ))}
          </div>

          {/* Row 2 — scrolls right */}
          <div className="flex gap-4 w-max animate-marquee-right group-hover:[animation-play-state:paused]">
            {[...row2Testimonials, ...row2Testimonials].map((review, i) => (
              <TestimonialCard key={`r2-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>

      <FAQSection />

      {/* CTA */}
      <div className="section-padding py-16">
        <div className="bg-forest rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Subtle Proof Fly in CTA corner - on a contained focus element */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-80 rotate-45 z-10">
            <img
              src="/images/dead_house_fly_final.png"
              alt=""
              className="w-8 h-8 mix-blend-multiply"
              style={{ clipPath: 'circle(36%)' }}
            />
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4">
            Ready to Protect Your <span ref={wordRef} className="inline-block text-gold-light ml-1">{words[wordIndex]}</span>
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Join 50,000+ Nigerian families who trust Haifly Trap for eco-friendly housefly control.
          </p>
          {isBackendDown && !isCheckingBackend ? (
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2348031301311'}?text=Hi%20I%20want%20to%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gold text-white font-semibold rounded-full transition-colors btn-gold-inverse inline-flex items-center"
            >
              <span>Order on WhatsApp</span>
              <ArrowUpRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
            </a>
          ) : (
            <button
              onClick={() => setCurrentView('shop')}
              className="px-8 py-4 bg-gold text-white font-semibold rounded-full transition-colors btn-gold-inverse"
            >
              <span>Shop Now</span>
              <ArrowUpRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
