import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Loader2, ChefHat, CheckCircle2, ShieldCheck, Zap,
  Mail, Lock, ArrowRight, Utensils, Coffee, Soup,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

import {
  loginAsync,
  googleLoginAsync,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthLoading,
  clearError,
} from '../store/authSlice';

const BRAND = '#F97316';
const BRAND_DARK = '#EA580C';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authError = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate(redirectPath);
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, redirectPath, dispatch]);

  const onSubmit = (data) => dispatch(loginAsync(data));

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => dispatch(googleLoginAsync(tokenResponse.access_token)),
    onError: () => console.log('Google Login Failed'),
  });

  // Reusable Google + Facebook SVGs
  const GoogleIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
      <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.414 1.096-4.04 1.096-3.414 0-6.273-2.318-7.305-5.396l-4.054 3.13C2.551 20.959 6.964 24 12 24c3.082 0 5.836-1.017 8.027-2.734l-4.015-3.253Z" />
      <path fill="#4285F4" d="M23.49 12.275c0-.826-.074-1.62-.21-2.387H12v4.513h6.44a5.523 5.523 0 0 1-2.395 3.62l4.015 3.253C22.444 19.334 24 16.03 24 12.275Z" />
      <path fill="#FBBC05" d="M5.266 9.765l-4.026-3.115C.46 8.353 0 10.12 0 12c0 1.88.46 3.647 1.266 5.253l4.054-3.13A7.101 7.101 0 0 1 4.909 12c0-1.112.26-2.162.357-2.235Z" />
    </svg>
  );

  const FacebookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  return (
    <div className="md:grid md:grid-cols-2 md:min-h-screen">

      {/* ════════════════════════════════════════════════════════════
           📱 MOBILE — "Warm Bowl" v2 design (premium, food-tone)
           overflow-x-hidden + w-full để khoá horizontal scroll/swipe
           ════════════════════════════════════════════════════════════ */}
      <main className="md:hidden flex flex-col min-h-screen w-full max-w-full bg-white overflow-x-hidden" aria-label="Đăng nhập FoodieGo">

        {/* ───── HERO (~40% screen, mesh gradient + floating food icons) ───── */}
        <section
          className="relative fg-hero-gradient fg-pattern-dots overflow-hidden flex-shrink-0"
          style={{ height: '40vh', minHeight: 320 }}
        >
          {/* Decorative blur orbs */}
          <div aria-hidden
            className="absolute -top-12 -right-14 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.45) 0%, transparent 70%)' }} />
          <div aria-hidden
            className="absolute bottom-12 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.40) 0%, transparent 70%)' }} />

          {/* Floating food iconography */}
          <div aria-hidden className="absolute top-16 left-7 text-orange-400/40 fg-float">
            <Utensils size={28} />
          </div>
          <div aria-hidden className="absolute top-24 right-9 text-orange-500/35 fg-float-delay">
            <Coffee size={24} />
          </div>
          <div aria-hidden className="absolute bottom-16 right-12 text-orange-400/30 fg-float">
            <Soup size={24} />
          </div>

          {/* Logo + Welcome */}
          <div className="relative h-full flex flex-col items-center justify-center px-6 pt-8">
            <div
              className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center fg-logo-glow"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
              aria-hidden
            >
              <ChefHat className="text-white" size={36} strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight text-center leading-tight px-2">
              Chào mừng trở lại <span className="inline-block">👋</span>
            </h1>
            <p className="mt-2 text-[15px] text-slate-500 font-normal text-center">
              Đăng nhập để tiếp tục đặt món ngon
            </p>
          </div>
        </section>

        {/* ───── FORM CARD (overlap hero -40px → bottom-sheet feel) ───── */}
        <section className="relative -mt-10 z-10 flex-1 bg-white rounded-t-[28px] fg-card-shadow px-6 pt-7 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-label="Form đăng nhập">

            {/* Email — flex layout: icon là flex item, không bao giờ overlap với input text */}
            <div>
              <label htmlFor="m-email" className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <div className={`fg-input-wrap flex items-center h-[52px] bg-slate-50 border rounded-[14px] transition-all ${
                errors.email ? 'border-red-400' : 'border-slate-200'
              }`}>
                <Mail size={18} className="text-slate-400 ml-4 mr-3 shrink-0" />
                <input
                  id="m-email"
                  {...register('email', {
                    required: 'Vui lòng nhập email',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' },
                  })}
                  type="email"
                  autoComplete="email"
                  placeholder="ten@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'm-email-err' : undefined}
                  className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-[15px] text-slate-900 placeholder:text-slate-400 pr-4"
                />
              </div>
              {errors.email && <p id="m-email-err" role="alert" className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password — same flex pattern + eye toggle ở cuối */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="m-password" className="text-[13px] font-medium text-slate-700">Mật khẩu</label>
                <Link to="/forgot-password" className="text-[13px] font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className={`fg-input-wrap flex items-center h-[52px] bg-slate-50 border rounded-[14px] transition-all ${
                errors.password ? 'border-red-400' : 'border-slate-200'
              }`}>
                <Lock size={18} className="text-slate-400 ml-4 mr-3 shrink-0" />
                <input
                  id="m-password"
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'm-password-err' : undefined}
                  className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-[15px] text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="shrink-0 mr-2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p id="m-password-err" role="alert" className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="fg-cta-glow group w-full h-14 rounded-2xl text-white text-[16px] font-semibold flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {authError && (
            <p role="alert" className="mt-4 text-sm text-red-600 text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100 font-medium">
              {authError}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6" role="separator" aria-label="hoặc">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[12px] text-slate-400 font-medium">hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Social — chỉ Google + Facebook (đã bỏ Apple theo yêu cầu) */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => googleLogin()}
              aria-label="Đăng nhập với Google"
              className="fg-social-btn w-14 h-14 rounded-full border-[1.5px] border-slate-200 bg-white flex items-center justify-center"
            >
              <GoogleIcon size={26} />
            </button>
            <button
              type="button"
              aria-label="Đăng nhập với Facebook"
              className="fg-social-btn w-14 h-14 rounded-full border-[1.5px] border-slate-200 bg-white flex items-center justify-center"
            >
              <FacebookIcon size={26} />
            </button>
          </div>

          {/* Footer signup */}
          <p className="text-center text-[14px] text-slate-600 mt-7">
            Chưa có tài khoản?
            <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors ml-1">
              Đăng ký ngay
            </Link>
          </p>
        </section>
      </main>

      {/* ════════════════════════════════════════════════════════════
           🖥️ WEB LEFT (≥ md) — brand + USP — GIỮ NGUYÊN như cũ
           ════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex relative flex-col items-center justify-center bg-[#0F0F0F] p-12 text-center overflow-hidden">
        <div aria-hidden className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND}1A 0%, transparent 60%)` }} />

        <div className="relative max-w-sm flex flex-col items-center gap-12">
          <div>
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-5"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
              <ChefHat className="text-white" size={32} strokeWidth={2.2} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">FoodieGo</h2>
            <p className="text-gray-400 text-sm mt-2">Giao đồ ăn nhanh, an toàn, nóng hổi</p>
          </div>

          <ul className="space-y-4 w-full text-left">
            {[
              { Icon: CheckCircle2, text: 'Hơn 500 nhà hàng đối tác' },
              { Icon: Zap, text: 'Giao hàng trong 30 phút' },
              { Icon: ShieldCheck, text: 'Thanh toán bảo mật 100%' },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-orange-400" />
                </span>
                <span className="text-gray-200 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
           🖥️ WEB RIGHT (≥ md) — form — GIỮ NGUYÊN như cũ
           ════════════════════════════════════════════════════════════ */}
      <section
        className="hidden md:flex items-center justify-center bg-[#FAFAFA] px-8 py-12"
        aria-labelledby="web-login-title"
      >
        <div className="w-full max-w-[440px] space-y-6">
          <header>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND }}>
              <ChefHat className="text-white" size={28} strokeWidth={2.2} />
            </div>
            <h1 id="web-login-title" className="text-3xl font-bold text-gray-900 mt-6 tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Chào mừng trở lại, chọn món ngon nào</p>
          </header>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <GoogleIcon size={18} />
              Đăng nhập với Google
            </button>
          )}

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">hoặc tiếp tục với email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="w-email" className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
              <input
                id="w-email"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' },
                })}
                type="email"
                autoComplete="email"
                placeholder="ten@example.com"
                className={`w-full px-4 py-3 text-sm bg-white border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-400`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="w-password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link to="/forgot-password" className="text-xs font-medium text-orange-500 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="w-password"
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-11 py-3 text-sm bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 text-white text-sm font-medium rounded-xl hover:brightness-95 active:brightness-90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND }}
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Đăng nhập'}
            </button>
          </form>

          {authError && (
            <p role="alert" className="text-sm text-red-600 text-center bg-red-50 py-3 rounded-xl border border-red-100 font-medium">
              {authError}
            </p>
          )}

          <p className="text-sm text-gray-600 text-center pt-2">
            Chưa có tài khoản?
            <Link to="/register" className="font-bold text-orange-500 hover:underline ml-1">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
