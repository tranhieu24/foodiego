import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, MapPin, Phone, CreditCard, Truck,
  CheckCircle2, Wallet, Building, QrCode, Loader2, Edit3, User, Package
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { selectCartItems, selectCartSubtotal, selectCartDiscount, clearCart } from '../store/cartSlice';
import { selectUser, selectIsAuthenticated } from '../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const SHIPPING_FEE = 25000;
const FREE_SHIP_THRESHOLD = 200000;

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }) };

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder:text-gray-400`}
      />
    </div>
  </div>
);

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
  const [shippingInfo, setShippingInfo] = useState({ name: user?.name || '', phone: '', address: '', city: 'Hồ Chí Minh', note: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const shipping = useMemo(() => (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE), [subtotal]);
  const discountAmount = useMemo(() => Math.round(subtotal * discountRate), [subtotal, discountRate]);
  const total = useMemo(() => subtotal + shipping - discountAmount, [subtotal, shipping, discountAmount]);
  const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ';

  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;
  if (items.length === 0 && !orderSuccess) return <Navigate to="/menu" replace />;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/orders', {
        orderItems: items.map(i => ({ product: i.id, qty: i.quantity })),
        shippingAddress: { address: shippingInfo.address, city: shippingInfo.city, phone: shippingInfo.phone },
        paymentMethod
      }, { headers: { Authorization: `Bearer ${user.token}` } });
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
    { id: 'COD', name: 'Tiền mặt khi nhận hàng', desc: 'Thanh toán trực tiếp cho shipper', icon: Wallet, color: 'text-green-600' },
    { id: 'BANK', name: 'Chuyển khoản ngân hàng', desc: 'Quét mã VietQR – nhanh chóng, an toàn', icon: Building, color: 'text-blue-600' },
    { id: 'MOMO', name: 'Ví MoMo', desc: 'Thanh toán qua ứng dụng MoMo', icon: CreditCard, color: 'text-pink-600' },
  ];

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto">

        {/* Stepper */}
        {step < 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-0 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step >= s.id;
                const isCurrent = step === s.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 ${isCurrent ? 'text-white shadow-md' : isActive ? 'text-orange-600' : 'text-gray-400'}`}
                      style={isCurrent ? { background: 'linear-gradient(135deg,#FF6B35,#E8551F)' } : {}}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isCurrent ? 'border-white/50 bg-white/20 text-white' : isActive ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                        {isActive && !isCurrent ? <CheckCircle2 size={14} /> : s.id}
                      </div>
                      <span className={`text-sm font-bold ${isCurrent ? 'text-white' : ''}`}>{s.name}</span>
                    </div>
                    {idx < STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 rounded ${step > s.id ? 'bg-orange-400' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column */}
          <div className={`${step < 3 ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            <AnimatePresence mode="wait">

              {/* Step 1: Shipping Info */}
              {step === 1 && (
                <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#FF6B35,#E8551F)' }}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800">Thông tin giao hàng</h3>
                        <p className="text-xs text-gray-400">Điền thông tin để shipper liên hệ bạn</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                        <InputField label="Họ và tên" icon={User} type="text" value={shippingInfo.name} onChange={e => setShippingInfo({ ...shippingInfo, name: e.target.value })} placeholder="Tên người nhận hàng" />
                      </motion.div>
                      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                        <InputField label="Số điện thoại" icon={Phone} type="tel" value={shippingInfo.phone} onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })} placeholder="Số điện thoại liên hệ" />
                      </motion.div>
                      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
                        <InputField label="Địa chỉ giao hàng" icon={MapPin} type="text" value={shippingInfo.address} onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })} placeholder="Số nhà, tên đường, phường/xã, quận..." />
                      </motion.div>
                      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="md:col-span-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Edit3 size={12} /> Ghi chú cho shipper
                          </label>
                          <textarea rows={3} value={shippingInfo.note} onChange={e => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                            placeholder="Ví dụ: Giao giờ hành chính, cổng sau tòa nhà..." />
                        </div>
                      </motion.div>
                    </div>

                    <motion.button custom={4} variants={fadeUp} initial="hidden" animate="visible"
                      onClick={() => setStep(2)}
                      disabled={!shippingInfo.address || !shippingInfo.phone || !shippingInfo.name}
                      className="mt-8 w-full py-4 rounded-xl text-white font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                      style={{ background: 'linear-gradient(135deg,#FF6B35,#E8551F)', boxShadow: '0 8px 20px rgba(255,107,53,0.35)' }}>
                      Tiếp tục <ChevronRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#FF6B35,#E8551F)' }}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800">Phương thức thanh toán</h3>
                        <p className="text-xs text-gray-400">Chọn hình thức thanh toán phù hợp</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((m, i) => {
                        const Icon = m.icon;
                        const selected = paymentMethod === m.id;
                        return (
                          <motion.button key={m.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${selected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-white shadow-md' : 'bg-gray-100'}`}>
                              <Icon size={22} className={selected ? 'text-orange-500' : 'text-gray-400'} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold text-sm ${selected ? 'text-orange-900' : 'text-gray-700'}`}>{m.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                              {selected && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* QR Preview for BANK/MOMO */}
                    <AnimatePresence>
                      {paymentMethod !== 'COD' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-5 bg-blue-50 rounded-2xl p-5 flex flex-col items-center gap-3 overflow-hidden">
                          <p className="text-blue-700 font-bold text-sm flex items-center gap-2"><QrCode size={16} /> Mã QR sẽ hiển thị sau khi đặt hàng</p>
                          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-200 to-blue-100 animate-pulse" />
                          </div>
                          <p className="text-xs text-blue-500">Quét mã để chuyển khoản nhanh</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 mt-8">
                      <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border-2 border-gray-200 font-bold text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                        <ChevronLeft size={18} /> Quay lại
                      </button>
                      <button onClick={handlePlaceOrder} disabled={loading}
                        className="flex-[2] py-4 rounded-xl text-white font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                        style={{ background: 'linear-gradient(135deg,#FF6B35,#E8551F)', boxShadow: '0 8px 20px rgba(255,107,53,0.35)' }}>
                        {loading ? <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</> : <>Xác nhận đặt hàng <ChevronRight size={20} /></>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <motion.div key="step3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </motion.div>
                  <motion.h2 variants={fadeUp} initial="hidden" animate="visible" className="text-3xl font-black text-gray-800 mb-2">Đặt hàng thành công! 🎉</motion.h2>
                  <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-gray-400 mb-8">
                    Mã đơn hàng: <span className="font-black text-gray-700">#{orderSuccess?._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}</span>
                  </motion.p>

                    {paymentMethod !== 'COD' && orderSuccess && (
                      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                        <p className="text-blue-800 font-bold mb-4 flex items-center justify-center gap-2"><QrCode size={18} /> Quét mã để thanh toán</p>
                        <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
                          <QRCodeSVG value={`PAYMENT:${orderSuccess?._id}:${total}`} size={180} />
                        </div>
                        <p className="text-xs text-blue-500 mt-3">Số tiền: <strong className="text-blue-700 text-sm">{formatPrice(total)}</strong></p>
                      </motion.div>
                    )}

                  <div className="space-y-3">
                    <motion.button custom={3} variants={fadeUp} initial="hidden" animate="visible" onClick={() => navigate('/orders')}
                      className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg,#FF6B35,#E8551F)' }}>
                      <Package size={18} /> Xem đơn hàng của tôi
                    </motion.button>
                    <button onClick={() => navigate('/')} className="w-full py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                      Quay lại trang chủ
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Sidebar */}
          {step < 3 && (
            <div className="lg:col-span-5">
              <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="bg-white rounded-3xl border border-gray-100 p-7 sticky top-24"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>

                <h3 className="font-black text-gray-800 text-lg mb-6 flex items-center gap-2">
                  <Package size={18} className="text-orange-500" /> Chi tiết đơn hàng
                </h3>

                {/* Items List */}
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-6">
                  {items.map((item, i) => (
                    <motion.div key={item.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.quantity}x {item.name}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.price)} / món</p>
                      </div>
                      <p className="text-sm font-black text-orange-500 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tạm tính</span>
                    <span className="text-sm font-bold text-gray-700">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phí giao hàng</span>
                    {shipping === 0
                      ? <span className="text-sm font-bold text-green-600">Miễn phí 🎉</span>
                      : <span className="text-sm font-bold text-gray-700">{formatPrice(shipping)}</span>}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Giảm giá</span>
                      <span className="text-sm font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-black text-gray-800 text-base">Tổng cộng</span>
                  <span className="text-3xl font-black" style={{ color: '#FF6B35' }}>{formatPrice(total)}</span>
                </div>

                {/* Delivery Address Preview (Step 2) */}
                {step === 2 && shippingInfo.address && (
                  <div className="mt-5 bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Giao đến</p>
                    <p className="text-sm font-semibold text-gray-800">{shippingInfo.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{shippingInfo.phone}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{shippingInfo.address}, {shippingInfo.city}</p>
                    <button onClick={() => setStep(1)} className="text-xs text-orange-500 font-bold mt-2 flex items-center gap-1 hover:text-orange-600">
                      <Edit3 size={11} /> Chỉnh sửa
                    </button>
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
