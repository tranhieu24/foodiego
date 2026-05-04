import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ChevronRight, ChevronLeft, MapPin, Phone, CreditCard, Truck,
  CheckCircle2, Wallet, Building, QrCode, Loader2, Edit3, User, Package,
  ChevronDown, MessageSquare, AlertCircle, PartyPopper, ArrowRight, Home
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { selectCartItems, selectCartSubtotal, selectCartDiscount, clearCart } from '../store/cartSlice';
import { selectUser, selectIsAuthenticated } from '../store/authSlice';
import axios from 'axios';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SHIPPING_FEE = 25000;
const FREE_SHIP_THRESHOLD = 200000;

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }) };

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={12} /> {error.message}
    </p>
  );
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discountRate = useSelector(selectCartDiscount);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState({ p: false, d: false, w: false });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: {
      name: user?.name || '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      address: '',
      note: ''
    }
  });

  const watchProvince = watch('province');
  const watchDistrict = watch('district');

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingLoc(prev => ({ ...prev, p: true }));
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        let data = res.data;
        data.sort((a, b) => a.name.localeCompare(b.name));
        const priorityCodes = ['79', '01', '48'];
        const priority = data.filter(p => priorityCodes.includes(String(p.code).padStart(2, '0')));
        const others = data.filter(p => !priorityCodes.includes(String(p.code).padStart(2, '0')));
        setProvinces([...priority, ...others]);
      } catch (err) {
        toast.error('Không thể tải danh sách tỉnh thành');
      } finally {
        setLoadingLoc(prev => ({ ...prev, p: false }));
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!watchProvince) {
      setDistricts([]);
      setWards([]);
      setValue('district', '');
      setValue('ward', '');
      return;
    }
    const fetchDistricts = async () => {
      setLoadingLoc(prev => ({ ...prev, d: true }));
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${watchProvince}?depth=2`);
        setDistricts(res.data.districts.sort((a, b) => a.name.localeCompare(b.name)));
        setValue('district', '');
        setValue('ward', '');
      } catch (err) {
        toast.error('Không thể tải danh sách quận huyện');
      } finally {
        setLoadingLoc(prev => ({ ...prev, d: false }));
      }
    };
    fetchDistricts();
  }, [watchProvince, setValue]);

  useEffect(() => {
    if (!watchDistrict) {
      setWards([]);
      setValue('ward', '');
      return;
    }
    const fetchWards = async () => {
      setLoadingLoc(prev => ({ ...prev, w: true }));
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${watchDistrict}?depth=2`);
        setWards(res.data.wards.sort((a, b) => a.name.localeCompare(b.name)));
        setValue('ward', '');
      } catch (err) {
        toast.error('Không thể tải danh sách phường xã');
      } finally {
        setLoadingLoc(prev => ({ ...prev, w: false }));
      }
    };
    fetchWards();
  }, [watchDistrict, setValue]);

  const shipping = useMemo(() => (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE), [subtotal]);
  const discountAmount = useMemo(() => Math.round(subtotal * discountRate), [subtotal, discountRate]);
  const total = useMemo(() => subtotal + shipping - discountAmount, [subtotal, shipping, discountAmount]);
  const formatPrice = (p) => p ? Number(p).toLocaleString('vi-VN') + 'đ' : '--';

  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;
  if (items.length === 0 && !orderSuccess) return <Navigate to="/menu" replace />;

  const onShippingSubmit = () => setStep(2);

  const handlePlaceOrder = async () => {
    const formData = watch();
    setLoading(true);
    try {
      const pName = provinces.find(p => String(p.code) === String(formData.province))?.name;
      const dName = districts.find(d => String(d.code) === String(formData.district))?.name;
      const wName = wards.find(w => String(w.code) === String(formData.ward))?.name;
      const fullAddress = `${formData.address}, ${wName}, ${dName}, ${pName}`;
      const isPaid = paymentMethod !== 'COD';
      
      const res = await api.post('/orders', {
        orderItems: items.map(i => ({ product: i.id, qty: i.quantity })),
        shippingAddress: { address: fullAddress, city: pName, phone: formData.phone },
        paymentMethod,
        isPaid: isPaid,
        paidAt: isPaid ? new Date() : null,
      });
      
      setOrderSuccess(res.data);
      dispatch(clearCart());
      toast.success('Đặt hàng thành công! 🎉');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { id: 1, name: 'Giao hàng', icon: Truck },
    { id: 2, name: 'Thanh toán', icon: CreditCard },
    { id: 3, name: 'Hoàn tất', icon: CheckCircle2 },
  ];

  const PAYMENT_METHODS = [
    { id: 'COD', name: 'Tiền mặt khi nhận hàng', desc: 'Thanh toán khi shipper giao tới', icon: Wallet, color: 'text-green-600' },
    { id: 'BANK', name: 'Chuyển khoản ngân hàng', desc: 'Quét mã VietQR – xử lý tức thì', icon: Building, color: 'text-blue-600' },
    { id: 'MOMO', name: 'Ví MoMo', desc: 'Thanh toán nhanh qua ứng dụng MoMo', icon: QrCode, color: 'text-pink-600' },
  ];

  return (
    <div 
      className="min-h-screen bg-gray-50 overflow-x-hidden flex flex-col" 
      style={{ paddingTop: step === 3 ? '0' : '110px', paddingBottom: '100px' }}
    >
      <div 
        className={`mx-auto px-4 sm:px-10 lg:px-16 flex flex-col items-center flex-1 ${step === 3 ? 'justify-center' : ''}`} 
        style={{ maxWidth: '1200px', width: '100%' }}
      >

        {/* Stepper */}
        {step < 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center mb-12 w-full">
            <div className="flex items-center gap-0 bg-white rounded-3xl p-2 shadow-sm border border-gray-200">
              {STEPS.map((s, idx) => {
                const isCurrent = step === s.id;
                const isActive = step >= s.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-[#FF6B35] text-white shadow-md' : isActive ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isCurrent ? 'border-white/50 bg-white/10' : isActive ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        {isActive && !isCurrent ? <CheckCircle2 size={14} /> : s.id}
                      </div>
                      <span className="text-sm font-black uppercase tracking-wide">{s.name}</span>
                    </div>
                    {idx < STEPS.length - 1 && <div className={`w-12 h-px mx-1 ${step > s.id ? 'bg-orange-300' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Layout Wrapper */}
        <div className={`w-full flex ${step === 3 ? 'justify-center items-center h-full' : 'flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center'}`}>

          {/* Left Column / Main Success Card */}
          <div className={`${step === 3 ? 'max-w-3xl w-full' : 'w-full lg:max-w-[720px] lg:flex-1'} ${step < 3 ? 'bg-white border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm' : ''}`}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF6B35]">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Thông tin giao hàng</h3>
                      <p className="text-sm text-gray-400">Shipper sẽ giao đến địa chỉ này</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Họ và tên</label>
                        <div className="relative">
                          <input {...register('name', { required: 'Vui lòng nhập họ và tên', minLength: { value: 2, message: 'Họ tên quá ngắn' } })} 
                            type="text" placeholder="Nguyễn Văn A" 
                            className={`w-full px-5 py-3 text-sm bg-gray-50 border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50 transition-all`} />
                          <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <ErrorMessage error={errors.name} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Số điện thoại</label>
                        <div className="relative">
                          <input {...register('phone', { required: 'Vui lòng nhập số điện thoại', pattern: { value: /(03|05|07|08|09)[0-9]{8}$/, message: 'Số điện thoại không hợp lệ' } })} 
                            type="tel" placeholder="0901234567" 
                            className={`w-full px-5 py-3 text-sm bg-gray-50 border ${errors.phone ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50 transition-all`} />
                          <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <ErrorMessage error={errors.phone} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                          Tỉnh / Thành
                          {loadingLoc.p && <Loader2 size={12} className="animate-spin text-[#FF6B35]" />}
                        </label>
                        <div className="relative">
                          <select {...register('province', { required: 'Vui lòng chọn tỉnh / thành' })} 
                            className={`w-full px-5 py-3 text-sm bg-gray-50 border ${errors.province ? 'border-red-400' : 'border-gray-200'} rounded-xl appearance-none focus:outline-none cursor-pointer disabled:opacity-50`}>
                            <option value="">Chọn tỉnh / thành</option>
                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                          Quận / Huyện
                          {loadingLoc.d && <Loader2 size={12} className="animate-spin text-[#FF6B35]" />}
                        </label>
                        <div className="relative">
                          <select {...register('district', { required: 'Vui lòng chọn quận / huyện' })} disabled={!watchProvince || loadingLoc.d}
                            className="w-full px-5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none disabled:opacity-50">
                            <option value="">Chọn quận / huyện</option>
                            {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                          Phường / Xã
                          {loadingLoc.w && <Loader2 size={12} className="animate-spin text-[#FF6B35]" />}
                        </label>
                        <div className="relative">
                          <select {...register('ward', { required: 'Vui lòng chọn phường / xã' })} disabled={!watchDistrict || loadingLoc.w}
                            className="w-full px-5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none disabled:opacity-50">
                            <option value="">Chọn phường / xã</option>
                            {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700">Địa chỉ chi tiết</label>
                      <div className="relative">
                        <input {...register('address', { required: 'Vui lòng nhập địa chỉ chi tiết' })} type="text" placeholder="Số nhà, tên đường..." 
                          className={`w-full px-5 py-3 text-sm bg-gray-50 border ${errors.address ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50 transition-all`} />
                        <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      <ErrorMessage error={errors.address} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">Ghi chú <span className="text-xs text-gray-400 ml-2 font-normal">(không bắt buộc)</span></label>
                      <div className="relative">
                        <textarea {...register('note')} rows={3} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." 
                          className="w-full px-5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50 transition-all resize-none" />
                        <MessageSquare size={18} className="absolute right-4 top-4 text-gray-400" />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 rounded-2xl bg-[#FF6B35] hover:bg-[#E8551F] text-white text-base font-black transition-all shadow-lg shadow-orange-100 hover:shadow-orange-200">Tiếp tục</button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF6B35]">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Thanh toán</h3>
                      <p className="text-sm text-gray-400">Chọn hình thức trả tiền</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {PAYMENT_METHODS.map((m) => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === m.id ? 'border-[#FF6B35] bg-orange-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === m.id ? 'bg-white' : 'bg-gray-50'}`}>
                          <m.icon size={28} className={paymentMethod === m.id ? 'text-[#FF6B35]' : 'text-gray-400'} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-base text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === m.id ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-gray-200'}`}>
                          {paymentMethod === m.id && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {paymentMethod !== 'COD' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col items-center text-center overflow-hidden">
                        <p className="text-blue-800 font-black mb-6 flex items-center gap-2"><QrCode size={18} /> Quét mã để thanh toán ngay</p>
                        <div className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-blue-100 mb-6">
                          <QRCodeSVG value={`PAYMENT:${user.id}:${total}`} size={180} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Số tiền cần trả</p>
                          <p className="text-2xl font-black text-blue-700">{formatPrice(total)}</p>
                        </div>
                        <p className="text-[10px] text-blue-400 mt-4 px-6 italic">Sau khi quét mã và thanh toán thành công, vui lòng bấm nút xác nhận phía dưới để hoàn tất đơn hàng.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-4 mt-10">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-400 hover:bg-gray-50 transition-all">Quay lại</button>
                    <button onClick={handlePlaceOrder} disabled={loading} className="flex-[2] py-4 rounded-2xl bg-[#FF6B35] text-white text-base font-black shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-60">
                      {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : paymentMethod === 'COD' ? 'Xác nhận đặt hàng' : 'Xác nhận đã thanh toán'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-10 lg:p-16 text-center shadow-2xl shadow-gray-200/40 w-full flex flex-col items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-40 h-40 bg-orange-50/40 rounded-br-full -z-10" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-50/40 rounded-tl-full -z-10" />
                  
                  <div className="w-28 h-28 rounded-full flex items-center justify-center mb-10 shadow-lg ring-8 ring-white bg-white">
                    <CheckCircle2 size={64} className={paymentMethod === 'COD' ? 'text-orange-500' : 'text-green-500'} />
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 flex items-center gap-3">
                    {paymentMethod === 'COD' ? 'Đặt hàng thành công!' : 'Thanh toán hoàn tất!'}
                    <PartyPopper className="text-[#FF6B35]" size={42} />
                  </h2>
                  
                  <p className="text-lg text-gray-400 font-bold mb-10">
                    Mã đơn hàng: <span className="font-black text-[#FF6B35] bg-orange-50 px-4 py-1.5 rounded-xl ml-1">#{orderSuccess?._id?.slice(-6)?.toUpperCase()}</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                    <div className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] shadow-sm ${paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      TRẠNG THÁI: {paymentMethod === 'COD' ? 'ĐANG CHỜ THANH TOÁN' : 'ĐÃ THANH TOÁN'}
                    </div>
                    <div className="px-6 py-3 bg-gray-100 rounded-2xl font-black text-[11px] text-gray-500 uppercase tracking-[0.1em] shadow-sm">
                      PHƯƠNG THỨC: {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}
                    </div>
                  </div>

                  <div className="w-full max-w-sm space-y-4">
                    <button 
                      onClick={() => navigate('/orders')} 
                      className="w-full py-5 rounded-[1.25rem] bg-[#FF6B35] hover:bg-[#E8551F] text-white text-lg font-black shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
                    >
                      Xem đơn hàng của tôi <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => navigate('/')} 
                      className="w-full py-4 rounded-[1.25rem] bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 text-sm font-black transition-all flex items-center justify-center gap-3"
                    >
                      <Home size={18} /> Quay lại trang chủ
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          {step < 3 && (
            <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 order-first lg:order-last">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <h3 className="font-black text-gray-900 text-lg mb-8 flex items-center gap-3">
                  <Package size={22} className="text-[#FF6B35]" /> Tóm tắt đơn hàng
                </h3>

                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 ring-1 ring-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-black text-gray-800 truncate">{item.quantity}x {item.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatPrice(item.price)} / món</p>
                      </div>
                      <p className="text-sm font-black text-gray-800 flex items-center">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-8 text-sm">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Tạm tính</span>
                    <span className="text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Phí giao hàng</span>
                    {shipping === 0 ? <span className="text-green-600 font-black">MIỄN PHÍ</span> : <span className="text-gray-800">{formatPrice(shipping)}</span>}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-black">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 mt-6 pt-6">
                    <span className="font-black text-gray-900 text-lg">Tổng cộng</span>
                    <span className="text-2xl font-black text-[#FF6B35]">{formatPrice(total)}</span>
                  </div>
                </div>

                {step === 2 && watch('address') && (
                  <div className="mt-8 p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Giao đến</p>
                      <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest hover:underline">Sửa</button>
                    </div>
                    <p className="text-sm font-black text-gray-800">
                      {watch('name')}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-1">{watch('phone')}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {watch('address')}, 
                      {wards.find(w => String(w.code) === String(watch('ward')))?.name}, 
                      {districts.find(d => String(d.code) === String(watch('district')))?.name}, 
                      {provinces.find(p => String(p.code) === String(watch('province')))?.name}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
