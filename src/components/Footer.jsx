import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Share2, Camera, Music } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social icons - using available lucide icons
  const socialIcons = [
    { icon: Share2, href: '#', label: 'Facebook' },
    { icon: Camera, href: '#', label: 'Instagram' },
    { icon: Music, href: '#', label: 'TikTok' }
  ];

  return (
    <footer className="mt-20">
      {/* Top accent line - cam duy nhất */}
      <div className="w-full h-0.5" style={{ backgroundColor: '#FF6B35' }} />

      {/* Main content */}
      <div style={{ backgroundColor: '#111' }} className="py-16">
        <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16">
          {/* 4 columns grid - responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            
            {/* Column 1: Brand */}
            <div className="space-y-5">
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-white">FoodieGo</h3>
                <p className="text-xs" style={{ color: '#666' }}>
                  Giao đồ ăn nhanh chóng, an toàn và luôn nóng hổi đến tay bạn.
                </p>
              </div>

              {/* Social icons - 32px square */}
              <div className="flex gap-3.5">
                {socialIcons.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="w-8 h-8 flex items-center justify-center border transition-colors"
                      style={{
                        borderColor: '#333',
                        color: '#666'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ffffff';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.color = '#666';
                      }}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Khám phá */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Khám phá</h4>
              <ul className="space-y-3.5">
                <li>
                  <Link to="/" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/menu" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Thực đơn
                  </Link>
                </li>
                <li>
                  <Link to="/orders" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Đơn hàng của tôi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Hỗ trợ */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Hỗ trợ</h4>
              <ul className="space-y-3.5">
                <li>
                  <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Liên hệ hợp tác
                  </a>
                </li>
                <li>
                  <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
                    Báo cáo vấn đề
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Liên hệ */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Liên hệ</h4>
              <ul className="space-y-3.5">
                <li className="flex items-center gap-3">
                  <Phone size={16} style={{ color: '#FF6B35' }} className="flex-shrink-0" />
                  <a href="tel:1900 1234" style={{ color: '#666' }} className="text-xs hover:text-white">
                    1900 1234
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} style={{ color: '#FF6B35' }} className="flex-shrink-0" />
                  <a href="mailto:hello@foodiego.com" style={{ color: '#666' }} className="text-xs hover:text-white">
                    hello@foodiego.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={16} style={{ color: '#FF6B35' }} className="flex-shrink-0" />
                  <span style={{ color: '#666' }} className="text-xs">
                    123 Đường ABC<br />TP. Hồ Chí Minh
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: '#0F0F0F', borderTopColor: '#222' }} className="border-t py-6">
        <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div style={{ color: '#666' }} className="text-xs">
              © {currentYear} FoodieGo. All rights reserved.
            </div>

            {/* Right: Links */}
            <div className="flex gap-6">
              <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
                Bảo mật
              </a>
              <span style={{ color: '#333' }}>·</span>
              <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
                Điều khoản
              </a>
              <span style={{ color: '#333' }}>·</span>
              <a href="#" style={{ color: '#666' }} className="text-xs hover:text-white">
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
