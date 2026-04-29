import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  TikTok,
  Apple,
  Play,
  Star
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social media links
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: TikTok, label: 'TikTok', href: '#' }
  ];

  // Payment methods
  const paymentMethods = ['Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay'];

  // Footer links columns
  const columns = [
    {
      title: 'Khám phá',
      links: [
        { label: 'Trang chủ', path: '/' },
        { label: 'Thực đơn', path: '/menu' },
        { label: 'Đơn hàng', path: '/orders' }
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Trung tâm trợ giúp', path: '#' },
        { label: 'Liên hệ hợp tác', path: '#' },
        { label: 'Báo cáo vấn đề', path: '#' }
      ]
    },
    {
      title: 'Liên hệ',
      links: [
        { label: '📞 1900 1234', path: 'tel:1900 1234' },
        { label: '✉️ hello@foodiego.com', path: 'mailto:hello@foodiego.com' },
        { label: '📍 123 Đường ABC, TP.HCM', path: '#' }
      ]
    }
  ];

  return (
    <footer 
      className="mt-20 relative"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {/* Top accent line gradient */}
      <div 
        className="h-0.5 w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)'
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}
              >
                <ChefHat size={22} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                FoodieGo
              </span>
            </Link>

            {/* Brand Description */}
            <p className="text-gray-400 text-sm leading-relaxed pr-2">
              Trải nghiệm giao đồ ăn nhanh chóng, an toàn và luôn nóng hổi. Dịch vụ ẩm thực hàng đầu cho bạn.
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-white/5 border border-white/10 w-fit">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-medium">4.8 (12K+)</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all duration-300 border border-white/5"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Discover Column */}
          <div className="space-y-5">
            <h3 
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#FF6B35' }}
            >
              Khám phá
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link 
                  to="/menu" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Thực đơn
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Đơn hàng của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-5">
            <h3 
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#FF6B35' }}
            >
              Hỗ trợ
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Liên hệ hợp tác
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Báo cáo vấn đề
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-5">
            <h3 
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#FF6B35' }}
            >
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <a href="tel:1900 1234" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                  1900 1234
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@foodiego.com" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                  hello@foodiego.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  123 Đường ABC<br />TP. Hồ Chí Minh
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Download App Section */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <h3 
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: '#FF6B35' }}
          >
            Tải ứng dụng FoodieGo
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* App Store */}
            <a 
              href="#" 
              className="flex-1 sm:flex-none px-5 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Apple size={18} className="text-white group-hover:text-orange-500 transition-colors" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Tải trên</div>
                <div className="text-sm font-semibold text-white">App Store</div>
              </div>
            </a>

            {/* Google Play */}
            <a 
              href="#" 
              className="flex-1 sm:flex-none px-5 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Play size={18} className="text-white group-hover:text-orange-500 transition-colors" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Tải trên</div>
                <div className="text-sm font-semibold text-white">Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-white/10 pt-8 pb-8 mb-8">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">
            Phương thức thanh toán
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-300 cursor-default"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="border-t pt-8"
          style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {/* Left - Copyright */}
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 leading-relaxed">
                © {currentYear} <span className="text-gray-300 font-semibold">FoodieGo</span>. All rights reserved.
              </p>
            </div>

            {/* Center - Tagline (hidden on mobile) */}
            <div className="hidden md:block text-center">
              <p className="text-xs text-gray-500 italic">
                Giao đồ ăn nhanh, an toàn, ngon miệng
              </p>
            </div>

            {/* Right - Legal Links */}
            <div className="flex justify-center md:justify-end gap-6">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Bảo mật
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Điều khoản
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-300">
                Cookie
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
