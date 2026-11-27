import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ExternalLink, Heart } from 'lucide-react';
import { toast } from 'sonner';

const postAsset = (name: string) => `/instagram-post/${name}`;

const POST_DETAILS: readonly [string, string][] = [
  [
    'Tamper-Proof Protection:',
    ' Comes with a red tamper-proof seal to protect against adulteration.',
  ],
  ['Odourless Formula:', ' No offensive smell.'],
  ['Safe Around:', ' Humans, dogs, horses, pigs and plants.'],
  [
    'Broad-Spectrum Pest Control:',
    ' Eliminates houseflies, bedbugs, cockroaches, sand flies, ticks, fleas and plant-eating insects such as aphids and black beetles.',
  ],
  ['48-Hour Kill Effect:', ' Provides up to 48 hours of constant elimination.'],
  ['Heat Resistant:', ' Formulated to withstand temperatures above 35°C.'],
];

interface ScrollableInstagramPostProps {
  onShopClick?: () => void;
  showWhatsAppFallback?: boolean;
  whatsappNumber?: string;
}

function PostIconButton({
  src,
  label,
  className = '',
  onClick,
  ariaPressed,
}: {
  src: string;
  label: string;
  className?: string;
  onClick?: () => void;
  ariaPressed?: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={ariaPressed}
      className={`no-anim flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:bg-white/10 active:scale-90 ${className}`}
      onClick={onClick}
      type="button"
    >
      <img alt="" className="max-h-6 max-w-6" src={src} />
    </button>
  );
}

/**
 * Interactive scrollable Instagram product showcase post for Broad Killer 6X 500ml.
 * Styled to match the @haiflytrap Instagram feature post while integrating cleanly
 * with HomePage sections and mobile viewports.
 */
export function ScrollableInstagramPost({
  onShopClick,
  showWhatsAppFallback = false,
  whatsappNumber = '2348031301311',
}: ScrollableInstagramPostProps) {
  const [liked, setLiked] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const captionRef = useRef<HTMLDivElement>(null);

  const updateScrollHint = () => {
    const el = captionRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 12);
  };

  useEffect(() => {
    updateScrollHint();
    window.addEventListener('resize', updateScrollHint);
    return () => window.removeEventListener('resize', updateScrollHint);
  }, []);

  const handleImageDoubleTap = () => {
    setLiked(true);
    setShowHeartBurst(true);
    window.setTimeout(() => setShowHeartBurst(false), 650);
  };

  const handleShare = async () => {
    const shareUrl = 'https://www.instagram.com/haiflytrap/';
    const shareText =
      'Check out HAI FLY TRAP BROAD KILLER™️ 6X Odourless Surface Spray – 500ml (₦3,500)!';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Hai Fly Trap Broad Killer 6X',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or share unavailable; fall back to clipboard copy below.
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success('Post link copied to share!');
    } catch {
      toast.info('Follow @haiflytrap on Instagram to share!');
    }
  };

  const handleToggleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      toast.success(next ? 'Broad Killer post saved' : 'Removed from saved');
      return next;
    });
  };

  const handleScrollDownHint = () => {
    const el = captionRef.current;
    if (!el) return;
    el.scrollBy({ top: 140, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[24px] md:rounded-[28px] bg-[#3c3c3b] text-white shadow-2xl border border-forest/15 text-left">
      {/* Post Card Header Bar */}
      <div className="border-b border-white/10 bg-[#3c3c3b]">
        <div className="relative flex h-12 items-center justify-center border-b border-white/10 px-4">
          <a
            href="https://www.instagram.com/haiflytrap/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit @haiflytrap on Instagram"
            className="inline-flex items-center hover:opacity-90 transition-opacity"
          >
            <img alt="Instagram" className="h-auto w-[104px]" src={postAsset('7b599.svg')} />
          </a>
          <a
            href="https://www.instagram.com/haiflytrap/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:bg-white/20 transition-colors"
          >
            <span className="hidden sm:inline">View Profile</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex h-[58px] items-center gap-3 px-4">
          <a
            href="https://www.instagram.com/haiflytrap/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <img
              alt="Hai Fly Trap profile"
              className="h-9 w-9 shrink-0 rounded-full border-2 border-[#f14a53] object-cover"
              src={postAsset('profile-picture.jpg')}
            />
          </a>
          <div className="min-w-0 leading-tight">
            <a
              href="https://www.instagram.com/haiflytrap/"
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-[13px] font-bold text-white hover:underline"
            >
              haiflytrap
            </a>
            <span className="block truncate text-[11px] text-white/65">
              Broad Killer™️ 6X • Official Showcase
            </span>
          </div>
          <a
            href="https://www.instagram.com/haiflytrap/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="More options on Instagram"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <img alt="" className="h-auto w-5" src={postAsset('db664.svg')} />
          </a>
        </div>
      </div>

      {/* Responsive Split Post Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        {/* Product Photo Frame */}
        <div
          className="relative flex items-center justify-center bg-white select-none cursor-pointer"
          onDoubleClick={handleImageDoubleTap}
          title="Double-click to like"
        >
          <img
            alt="Hai Fly Trap Broad Killer odourless surface spray bottle"
            className="block aspect-[1181/1206] w-full max-h-[420px] lg:max-h-[490px] object-contain"
            loading="lazy"
            src={postAsset('39ec3.png')}
          />

          {showHeartBurst && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart className="h-20 w-20 fill-[#f14a53] text-[#f14a53] drop-shadow-xl animate-scale-in" />
            </div>
          )}
        </div>

        {/* Scrollable Details & Engagement Column */}
        <div className="relative flex flex-col bg-[#3c3c3b] h-[350px] sm:h-[380px] lg:h-[490px] border-t border-white/10 lg:border-t-0 lg:border-l">
          {/* Engagement Icons Row */}
          <div className="relative flex shrink-0 items-center gap-1 px-3 pb-1 pt-2">
            <PostIconButton
              ariaPressed={liked}
              className={liked ? '' : 'grayscale opacity-75'}
              label={liked ? 'Unlike post' : 'Like post'}
              onClick={() => setLiked((value) => !value)}
              src={postAsset('7dc37.svg')}
            />
            <PostIconButton
              label="Scroll post details"
              onClick={handleScrollDownHint}
              src={postAsset('ad8b8.svg')}
            />
            <PostIconButton label="Share post" onClick={handleShare} src={postAsset('52fe9.svg')} />
            <img
              alt="Featured slide"
              className="pointer-events-none absolute left-1/2 h-[5px] w-[23px] -translate-x-1/2"
              src={postAsset('87297.svg')}
            />
            <PostIconButton
              ariaPressed={saved}
              className={`ml-auto ${saved ? 'ring-1 ring-gold bg-gold/20' : ''}`}
              label={saved ? 'Remove bookmark' : 'Save post'}
              onClick={handleToggleSave}
              src={postAsset('84ab3.svg')}
            />
          </div>

          {/* Likes Counter */}
          <div className="shrink-0 px-4 pb-2.5 border-b border-white/10">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <img
                  alt=""
                  className={`h-[10px] w-3.5 transition-all ${liked ? '' : 'grayscale opacity-60'}`}
                  src={postAsset('10c56.svg')}
                />
                <span className="font-semibold text-white">{liked ? '362' : '361'} likes</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-white/55">Scroll caption</span>
            </div>
          </div>

          {/* Independently Scrollable Post Caption */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={captionRef}
              onScroll={updateScrollHint}
              className="ig-post-scroll h-full overflow-y-auto px-4 py-3.5 text-[13px] leading-[1.45] text-white/95"
            >
              <article className="space-y-3 pb-10">
                <p>
                  <strong className="font-bold text-white">haiflytrap</strong> Here is our new look
                  of Broad Killer!
                </p>

                <p className="font-bold text-gold">
                  HAI FLY TRAP BROAD KILLER™️ 6X ODOURLESS SURFACE SPRAY – 500ML
                </p>

                <p>
                  Introducing the upgraded Hai Fly Trap Broad Killer Odourless Surface Spray 6X!
                </p>

                <p className="font-bold tracking-wide text-white">
                  POWERFUL PROTECTION. LONG-LASTING ELIMINATION.
                </p>

                {POST_DETAILS.map(([title, copy]) => (
                  <p key={title}>
                    <strong className="font-bold text-white">{title}</strong>
                    <span className="text-white/90">{copy}</span>
                  </p>
                ))}

                <p className="font-bold text-white">HAI FLY TRAP – INNOVATION YOU CAN TRUST.</p>
                <p className="text-white/90">Healthy Homes. Healthier Communities.</p>
                <p>
                  <strong className="font-bold text-gold">Retail Price:</strong> ₦3,500 per 500ml
                  bottle.
                </p>
                <p className="font-bold text-white">ESTABLISHED: 2018</p>
                <p className="text-white/90">Nafdac approved</p>
                <p className="text-white/90">Proudly made in Nigeria 🇳🇬</p>
              </article>
            </div>

            {canScrollDown && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#3c3c3b] via-[#3c3c3b]/85 to-transparent" />
                <button
                  type="button"
                  onClick={handleScrollDownHint}
                  aria-label="Scroll down to read more details"
                  className="no-anim absolute bottom-2 right-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm border border-white/15 hover:bg-black/90 transition-colors"
                >
                  <span>More</span>
                  <ChevronDown className="h-3 w-3 animate-bounce" />
                </button>
              </>
            )}
          </div>

          {/* Card Footer Action Bar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#323231] px-3 sm:px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">Broad Killer™️ 6X (500ml)</p>
              <p className="text-[11px] font-semibold text-gold">₦3,500 • NAFDAC Approved</p>
            </div>

            {showWhatsAppFallback ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20I%20want%20to%20order%20Broad%20Killer%20500ml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3.5 sm:px-4 py-2 text-xs font-bold text-forest shadow-md transition-colors hover:bg-white"
              >
                <span>Order on WhatsApp</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onShopClick}
                className="no-anim inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3.5 sm:px-4 py-2 text-xs font-bold text-forest shadow-md transition-colors hover:bg-white"
              >
                <span>Shop Broad Killer</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
