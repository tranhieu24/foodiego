import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Search, Menu, X, ChefHat, User, LogOut, LayoutDashboard, Clock, MapPin, UserCircle } from 'lucide-react';
import { selectCartCount } from '../store/cartSlice';
import { selectIsAuthenticated, selectUser, selectIsAdmin, logout } from '../store/authSlice';

const Navbar = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: '0px', right: '0px' });
  const userMenuBtnRef = useRef(null);

  const cartCount = useSelector(selectCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (userMenuBtnRef.current) {
        const rect = userMenuBtnRef.current.getBoundingClientRect();
        setDropdownPos({
          top: `${rect.bottom + 16}px`,
          right: `${Math.max(0, window.innerWidth - rect.right)}px`
        });
      }
    };

    if (showUserMenu) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    navigate(`/menu?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate('/');
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: null },
    { to: '/menu', label: 'Thực đơn', icon: null },
    { to: '/orders', label: 'Đơn hàng', icon: null },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${scrolled
        ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-gray-100 py-2'
        : 'bg-white py-3 shadow-sm'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 shadow-lg shadow-orange-100" style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
              <ChefHat size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight hidden sm:block" style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FoodieGo
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center bg-gray-50/80 p-1 rounded-2xl border border-gray-100 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${isActive(link.to)
                  ? 'text-orange-600 bg-white shadow-sm ring-1 ring-gray-100'
                  : 'text-gray-500 hover:text-orange-500 hover:bg-white/50'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" strokeWidth={2} />
              <input
                id="navbar-search"
                type="text"
                placeholder="Tìm món hoặc quán ăn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 placeholder:text-gray-400"
              />
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Cart Icon */}
            <Link
              to="/cart"
              id="navbar-cart-btn"
              className={`relative p-2.5 rounded-2xl transition-all duration-300 group ${isActive('/cart') ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-500'}`}
            >
              <ShoppingCart size={22} className="transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full ring-2 ring-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative z-50">
                <button
                  ref={userMenuBtnRef}
                  id="navbar-user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-2xl transition-all border ${showUserMenu ? 'bg-white border-orange-200 shadow-lg shadow-orange-50' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-white shadow-sm">
                      <User size={18} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Thành viên</p>
                    <p className="text-sm font-black text-gray-700 leading-none">
                      {user?.name?.split(' ').pop()}
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <div 
                    className="fixed w-56 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/5 p-2 z-[9999] origin-top-right transition-all duration-150"
                    style={{
                      top: dropdownPos.top,
                      right: dropdownPos.right
                    }}
                  >
                    {/* Header Block - User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Avatar with Initials */}
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm" style={{ backgroundColor: '#FFF3EE', color: '#FF6B35' }}>
                          {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Clock size={15} className="text-gray-400" />
                        Đơn hàng của tôi
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-gray-400" />
                          Dashboard Admin
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      id="navbar-logout-btn"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={15} style={{ color: '#EF4444' }} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                id="navbar-login-btn"
                className="hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
              >
                <User size={16} />
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              id="navbar-mobile-toggle"
              className="lg:hidden p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-slide-in-up border-t border-gray-100 mt-4 pt-6 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Bạn muốn ăn gì?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-200 transition-all font-medium"
                />
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive(link.to)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-black text-white text-center mt-4 shadow-lg shadow-orange-100"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
              >
                <User size={16} /> Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Close user menu on outside click */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </nav>
  );
};

export default Navbar;
