const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ── Rate limiters ────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: '15 минутэд 10-аас илүү оролдлого хийж болохгүй. Түр хүлээнэ үү.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: '1 цагт 5-аас илүү бүртгэл үүсгэж болохгүй.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: '15 минутэд 5-аас илүү оролдлого хийж болохгүй.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Input sanitization helper ────────────────────────────────
// HTML тэгнүүдийг устгаж, аюулгүй мөр буцаана
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return validator.stripLow(validator.trim(str)).replace(/<[^>]*>/g, '');
}

// ── Token generators ─────────────────────────────────────────
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }                   // Access token: 15 минут
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }                   // Refresh token: 30 хоног
  );
}

function userPayload(user) {
  return { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage };
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const username = sanitizeText(req.body.username);
    const email    = sanitizeText(req.body.email).toLowerCase();
    const password = req.body.password;
    const role     = req.body.role;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Хэрэглэгчийн нэр, имэйл, нууц үг шаардлагатай' });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: 'Имэйл хаяг буруу байна' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Нууц үг дор хаяж 6 тэмдэгт байх ёстой' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(409).json({ message: 'Хэрэглэгчийн нэр эсвэл имэйл аль хэдийн бүртгэлтэй байна' });

    const user = new User({ username, email, password, role: role || 'teacher' });

    const refreshToken = generateRefreshToken(user);
    user.refreshToken  = refreshToken;
    await user.save();

    const accessToken = generateAccessToken(user);

    res.status(201).json({
      message: 'Хэрэглэгч амжилттай бүртгэгдлээ',
      token: accessToken,
      refreshToken,
      user: userPayload(user),
    });
  } catch (err) {
    console.error('REGISTER АЛДАА:', err);
    res.status(500).json({ message: 'Бүртгэлд алдаа гарлаа' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const email    = sanitizeText(req.body.email).toLowerCase();
    const password = req.body.password;

    if (!email || !password)
      return res.status(400).json({ message: 'Имэйл болон нууц үг шаардлагатай' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Refresh token-ийг DB-д хадгална
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Амжилттай нэвтэрлээ',
      token: accessToken,
      refreshToken,
      user: userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Нэвтрэхэд алдаа гарлаа' });
  }
});

// ── POST /api/auth/refresh ───────────────────────────────────
// Refresh token ашиглан шинэ access token авна (нэвтрэлт шаардлагагүй)
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token байхгүй байна' });

  try {
    const secret  = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    const decoded = jwt.verify(refreshToken, secret);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: 'Refresh token хүчингүй байна' });

    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Refresh token-ийг шинэчилнэ (rotation)
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    res.status(403).json({ message: 'Refresh token хүчингүй эсвэл хугацаа дууссан байна' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });
    res.json({ message: 'Амжилттай гарлаа' });
  } catch {
    res.status(500).json({ message: 'Гарахад алдаа гарлаа' });
  }
});

// ── POST /api/auth/change-password ──────────────────────────
router.post('/change-password', passwordLimiter, async (req, res) => {
  try {
    const email           = sanitizeText(req.body.email).toLowerCase();
    const currentPassword = req.body.currentPassword;
    const newPassword     = req.body.newPassword;

    if (!email || !currentPassword || !newPassword)
      return res.status(400).json({ message: 'Имэйл, одоогийн болон шинэ нууц үг шаардлагатай' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Тухайн имэйлтэй хэрэглэгч олдсонгүй' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ message: 'Одоогийн нууц үг буруу байна' });

    user.password     = newPassword;
    user.refreshToken = '';          // Бүх сессийг цуцална
    await user.save();

    res.json({ message: 'Нууц үг амжилттай солигдлоо' });
  } catch {
    res.status(500).json({ message: 'Нууц үг солиход алдаа гарлаа' });
  }
});

// ── PATCH /api/auth/profile ──────────────────────────────────
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    res.json({ message: 'Профайл амжилттай шинэчлэгдлээ', user: userPayload(user) });
  } catch {
    res.status(500).json({ message: 'Профайл шинэчлэхэд алдаа гарлаа' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Алдаа гарлаа' });
  }
});

module.exports = router;
