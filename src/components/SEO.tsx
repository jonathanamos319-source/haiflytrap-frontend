import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';

const CANONICAL_ORIGIN = 'https://www.haiflytrap.com';

const VIEW_PATHS: Record<string, string> = {
  home: '/',
  shop: '/shop',
  blog: '/blog',
  reviews: '/reviews',
  'track-order': '/track-order',
  cart: '/cart',
  checkout: '/checkout',
  'customer-login': '/login',
};

export function SEO() {
  const { currentView, selectedProduct } = useStore();

  useEffect(() => {
    let title = 'Hai Fly Trap - Broad Killer 6X Odourless Pest Control Spray Nigeria';
    let description =
      'Hai Fly Trap Broad Killer 6X Odourless Surface Spray (500ml, ₦3,500). Fast 48-hour elimination of houseflies, bedbugs, cockroaches, ticks & fleas. Safe around humans, dogs, horses & plants. NAFDAC approved.';
    let canonicalPath = VIEW_PATHS[currentView] || '/';

    if (currentView === 'home') {
      title = 'Hai Fly Trap | Broad Killer 6X Odourless Pest Control Spray Nigeria';
      description =
        'Hai Fly Trap Broad Killer 6X Odourless Surface Spray (500ml, ₦3,500). Fast 48-hour elimination of houseflies, bedbugs, cockroaches & ticks. Safe around humans, pets & plants. NAFDAC approved.';
      canonicalPath = '/';
    } else if (currentView === 'shop') {
      title = 'Shop | Hai Fly Trap';
      description = 'Order authentic NAFDAC-approved Hai Fly Trap Broad Killer 6X 500ml spray with fast Lagos and nationwide delivery.';
    } else if (currentView === 'product' && selectedProduct) {
      title = `${selectedProduct.name} | Hai Fly Trap`;
      description = selectedProduct.description || description;
      canonicalPath = `/product/${selectedProduct.id}`;
    } else if (currentView === 'blog') {
      title = 'Blog | Hai Fly Trap';
      description = 'Read expert pest control tips, product updates, and safe home guidance from Hai Fly Trap.';
    } else if (currentView === 'reviews') {
      title = 'Customer Reviews | Hai Fly Trap';
      description = 'Verified testimonials and reviews from Nigerian homes, farms, kennels, and businesses using Hai Fly Trap.';
    } else if (currentView === 'track-order') {
      title = 'Track Your Order | Hai Fly Trap';
      description = 'Track your Hai Fly Trap order delivery status in real time.';
    }

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${CANONICAL_ORIGIN}${canonicalPath}`);
  }, [currentView, selectedProduct]);

  return null;
}
