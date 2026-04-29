import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import { categories } from '../data/mockData';
import FoodCard from '../components/FoodCard';
import CategoryChip from '../components/CategoryChip';
import { SkeletonGrid } from '../components/SkeletonCard';
import axios from 'axios';

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

const PRICE_RANGES = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: '0-50000', label: 'Dưới 50.000đ' },
  { value: '50000-100000', label: '50.000 - 100.000đ' },
  { value: '100000-200000', label: '100.000 - 200.000đ' },
  { value: '200000+', label: 'Trên 200.000đ' },
];

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [foodData, setFoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        // Map _id to id for compatibility with existing components
        const mappedData = data.map(item => ({
          ...item,
          id: item._id,
          // Add some mock fields if missing to match UI expectations
          reviews: item.reviews || Math.floor(Math.random() * 200) + 50,
          time: '20-30 phút'
        }));
        setFoodData(mappedData);
      } catch (error) {
        console.error('Error fetching foods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const handleCategorySelect = useCallback((catId) => {
    setSelectedCategory(catId);
  }, []);

  const filteredAndSortedFoods = useMemo(() => {
    if (!foodData) return [];

    let result = [...foodData];

    // Filter by category
    if (selectedCategory !== 'all') {
      // Note: Backend categories might be different case or name, mapping needed if they don't match
      // For now, assume a simple match or case-insensitive match
      result = result.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    // Filter by price range
    if (priceRange !== 'all') {
      if (priceRange === '200000+') {
        result = result.filter((f) => f.price >= 200000);
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        result = result.filter((f) => f.price >= min && f.price <= max);
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    return result;
  }, [foodData, selectedCategory, searchQuery, priceRange, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    sortBy !== 'default' ||
    priceRange !== 'all' ||
    searchQuery.trim();

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSortBy('default');
    setPriceRange('all');
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen py-8">
      {/* Page Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">🍽️ Thực đơn</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? 'Đang tải...' : `${filteredAndSortedFoods.length} món ăn`}
              {selectedCategory !== 'all' && ` trong "${categories.find(c => c.id === selectedCategory)?.label || selectedCategory}"`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Tìm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              id="menu-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                showFilters || hasActiveFilters
                  ? 'text-white border-orange-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
              style={showFilters || hasActiveFilters ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}
            >
              <SlidersHorizontal size={16} />
              Lọc
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-slide-in-up">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-gray-500 mb-2 block">SẮP XẾP</label>
                <div className="relative">
                  <select
                    id="menu-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400 pr-8"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-gray-500 mb-2 block">MỨC GIÁ</label>
                <div className="relative">
                  <select
                    id="menu-price-filter"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-orange-400 pr-8"
                  >
                    {PRICE_RANGES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    id="menu-clear-filters-btn"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-all font-medium"
                  >
                    <X size={14} /> Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              isActive={selectedCategory === cat.id}
              onClick={handleCategorySelect}
            />
          ))}
        </div>

        {loading ? (
          <SkeletonGrid count={8} />
        ) : filteredAndSortedFoods.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy món ăn</h3>
            <p className="text-gray-500 text-sm mb-4">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
            <button
              onClick={clearFilters}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
            {filteredAndSortedFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
