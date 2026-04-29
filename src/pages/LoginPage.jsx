import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { loginAsync, selectIsAuthenticated, selectAuthError, selectAuthLoading, clearError } from '../store/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authError = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Extract redirect path from URL
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch, redirectPath]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (authError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    dispatch(loginAsync({ email: form.email, password: form.password }));
  };

  const handleQuickFill = (type) => {
    if (type === 'admin') {
      setForm({ email: 'admin@example.com', password: 'password123' });
    } else {
      setForm({ email: 'john@example.com', password: 'password123' });
    }
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-orange-50 to-orange-100 overflow-x-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden animate-fade-in border border-white">
          {/* Top aesthetic bar */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500" />

          <div className="p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[30px] bg-gradient-to-br from-orange-500 to-red-600 shadow-xl shadow-orange-200 mb-6 transform -rotate-6">
                <ChefHat size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Chào mừng!</h1>
              <p className="text-gray-500 mt-2 font-medium">Đăng nhập để đặt món ăn ngon</p>
            </div>

            {/* Quick Fill Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => handleQuickFill('admin')}
                type="button"
                className="flex-1 py-3 px-4 rounded-2xl bg-orange-50 border-2 border-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
              >
                🔐 Admin Demo
              </button>
              <button
                onClick={() => handleQuickFill('user')}
                type="button"
                className="flex-1 py-3 px-4 rounded-2xl bg-blue-50 border-2 border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
              >
                👤 User Demo
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                  <p className="text-red-600 text-xs font-bold flex items-center gap-2">
                    <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">⚠️</span>
                    {authError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-5 rounded-[24px] flex items-center justify-center gap-3 text-sm font-black shadow-xl shadow-orange-200 mt-4 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    ĐĂNG NHẬP NGAY <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
            
            <p className="text-center mt-8 text-sm font-medium text-gray-400">
              Chưa có tài khoản? <button className="text-orange-500 font-bold hover:underline">Đăng ký ngay</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
