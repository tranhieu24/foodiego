import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChefHat, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-left">
          <div className="w-11 h-11 bg-[#FF6B35] rounded-xl flex items-center justify-center">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-6 tracking-tight">Quên mật khẩu</h1>
          <p className="text-sm text-gray-400 mt-1.5 font-medium">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Email đã được gửi!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Kiểm tra hộp thư (kể cả thư mục Spam) và làm theo hướng dẫn để đặt lại mật khẩu. Link có hiệu lực trong <strong>15 phút</strong>.
            </p>
            <Link
              to="/login"
              className="text-sm font-semibold text-[#FF6B35] hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
              <input
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                type="email"
                placeholder="ten@example.com"
                className={`w-full px-4 py-3 text-sm bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Gửi link đặt lại mật khẩu'}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 py-3 rounded-xl border border-red-100 font-medium">
                {error}
              </p>
            )}

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF6B35] transition-colors"
              >
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
