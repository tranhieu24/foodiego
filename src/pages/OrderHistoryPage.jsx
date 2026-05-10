import { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShoppingBag, Loader2, Truck, RefreshCw, MapPin, Phone, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/authSlice';
import api from '../utils/api';

const STATUS_CONFIG = {
  delivered: {
    label: 'Đã giao',
    icon: CheckCircle2,
    badge: 'bg-green-100 text-green-700 border border-green-200',
    color: '#2D9B4E',
    step: 3,
  },
  delivering: {
    label: 'Đang giao',
    icon: Truck,
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    color: '#3B82F6',
    step: 2,
  },
  cancelled: {
    label: 'Đã hủy',
    icon: XCircle,
    badge: 'bg-red-100 text-red-700 border border-red-200',
    color: '#EF4444',
    step: 0,
  },
};

const STEPS = [
  { label: 'Đặt hàng', icon: ShoppingBag },
  { label: 'Đang giao', icon: Truck },
  { label: 'Đã giao', icon: CheckCircle2 },
];

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatus = () => {
    if (order.isDelivered) return STATUS_CONFIG.delivered;
    return STATUS_CONFIG.delivering;
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatPrice = (p) => p ? Number(p).toLocaleString('vi-VN') + 'đ' : '--';
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Package size={20} className="text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-800 text-sm">#{order?._id?.slice(-6)?.toUpperCase()}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${status.badge}`}>
                <StatusIcon size={10} />
                {status.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={10} /> {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Tổng cộng</p>
          <p className="text-lg font-black text-orange-500">{formatPrice(order.totalPrice)}</p>
        </div>
      </div>

      {/* Progress tracker */}
      {status !== STATUS_CONFIG.cancelled && (
        <div className="px-5 py-4 bg-gray-50/60">
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute left-5 right-5 top-4 h-0.5 bg-gray-200" />
            <div
              className="absolute left-5 top-4 h-0.5 bg-blue-400 transition-all duration-700"
              style={{ width: status.step === 3 ? 'calc(100% - 40px)' : status.step === 2 ? '50%' : '0%' }}
            />
            {STEPS.map((step, i) => {
              const done = i < status.step;
              const active = i === status.step - 1;
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    done || active
                      ? 'border-blue-400 bg-blue-400 text-white'
                      : 'border-gray-200 bg-white text-gray-300'
                  } ${active && !done ? 'animate-pulse' : ''}`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-[10px] font-bold ${done || active ? 'text-blue-500' : 'text-gray-300'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item thumbnails + expand */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {order.orderItems.slice(0, 4).map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt={item.name}
              title={item.name}
              className="w-9 h-9 rounded-lg ring-2 ring-white object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60'; }}
            />
          ))}
          {order.orderItems.length > 4 && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 ring-2 ring-white flex items-center justify-center text-[10px] font-black text-gray-500">
              +{order.orderItems.length - 4}
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
        >
          {expanded ? 'Ẩn bớt' : 'Xem chi tiết'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/40 px-5 py-4 space-y-4">
          {/* Items list */}
          <div className="space-y-2">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60'; }}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{formatPrice(item.price)} × {item.qty}</p>
                  </div>
                </div>
                <span className="font-black text-sm text-gray-700">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Shipping */}
            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin giao hàng</p>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin size={13} className="text-orange-400 mt-0.5 shrink-0" />
                <span className="font-medium leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone size={13} className="text-orange-400 shrink-0" />
                <span className="font-medium">{order.shippingAddress?.phone}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thanh toán</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500">
                  {order.paymentMethod === 'COD'
                    ? <Banknote size={13} className="text-gray-400" />
                    : <CreditCard size={13} className="text-gray-400" />}
                  <span>{order.paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                </div>
                <span className={`font-bold ${(order.isPaid || order.paymentMethod !== 'COD') ? 'text-green-600' : 'text-orange-500'}`}>
                  {(order.isPaid || order.paymentMethod !== 'COD') ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
              <div className="border-t border-gray-50 pt-2 flex justify-between items-center">
                <span className="text-xs font-black text-gray-700">Tổng cộng</span>
                <span className="text-base font-black text-orange-500">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistoryPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!isAuthenticated || !user) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get(`/orders/user/${user._id}`);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30s để bắt cập nhật từ admin
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="text-6xl mb-5">🔐</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-7 text-sm font-medium">Đăng nhập để xem lịch sử đơn hàng của bạn.</p>
          <Link to="/login?redirect=/orders" className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 overflow-x-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Đơn hàng của tôi</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading ? '...' : `${orders.length} đơn hàng`}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm font-medium">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white py-20 px-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-5">📦</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-400 mb-7 text-sm font-medium">Hãy thêm món ăn vào giỏ hàng và đặt đơn đầu tiên!</p>
            <Link to="/menu" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2 font-bold text-sm">
              <ShoppingBag size={16} /> Xem thực đơn
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
