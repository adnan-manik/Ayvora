import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-golden.png" alt="AYVORA" className="h-10 w-auto object-contain" />
              <span className="text-2xl font-serif font-bold tracking-widest text-gold-500">AYVORA</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the art of perfumery with Ayvora. Our scents are crafted to leave a lasting impression, blending tradition with modern elegance.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-gold-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a></li>
              <li><Link to="/track-order" className="hover:text-gold-500 transition-colors">Track Order</Link></li>
              <li><Link to="/admin/login" className="hover:text-gold-500 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-6">Collections</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/shop/Men" className="hover:text-gold-500 transition-colors">Men's Fragrances</Link></li>
              <li><Link to="/shop/Women" className="hover:text-gold-500 transition-colors">Women's Fragrances</Link></li>
              <li><Link to="/shop/Unisex" className="hover:text-gold-500 transition-colors">Unisex Collection</Link></li>
              <li><Link to="/shop/Testers" className="hover:text-gold-500 transition-colors">Testers</Link></li>
              <li><Link to="/shop" className="hover:text-gold-500 transition-colors">Gift Sets</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>123 Luxury Lane, Fashion District, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <span>support@ayvora.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Ayvora. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
             <span>VISA</span>
             <span>Mastercard</span>
             <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};