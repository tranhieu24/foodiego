import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ChefHat, Mail, ArrowLeft, ArrowRight, Loader2,
  KeyRound, Send, MailOpen,
} from 'lucide-react';
import api from '../utils/api';

const BRAND = '#F97316';
const BRAND_DARK = '#EA580C';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmittedEmail(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  /* ───────── SUCCESS STATE (shared mobile + desktop) ───────── */
  const successView = (compact = false) => (
    <div className="text-center">
      {/* Animated success icon */}
      <div className="relative mx-auto w-20 h-20 mb-5">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-50" />
        <div className="relative w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
          <MailOpen size={36} className="text-green-500" strokeWidth={2.2} />
        </div>
      </div>
      <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 mb-2`}>
        Email đã được gửi! 📬
      </h2>
      <p className="text-[14px] text-slate-500 leading-relaxed mb-1">
        Chúng tôi đã gửi link đặt lại mật khẩu đến
      </p>
      <p className="text-[14px] font-semibold text-slate-800 mb-5 break-all">{submittedEmail}</p>
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-6 text-left">
        <p className="text-[12px] text-orange-700 leading-relaxed">
          ⏱ Link có hiệu lực trong <strong>15 phút</strong>. Kiểm tra cả thư mục Spam nếu không thấy email.
        </p>
      </div>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại đăng nhập
      </Link>
    </div>
  );

  /* ───────── FORM (shared mobile + desktop, with variant switch) ───────── */
  const formView = (variant /* 'mobile' | 'web' */) => {
    const isMobile = variant === 'mobile';
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={isMobile ? 'space-y-4' : 'space-y-5'} noValidate>
        <div>
          <label htmlFor={`${variant}-fp-email`} className={`block ${isMobile ? 'text-[13px] font-medium' : 'text-sm font-medium'} text-slate-700 mb-1.5`}>
            Địa chỉ Email
          </label>

          {isMobile ? (
            <div className={`fg-input-wrap flex items-center h-[52px] bg-slate-50 border rounded-[14px] transition-all ${
              errors.email ? 'border-red-400' : 'border-slate-200'
            }`}>
              <Mail size={18} className="text-slate-400 ml-4 mr-3 shrink-0" />
              <input
                id={`${variant}-fp-email`}
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' },
                })}
                type="email"
                autoComplete="email"
                placeholder="ten@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${variant}-fp-email-err` : undefined}
                className="flex-1 min-w-0 h-full bg-transparent border-0 outline-none text-[15px] text-slate-900 placeholder:text-slate-400 pr-4"
              />
            </div>
          ) : (
            <input
              id={`${variant}-fp-email`}
              {...register('email', {
                required: 'Vui lòng nhập email',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' },
              })}
              type="email"
              autoComplete="email"
              placeholder="ten@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${variant}-fp-email-err` : undefined}
              className={`w-full px-4 py-3 text-sm bg-white border ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-400`}
            />
          )}

          {errors.email && (
            <p id={`${variant}-fp-email-err`} role="alert" className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 flex items-center justify-center gap-2 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            isMobile
              ? 'fg-cta-glow group h-14 rounded-2xl text-[16px] font-semibold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
              : 'py-3 text-sm font-medium rounded-xl hover:brightness-95 active:brightness-90'
          }`}
          style={{ background: isMobile ? `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` : BRAND }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={isMobile ? 20 : 16} />
          ) : (
            <>
              <span>Gửi link đặt lại</span>
              {isMobile && (
                <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
              )}
            </>
          )}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-600 text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100 font-medium">
            {error}
          </p>
        )}

        <div className="text-center pt-1">
          <Link
            to="/login"
            className={`inline-flex items-center gap-1.5 ${isMobile ? 'text-[14px]' : 'text-sm'} font-semibold text-slate-500 hover:text-orange-500 transition-colors`}
          >
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
      </form>
    );
  };

  return (
    <div className="md:grid md:grid-cols-2 md:min-h-screen">

      {/* ════════════════════════════════════════════════════════════
           📱 MOBILE — "Warm Bowl" theme (consistent với login)
           ════════════════════════════════════════════════════════════ */}
      <main className="md:hidden flex flex-col min-h-screen w-full max-w-full bg-white overflow-x-hidden" aria-label="Quên mật khẩu FoodieGo">

        {/* HERO ~35% */}
        <section
          className="relative fg-hero-gradient fg-pattern-dots overflow-hidden flex-shrink-0"
          style={{ height: '36vh', minHeight: 280 }}
        >
          <div aria-hidden
            className="absolute -top-12 -right-14 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.45) 0%, transparent 70%)' }} />
          <div aria-hidden
            className="absolute bottom-8 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.40) 0%, transparent 70%)' }} />

          {/* Theme-relevant floating icons (key/mail/send) */}
          <div aria-hidden className="absolute top-16 left-7 text-orange-400/40 fg-float">
            <KeyRound size={26} />
          </div>
          <div aria-hidden className="absolute top-24 right-9 text-orange-500/35 fg-float-delay">
            <Send size={22} />
          </div>
          <div aria-hidden className="absolute bottom-12 right-14 text-orange-400/30 fg-float">
            <Mail size={22} />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center px-6 pt-8">
            <div
              className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center fg-logo-glow"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
              aria-hidden
            >
              <ChefHat className="text-white" size={36} strokeWidth={2.2} />
            </div>
            <h1 className="mt-5 text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight text-center leading-tight px-2">
              Quên mật khẩu?
            </h1>
            <p className="mt-2 text-[15px] text-slate-500 font-normal text-center px-4">
              {sent ? 'Đã gửi link đến email của bạn' : 'Nhập email để nhận link đặt lại'}
            </p>
          </div>
        </section>

        {/* FORM CARD overlap */}
        <section className="relative -mt-10 z-10 flex-1 bg-white rounded-t-[28px] fg-card-shadow px-6 pt-7 pb-8">
          {sent ? successView(true) : formView('mobile')}
        </section>
      </main>

      {/* ════════════════════════════════════════════════════════════
           🖥️ WEB LEFT (≥ md) — brand panel với decorative info
           ════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex relative flex-col items-center justify-center bg-[#0F0F0F] p-12 text-center overflow-hidden">
        <div aria-hidden className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND}1A 0%, transparent 60%)` }} />

        <div className="relative max-w-sm flex flex-col items-center gap-10">
          <div>
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-5"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
              <ChefHat className="text-white" size={32} strokeWidth={2.2} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">FoodieGo</h2>
            <p className="text-gray-400 text-sm mt-2">Khôi phục tài khoản dễ dàng</p>
          </div>

          {/* 3-step process — giúp user hiểu flow */}
          <ol className="space-y-4 w-full text-left">
            {[
              { n: '1', text: 'Nhập email đăng ký', Icon: Mail },
              { n: '2', text: 'Kiểm tra hộp thư đến', Icon: MailOpen },
              { n: '3', text: 'Đặt mật khẩu mới', Icon: KeyRound },
            ].map(({ n, text, Icon }) => (
              <li key={n} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 relative">
                  <Icon size={16} className="text-orange-400" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: BRAND }}>{n}</span>
                </span>
                <span className="text-gray-200 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ol>

          <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-800 pt-4 w-full text-center">
            🔒 Link đặt lại có hiệu lực trong <span className="text-gray-300 font-semibold">15 phút</span>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
           🖥️ WEB RIGHT (≥ md) — form
           ════════════════════════════════════════════════════════════ */}
      <section className="hidden md:flex items-center justify-center bg-[#FAFAFA] px-8 py-12">
        <div className="w-full max-w-[440px] space-y-6">
          {!sent && (
            <header>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND }}>
                <KeyRound className="text-white" size={24} strokeWidth={2.2} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mt-6 tracking-tight">Quên mật khẩu</h1>
              <p className="text-sm text-gray-500 mt-2 font-medium">Nhập email để nhận link đặt lại mật khẩu</p>
            </header>
          )}

          {sent ? successView(false) : formView('web')}
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
