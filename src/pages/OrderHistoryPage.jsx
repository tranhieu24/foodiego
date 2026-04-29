import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/authSlice';
import axios from 'axios';

const STATUS_CONFIG = {
  delivered: {
    label: 'Đã giao',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700',
    color: '#2D9B4E',
  },
  delivering: {
    label: 'Đang xử lý',
    icon: Clock,
    className: 'bg-orange-100 text-orange-700',
    color: '#FF6B35',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: XCircle,
    className: 'bg-red-100 text-red-700',
    color: '#EF4444',
  },
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Map backend status to frontend config
  const getStatus = () => {
    if (order.isDelivered) return STATUS_CONFIG.delivered;
    return STATUS_CONFIG.delivering;
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ';
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-black text-gray-800">#{order?._id?.slice(-6)?.toUpperCase()}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Tổng cộng</p>
            <p className="text-xl font-black text-orange-500">{formatPrice(order.totalPrice)}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex -space-x-3 overflow-hidden">
            {order.orderItems.map((item, i) => (
              <img 
                key={i} 
                src={item.image} 
                alt={item.name} 
                className="inline-block h-10 w-10 rounded-xl ring-4 ring-white object-cover"
                title={item.name}
              />
            ))}
            {order.orderItems.length > 3 && (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold text-gray-500 ring-4 ring-white">
                +{order.orderItems.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
          >
            {expanded ? 'Ẩn bớt' : 'Xem chi tiết'}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 bg-gray-50/50 animate-fade-in">
          <div className="space-y-3 py-4">
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{formatPrice(item.price)} × {item.qty}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-800 text-sm">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-gray-100">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Địa chỉ giao hàng</p>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5">📍</span>
                  <p className="font-medium">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số điện thoại</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📞</span>
                  <p className="font-medium">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-3xl border border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Thanh toán</span>
                  <span className="text-gray-800 font-bold">{order.paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Trạng thái</span>
                  <span className={order.isPaid ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
                    {order.isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-800">Tổng cộng</span>
                  <span className="text-lg font-black text-orange-500">{formatPrice(order.totalPrice)}</span>
                </div>
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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`, config);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-xl border border-gray-100 max-w-md w-full">
          <div className="text-7xl mb-6">🔐</div>
          <h2 className="text-3xl font-black text-gray-800 mb-3">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-8 font-medium">Bạn cần đăng nhập để xem lịch sử mua hàng cá nhân.</p>
          <Link
            to="/login?redirect=/orders"
            className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Lịch sử giao dịch</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-2xl font-black text-gray-800">{orders.length}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn hàng</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white py-20 rounded-[40px] shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-400 mb-8 font-medium">Bạn chưa thực hiện bất kỳ giao dịch nào trên FoodieGo.</p>
            <Link
              to="/menu"
              className="btn-primary px-10 py-4 rounded-2xl inline-flex items-center gap-2"
            >
              <ShoppingBag size={20} /> Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="animate-fade-in">
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
