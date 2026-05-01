import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChefHat, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { 
  registerAsync, 
  selectIsAuthenticated, 
  selectAuthError, 
  selectAuthLoading, 
  clearError 
} from '../store/authSlice';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authError = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const { register, handleSubmit, watch, formState: { errors }, setError, clearErrors } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const password = watch('password', '');

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    switch (score) {
      case 1: return { score: 1, label: 'Yếu', color: 'bg-red-500' };
      case 2: return { score: 2, label: 'Trung bình', color: 'bg-yellow-500' };
      case 3: return { score: 3, label: 'Mạnh', color: 'bg-blue-500' };
      case 4: return { score: 4, label: 'Rất mạnh', color: 'bg-green-500' };
      default: return { score: 0, label: '', color: 'bg-gray-200' };
    }
  };

  const strength = getPasswordStrength(password);

  const checkEmailAvailability = async (email) => {
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) return;
    
    setCheckingEmail(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/check-email?email=${email}`);
      if (response.data.exists) {
        setError('email', { type: 'manual', message: 'Email này đã được đăng ký' });
      } else {
        clearErrors('email');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = (data) => {
    const { confirmPassword, terms, ...userData } = data;
    dispatch(registerAsync(userData));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column - Desktop Only */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0F0F0F] p-12 text-center">
        <div className="mb-8">
          <ChefHat size={48} className="text-[#FF6B35] mx-auto" />
          <h2 className="text-3xl font-semibold text-white mt-4 tracking-tight">FoodieGo</h2>
          <p className="text-gray-500 text-sm mt-2">Giao đồ ăn nhanh, an toàn, nóng hổi</p>
        </div>
        
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-gray-600" />
            </div>
            <span className="text-gray-400 text-xs font-medium">Hơn 500 nhà hàng đối tác</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <Zap size={16} className="text-gray-600" />
            </div>
            <span className="text-gray-400 text-xs font-medium">Giao hàng trong 30 phút</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <ShieldCheck size={16} className="text-gray-600" />
            </div>
            <span className="text-gray-400 text-xs font-medium">Thanh toán bảo mật 100%</span>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center bg-[#FAFAFA] px-6 lg:px-8 py-12">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Header */}
          <div className="text-left">
            <div className="w-11 h-11 bg-[#FF6B35] rounded-xl flex items-center justify-center">
              <ChefHat className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mt-6 tracking-tight">Tạo tài khoản</h1>
            <p className="text-sm text-gray-400 mt-1.5 font-medium">Điền thông tin để bắt đầu đặt món</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                {...register('name', { 
                  required: 'Vui lòng nhập họ và tên',
                  minLength: { value: 2, message: 'Họ và tên tối thiểu 2 ký tự' }
                })}
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full px-4 py-3 text-sm bg-white border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
              <div className="relative">
                <input
                  {...register('email', { 
                    required: 'Vui lòng nhập email',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  onBlur={(e) => checkEmailAvailability(e.target.value)}
                  type="email"
                  placeholder="ten@example.com"
                  className={`w-full px-4 py-3 text-sm bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-gray-400" size={16} />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  {...register('password', { 
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 text-sm bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength Indicator */}
              <div className="mt-2">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`flex-1 rounded-full transition-all duration-300 ${step <= strength.score ? strength.color : 'bg-gray-200'}`} 
                    />
                  ))}
                </div>
                {strength.label && <p className="text-[10px] font-semibold mt-1 text-right uppercase tracking-wider" style={{ color: strength.color.replace('bg-', '') }}>{strength.label}</p>}
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  {...register('confirmPassword', { 
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 text-sm bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="flex items-center h-5">
                <input
                  {...register('terms', { required: true })}
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35] transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                Tôi đồng ý với <Link to="/terms" className="text-[#FF6B35] hover:underline font-medium">Điều khoản sử dụng</Link> và chính sách bảo mật
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500">Vui lòng đồng ý với điều khoản</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Tạo tài khoản'}
            </button>
          </form>

          {authError && (
            <p className="text-sm text-red-500 text-center mt-4 bg-red-50 py-3 rounded-xl border border-red-100 font-medium">
              {authError}
            </p>
          )}

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-[#FF6B35] hover:underline ml-1">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
