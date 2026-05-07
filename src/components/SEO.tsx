import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';

export function SEO() {
  const { currentView, selectedProduct } = useStore();

  useEffect(() => {
    let title = 'Haify Trap - Premium Eco-Friendly Housefly Control';
    let description = 'Protect your home from flies with Haify Trap botanical solutions.';

    if (currentView === 'home') {
      title = 'Haify Trap | Home';
      description = 'Welcome to Haify Trap. Premium eco-friendly housefly control solutions.';
    } else if (currentView === 'shop') {
      title = 'Shop | Haify Trap';
      description = 'Browse our collection of premium eco-friendly housefly control solutions.';
    } else if (currentView === 'product' && selectedProduct) {
      title = `${selectedProduct.name} | Haify Trap`;
      description = selectedProduct.description || description;
    } else if (currentView === 'blog') {
      title = 'Blog | Haify Trap';
      description = 'Read the latest news and tips from Haify Trap.';
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
  }, [currentView, selectedProduct]);

  return null;
}
