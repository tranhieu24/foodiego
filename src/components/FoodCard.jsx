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
        <img
          src={imgError ? FALLBACK : food.image}
          alt={food.name}
          className="w-10 h-10 rounded-lg object-cover shrink-0"
          onError={(e) => { e.target.src = FALLBACK; }}
        />
        <div>
          <p className="font-semibold text-gray-800 text-sm">{food.name}</p>
          <p className="text-xs text-gray-500">Đã thêm vào giỏ hàng!</p>
        </div>
      </div>,
      {
        duration: 2500,
        style: { borderRadius: '14px', padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
      }
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
    <div className="food-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '176px' }}>
        <img
          src={imgError ? FALLBACK : food.image}
          alt={food.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {food.isPopular && (
            <span
              className="px-2 py-0.5 text-[11px] font-bold text-white rounded-full shadow"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
            >
              🔥 Phổ biến
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-full bg-red-500 shadow">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Time badge bottom right */}
        {food.time && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock size={10} />
            {food.time}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-1">
          {food.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 flex-1 leading-relaxed">
          {food.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-700">{food.rating}</span>
          {food.reviews && (
            <span className="text-[11px] text-gray-400">({food.reviews})</span>
          )}
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black text-orange-500">
              {formatPrice(food.price)}
            </span>
            {food.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(food.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all duration-200 shrink-0 ${
              added ? 'bg-green-500 scale-95' : ''
            }`}
            style={!added ? { background: 'linear-gradient(135deg, #FF6B35, #E8551F)' } : {}}
          >
            {added ? (
              <><Check size={13} /> Đã thêm</>
            ) : isInCart ? (
              <><Plus size={13} /> Thêm nữa</>
            ) : (
              <><ShoppingCart size={13} /> Thêm</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
