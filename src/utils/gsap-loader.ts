/**
 * GSAP Lazy Loader Utility
 * 
 * Dynamically imports GSAP and required plugins only when needed.
 * This keeps the main bundle small and ensures GSAP is only loaded
 * on pages that use complex animations.
 */

export async function loadGSAP() {
  const [gsapModule, ScrollTriggerModule] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ]);

  const gsap = gsapModule.default;
  const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  return { gsap, ScrollTrigger };
}
