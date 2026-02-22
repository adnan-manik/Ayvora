import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CartDrawer } from './components/CartDrawer';
import { AIScentFinder } from './components/AIScentFinder';
import { AnnouncementBar } from './components/AnnouncementBar';
import { CartItem, Product } from './types';
import { PopupProvider } from './context/PopupContext';

// Admin Imports
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminPromoCodes } from './pages/admin/AdminPromoCodes';
import { AdminSettings } from './pages/admin/AdminSettings';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ayvora_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ayvora_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard';
    const variant = product.sizeVariants[size] || { price: product.price };
    
    setCartItems(prev => {
      // Uniqueness check based on ID AND SIZE
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedSize === size);
      
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { 
        ...product, 
        quantity, 
        selectedSize: size,
        activePrice: variant.price 
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartKey: string, delta: number) => {
    // We use a combination of id and size as the virtual key
    setCartItems(prev => prev.map(item => {
      const itemKey = `${item.id}-${item.selectedSize}`;
      if (itemKey === cartKey) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (cartKey: string) => {
    setCartItems(prev => prev.filter(item => `${item.id}-${item.selectedSize}` !== cartKey));
  };

  const clearCart = () => setCartItems([]);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="promos" element={<AdminPromoCodes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={
            <>
              <AnnouncementBar />
              <Navbar 
                cartCount={cartCount} 
                onOpenCart={() => setIsCartOpen(true)} 
                onOpenAI={() => setIsAIOpen(true)}
              />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
                  <Route path="/shop" element={<ShopPage onAddToCart={addToCart} />} />
                  <Route path="/shop/:category" element={<ShopPage onAddToCart={addToCart} />} />
                  <Route path="/product/:id" element={<ProductDetailPage onAddToCart={addToCart} />} />
                  <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} clearCart={clearCart} />} />
                  <Route path="/order-success/:trackingId" element={<OrderSuccessPage />} />
                  <Route path="/track-order" element={<OrderTrackingPage />} />
                  <Route path="*" element={<HomePage onAddToCart={addToCart} />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cartItems} 
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
        />
        
        <AIScentFinder 
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)}
          onAddToCart={addToCart}
        />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <PopupProvider>
      <Router>
        <AppContent />
      </Router>
    </PopupProvider>
  );
};

export default App;