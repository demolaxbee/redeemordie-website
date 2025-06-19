import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import './styles/navbar.css';
import './styles/footer.css';
import './styles/shop.css';
import './styles/admin.css';
import './styles/thank-you.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import PrivacyPolicy from './components/PrivacyPolicy';
import DeliveryReturns from './components/DeliveryReturns';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { CurrencyProvider } from './context/CurrencyContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/admin" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <SearchProvider>
            <Router>
            <div className="app">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/delivery-returns" element={<DeliveryReturns />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <PrivateRoute>
                        <AdminDashboard />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <ToastContainer />
        </SearchProvider>
      </CartProvider>
    </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
