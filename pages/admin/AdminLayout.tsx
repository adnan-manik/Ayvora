import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Image, LogOut, Tag, Settings } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem('ayvora_admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
    localStorage.removeItem('ayvora_admin_auth');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/admin/dashboard' },
    { name: 'Products', icon: <Package size={20}/>, path: '/admin/products' },
    { name: 'Orders', icon: <ShoppingBag size={20}/>, path: '/admin/orders' },
    { name: 'Promo Codes', icon: <Tag size={20}/>, path: '/admin/promos' },
    { name: 'Banners', icon: <Image size={20}/>, path: '/admin/banners' },
    { name: 'Settings', icon: <Settings size={20}/>, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-dark-900 text-white fixed h-full flex flex-col z-50">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <img src="/logo-golden.png" alt="AYVORA" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="text-xl font-serif font-bold text-gold-500 tracking-widest leading-none">AYVORA</h2>
            <span className="text-xs text-gray-500 uppercase">Admin Portal</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                location.pathname === item.path 
                  ? 'bg-gold-500 text-white font-bold' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};