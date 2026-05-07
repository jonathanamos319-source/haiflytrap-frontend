import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';

export function SEO() {
  const { currentView, selectedProduct } = useStore();

  useEffect(() => {
    let title = 'Haifly Trap - Premium Eco-Friendly Housefly Control';
    let description = 'Protect your home from flies with Haifly Trap botanical solutions.';

    if (currentView === 'home') {
      title = 'Haifly Trap | Home';
      description = 'Welcome to Haifly Trap. Premium eco-friendly housefly control solutions.';
    } else if (currentView === 'shop') {
      title = 'Shop | Haifly Trap';
      description = 'Browse our collection of premium eco-friendly housefly control solutions.';
    } else if (currentView === 'product' && selectedProduct) {
      title = `${selectedProduct.name} | Haifly Trap`;
      description = selectedProduct.description || description;
    } else if (currentView === 'blog') {
      title = 'Blog | Haifly Trap';
      description = 'Read the latest news and tips from Haifly Trap.';
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
