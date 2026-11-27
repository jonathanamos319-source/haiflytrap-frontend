import { ArrowUpRight, CheckCircle2, Flame, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import Lottie from 'lottie-react';
import leavesAnimation from '../lotties/leaves.json';
import { LeavesBackground } from '@/components/LeavesBackground';
import {
  AphidSvg,
  BlackBeetleSvg,
  DogEmblemSvg,
  FleaSvg,
  HorseEmblemSvg,
  HumansEmblemSvg,
  PigEmblemSvg,
  PlantsEmblemSvg,
  SandFlySvg,
} from '@/components/ShowcaseIcons';
import {
  OrganicMiniCardBackdrop,
  OrganicPanelBackdrop,
} from '@/components/OrganicPanelShapes';

interface BroadKillerShowcaseSectionProps {
  onShopClick?: () => void;
  showWhatsAppFallback?: boolean;
  whatsappNumber?: string;
}

interface PestItem {
  name: string;
  image?: string;
  renderSvg?: () => React.ReactNode;
}

const TARGET_PESTS: readonly PestItem[] = [
  { name: 'Houseflies', image: '/images/dead_house_fly_final.png' },
  { name: 'Bedbugs', image: '/images/bedbug.png' },
  { name: 'Cockroaches', image: '/images/cockroach.png' },
  { name: 'Sand flies', renderSvg: () => <SandFlySvg className="w-8 h-8" /> },
  { name: 'Ticks', image: '/images/tick.png' },
  { name: 'Fleas', renderSvg: () => <FleaSvg className="w-8 h-8" /> },
  { name: 'Aphids', renderSvg: () => <AphidSvg className="w-8 h-8" /> },
  { name: 'Black beetles', renderSvg: () => <BlackBeetleSvg className="w-8 h-8" /> },
];

const PROTECTION_HIGHLIGHTS = [
  {
    title: '48-Hour Kill Effect',
    description: 'Up to 48 hours of continuous elimination per surface application.',
    icon: Timer,
  },
  {
    title: '6X Odourless Formula',
    description: 'High-strength upgraded formula built for stubborn infestations.',
    icon: Sparkles,
  },
  {
    title: 'No Offensive Smell',
    description: 'Keeps kitchens, bedrooms & pet areas fresh without harsh fumes.',
    icon: CheckCircle2,
  },
  {
    title: 'Heat Resistant Above 35°C',
    description: 'Remains stable and effective in hot indoor or outdoor climates.',
    icon: Flame,
  },
] as const;

const SAFE_AROUND_SUBJECTS = [
  { name: 'Humans', renderIcon: () => <HumansEmblemSvg className="w-6 h-6 sm:w-7 sm:h-7" /> },
  { name: 'Dogs', renderIcon: () => <DogEmblemSvg className="w-6 h-6 sm:w-7 sm:h-7" /> },
  { name: 'Horses', renderIcon: () => <HorseEmblemSvg className="w-6 h-6 sm:w-7 sm:h-7" /> },
  { name: 'Pigs', renderIcon: () => <PigEmblemSvg className="w-6 h-6 sm:w-7 sm:h-7" /> },
  { name: 'Plants', renderIcon: () => <PlantsEmblemSvg className="w-6 h-6 sm:w-7 sm:h-7" /> },
] as const;

function DualCircleBadges({
  topValue,
  topLabel,
  bottomValue,
  bottomLabel,
  topClassName,
  bottomClassName,
}: {
  topValue: string;
  topLabel: string;
  bottomValue: string;
  bottomLabel: string;
  topClassName: string;
  bottomClassName: string;
}) {
  return (
    <div className="flex flex-row lg:flex-col items-center justify-center gap-2.5 z-20 shrink-0">
      <div
        className={`w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center text-center shadow-lg border-[3px] border-white leading-none transition-transform duration-300 hover:scale-105 ${topClassName}`}
      >
        <span className="text-[8px] font-bold uppercase tracking-wider opacity-85">{topLabel}</span>
        <span className="text-xs font-extrabold mt-0.5">{topValue}</span>
      </div>
      <div
        className={`w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center text-center shadow-lg border-[3px] border-white leading-none transition-transform duration-300 hover:scale-105 ${bottomClassName}`}
      >
        <span className="text-[8px] font-bold uppercase tracking-wider opacity-85">{bottomLabel}</span>
        <span className="text-xs font-extrabold mt-0.5 px-1">{bottomValue}</span>
      </div>
    </div>
  );
}

const FALLING_LEAVES = [
  { left: '3%', top: '-4%', size: 22, duration: '9s', delay: '0s', color: '#017810' },
  { left: '8%', top: '18%', size: 18, duration: '11s', delay: '-3s', color: '#006c48' },
  { left: '4%', top: '52%', size: 20, duration: '10.5s', delay: '-6s', color: '#0f5238' },
  { left: '92%', top: '-6%', size: 22, duration: '9.5s', delay: '-1.5s', color: '#017810' },
  { left: '95%', top: '26%', size: 18, duration: '12s', delay: '-5s', color: '#16a34a' },
  { left: '90%', top: '62%', size: 20, duration: '10s', delay: '-7.5s', color: '#006c48' },
] as const;

/**
 * Compact, responsive multi-panel product showcase section for HAI FLY TRAP BROAD KILLER 6X (500ml),
 * rendered with custom asymmetrical curved & angled SVG panels, brand tree branches, and falling leaves.
 */
export function BroadKillerShowcaseSection({
  onShopClick,
  showWhatsAppFallback = false,
  whatsappNumber = '2348031301311',
}: BroadKillerShowcaseSectionProps) {
  return (
    <section
      aria-labelledby="broad-killer-showcase-heading"
      className="py-8 md:py-10 bg-surface-low relative overflow-hidden scroll-mt-24"
    >
      {/* Existing Site Lottie Leaves Background Layer */}
      <LeavesBackground opacity={0.2} />

      {/* Mobile & Outer Corner Visible Lottie Foliage Accents */}
      <div
        aria-hidden="true"
        className="md:hidden pointer-events-none absolute -top-6 -left-8 w-44 h-44 opacity-20 rotate-12 select-none z-0"
      >
        <Lottie animationData={leavesAnimation} loop={true} />
      </div>
      <div
        aria-hidden="true"
        className="md:hidden pointer-events-none absolute -bottom-6 -right-8 w-44 h-44 opacity-20 rotate-[190deg] select-none z-0"
      >
        <Lottie animationData={leavesAnimation} loop={true} />
      </div>

      {/* Prominent Brand Tree Branches Framing All Sides */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-12 w-56 sm:w-72 md:w-80 h-auto opacity-25 rotate-12 select-none z-0"
      >
        <img src="/products/image%206.png" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[22%] -left-16 w-52 sm:w-64 md:w-72 h-auto opacity-20 -rotate-45 select-none z-0"
      >
        <img src="/products/image%206.png" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[24%] -right-14 w-52 sm:w-64 md:w-72 h-auto opacity-20 -rotate-[135deg] select-none z-0"
      >
        <img src="/products/image%206.png" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-12 w-56 sm:w-72 h-auto opacity-25 rotate-[165deg] select-none z-0"
      >
        <img src="/products/image%206.png" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>

      {/* Drifting Animated Falling Leaves Layer (sits cleanly behind panels on mobile) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none z-[5]">
        {FALLING_LEAVES.map((leaf, idx) => (
          <div
            key={idx}
            className="animate-leaf-fall absolute opacity-45 md:opacity-70"
            style={{
              left: leaf.left,
              top: leaf.top,
              width: leaf.size,
              height: leaf.size,
              animationDuration: leaf.duration,
              animationDelay: leaf.delay,
            }}
          >
            <svg viewBox="0 0 24 24" fill={leaf.color} className="w-full h-full drop-shadow-xs">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8Z" />
            </svg>
          </div>
        ))}
      </div>

      <div className="section-padding relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Area: Compact Brand Mark + Main Heading + Tagline */}
          <div className="text-center mb-3 md:mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest px-3.5 py-1 shadow-md border border-[#017810] mb-2">
              <img
                src="/products/HAIFLYLOGO.png"
                alt="Hai Fly Trap Logo"
                className="w-6 h-6 rounded-full bg-white p-0.5 object-contain"
              />
              <span className="text-xs font-extrabold tracking-wide text-white">HAI FLY TRAP™</span>
              <span className="rounded-full bg-[#e40d14] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                EST. 2018
              </span>
            </div>

            <h2
              id="broad-killer-showcase-heading"
              className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-forest tracking-tight leading-[1.15]"
            >
              HAI FLY TRAP™{' '}
              <span className="inline-block bg-[#017810] text-white px-3 py-0.5 rounded-xl shadow-sm mt-1 sm:mt-0">
                BROAD KILLER 6X
              </span>
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm md:text-base font-bold tracking-wide text-fresh uppercase">
              POWERFUL PROTECTION. LONG-LASTING ELIMINATION.
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-on-surface/75">
              6X Odourless Surface Spray • 500ML Trigger Bottle
            </p>
          </div>

          {/* Interlocking Asymmetrical Organic Panels */}
          <div className="space-y-1 lg:space-y-0">
            {/* PANEL 1: BROAD-SPECTRUM PEST CONTROL */}
            <article className="relative text-white px-4 pt-5 pb-6 sm:px-6 lg:px-7 lg:pt-5 lg:pb-9 transition-transform duration-300 hover:-translate-y-0.5 z-10">
              <OrganicPanelBackdrop variant="crimson-top" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,0.75fr)] items-center gap-3 lg:gap-4">
                {/* Left: Section 1 Info & All 8 Pests Compact Grid */}
                <div>
                  <span className="inline-flex items-center rounded-full bg-white text-[#e40d14] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Section 01 • Targeted Control
                  </span>
                  <h3 className="mt-2 font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    BROAD-SPECTRUM PEST CONTROL
                  </h3>
                  <p className="mt-1 text-xs sm:text-[13px] text-white/95 max-w-xl leading-snug">
                    Fast knockdown across flying, crawling and biting pests in homes, farms, kennels & gardens.
                  </p>

                  {/* 8 Pests Organic Pill Tiles */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {TARGET_PESTS.map((pest) => (
                      <div
                        key={pest.name}
                        className="group/pest flex sm:flex-col items-center justify-start sm:justify-center gap-1.5 sm:gap-1 rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg bg-white px-2 py-1.5 sm:p-2 text-left sm:text-center shadow-sm border border-[#017810]/15 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 rounded-full bg-[#f8faf9] flex items-center justify-center overflow-hidden border border-[#017810]/20">
                          {pest.image ? (
                            <img
                              src={pest.image}
                              alt={pest.name}
                              loading="lazy"
                              className="w-5 h-5 sm:w-7 sm:h-7 object-contain mix-blend-multiply transition-transform duration-200 group-hover/pest:scale-110"
                            />
                          ) : (
                            <div className="scale-90 sm:scale-100 transition-transform duration-200 group-hover/pest:scale-110">
                              {pest.renderSvg?.()}
                            </div>
                          )}
                        </div>
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-forest leading-tight">
                          {pest.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle Seam Badges */}
                <DualCircleBadges
                  topLabel="RETAIL"
                  topValue="₦3,500"
                  topClassName="bg-white text-forest"
                  bottomLabel="SIZE"
                  bottomValue="500ML"
                  bottomClassName="bg-forest text-white"
                />

                {/* Right: Untouched Bottle Medallion Overlapping Upper Seam */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:-mt-4 rounded-full bg-white p-2.5 shadow-xl border-4 border-white flex items-center justify-center transition-transform duration-300 hover:scale-[1.03]">
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-[#017810]/25 pointer-events-none" />
                    <img
                      src="/showcase/broad-killer-bottle-cutout.png"
                      alt="Hai Fly Trap Broad Killer 6X 500ml Odourless Surface Spray Bottle"
                      className="h-full w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* PANEL 2: LONG-LASTING PROTECTION (Interlocking Parallel Slopes) */}
            <article className="relative text-white px-4 pt-6 pb-6 sm:px-6 lg:px-7 lg:pt-8 lg:pb-9 lg:-mt-9 transition-transform duration-300 hover:-translate-y-0.5 z-20">
              <OrganicPanelBackdrop variant="forest-middle" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,0.75fr)_auto_minmax(0,1.35fr)] items-center gap-3 lg:gap-4">
                {/* Left: Bottle Visual */}
                <div className="flex justify-center order-3 lg:order-1">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:mt-2 rounded-full bg-white p-2.5 shadow-xl border-4 border-[#01b200]/35 flex items-center justify-center transition-transform duration-300 hover:scale-[1.03]">
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-[#017810]/20 pointer-events-none" />
                    <img
                      src="/showcase/broad-killer-bottle-cutout.png"
                      alt="Broad Killer 6X Long-Lasting Spray Bottle"
                      loading="lazy"
                      className="h-full w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Middle Seam Badges */}
                <div className="order-2">
                  <DualCircleBadges
                    topLabel="KILL"
                    topValue="48 HRS"
                    topClassName="bg-[#e40d14] text-white"
                    bottomLabel="HEAT SAFE"
                    bottomValue="> 35°C"
                    bottomClassName="bg-white text-[#017810]"
                  />
                </div>

                {/* Right: Section 2 Long-Lasting Protection Asymmetric Feature Tiles */}
                <div className="order-1 lg:order-3">
                  <span className="inline-flex items-center rounded-full bg-[#01b200] text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Section 02 • Performance Shield
                  </span>
                  <h3 className="mt-2 font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    LONG-LASTING PROTECTION
                  </h3>
                  <p className="mt-1 text-xs sm:text-[13px] text-white/90 max-w-xl leading-snug">
                    Upgraded 6X strength engineered for odourless indoor comfort and rugged tropical heat stability.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PROTECTION_HIGHLIGHTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-white p-3 text-left shadow-sm border border-[#017810]/20 transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#017810] text-white">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <h4 className="text-xs sm:text-[13px] font-extrabold text-forest leading-tight">
                              {item.title}
                            </h4>
                          </div>
                          <p className="mt-1.5 text-[11px] text-on-surface/80 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>

            {/* PANEL 3: SAFE AROUND (Interlocking White Label + Curved Green Skirt) */}
            <article className="relative text-forest px-4 pt-6 pb-5 sm:px-6 lg:px-7 lg:pt-8 lg:pb-7 lg:-mt-9 transition-transform duration-300 hover:-translate-y-0.5 z-10">
              <OrganicPanelBackdrop variant="white-bottom" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,0.75fr)] items-center gap-3 lg:gap-4">
                {/* Left: Safe Around Copy + Asymmetric Curved Green Packaging Skirt */}
                <div>
                  <span className="inline-flex items-center rounded-full bg-[#e40d14] text-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    Section 03 • Safe Around
                  </span>
                  <h3 className="mt-2 font-display font-extrabold text-xl sm:text-2xl text-forest tracking-tight">
                    SAFE AROUND PEOPLE, PETS & PLANTS
                  </h3>
                  <p className="mt-1 text-xs sm:text-[13px] text-on-surface/80 max-w-xl leading-snug">
                    Targeted elimination designed for peace of mind around family members, companion animals, livestock & greenery.
                  </p>

                  {/* Curved Asymmetrical Green Packaging Skirt */}
                  <div className="mt-3 rounded-tl-[22px] rounded-br-[22px] rounded-tr-[10px] rounded-bl-[10px] bg-gradient-to-r from-[#017810] via-[#068c16] to-[#006c48] p-3 sm:p-3.5 shadow-inner border-t-[3px] border-[#01b200]">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2.5 sm:grid sm:grid-cols-5 sm:gap-2">
                      {SAFE_AROUND_SUBJECTS.map((subject) => (
                        <div
                          key={subject.name}
                          className="group/safe flex flex-col items-center text-center min-w-[68px] sm:min-w-0"
                        >
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#017810] flex items-center justify-center shadow-sm border-2 border-white transition-transform duration-200 group-hover/safe:scale-110">
                            {subject.renderIcon()}
                          </div>
                          <span className="mt-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide text-white">
                            {subject.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Seam Badges */}
                <DualCircleBadges
                  topLabel="EST."
                  topValue="2018"
                  topClassName="bg-[#e40d14] text-white"
                  bottomLabel="CERTIFIED"
                  bottomValue="NAFDAC"
                  bottomClassName="bg-[#017810] text-white"
                />

                {/* Right: Compact Product Medallion */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:mt-1 rounded-full bg-[#f8faf9] p-2.5 shadow-xl border-4 border-[#017810]/20 flex items-center justify-center transition-transform duration-300 hover:scale-[1.03]">
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-[#017810]/20 pointer-events-none" />
                    <img
                      src="/showcase/broad-killer-bottle-cutout.png"
                      alt="Broad Killer 500ml Safe Around Formula"
                      loading="lazy"
                      className="h-full w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Bottom Organic Highlight Row */}
          <div className="mt-1.5 lg:-mt-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 lg:gap-3 items-stretch">
            {/* Highlight 1: Dedicated Tamper-Proof Protection */}
            <div className="relative lg:col-span-5 px-5 py-5 flex flex-col sm:flex-row items-center gap-3.5 transition-transform duration-300 hover:-translate-y-0.5">
              <OrganicMiniCardBackdrop variant="tamper-seal" />

              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-[#f8faf9] border-2 border-[#e40d14]/30 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src="/showcase/red-tamper-seal.png"
                  alt="Red tamper-proof protection seal on Broad Killer bottle cap"
                  loading="lazy"
                  className="h-full w-auto object-contain drop-shadow-xs"
                />
              </div>

              <div className="relative z-10 text-center sm:text-left">
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e40d14]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Red Tamper-Proof Seal</span>
                </div>
                <h3 className="mt-0.5 font-display font-extrabold text-sm sm:text-base text-forest leading-tight">
                  TAMPER-PROOF PROTECTION
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-on-surface/80 leading-snug">
                  Sealed with our signature red tamper-proof seal to protect against adulteration and guarantee genuine factory quality.
                </p>
              </div>
            </div>

            {/* Highlight 2: Price, Size & Trust Credentials */}
            <div className="relative lg:col-span-4 px-5 py-5 text-white flex flex-col justify-between transition-transform duration-300 hover:-translate-y-0.5">
              <OrganicMiniCardBackdrop variant="price-trust" />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/75">
                    RETAIL PRICE
                  </span>
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-none mt-0.5">
                    ₦3,500
                  </div>
                </div>
                <div className="rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#01b200] px-3 py-1.5 text-center shadow-xs">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-white/90">
                    PRODUCT SIZE
                  </span>
                  <span className="block text-sm font-extrabold text-white leading-tight">
                    500ML
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#e40d14] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  ESTABLISHED: 2018
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-forest uppercase tracking-wide">
                  NAFDAC APPROVED
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  <span>PROUDLY MADE IN NIGERIA</span>
                  <svg
                    viewBox="0 0 18 12"
                    className="w-3.5 h-2.5 rounded-[2px] shrink-0"
                    aria-label="Nigeria flag"
                  >
                    <rect width="6" height="12" fill="#008751" />
                    <rect x="6" width="6" height="12" fill="#ffffff" />
                    <rect x="12" width="6" height="12" fill="#008751" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Highlight 3: Closing Promise & Order CTA */}
            <div className="relative lg:col-span-3 px-5 py-5 text-white flex flex-col justify-between text-center lg:text-left transition-transform duration-300 hover:-translate-y-0.5">
              <OrganicMiniCardBackdrop variant="promise-cta" />

              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Our Promise
                </p>
                <p className="mt-1 font-display font-extrabold text-base sm:text-lg leading-tight text-white">
                  HEALTHY HOMES.
                  <br />
                  HEALTHIER COMMUNITIES.
                </p>
              </div>

              <div className="relative z-10 mt-3">
                {showWhatsAppFallback ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=Hi%20I%20want%20to%20order%20Broad%20Killer%206X%20500ml`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-white text-forest px-4 py-2 text-xs font-extrabold shadow-sm transition-all hover:bg-[#e40d14] hover:text-white"
                  >
                    <span>Order on WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onShopClick}
                    className="no-anim w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-white text-forest px-4 py-2 text-xs font-extrabold shadow-sm transition-all hover:bg-[#e40d14] hover:text-white"
                  >
                    <span>Order Broad Killer 6X</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
