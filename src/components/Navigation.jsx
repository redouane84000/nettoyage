import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/devis', label: 'Devis' },
    { path: '/formulaire', label: 'Contact' }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-[68px]">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-display font-bold text-[13px] tracking-wide">FC</span>
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-primary text-[15px] sm:text-lg leading-tight tracking-[0.08em]">FAST & CLEAN</div>
              <div className="hidden sm:block text-[11px] text-slate-500 tracking-wide">Nettoyage Haute Pression</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium text-[15px] tracking-wide transition-colors pb-1 ${
                  isActive(item.path)
                    ? 'text-primary after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-secondary'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/formulaire"
              className="btn-primary flex items-center !px-5 !py-2.5 text-sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium px-4 py-2.5 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-secondary/10 text-primary'
                      : 'text-slate-600 hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/formulaire"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary mx-4 mt-2 flex items-center justify-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
