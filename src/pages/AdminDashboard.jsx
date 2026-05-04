import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, BarChart3, ShoppingBag,
  Users, TrendingUp, X, Star, ChevronDown, LayoutDashboard,
  Package, CheckCircle2, Clock, Loader2, RefreshCw, Eye,
  DollarSign, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { selectIsAdmin } from '../store/authSlice';
import { categories } from '../data/mockData';
import Modal from '../components/Modal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm', icon: ShoppingBag },
  { id: 'orders', label: 'Đơn hàng', icon: Package },
  { id: 'users', label: 'Người dùng', icon: Users },
];

const EMPTY_PRODUCT = {
  name: '', category: 'burger', price: '', originalPrice: '',
  rating: 4.5, image: '', description: '', isPopular: false,
};

const fmt = (p) => p ? Number(p).toLocaleString('vi-VN') + 'đ' : '--';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';

// ── Stat card ────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, bg, loading }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      {loading
        ? <div className="w-10 h-8 skeleton rounded-lg" />
        : <span className="text-3xl font-black" style={{ color }}>{value}</span>}
    </div>
    <p className="text-sm font-bold text-gray-700">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Admin Dashboard ───────────────────────────────────────────
const AdminDashboard = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const [tab, setTab] = useState('dashboard');

  // ── Product state ──
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCat, setProductCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ── Order state ──
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  // ── User state ──
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch { toast.error('Không thể tải sản phẩm'); }
    finally { setLoadingProducts(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoadingOrders(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/user/all');
      setUsers(data);
    } catch { toast.error('Không thể tải người dùng'); }
    finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => { fetchProducts(); fetchOrders(); fetchUsers(); }, []);

  // ── Stats ──────────────────────────────────────────────────
  const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const deliveredCount = orders.filter(o => o.isDelivered).length;
  const pendingCount = orders.filter(o => !o.isDelivered).length;

  const stats = [
    { label: 'Doanh thu', value: fmt(revenue), sub: `${orders.length} đơn`, icon: DollarSign, color: '#2D9B4E', bg: 'rgba(45,155,78,0.12)' },
    { label: 'Tổng đơn hàng', value: orders.length, sub: `${pendingCount} chờ giao`, icon: Package, color: '#FF6B35', bg: 'rgba(255,107,53,0.12)' },
    { label: 'Sản phẩm', value: products.length, sub: `${products.filter(p => p.isPopular).length} phổ biến`, icon: ShoppingBag, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Người dùng', value: users.length, sub: `${users.filter(u => u.role === 'admin').length} admin`, icon: Users, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ];

  // ── Product CRUD ───────────────────────────────────────────
  const openAddModal = () => { setEditingProduct(null); setFormData(EMPTY_PRODUCT); setModalOpen(true); };
  const openEditModal = (p) => { setEditingProduct(p); setFormData({ ...p, price: p.price, originalPrice: p.originalPrice || '' }); setModalOpen(true); };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        rating: Number(formData.rating),
      };
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? data : p));
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts(prev => [data, ...prev]);
        toast.success('Đã thêm sản phẩm mới!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    } finally { setSavingProduct(false); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteId(null);
      toast.success('Đã xóa sản phẩm!');
    } catch { toast.error('Không thể xóa sản phẩm'); }
  };

  // ── Order actions ─────────────────────────────────────────
  const handleDeliver = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/deliver`);
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
      toast.success('Đã cập nhật trạng thái giao hàng!');
    } catch { toast.error('Không thể cập nhật đơn hàng'); }
    finally { setUpdatingOrderId(null); }
  };

  // ── Filtered data ─────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchCat = productCat === 'all' || p.category === productCat;
    const matchSearch = !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'pending') return !o.isDelivered;
    if (orderFilter === 'delivered') return o.isDelivered;
    if (orderFilter === 'paid') return o.isPaid;
    return true;
  });
  const pagedOrders = filteredOrders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const filteredUsers = users.filter(u =>
    !userSearch.trim() ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Access guard ──────────────────────────────────────────
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-6">🚫</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Không có quyền truy cập</h2>
        <p className="text-gray-500 mb-6">Trang này chỉ dành cho Admin.</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl">Đăng nhập Admin</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F1F5F9' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">FoodieGo Management System</p>
            </div>
          </div>
          <button onClick={() => { fetchProducts(); fetchOrders(); fetchUsers(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-orange-300 transition-all">
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>

        {/* ── Tab nav ── */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-2xl mb-6 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}>
              <t.icon size={15} />
              {t.label}
              {t.id === 'orders' && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB: TỔNG QUAN
        ════════════════════════════════ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(s => (
                <StatCard key={s.label} {...s} loading={loadingOrders && loadingProducts && loadingUsers} />
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Đơn hàng gần đây</h2>
                <button onClick={() => setTab('orders')} className="text-xs text-orange-500 font-semibold hover:underline">Xem tất cả →</button>
              </div>
              {loadingOrders
                ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-6 py-3 text-left">Đơn hàng</th>
                        <th className="px-6 py-3 text-left">Khách hàng</th>
                        <th className="px-6 py-3 text-left">Tổng tiền</th>
                        <th className="px-6 py-3 text-left">Thanh toán</th>
                        <th className="px-6 py-3 text-left">Trạng thái</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.slice(0, 8).map(o => (
                          <tr key={o._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">#{o._id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-800">{o.user?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{o.user?.email}</p>
                            </td>
                            <td className="px-6 py-3 font-bold text-orange-500">{fmt(o.totalPrice)}</td>
                            <td className="px-6 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {o.isPaid ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isDelivered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                {o.isDelivered ? '✓ Đã giao' : '🚚 Đang giao'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có đơn hàng nào.</div>}
                  </div>
                )}
            </div>

            {/* Top products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Sản phẩm phổ biến</h2>
                <button onClick={() => setTab('products')} className="text-xs text-orange-500 font-semibold hover:underline">Quản lý →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {products.filter(p => p.isPopular).slice(0, 5).map((p, i) => (
                  <div key={p._id} className="px-6 py-3 flex items-center gap-4">
                    <span className="text-lg font-black text-gray-200 w-6">#{i + 1}</span>
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-500">{fmt(p.price)}</p>
                      <div className="flex items-center gap-0.5 justify-end">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs text-gray-500">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {products.filter(p => p.isPopular).length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB: SẢN PHẨM
        ════════════════════════════════ */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-gray-800">Sản phẩm ({filteredProducts.length})</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <select value={productCat} onChange={e => setProductCat(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Tìm món..." value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 w-44" />
                </div>
                <button onClick={openAddModal}
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
                  <Plus size={16} /> Thêm món
                </button>
              </div>
            </div>

            {loadingProducts
              ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Sản phẩm</th>
                      <th className="px-6 py-3 text-left">Danh mục</th>
                      <th className="px-6 py-3 text-left">Giá</th>
                      <th className="px-6 py-3 text-left">Đánh giá</th>
                      <th className="px-6 py-3 text-left">Trạng thái</th>
                      <th className="px-6 py-3 text-center">Thao tác</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60'; }} />
                              <div>
                                <p className="font-semibold text-gray-800 leading-tight">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-medium">
                              {categories.find(c => c.id === p.category)?.emoji} {p.category}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-bold text-orange-500">{fmt(p.price)}</span>
                            {p.originalPrice && <span className="ml-1 text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1">
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-gray-700">{p.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            {p.isPopular
                              ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-600">🔥 Phổ biến</span>
                              : p.originalPrice
                                ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-500">🏷️ Sale</span>
                                : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Bình thường</span>}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditModal(p)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Pencil size={12} /> Sửa
                              </button>
                              {deleteId === p._id
                                ? <div className="flex items-center gap-1">
                                    <button onClick={() => handleDeleteProduct(p._id)}
                                      className="px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Xác nhận</button>
                                    <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><X size={12} /></button>
                                  </div>
                                : <button onClick={() => setDeleteId(p._id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                    <Trash2 size={12} /> Xóa
                                  </button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && <div className="text-center py-16 text-gray-400">Không tìm thấy sản phẩm nào.</div>}
                </div>
              )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB: ĐƠN HÀNG
        ════════════════════════════════ */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-gray-800">Đơn hàng ({filteredOrders.length})</h2>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pending', label: '🚚 Chờ giao' },
                  { id: 'delivered', label: '✓ Đã giao' },
                  { id: 'paid', label: '💳 Đã thanh toán' },
                ].map(f => (
                  <button key={f.id} onClick={() => { setOrderFilter(f.id); setOrderPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${orderFilter === f.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    style={orderFilter === f.id ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingOrders
              ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
              : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <th className="px-6 py-3 text-left">Mã đơn</th>
                        <th className="px-6 py-3 text-left">Khách hàng</th>
                        <th className="px-6 py-3 text-left">Món ăn</th>
                        <th className="px-6 py-3 text-left">Tổng tiền</th>
                        <th className="px-6 py-3 text-left">Thanh toán</th>
                        <th className="px-6 py-3 text-left">Giao hàng</th>
                        <th className="px-6 py-3 text-left">Ngày đặt</th>
                        <th className="px-6 py-3 text-center">Thao tác</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {pagedOrders.map(o => (
                          <tr key={o._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-3 font-mono text-xs font-bold text-gray-600">#{o._id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-800">{o.user?.name || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{o.shippingAddress?.phone}</p>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex -space-x-2">
                                {o.orderItems?.slice(0, 3).map((item, i) => (
                                  <img key={i} src={item.image} alt={item.name}
                                    className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&q=60'; }} />
                                ))}
                                {o.orderItems?.length > 3 && (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                    +{o.orderItems.length - 3}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{o.orderItems?.length} món</p>
                            </td>
                            <td className="px-6 py-3 font-bold text-orange-500">{fmt(o.totalPrice)}</td>
                            <td className="px-6 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {o.isPaid ? '✓ Đã TT' : '⏳ Chờ TT'}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isDelivered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                {o.isDelivered ? '✓ Đã giao' : '🚚 Đang giao'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-xs text-gray-500">{fmtDate(o.createdAt)}</td>
                            <td className="px-6 py-3 text-center">
                              {!o.isDelivered && (
                                <button onClick={() => handleDeliver(o._id)}
                                  disabled={updatingOrderId === o._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors mx-auto disabled:opacity-50">
                                  {updatingOrderId === o._id
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <CheckCircle2 size={12} />}
                                  Đã giao
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && <div className="text-center py-16 text-gray-400">Không có đơn hàng nào.</div>}
                  </div>

                  {/* Pagination */}
                  {totalOrderPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-500">Trang {orderPage}/{totalOrderPages} · {filteredOrders.length} đơn</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-orange-300 disabled:opacity-40 transition-all">
                          <ChevronLeft size={14} />
                        </button>
                        <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))} disabled={orderPage === totalOrderPages}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-orange-300 disabled:opacity-40 transition-all">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB: NGƯỜI DÙNG
        ════════════════════════════════ */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-gray-800">Người dùng ({filteredUsers.length})</h2>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm người dùng..." value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 w-52" />
              </div>
            </div>

            {loadingUsers
              ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Người dùng</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Vai trò</th>
                      <th className="px-6 py-3 text-left">Địa chỉ</th>
                      <th className="px-6 py-3 text-left">Ngày tham gia</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-500">{u.email}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                              {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500">{u.addresses?.length || 0} địa chỉ</td>
                          <td className="px-6 py-3 text-xs text-gray-500">{fmtDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-16 text-gray-400">Không tìm thấy người dùng nào.</div>}
                </div>
              )}
          </div>
        )}
      </div>

      {/* ── Add/Edit Product Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingProduct ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'} size="lg">
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">TÊN MÓN ĂN *</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} required
                placeholder="VD: Burger Bò Phô Mai Double"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">DANH MỤC *</label>
              <div className="relative">
                <select name="category" value={formData.category} onChange={handleFormChange}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400 pr-8">
                  {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">ĐÁNH GIÁ</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleFormChange}
                min="0" max="5" step="0.1"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">GIÁ BÁN (VNĐ) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleFormChange} required min="0"
                placeholder="VD: 89000"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">GIÁ GỐC (nếu đang sale)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice || ''} onChange={handleFormChange} min="0"
                placeholder="VD: 110000"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL HÌNH ẢNH</label>
              <input type="url" name="image" value={formData.image} onChange={handleFormChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">MÔ TẢ *</label>
              <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} required
                placeholder="Mô tả chi tiết về món ăn..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleFormChange} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-700">🔥 Món phổ biến</span>
              </label>
            </div>
          </div>
          {formData.image && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img src={formData.image} alt="preview" className="w-14 h-14 rounded-lg object-cover" onError={e => { e.target.style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{formData.name || 'Tên món ăn'}</p>
                <p className="text-xs text-orange-500 font-bold">{formData.price ? Number(formData.price).toLocaleString('vi-VN') + 'đ' : '--'}</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Hủy</button>
            <button type="submit" disabled={savingProduct}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70">
              {savingProduct ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</> : editingProduct ? '✅ Cập nhật' : '➕ Thêm món'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
