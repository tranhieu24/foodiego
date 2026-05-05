import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id),
});

// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role: role || 'user' });

  if (user) {
    res.status(201).json(formatUser(user));
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json(formatUser(user));
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @route POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const googleRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`);
  if (!googleRes.ok) {
    res.status(401);
    throw new Error('Google token không hợp lệ');
  }

  const { id, email, name } = await googleRes.json();

  let user = await User.findOne({ $or: [{ googleId: id }, { email }] });
  if (!user) {
    user = await User.create({ name, email, googleId: id });
  } else if (!user.googleId) {
    user.googleId = id;
    await user.save({ validateBeforeSave: false });
  }

  res.json(formatUser(user));
});

// @route POST /api/auth/facebook
const facebookLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);
  if (!fbRes.ok) {
    res.status(401);
    throw new Error('Facebook token không hợp lệ');
  }

  const { id, email, name } = await fbRes.json();

  const query = email ? { $or: [{ facebookId: id }, { email }] } : { facebookId: id };
  let user = await User.findOne(query);
  if (!user) {
    user = await User.create({
      name,
      email: email || `fb${id}@facebook.placeholder.com`,
      facebookId: id,
    });
  } else if (!user.facebookId) {
    user.facebookId = id;
    await user.save({ validateBeforeSave: false });
  }

  res.json(formatUser(user));
});

// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: `FoodieGo <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu FoodieGo',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
          <div style="background:linear-gradient(135deg,#FF6B35,#E8551F);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🍔 FoodieGo</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin-bottom:8px;">Đặt lại mật khẩu</h2>
            <p style="color:#666;line-height:1.6;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục:</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="background:linear-gradient(135deg,#FF6B35,#E8551F);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            <p style="color:#999;font-size:13px;line-height:1.6;">Link có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#bbb;font-size:12px;text-align:center;">© FoodieGo. Giao đồ ăn nhanh chóng.</p>
          </div>
        </div>
      `,
    });
    res.json({ message: 'Email đặt lại mật khẩu đã được gửi.' });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Không thể gửi email, vui lòng thử lại sau.');
  }
});

// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json(formatUser(user));
});

export { registerUser, loginUser, googleLogin, facebookLogin, forgotPassword, resetPassword };
