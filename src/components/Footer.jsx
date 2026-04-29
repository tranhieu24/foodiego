import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Globe,
  Share2
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 py-20 border-t border-gray-100" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 shadow-lg shadow-orange-900/20" style={{ background: 'linear-gradient(135deg, #FF6B35, #E8551F)' }}>
                <ChefHat size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                FoodieGo
              </span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed">
              Giao đồ ăn nhanh chóng, an toàn và luôn nóng hổi đến tận tay bạn. Trải nghiệm dịch vụ ẩm thực hàng đầu.
            </p>
            <div className="flex gap-3">
              {[Globe, Share2].map((Icon, index) => (
                <a key={index} href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Trang chủ</Link></li>
              <li><Link to="/menu" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Thực đơn</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Đơn hàng</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-5">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Điều khoản & Bảo mật</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-xs">Liên hệ hợp tác</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-xs">
                <Phone size={14} className="text-orange-500" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-xs">
                <Mail size={14} className="text-orange-500" />
                <span>hello@foodiego.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-[11px] text-center md:text-left tracking-wide">
            © {currentYear} <span className="text-gray-300 font-medium">FOODIEGO</span>. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-[11px] transition-colors uppercase tracking-widest">Bảo mật</a>
            <a href="#" className="text-gray-500 hover:text-white text-[11px] transition-colors uppercase tracking-widest">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
