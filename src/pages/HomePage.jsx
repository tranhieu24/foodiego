import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck, Loader2 } from 'lucide-react';
import { bannerSlides, categories } from '../data/mockData';
import FoodCard from '../components/FoodCard';
import api from '../utils/api';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [foodData, setFoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch foods from backend
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data } = await api.get('/products');
        const mappedData = data.map(item => ({
          ...item,
          id: item._id,
          reviews: item.reviews || Math.floor(Math.random() * 200) + 50,
          time: '20-30 phút',
          isPopular: item.rating >= 4.5
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

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const featuredFoods = useMemo(() => foodData.filter((f) => f.isPopular).slice(0, 5), [foodData]);
  const filteredFoods = useMemo(() => {
    if (selectedCategory === 'all') return foodData.slice(0, 8);
    return foodData.filter((f) => f.category && f.category.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 8);
  }, [foodData, selectedCategory]);

  const topRatedFoods = useMemo(() => foodData.filter((f) => f.rating >= 4.8).slice(0, 5), [foodData]);

  const features = [
    { icon: Zap, title: 'Giao siêu nhanh', desc: 'Trong vòng 30 phút', color: '#FF6B35' },
    { icon: Shield, title: 'Đảm bảo chất lượng', desc: 'Kiểm soát toàn bộ nguyên liệu', color: '#2D9B4E' },
    { icon: Truck, title: 'Free ship', desc: 'Đơn trên 200.000đ', color: '#FFB347' },
  ];

  const slide = bannerSlides[currentSlide];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 hero-gradient opacity-80" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center min-h-[520px]">
          <div className="text-white max-w-lg animate-fade-in" key={currentSlide}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: slide.accent + '33', border: `1px solid ${slide.accent}` }}
            >
              <span style={{ color: slide.accent }}>✨ Ưu đãi đặc biệt</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-3">
              {slide.title}
              <br />
              <span style={{ color: slide.accent }}>{slide.subtitle}</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">{slide.description}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/menu')}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-base"
              >
                {slide.cta} <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
              >
                Xem thực đơn
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              id={`banner-dot-${i}`}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5 shadow-lg flex items-center gap-4 transition-transform hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: f.color + '20' }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED DISHES ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800">🔥 Món phổ biến</h2>
            <p className="text-sm text-gray-500 mt-1">Được đặt nhiều nhất hôm nay</p>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {featuredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-800">🍽️ Khám phá theo danh mục</h2>
            <p className="text-sm text-gray-500 mt-2">Chọn loại món ăn yêu thích của bạn</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`home-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[90px] transition-all duration-300 ${selectedCategory === cat.id
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-500 shadow-sm'
                  }`}
                style={selectedCategory === cat.id ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-bold">{cat.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/menu"
              id="home-view-all-btn"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl"
            >
              Xem toàn bộ thực đơn <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TOP RATED ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800">⭐ Đánh giá cao nhất</h2>
            <p className="text-sm text-gray-500 mt-1">Rating từ 4.8 trở lên</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {topRatedFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-[1440px] mt-12 mb-20">
        <div
          className="rounded-3xl px-8 py-12 sm:px-16 sm:py-16 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E8551F 55%, #C44214 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -right-8 -top-8 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute right-24 bottom-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
          <div className="absolute right-4 top-4 text-[120px] leading-none select-none opacity-20 hidden sm:block">🍔</div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">Ưu đãi hôm nay</span>
              <h2 className="text-3xl sm:text-5xl font-black mb-3 leading-tight">
                Đói bụng chưa? 🎉
              </h2>
              <p className="text-white/85 text-sm sm:text-base mb-6">
                Đặt ngay hôm nay và nhận ưu đãi <strong className="text-white">free ship</strong> cho đơn hàng đầu tiên của bạn!
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-8">
                <span className="flex items-center gap-1.5"><span className="text-base">⚡</span> Giao trong 30 phút</span>
                <span className="flex items-center gap-1.5"><span className="text-base">🛡️</span> Đảm bảo chất lượng</span>
                <span className="flex items-center gap-1.5"><span className="text-base">🎁</span> Free ship đơn đầu</span>
              </div>
              <Link
                to="/menu"
                id="cta-order-btn"
                className="inline-flex items-center gap-2.5 bg-white font-black px-8 py-3.5 rounded-2xl hover:bg-orange-50 transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5 text-sm sm:text-base"
                style={{ color: '#FF6B35' }}
              >
                Đặt ngay bây giờ <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats column */}
            <div className="hidden sm:flex flex-col gap-4 min-w-40">
              {[
                { value: '50+', label: 'Món ăn' },
                { value: '4.8★', label: 'Đánh giá TB' },
                { value: '30p', label: 'Giao hàng' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-white/75 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
