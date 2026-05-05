import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChefHat, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    if (!token || !email) {
      setError('Link không hợp lệ. Vui lòng yêu cầu link mới.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
        <div className="text-center">
          <AlertCircle size={52} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Link không hợp lệ</h2>
          <p className="text-sm text-gray-500 mb-6">Vui lòng yêu cầu link đặt lại mật khẩu mới.</p>
          <Link to="/forgot-password" className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex">
            Quên mật khẩu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-left">
          <div className="w-11 h-11 bg-[#FF6B35] rounded-xl flex items-center justify-center">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-6 tracking-tight">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-400 mt-1.5 font-medium">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Mật khẩu đã được cập nhật!</h2>
            <p className="text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 text-sm bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: (val) => val === watch('password') || 'Mật khẩu không khớp',
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-3 text-sm bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Cập nhật mật khẩu'}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 py-3 rounded-xl border border-red-100 font-medium">
                {error}
              </p>
            )}

            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-[#FF6B35] transition-colors">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
