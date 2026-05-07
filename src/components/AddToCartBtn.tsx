import { useState, useRef } from "react";

const styles = `
  .cart-btn {
    --btn-bg:         #0f5238; /* forest */
    --btn-hover:      #0a3d2a; /* forest.dark */
    --btn-blue:       #d4a017; /* gold (truck cab front) */
    --btn-blue-light: #f8faf9; /* surface (windshield) */
    --btn-grey:       #006c48; /* fresh (truck cab back) */
    --btn-grey-dark:  #004d33; /* fresh.dark */
    --btn-grey-light: #e8eeeb; /* surface.high (truck body top) */
    --btn-grey-shade: #e1e3e2; /* surface.highest (truck body bottom) */
    --btn-green:      #e5b52e; /* gold.light (success checkmark) */
    --btn-sand:       #b0850f; /* gold.dark (package shade) */
    --btn-sand-light: #d4a017; /* gold (package light) */
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    width: 240px;
    height: 63px;
    background: var(--btn-bg);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    outline: none;
    box-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 8px 32px rgba(15,82,56,.5);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .cart-btn:hover:not(.go) { background: var(--btn-hover); }

  .lbl {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: .3px;
    pointer-events: none;
    transition: opacity .4s ease;
    color: #fff;
  }
  .lbl.idle { transition-delay: .3s; }
  .lbl.done { opacity: 0; }

  .cart-btn.go .lbl.idle { opacity: 0; transition-delay: 0s; }
  .cart-btn.go .lbl.done { opacity: 1; transition-delay: 7s; }

  .lbl.done svg {
    width: 14px; height: 12px;
    fill: none;
    stroke: var(--btn-green);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 16px;
    stroke-dashoffset: 16px;
    transition: stroke-dashoffset .35s ease;
  }
  .cart-btn.go .lbl.done svg {
    stroke-dashoffset: 0;
    transition-delay: 7.3s;
  }

  /* Package */
  .cargo {
    position: absolute;
    width: 20px; height: 20px;
    bottom: 14px;
    right: 100%;
    opacity: 0;
    border-radius: 3px;
    background: linear-gradient(135deg, var(--btn-sand-light), var(--btn-sand));
    box-shadow: inset -2px -2px 0 rgba(0,0,0,.15);
  }
  .cargo::before {
    content: '';
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 1.5px;
    background: rgba(0,0,0,.2);
    transform: translateX(-50%);
  }
  .cargo::after {
    content: '';
    position: absolute;
    top: 50%; left: 0; right: 0;
    height: 1.5px;
    background: rgba(0,0,0,.2);
    transform: translateY(-50%);
  }

  /* Truck */
  .vehicle {
    position: absolute;
    bottom: 10px;
    left: 100%;
    width: 82px;
    height: 42px;
    transform: translateX(24px);
  }
  .vehicle::before, .vehicle::after {
    content: '';
    position: absolute;
    left: 0;
    width: 44px;
    height: 50%;
    background: linear-gradient(180deg, var(--btn-grey-light), var(--btn-grey-shade));
  }
  .vehicle::before { top: 0; border-radius: 3px 3px 0 0; transform-origin: left top; }
  .vehicle::after  { bottom: 0; border-radius: 0 0 3px 3px; transform-origin: left bottom; }

  .cab-back {
    position: absolute;
    left: 42px; top: 4px;
    width: 12px; height: 34px;
    background: linear-gradient(180deg, var(--btn-grey), var(--btn-grey-dark));
    border-radius: 2px 0 0 2px;
  }
  .cab-back::before, .cab-back::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    background: #191c1c;
    border: 2px solid #004d33;
    border-radius: 50%;
    bottom: -19px;
    left: -32px;
  }
  .cab-back::after { left: -18px; }

  .cab-front {
    position: absolute;
    left: 53px; top: 0;
    width: 29px; height: 42px;
    background: var(--btn-blue);
    border-radius: 4px 10px 6px 4px;
    overflow: hidden;
  }
  .cab-front::before, .cab-front::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    background: #191c1c;
    border: 2px solid #004d33;
    border-radius: 50%;
    bottom: -5px;
  }
  .cab-front::before { left: 2px; }
  .cab-front::after  { right: 4px; }

  .windshield {
    position: absolute;
    top: 5px; right: 4px;
    width: 14px; height: 16px;
    background: var(--btn-blue-light);
    border-radius: 2px 6px 6px 2px;
    transform: perspective(4px) rotateY(3deg);
    transform-origin: 0 50%;
    opacity: .85;
  }

  .headlight {
    position: absolute;
    right: 2px;
    width: 4px; height: 4px;
    background: #e5b52e;
    border-radius: 1px;
  }
  .headlight.top    { top: 8px; }
  .headlight.bottom { top: 18px; }
  .headlight::before {
    content: '';
    position: absolute;
    left: 100%; top: 50%;
    width: 10px; height: 4px;
    opacity: 0;
    background: linear-gradient(90deg, rgba(229,181,46,1), rgba(229,181,46,.6), rgba(229,181,46,0));
    transform: perspective(2px) rotateY(-15deg) translateY(-50%);
  }

  /* Speed rail */
  .rail {
    position: absolute;
    opacity: 0;
    height: 3px; width: 6px;
    top: 29px; left: 100%;
    background: rgba(255,255,255,.5);
    border-radius: 2px;
    box-shadow:
      15px 0 0 rgba(255,255,255,.5), 30px 0 0 rgba(255,255,255,.5),
      45px 0 0 rgba(255,255,255,.5), 60px 0 0 rgba(255,255,255,.5),
      75px 0 0 rgba(255,255,255,.5), 90px 0 0 rgba(255,255,255,.5),
      105px 0 0 rgba(255,255,255,.5), 120px 0 0 rgba(255,255,255,.5),
      135px 0 0 rgba(255,255,255,.5), 150px 0 0 rgba(255,255,255,.5),
      165px 0 0 rgba(255,255,255,.5), 180px 0 0 rgba(255,255,255,.5),
      195px 0 0 rgba(255,255,255,.5), 210px 0 0 rgba(255,255,255,.5),
      225px 0 0 rgba(255,255,255,.5), 240px 0 0 rgba(255,255,255,.5),
      255px 0 0 rgba(255,255,255,.5), 270px 0 0 rgba(255,255,255,.5),
      285px 0 0 rgba(255,255,255,.5), 300px 0 0 rgba(255,255,255,.5),
      315px 0 0 rgba(255,255,255,.5), 330px 0 0 rgba(255,255,255,.5);
  }

  /* Keyframes */
  @keyframes veh {
    0%           { transform: translateX(24px); }
    10%, 30%     { transform: translateX(-164px); }
    40%          { transform: translateX(-104px); }
    60%          { transform: translateX(-260px); }
    75%, 100%    { transform: translateX(24px); }
  }
  @keyframes pkg {
    0%       { opacity: 0; transform: translateX(0); }
    8%, 10%  { opacity: 1; transform: translateX(40px); }
    25%      { opacity: 1; transform: translateX(112px); }
    26%      { opacity: 0; transform: translateX(112px); }
    100%     { opacity: 0; transform: translateX(0); }
  }
  @keyframes hatch1 {
    0%       { transform: rotate(0deg); }
    30%, 50% { transform: rotate(32deg); }
    70%, 100%{ transform: rotate(0deg); }
  }
  @keyframes hatch2 {
    0%       { transform: rotate(0deg); }
    30%, 50% { transform: rotate(-32deg); }
    70%, 100%{ transform: rotate(0deg); }
  }
  @keyframes rails {
    0%,  30% { opacity: 0; transform: scaleY(.7) translateX(0); }
    35%, 65% { opacity: 1; }
    70%      { opacity: 0; }
    100%     { opacity: 0; transform: scaleY(.7) translateX(-400px); }
  }
  @keyframes glow {
    0%,  30% { opacity: 0; }
    40%, 100%{ opacity: 1; }
  }

  /* Animate on .go */
  .cart-btn.go .vehicle        { animation: veh   10s cubic-bezier(.4,0,.2,1) forwards; }
  .cart-btn.go .vehicle::before{ animation: hatch1 2.4s ease forwards 0.3s; }
  .cart-btn.go .vehicle::after { animation: hatch2 2.4s ease forwards 0.6s; }
  .cart-btn.go .cargo          { animation: pkg   10s ease forwards; }
  .cart-btn.go .rail           { animation: rails 10s ease forwards; }
  .cart-btn.go .headlight::before { animation: glow 10s ease forwards; }
`;

export default function AddToCartBtn({ onAddToCart }: { onAddToCart?: () => void }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onAddToCart?.();
    timerRef.current = setTimeout(() => setIsAnimating(false), 10000);
  };

  return (
    <>
      <style>{styles}</style>
      <button
        className={`cart-btn no-anim${isAnimating ? " go" : ""}`}
        onClick={handleClick}
        aria-label="Add to cart"
      >
        {/* Idle label */}
        <span className="lbl idle">Add to Cart</span>

        {/* Success label */}
        <span className="lbl done">
          Added!
          <svg viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1" />
          </svg>
        </span>

        {/* Package */}
        <div className="cargo" />

        {/* Truck */}
        <div className="vehicle">
          <div className="cab-back" />
          <div className="cab-front">
            <div className="windshield" />
          </div>
          <div className="headlight top" />
          <div className="headlight bottom" />
        </div>

        {/* Speed lines */}
        <div className="rail" />
      </button>
    </>
  );
}
