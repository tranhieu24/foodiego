import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Search, ChefHat, User, LogOut, LayoutDashboard,
  Clock, X, Home, UtensilsCrossed, Package,
} from 'lucide-react';
import { selectCartCount } from '../store/cartSlice';
import { selectIsAuthenticated, selectUser, selectIsAdmin, logout } from '../store/authSlice';

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileAccount, setShowMobileAccount] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
          right: `${Math.max(0, window.innerWidth - rect.right)}px`,
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
    setMobileSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    setShowMobileAccount(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
    { to: '/orders', label: 'Đơn hàng' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
        scrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-gray-100 py-2' : 'bg-white py-3 shadow-sm'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 shadow-lg shadow-orange-100"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                <ChefHat size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FoodieGo
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center bg-gray-50/80 p-1 rounded-2xl border border-gray-100 gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive(link.to) ? 'text-orange-600 bg-white shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-orange-500 hover:bg-white/50'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-md ml-4">
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

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile: search toggle */}
              <button
                className="lg:hidden p-2.5 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-colors"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Desktop: Cart */}
              <Link to="/cart" id="navbar-cart-btn"
                className={`hidden lg:flex relative p-2.5 rounded-2xl transition-all duration-300 group ${
                  isActive('/cart') ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-500'
                }`}>
                <ShoppingCart size={22} className="transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full ring-2 ring-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop: User menu */}
              {isAuthenticated ? (
                <div className="relative z-50 hidden lg:block">
                  <button ref={userMenuBtnRef} id="navbar-user-menu-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-2xl transition-all border ${
                      showUserMenu ? 'bg-white border-orange-200 shadow-lg shadow-orange-50' : 'bg-gray-50 border-transparent hover:border-gray-200'
                    }`}>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-white shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Thành viên</p>
                      <p className="text-sm font-black text-gray-700 leading-none">{user?.name?.split(' ').pop()}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="fixed w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-9999"
                      style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm"
                            style={{ backgroundColor: '#FFF3EE', color: '#FF6B35' }}>
                            {getInitials(user?.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-0.5 py-1">
                        <Link to="/orders" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <Clock size={15} className="text-gray-400" /> Đơn hàng của tôi
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard size={15} className="text-gray-400" /> Dashboard Admin
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={handleLogout} id="navbar-logout-btn"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-red-500"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <LogOut size={15} className="text-red-500" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" id="navbar-login-btn"
                  className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black text-white shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                  <User size={16} /> Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Mobile expandable search */}
          {mobileSearchOpen && (
            <div className="lg:hidden pb-3 pt-2 animate-slide-in-up">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Bạn muốn ăn gì?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 text-sm bg-gray-50 border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {showUserMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
        )}
      </nav>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-end justify-around px-2 pb-2 pt-1">

          <Link to="/" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all ${isActive('/') ? 'text-orange-500' : 'text-gray-400'}`}>
            <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Trang chủ</span>
          </Link>

          <Link to="/menu" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all ${isActive('/menu') ? 'text-orange-500' : 'text-gray-400'}`}>
            <UtensilsCrossed size={22} strokeWidth={isActive('/menu') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Thực đơn</span>
          </Link>

          {/* Cart — elevated center */}
          <Link to="/cart" className="flex flex-col items-center gap-1 -mt-4">
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
              <ShoppingCart size={24} className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive('/cart') ? 'text-orange-500' : 'text-gray-400'}`}>Giỏ hàng</span>
          </Link>

          <Link to="/orders" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all ${isActive('/orders') ? 'text-orange-500' : 'text-gray-400'}`}>
            <Package size={22} strokeWidth={isActive('/orders') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Đơn hàng</span>
          </Link>

          {isAuthenticated ? (
            <button onClick={() => setShowMobileAccount(true)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all ${showMobileAccount ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                {getInitials(user?.name).charAt(0)}
              </div>
              <span className="text-[10px] font-bold">Tài khoản</span>
            </button>
          ) : (
            <Link to="/login" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all ${isActive('/login') ? 'text-orange-500' : 'text-gray-400'}`}>
              <User size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-bold">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Account Bottom Sheet */}
      {showMobileAccount && (
        <>
          <div className="fixed inset-0 bg-black/40 z-60 lg:hidden" onClick={() => setShowMobileAccount(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-70 lg:hidden bg-white rounded-t-3xl shadow-2xl animate-slide-in-up">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />

            {/* User info */}
            <div className="px-5 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-100"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-base">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4 space-y-2">
              <Link to="/orders" onClick={() => setShowMobileAccount(false)}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Package size={18} className="text-orange-500" />
                </div>
                <span className="font-semibold">Đơn hàng của tôi</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setShowMobileAccount(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <LayoutDashboard size={18} className="text-purple-500" />
                  </div>
                  <span className="font-semibold">Dashboard Admin</span>
                </Link>
              )}
            </div>

            <div className="mx-4 border-t border-gray-100" />

            <div className="px-4 pt-3 pb-8">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-red-500 bg-red-50 font-bold hover:bg-red-100 transition-colors">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
