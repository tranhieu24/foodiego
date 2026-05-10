import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutPage from './pages/CheckoutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      <Navbar />
      <main className="w-full max-w-[1920px] mx-auto overflow-x-hidden pt-20 pb-20 lg:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-6">😕</div>
                  <h1 className="text-3xl font-black text-gray-800 mb-3">404 - Không tìm thấy</h1>
                  <p className="text-gray-500 mb-6">Trang bạn tìm kiếm không tồn tại.</p>
                  <a href="/" className="btn-primary px-8 py-3 rounded-xl inline-flex">
                    Về trang chủ
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#2D9B4E',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-no-google';
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
