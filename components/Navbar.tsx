import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Sparkles, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { SearchOverlay } from './SearchOverlay';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onOpenAI }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <button 
            className={`lg:hidden ${isScrolled || isMobileMenuOpen ? 'text-dark-900' : 'text-dark-900 lg:text-white'}`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="z-50 flex items-center gap-3">
            <img 
              src={isScrolled || isMobileMenuOpen ? "/logo-black.png" : "/logo-golden.png"} 
              alt="AYVORA" 
              className="h-10 w-auto object-contain transition-all duration-300"
            />
            <span className={`text-2xl font-serif font-bold tracking-widest transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'text-dark-900' : 'text-gold-500'}`}>
              AYVORA
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex space-x-8 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                  location.pathname === link.href 
                    ? 'text-gold-600 font-bold' 
                    : 'text-dark-800 hover:text-gold-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Direct Track Order Link */}
            <Link 
              to="/track-order" 
              className="text-xs font-bold uppercase tracking-widest border border-dark-900 px-3 py-1 hover:bg-dark-900 hover:text-white transition-colors"
            >
              Track Order
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5 z-50">
             <button 
              onClick={onOpenAI}
              className="hidden md:flex items-center space-x-1 text-gold-600 hover:text-gold-500 transition-colors bg-gold-400/10 px-3 py-1 rounded-full"
            >
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Match</span>
            </button>

            <button 
              className="text-dark-800 hover:text-gold-500 transition-colors" 
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={22} />
            </button>
            
            <button 
              className="text-dark-800 hover:text-gold-500 transition-colors relative"
              onClick={onOpenCart}
              aria-label="Open Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-dark-900/50 z-50 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`bg-white w-3/4 h-full shadow-xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex justify-between items-center border-b">
            <span className="font-serif font-bold text-xl">MENU</span>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 flex flex-col space-y-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-lg font-medium uppercase tracking-wide ${
                  location.pathname === link.href ? 'text-gold-600' : 'text-dark-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
             <button 
              onClick={() => { onOpenAI(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-2 text-gold-600 font-bold uppercase tracking-wider mt-4"
            >
              <Sparkles size={20} />
              <span>AI Scent Match</span>
            </button>
            <Link 
              to="/track-order" 
              className="flex items-center space-x-2 text-dark-800 font-bold uppercase tracking-wider"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package size={20} />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};