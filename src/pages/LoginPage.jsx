import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChefHat, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLoginModule from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = FacebookLoginModule.default || FacebookLoginModule;

import { 
  loginAsync, 
  googleLoginAsync, 
  facebookLoginAsync, 
  selectIsAuthenticated, 
  selectAuthError, 
  selectAuthLoading, 
  clearError 
} from '../store/authSlice';

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
    if (isAuthenticated) {
      navigate(redirectPath);
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, redirectPath, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginAsync(data));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLoginAsync(tokenResponse.access_token));
    },
    onError: () => console.log('Google Login Failed'),
  });

  const responseFacebook = (response) => {
    if (response.accessToken) {
      dispatch(facebookLoginAsync(response.accessToken));
    }
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
            <h1 className="text-2xl font-semibold text-gray-900 mt-6 tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-gray-400 mt-1.5 font-medium">Chào mừng trở lại, chọn món ngon nào</p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => googleLogin()}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.414 1.096-4.04 1.096-3.414 0-6.273-2.318-7.305-5.396l-4.054 3.13C2.551 20.959 6.964 24 12 24c3.082 0 5.836-1.017 8.027-2.734l-4.015-3.253Z" />
                <path fill="#4285F4" d="M23.49 12.275c0-.826-.074-1.62-.21-2.387H12v4.513h6.44a5.523 5.523 0 0 1-2.395 3.62l4.015 3.253C22.444 19.334 24 16.03 24 12.275Z" />
                <path fill="#FBBC05" d="M5.266 9.765l-4.026-3.115C.46 8.353 0 10.12 0 12c0 1.88.46 3.647 1.266 5.253l4.054-3.13A7.101 7.101 0 0 1 4.909 12c0-1.112.26-2.162.357-2.235Z" />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            <FacebookLogin
              appId="YOUR_FACEBOOK_APP_ID"
              callback={responseFacebook}
              render={renderProps => (
                <button
                  onClick={renderProps.onClick}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-[18px] h-[18px]" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </button>
              )}
            />

            <button
              disabled
              title="Sắp ra mắt"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed opacity-60 transition-all"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z" />
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">hoặc tiếp tục với email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
              <input
                {...register('email', { 
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                type="email"
                placeholder="ten@example.com"
                className={`w-full px-4 py-3 text-sm bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link to="/forgot-password" title="Chưa có tính năng này" className="text-xs font-medium text-[#FF6B35] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password', { 
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu tối thiểu 6 ký tự'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 text-sm bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-[#FF6B35] hover:bg-[#E8551F] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Đăng nhập'}
            </button>
          </form>

          {authError && (
            <p className="text-sm text-red-500 text-center mt-4 bg-red-50 py-3 rounded-xl border border-red-100 font-medium">
              {authError}
            </p>
          )}

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-[#FF6B35] hover:underline ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
