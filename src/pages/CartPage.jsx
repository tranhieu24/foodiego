import { useMemo, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, Tag, X, ArrowRight, Truck, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartDiscount,
  selectPromoCode,
  removeItem,
  updateQuantity,
  clearCart,
  applyPromo,
  removePromo,
  addItem,
} from '../store/cartSlice';
import toast from 'react-hot-toast';

const SHIPPING_FEE = 25000;
const FREE_SHIP_THRESHOLD = 200000;



const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discountRate = useSelector(selectCartDiscount);
  const promoCode = useSelector(selectPromoCode);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Fetch real products from DB for recommendations
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(({ data }) => {
        const cartIds = new Set(items.map(i => i.id));
        const others = data
          .filter(p => !cartIds.has(p._id))
          .slice(0, 4)
          .map(p => ({ id: p._id, name: p.name, price: p.price, image: p.image, description: p.description }));
        setRecommendations(others);
      })
      .catch(() => {}); // Silent fail – recommendations are non-critical
  }, [items]);

  const shipping = useMemo(
    () => (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE),
    [subtotal]
  );
  const discountAmount = useMemo(() => Math.round(subtotal * discountRate), [subtotal, discountRate]);
  const total = useMemo(() => subtotal + shipping - discountAmount, [subtotal, shipping, discountAmount]);
  const progressToFreeShip = useMemo(() => Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100), [subtotal]);

  const handleIncrease = useCallback(
    (id, currentQty) => dispatch(updateQuantity({ id, quantity: currentQty + 1 })),
    [dispatch]
  );
  const handleDecrease = useCallback(
    (id, currentQty) => {
      if (currentQty <= 1) {
        dispatch(removeItem(id));
        toast.error('Đã xóa khỏi giỏ hàng', { duration: 1500 });
      } else {
        dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
      }
    },
    [dispatch]
  );
  const handleRemove = useCallback(
    (id, name) => {
      dispatch(removeItem(id));
      toast.error(`Đã xóa "${name}"`, { duration: 2000 });
    },
    [dispatch]
  );
  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    toast.success('Đã xóa toàn bộ giỏ hàng');
  }, [dispatch]);

  const handleApplyPromo = useCallback(() => {
    if (!promoInput.trim()) return;
    dispatch(applyPromo(promoInput));
    const validCodes = ['FOODIEGO20', 'SALE10', 'NEWUSER'];
    if (validCodes.includes(promoInput.toUpperCase())) {
      setPromoError('');
      toast.success(`🎉 Áp dụng mã "${promoInput.toUpperCase()}" thành công!`);
      setPromoInput('');
    } else {
      setPromoError('Mã giảm giá không hợp lệ!');
    }
  }, [dispatch, promoInput]);

  const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ';

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-8 text-7xl">
            🛒
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-3">Giỏ hàng đang trống!</h2>
          <p className="text-gray-400 mb-10 max-w-xs mx-auto leading-relaxed">Hãy thêm một vài món ăn ngon vào giỏ hàng để tiếp tục nhé.</p>
          <Link
            to="/menu"
            id="cart-go-menu-btn"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-300/40 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
          >
            <ShoppingBag size={20} /> Xem thực đơn ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Giỏ hàng của bạn</h1>
            <p className="text-gray-400 text-sm mt-1">{items.length} sản phẩm đang chờ bạn</p>
          </div>
          <button
            id="cart-clear-btn"
            onClick={handleClearCart}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 transition-all"
          >
            <Trash2 size={15} /> Xóa tất cả
          </button>
        </div>

        {/* Main Grid: 8/4 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===== LEFT COLUMN: Items ===== */}
          <div className="lg:col-span-8 space-y-5">

            {/* Free Ship Progress Bar */}
            {subtotal < FREE_SHIP_THRESHOLD ? (
              <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E8551F 100%)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Truck size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-sm">
                        Mua thêm <strong className="text-yellow-200">{formatPrice(FREE_SHIP_THRESHOLD - subtotal)}</strong> để được <strong>Miễn phí vận chuyển!</strong>
                      </p>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">{Math.round(progressToFreeShip)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressToFreeShip}%`, background: 'rgba(255,255,255,0.9)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-5 bg-green-50 border border-green-200 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Truck size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-800">🎉 Bạn được miễn phí vận chuyển!</p>
                  <p className="text-green-600 text-xs mt-0.5">Tuyệt vời! Đơn hàng của bạn đủ điều kiện giao hàng miễn phí.</p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-5 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          id={`cart-decrease-${item.id}`}
                          onClick={() => handleDecrease(item.id, item.quantity)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                        <button
                          id={`cart-increase-${item.id}`}
                          onClick={() => handleIncrease(item.id, item.quantity)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price + Delete */}
                      <div className="flex items-center gap-4">
                        <span className="font-black text-lg" style={{ color: '#FF6B35' }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          id={`cart-remove-${item.id}`}
                          onClick={() => handleRemove(item.id, item.name)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cross-sell: Recommended Items */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                    <Zap size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black text-gray-800">Có thể bạn sẽ thích</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                      <div className="h-28 overflow-hidden">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'; }}
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-gray-800 text-xs leading-tight mb-0.5 line-clamp-1">{rec.name}</p>
                        <p className="text-[11px] text-gray-400 mb-2 line-clamp-1">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm" style={{ color: '#FF6B35' }}>{formatPrice(rec.price)}</span>
                          <button
                            onClick={() => {
                              dispatch(addItem({ ...rec, quantity: 1 }));
                              toast.success(`Đã thêm ${rec.name}!`);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
                            style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>

              {/* Promo Code Section */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag size={12} className="text-orange-500" /> Mã giảm giá
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <span className="text-sm font-bold text-green-700">✅ {promoCode}</span>
                    <button onClick={() => dispatch(removePromo())} className="text-green-500 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      id="cart-promo-input"
                      type="text"
                      placeholder="Nhập mã..."
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 uppercase tracking-wider"
                    />
                    <button
                      id="cart-apply-promo-btn"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
                {!promoCode && (
                  <p className="text-xs text-gray-400 mt-2">Thử: FOODIEGO20 · SALE10 · NEWUSER</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="text-sm">Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="text-sm">Phí vận chuyển</span>
                  {shipping === 0 ? (
                    <span className="font-bold text-green-600 italic">Miễn phí 🎉</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(shipping)}</span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm">Giảm giá ({Math.round(discountRate * 100)}%)</span>
                    <span className="font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 my-4"></div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-orange-500">{formatPrice(total)}</span>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-checkout-btn"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
              >
                Tiến tới thanh toán <ArrowRight size={20} />
              </button>

              <Link
                to="/menu"
                className="text-sm text-center text-gray-500 mt-3 hover:text-orange-500 cursor-pointer block transition-colors"
              >
                ← Tiếp tục mua sắm
              </Link>

              {/* Trust Badges */}
              <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Thanh toán an toàn</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Truck size={14} className="text-orange-500" />
                  <span>Giao hàng nhanh</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
