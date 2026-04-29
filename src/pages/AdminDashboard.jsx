import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, BarChart3, ShoppingBag,
  Users, TrendingUp, X, Star, ChevronDown, LayoutDashboard
} from 'lucide-react';
import { selectIsAdmin } from '../store/authSlice';
import { foods as initialFoods, categories } from '../data/mockData';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const EMPTY_FOOD = {
  name: '',
  category: 'burger',
  price: '',
  originalPrice: '',
  rating: 4.5,
  reviews: 0,
  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  description: '',
  isPopular: false,
  isSale: false,
  time: '20-25 phút',
};

const AdminDashboard = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const [foods, setFoods] = useState(initialFoods);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FOOD);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Không có quyền truy cập</h2>
          <p className="text-gray-500 mb-6">Trang này chỉ dành cho Admin.</p>
          <Link
            to="/login"
            id="admin-go-login-btn"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl"
          >
            Đăng nhập Admin
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Tổng món ăn', value: foods.length, icon: ShoppingBag, color: '#FF6B35', bg: 'rgba(255,107,53,0.1)' },
    { label: 'Đang sale', value: foods.filter((f) => f.isSale).length, icon: TrendingUp, color: '#2D9B4E', bg: 'rgba(45,155,78,0.1)' },
    { label: 'Phổ biến', value: foods.filter((f) => f.isPopular).length, icon: Star, color: '#FFB347', bg: 'rgba(255,179,71,0.1)' },
    { label: 'Danh mục', value: categories.length - 1, icon: BarChart3, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  ];

  const filteredFoods = foods.filter((f) => {
    const matchCat = filterCat === 'all' || f.category === filterCat;
    const matchSearch =
      !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAddModal = useCallback(() => {
    setEditingFood(null);
    setFormData(EMPTY_FOOD);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((food) => {
    setEditingFood(food);
    setFormData({ ...food });
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirmId(null);
    toast.success('Đã xóa món ăn!');
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingFood) {
      setFoods((prev) =>
        prev.map((f) => (f.id === editingFood.id ? { ...formData, id: editingFood.id } : f))
      );
      toast.success('Đã cập nhật món ăn!');
    } else {
      const newFood = {
        ...formData,
        id: Date.now(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
      };
      setFoods((prev) => [newFood, ...prev]);
      toast.success('Đã thêm món ăn mới!');
    }
    setModalOpen(false);
  };

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + 'đ';

  return (
    <div className="min-h-screen py-8 overflow-x-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Quản lý thực đơn nhà hàng</p>
            </div>
          </div>
          <button
            id="admin-add-food-btn"
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={18} /> Thêm món ăn
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <span className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-gray-800">Danh sách món ăn ({filteredFoods.length})</h2>
            <div className="flex items-center gap-3">
              {/* Category filter */}
              <div className="relative">
                <select
                  id="admin-category-filter"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-search-input"
                  type="text"
                  placeholder="Tìm món..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 w-48"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Món ăn</th>
                  <th className="px-6 py-3">Danh mục</th>
                  <th className="px-6 py-3">Giá</th>
                  <th className="px-6 py-3">Đánh giá</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFoods.map((food) => (
                  <tr key={food.id} id={`admin-row-${food.id}`} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{food.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{food.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg font-medium capitalize">
                        {categories.find((c) => c.id === food.category)?.emoji} {food.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-orange-500 text-sm">{formatPrice(food.price)}</span>
                      {food.originalPrice && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(food.originalPrice)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="star-filled fill-current" />
                        <span className="text-sm font-semibold text-gray-700">{food.rating}</span>
                        <span className="text-xs text-gray-400">({food.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {food.isPopular && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit status-delivering">🔥 Phổ biến</span>
                        )}
                        {food.isSale && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-red-50 text-red-500">🏷️ Sale</span>
                        )}
                        {!food.isPopular && !food.isSale && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-gray-50 text-gray-500">Bình thường</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`admin-edit-${food.id}`}
                          onClick={() => openEditModal(food)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Pencil size={13} /> Sửa
                        </button>
                        {deleteConfirmId === food.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              id={`admin-confirm-delete-${food.id}`}
                              onClick={() => handleDelete(food.id)}
                              className="px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`admin-delete-${food.id}`}
                            onClick={() => setDeleteConfirmId(food.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500">Không tìm thấy món ăn nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFood ? '✏️ Chỉnh sửa món ăn' : '➕ Thêm món ăn mới'}
        size="lg"
      >
        <form id="admin-food-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">TÊN MÓN ĂN *</label>
              <input
                id="admin-form-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="VD: Burger Bò Phô Mai Double"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">DANH MỤC *</label>
              <div className="relative">
                <select
                  id="admin-form-category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400 pr-8"
                >
                  {categories.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">THỜI GIAN GIAO</label>
              <input
                id="admin-form-time"
                type="text"
                name="time"
                value={formData.time}
                onChange={handleFormChange}
                placeholder="VD: 20-25 phút"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">GIÁ BÁN (VNĐ) *</label>
              <input
                id="admin-form-price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
                min="0"
                placeholder="VD: 89000"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">GIÁ GỐC (để trống nếu không có)</label>
              <input
                id="admin-form-original-price"
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleFormChange}
                min="0"
                placeholder="VD: 110000"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL HÌNH ẢNH</label>
              <input
                id="admin-form-image"
                type="url"
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                placeholder="https://..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">MÔ TẢ</label>
              <textarea
                id="admin-form-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Mô tả chi tiết về món ăn..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            {/* Checkboxes */}
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="admin-form-popular"
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-700">🔥 Món phổ biến</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="admin-form-sale"
                  type="checkbox"
                  name="isSale"
                  checked={formData.isSale}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-700">🏷️ Đang giảm giá</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {formData.image && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img src={formData.image} alt="Preview" className="w-14 h-14 rounded-lg object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{formData.name || 'Tên món ăn'}</p>
                <p className="text-xs text-orange-500 font-bold">{formData.price ? Number(formData.price).toLocaleString('vi-VN') + 'đ' : '--'}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              id="admin-form-submit-btn"
              type="submit"
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm"
            >
              {editingFood ? '✅ Cập nhật' : '➕ Thêm món'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
