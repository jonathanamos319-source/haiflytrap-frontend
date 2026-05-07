import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { FooterWave } from './FooterWave';

export function Footer() {
  const { currentView, setCurrentView } = useStore();

  return (
    <footer className="text-white relative overflow-hidden">
      <FooterWave />
      <div style={{ background: '#1a5c38' }}>
        <div className="section-padding py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center group no-anim"
              >
                {currentView !== 'shop' && (
                  <img 
                    src="/products/HAIFLYLOGO.png" 
                    alt="Haifly Logo" 
                    className="h-10 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                )}
              </button>
              <span className="text-gold font-display font-black text-[10px] md:text-xs tracking-[0.2em] uppercase mt-2">
                est 2018
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Nigeria's premier eco-friendly housefly control provider. Protecting homes from Ikeja to Abuja with naturally derived solutions.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors no-anim">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors no-anim">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors no-anim">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop All', view: 'shop' },
                { label: 'Our Story', view: 'reviews' },
                { label: 'Track Order', view: 'track-order' },
                { label: 'Bulk Orders', view: 'shop' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => setCurrentView(link.view as any)}
                    className="text-white/70 hover:text-white text-sm transition-colors btn-anim"
                  >
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-gold mb-4">Support</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Shipping Info', 'Returns', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-gold mb-4">Stay Connected</h4>
            <p className="text-white/70 text-sm mb-4">
              Subscribe for eco-tips and exclusive offers.
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <button className="px-4 py-2.5 bg-gold hover:bg-gold-light rounded-xl text-sm font-semibold transition-colors btn-gold">
                <span>Join</span>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-white/90 text-base md:text-lg">
                <Phone className="w-5 h-5 text-gold" />
                <span className="font-bold">+234 803 130 1311</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@haiflytrap.com</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Block D1181HFP, Eastline Complex, Abraham Adesanya, Ajah, Lagos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            © 2026 Haify Trap. Naturally Powerful Insecticide. | NAFDAC: A10-101283
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-xs">Secured by</span>
            <div className="flex gap-3">
              <span className="text-white/70 text-sm font-medium">Paystack</span>
              <span className="text-white/70 text-sm font-medium">Flutterwave</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
