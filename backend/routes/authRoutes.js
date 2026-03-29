const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ── Rate limiters ────────────────────────────────────────────
// Нэвтрэх: 15 минутэд 10 оролдлого (brute force хамгаалалт)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: '15 минутэд 10-аас илүү оролдлого хийж болохгүй. Түр хүлээнэ үү.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Бүртгүүлэх: 1 цагт 5 оролдлого
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: '1 цагт 5-аас илүү бүртгэл үүсгэж болохгүй.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Нууц үг солих: 15 минутэд 5 оролдлого
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: '15 минутэд 5-аас илүү оролдлого хийж болохгүй.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Токен үүсгэх туслах функц
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register — Шинэ хэрэглэгч бүртгэх
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Хэрэглэгчийн нэр, имэйл, нууц үг шаардлагатай' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Нууц үг дор хаяж 6 тэмдэгт байх ёстой' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Хэрэглэгчийн нэр эсвэл имэйл аль хэдийн бүртгэлтэй байна' });
    }

    const user = new User({ username, email, password, role: role || 'teacher' });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'Хэрэглэгч амжилттай бүртгэгдлээ',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage },
    });
  } catch (err) {
    console.error('REGISTER АЛДАА:', err);
    res.status(500).json({ message: 'Бүртгэлд алдаа гарлаа', error: err.message });
  }
});

// POST /api/auth/login — Нэвтрэх
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Имэйл болон нууц үг шаардлагатай' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Амжилттай нэвтэрлээ',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ message: 'Нэвтрэхэд алдаа гарлаа', error: err.message });
  }
});

// POST /api/auth/change-password — Нууц үг солих (имэйлээр, нэвтрэлгүй)
router.post('/change-password', passwordLimiter, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Имэйл, одоогийн болон шинэ нууц үг шаардлагатай' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Тухайн имэйлтэй хэрэглэгч олдсонгүй' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Одоогийн нууц үг буруу байна' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Нууц үг амжилттай солигдлоо' });
  } catch (err) {
    res.status(500).json({ message: 'Нууц үг солиход алдаа гарлаа', error: err.message });
  }
});

// PATCH /api/auth/profile — Профайл зураг шинэчлэх (хамгаалалттай)
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    res.json({
      message: 'Профайл амжилттай шинэчлэгдлээ',
      user: { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ message: 'Профайл шинэчлэхэд алдаа гарлаа', error: err.message });
  }
});

// GET /api/auth/me — Одоогийн хэрэглэгч авах (хамгаалалттай)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

module.exports = router;
