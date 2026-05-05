import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Clock, Plus, Check } from 'lucide-react';
import { addItem, selectCartItems } from '../store/cartSlice';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop&auto=format&q=80';

const FoodCard = ({ food }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isInCart = cartItems.some((item) => item.id === food.id);

  const handleAddToCart = useCallback(() => {
    dispatch(addItem(food));
    setAdded(true);
    toast.success(
      <div className="flex items-center gap-3">
        <img src={imgError ? FALLBACK : food.image} alt={food.name}
          className="w-10 h-10 rounded-lg object-cover shrink-0"
          onError={(e) => { e.target.src = FALLBACK; }} />
        <div>
          <p className="font-semibold text-gray-800 text-sm">{food.name}</p>
          <p className="text-xs text-gray-500">Đã thêm vào giỏ hàng!</p>
        </div>
      </div>,
      { duration: 2500, style: { borderRadius: '14px', padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } }
    );
    setTimeout(() => setAdded(false), 1500);
  }, [dispatch, food, imgError]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '--';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const discountPercent = food.originalPrice
    ? Math.round((1 - food.price / food.originalPrice) * 100)
    : null;

  return (
    <div className="food-card bg-white rounded-2xl overflow-hidden border border-gray-100 group
                    flex flex-row sm:flex-col">

      {/* ── Image ── */}
      {/* Mobile: fixed square; Desktop: full-width landscape */}
      <div className="relative overflow-hidden shrink-0
                      w-[120px] h-[120px] sm:w-full sm:h-44">
        <img
          src={imgError ? FALLBACK : food.image}
          alt={food.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {food.isPopular && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full shadow hidden sm:inline"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
              🔥 Phổ biến
            </span>
          )}
          {discountPercent && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full bg-red-500 shadow">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Time badge — desktop only */}
        {food.time && (
          <div className="absolute bottom-2 right-2 hidden sm:flex items-center gap-1 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock size={10} /> {food.time}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-0.5 sm:mb-1 line-clamp-1">
          {food.name}
        </h3>

        {/* Description — desktop only */}
        <p className="hidden sm:block text-[11px] text-gray-400 line-clamp-2 mb-3 flex-1 leading-relaxed">
          {food.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 sm:mb-3">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-700">{food.rating}</span>
          {food.reviews && (
            <span className="text-[10px] text-gray-400 hidden sm:inline">({food.reviews})</span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between mb-2">
          {food.originalPrice ? (
            <span className="text-[10px] text-gray-400 line-through leading-none">
              {formatPrice(food.originalPrice)}
            </span>
          ) : <span />}
          <span className="text-base font-black text-orange-500 leading-none">
            {formatPrice(food.price)}
          </span>
        </div>

        {/* Add button */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 ${
            added ? 'bg-green-500 scale-95' : ''
          }`}
          style={!added ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}
        >
          {added ? (
            <><Check size={12} /> Đã thêm</>
          ) : isInCart ? (
            <><Plus size={12} /> Thêm nữa</>
          ) : (
            <><ShoppingCart size={12} /> Thêm</>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
