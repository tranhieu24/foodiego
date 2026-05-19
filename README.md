# 🍔 FoodieGo – Ứng Dụng Đặt Đồ Ăn Trực Tuyến

> **🚀 Live Demo:** [https://foodiego-iota.vercel.app/](https://foodiego-iota.vercel.app/)

FoodieGo là nền tảng đặt đồ ăn trực tuyến được xây dựng theo mô hình **Full-Stack**, phục vụ thị trường Việt Nam với đầy đủ tính năng từ duyệt thực đơn, đặt hàng, thanh toán đến quản trị hệ thống.

---

## I. CÔNG NGHỆ SỬ DỤNG

### Frontend
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| React | 19.2 | Thư viện UI chính |
| Vite | 8.0 | Build tool & dev server |
| Redux Toolkit | 2.11 | Quản lý state toàn cục |
| React Router DOM | 7.14 | Điều hướng trang |
| Tailwind CSS | 4.2 | Giao diện & responsive |
| Framer Motion | 12.38 | Hiệu ứng animation |
| Axios | 1.15 | Gọi API HTTP |
| React Hook Form | 7.74 | Xử lý & validate form |
| React Leaflet | 5.0 | Bản đồ địa chỉ |
| QRCode React | 4.2 | Tạo mã QR thanh toán |

### Backend
| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| Node.js + Express | 4.19 | REST API server |
| MongoDB + Mongoose | 8.3 | Cơ sở dữ liệu |
| JWT | 9.0 | Xác thực & phân quyền |
| bcryptjs | 2.4 | Mã hóa mật khẩu |
| Nodemailer | 8.0 | Gửi email |

### Tích hợp bên thứ ba
- **Google OAuth** – Đăng nhập bằng tài khoản Google
- **Facebook Login** – Đăng nhập bằng Facebook
- **VietQR / MoMo** – Thanh toán trực tuyến
- **Vercel** – Nền tảng triển khai (Serverless)

---

## II. KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────┐
│                   NGƯỜI DÙNG                     │
│           (Trình duyệt / Mobile)                 │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│              VERCEL (CDN + Serverless)            │
│  ┌─────────────────┐   ┌─────────────────────┐  │
│  │   FRONTEND       │   │      BACKEND         │  │
│  │  React + Vite    │   │  Node.js + Express   │  │
│  │  /dist (static) │   │  /api/* (functions)  │  │
│  └─────────────────┘   └──────────┬──────────┘  │
└───────────────────────────────────┼─────────────┘
                                    │ Mongoose
                         ┌──────────▼──────────────┐
                         │    MongoDB Atlas          │
                         │  (Cloud Database)         │
                         │  - users                  │
                         │  - products               │
                         │  - orders                 │
                         └─────────────────────────┘
```

---

## III. CẤU TRÚC FRONTEND

### Sơ đồ trang
```
FoodieGo/
├── HomePage           – Trang chủ, banner, món phổ biến
├── MenuPage           – Thực đơn đầy đủ, tìm kiếm, lọc
├── CartPage           – Giỏ hàng, mã giảm giá
├── CheckoutPage       – Thanh toán 3 bước
├── OrderHistoryPage   – Lịch sử đơn hàng
├── LoginPage          – Đăng nhập
├── RegisterPage       – Đăng ký
├── ForgotPasswordPage – Quên mật khẩu
├── ResetPasswordPage  – Đặt lại mật khẩu
└── AdminDashboard     – Quản trị (Admin only)
```

### Quản lý State (Redux)

**authSlice** – Xác thực người dùng:
- Lưu thông tin user, token vào `localStorage`
- Xử lý login/register thường, Google OAuth, Facebook OAuth

**cartSlice** – Giỏ hàng:
- Thêm/xóa/cập nhật số lượng món
- Áp mã giảm giá: `FOODIEGO20` (20%), `SALE10` (10%), `NEWUSER` (15%)
- Tự động lưu vào `localStorage`

---

## IV. CẤU TRÚC BACKEND – REST API

```
/api
├── /auth
│   ├── POST /register          – Đăng ký
│   ├── POST /login             – Đăng nhập
│   ├── POST /google            – Google OAuth
│   ├── POST /facebook          – Facebook OAuth
│   ├── POST /forgot-password   – Gửi email reset
│   └── POST /reset-password    – Đặt lại mật khẩu
│
├── /products
│   ├── GET  /                  – Lấy toàn bộ sản phẩm
│   ├── GET  /:id               – Chi tiết sản phẩm
│   ├── POST /                  – Tạo sản phẩm [Admin]
│   ├── PUT  /:id               – Cập nhật [Admin]
│   └── DELETE /:id             – Xóa [Admin]
│
├── /orders
│   ├── POST /                  – Tạo đơn hàng
│   ├── GET  /                  – Tất cả đơn [Admin]
│   ├── GET  /user/:id          – Đơn của user
│   ├── PUT  /:id/pay           – Xác nhận thanh toán
│   └── PUT  /:id/deliver       – Xác nhận giao hàng [Admin]
│
└── /user
    ├── GET  /all               – Tất cả user [Admin]
    ├── GET  /addresses         – Địa chỉ của user
    ├── POST /addresses         – Thêm địa chỉ
    ├── PUT  /addresses/:id     – Cập nhật địa chỉ
    └── POST /calculate-shipping – Tính phí ship
```

### Middleware bảo mật
```
Request → protect() [JWT] → admin() [role check] → Controller
```

---

## V. CƠ SỞ DỮ LIỆU – MongoDB Atlas

### Collection `users`
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@email.com",
  "password": "$2b$10$...(bcrypt hashed)",
  "role": "user | admin",
  "googleId": "...",
  "facebookId": "...",
  "resetPasswordToken": "...",
  "resetPasswordExpire": "Date",
  "addresses": [
    {
      "label": "Nhà | Cơ quan | Trường học",
      "addressDetail": "123 Nguyễn Trãi, Q.1, TP.HCM",
      "coordinates": { "lat": 10.762, "lng": 106.660 },
      "isDefault": true
    }
  ]
}
```

### Collection `products`
```json
{
  "name": "Burger Bò Phô Mai",
  "category": "burger | pizza | pho | sushi | salad | drink | dessert",
  "price": 85000,
  "originalPrice": 100000,
  "description": "Burger bò với phô mai Cheddar...",
  "image": "https://...",
  "rating": 4.5,
  "isPopular": true
}
```

### Collection `orders`
```json
{
  "user": "ObjectId (ref: users)",
  "orderItems": [
    { "name": "Burger Bò Phô Mai", "qty": 2, "price": 85000, "product": "ObjectId" }
  ],
  "shippingAddress": { "address": "123 Nguyễn Trãi", "city": "TP.HCM", "phone": "0901234567" },
  "paymentMethod": "COD | BANK | MOMO",
  "itemsPrice": 170000,
  "shippingFee": 25000,
  "totalPrice": 195000,
  "isPaid": false,
  "isDelivered": false
}
```

---

## VI. QUY TRÌNH NGHIỆP VỤ

### Luồng đặt hàng
```
1. Duyệt Menu
   └── Tìm kiếm / Lọc danh mục / Sắp xếp theo giá, rating

2. Thêm vào Giỏ hàng
   └── Redux cập nhật state → Lưu localStorage tức thì

3. Checkout – Bước 1: Thông tin giao hàng
   └── Họ tên, SĐT, Tỉnh / Quận / Phường / Địa chỉ chi tiết

4. Checkout – Bước 2: Phương thức thanh toán
   ├── COD  – Thanh toán khi nhận hàng
   ├── BANK – Hiển thị QR VietQR
   └── MOMO – Hiển thị QR MoMo

5. Xác nhận đơn → Gọi API POST /api/orders
   ├── Server kiểm tra giá thực từ DB (chống hack giá)
   ├── Tính phí ship theo khoảng cách (công thức Haversine)
   └── Lưu đơn vào MongoDB

6. Theo dõi đơn hàng
   └── Tự động refresh mỗi 30 giây
       └── Trạng thái: Đã đặt → Đang giao → Đã giao
```

### Luồng xác thực
```
├── Email + Password → bcrypt verify → JWT (30 ngày)
├── Google OAuth    → ID Token → Google API → JWT
└── Facebook OAuth  → Access Token → Facebook API → JWT

JWT tự động đính kèm vào mọi request qua Axios interceptor
```

### Tính phí giao hàng
```
Haversine Formula → Khoảng cách (km)
├── ≤ 2 km:  15,000 VND (cố định)
└── > 2 km:  15,000 + (km - 2) × 5,000 VND

Miễn phí ship khi đơn hàng ≥ 200,000 VND
```

---

## VII. TÍNH NĂNG NỔI BẬT

### Người dùng
- Đăng nhập đa nền tảng: Email / Google / Facebook
- Quên mật khẩu qua email (token hết hạn sau 15 phút)
- Lưu nhiều địa chỉ giao hàng với tọa độ GPS
- Giỏ hàng tự động lưu dù chưa đăng nhập

### Thương mại
- Hơn 50 món ăn, 7 danh mục
- Mã giảm giá tích hợp sẵn
- 3 phương thức thanh toán phổ biến tại Việt Nam
- Tự động seed dữ liệu khi DB trống

### Quản trị (Admin)
- Dashboard thống kê: doanh thu, đơn hàng, người dùng
- CRUD sản phẩm với xem trước ảnh
- Quản lý và cập nhật trạng thái đơn hàng
- Quản lý danh sách người dùng

### Kỹ thuật
- **Serverless-ready**: Backend export dưới dạng function, không start server
- **Bảo mật giá**: Server tự lấy giá từ DB, không tin giá từ client
- **Responsive**: Tối ưu cho mobile và desktop

---

## VIII. TRIỂN KHAI (DEPLOYMENT)

```
GitHub Repository
      │ Push code → tự động trigger
      ▼
   Vercel CI/CD
   ┌───────────────────────────────┐
   │  vercel.json                  │
   │  ├── /api/* → Express Server  │
   │  └── /*    → React SPA        │
   └───────────────────────────────┘
      │
      ▼
   https://foodiego-iota.vercel.app/
```

**Biến môi trường trên Vercel:**
```
MONGODB_URI   – Kết nối MongoDB Atlas
JWT_SECRET    – Khóa ký token
EMAIL_USER    – Gmail SMTP
EMAIL_PASS    – Gmail App Password
FRONTEND_URL  – URL frontend cho email reset
```

---

## IX. CHẠY DỰ ÁN LOCAL

```bash
# 1. Clone repo
git clone https://github.com/tranhieu24/foodiego.git
cd foodiego

# 2. Cài dependencies
npm install
npm install --prefix server

# 3. Tạo file server/.env
cp server/.env.example server/.env
# Điền MONGODB_URI, JWT_SECRET, ...

# 4. Chạy đồng thời frontend + backend
npm run dev:all
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## X. CẤU TRÚC THƯ MỤC

```
foodiego/
├── src/                    # Frontend
│   ├── pages/              # 9 trang
│   ├── components/         # 8 component tái sử dụng
│   ├── store/              # Redux (authSlice, cartSlice)
│   ├── utils/              # Axios instance
│   ├── App.jsx
│   └── main.jsx
│
├── server/src/             # Backend
│   ├── routes/             # 4 file routes
│   ├── controllers/        # 4 file controllers
│   ├── models/             # 3 Mongoose schemas
│   ├── middleware/         # Auth, error handling
│   ├── config/             # DB connection
│   ├── utils/              # Haversine, seeder
│   └── index.js
│
├── vercel.json             # Cấu hình deploy
├── vite.config.js
└── package.json
```

---

## XI. KẾT LUẬN

| Tiêu chí | Đánh giá |
|----------|----------|
| Kiến trúc | MVC rõ ràng, tách biệt frontend/backend |
| Bảo mật | JWT, bcrypt, phân quyền, validate server-side |
| Trải nghiệm | Responsive, animation, real-time update |
| Scalability | Serverless, MongoDB Atlas cloud |
| Tính năng | Đầy đủ cho một ứng dụng thực tế |

**FoodieGo** là một sản phẩm sẵn sàng đưa vào thực tế với kiến trúc chuẩn mực, bảo mật và trải nghiệm người dùng được chú trọng từ đầu đến cuối.

---

> 🌐 **Demo:** [https://foodiego-iota.vercel.app/](https://foodiego-iota.vercel.app/)  
> 👨‍💻 **Author:** Trần Hiếu, Gia Phú , Đặng Tiến Đạt
