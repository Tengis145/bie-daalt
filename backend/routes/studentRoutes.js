const express = require('express');
const router = express.Router();
const validator = require('validator');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// HTML тэг болон аюултай тэмдэгтийг цэвэрлэнэ
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return validator.stripLow(validator.trim(str)).replace(/<[^>]*>/g, '');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary URL-аас public_id гаргах
function getPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  return parts[1].replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
}

async function deleteCloudinaryImage(url) {
  const publicId = getPublicId(url);
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
}

// ── PUBLIC: Gmail/имэйлээр дүн харах (нэвтрэлт шаардлагагүй) ──
router.get('/public/lookup', async (req, res) => {
  try {
    const email = sanitize(String(req.query.email || '')).toLowerCase();
    if (!email || !validator.isEmail(email))
      return res.status(400).json({ message: 'Зөв Gmail хаяг оруулна уу' });
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(404).json({ message: 'Тухайн Gmail хаягтай сурагч олдсонгүй. Багшдаа имэйл хаягаа бүртгүүлнэ үү.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

router.use(authMiddleware);

// ── Grade validation + score recalc ─────────────────────────
function validateAndCalcGrades(grades) {
  if (!Array.isArray(grades)) return { error: 'grades массив байх ёстой' };
  for (const g of grades) {
    if (!g.subject || typeof g.subject !== 'string' || !g.subject.trim()) {
      return { error: 'Хичээлийн нэр шаардлагатай' };
    }
    const exam1       = Number(g.exam1       ?? 0);
    const exam2       = Number(g.exam2       ?? 0);
    const attendance  = Number(g.attendance  ?? 0);
    const independent = Number(g.independent ?? 0);
    if (isNaN(exam1) || exam1 < 0 || exam1 > 30)             return { error: `${g.subject}: Шалгалт 1 оноо 0-30 байх ёстой` };
    if (isNaN(exam2) || exam2 < 0 || exam2 > 30)             return { error: `${g.subject}: Шалгалт 2 оноо 0-30 байх ёстой` };
    if (isNaN(attendance) || attendance < 0 || attendance > 20)   return { error: `${g.subject}: Ирц оноо 0-20 байх ёстой` };
    if (isNaN(independent) || independent < 0 || independent > 20) return { error: `${g.subject}: Бие даалт оноо 0-20 байх ёстой` };
    g.exam1       = exam1;
    g.exam2       = exam2;
    g.attendance  = attendance;
    g.independent = independent;
    g.score       = exam1 + exam2 + attendance + independent;
  }
  return { grades };
}

// ── Role-based student filter ────────────────────────────────
// Admin: бүх сурагчийг харна
// Teacher: зөвхөн өөрийн бүртгэсэн сурагчдаа харна
function studentFilter(req, extra = {}) {
  const filter = { ...extra };
  if (req.user.role !== 'admin') {
    filter.$or = [
      { createdBy: req.user.id },
      { createdBy: { $exists: false } },
      { createdBy: null },
    ];
  }
  return filter;
}

// ── Ангиудын жагсаалт (/:id-ийн ӨМНӨ) ─────────────────────
router.get('/meta/classes', async (req, res) => {
  try {
    const filter = req.user.role !== 'admin'
      ? { $or: [{ createdBy: req.user.id }, { createdBy: null }, { createdBy: { $exists: false } }] }
      : {};
    const classes = await Student.distinct('className', filter);
    res.json(classes.sort());
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

// ── Бүх сурагч авах ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const extra = {};
    if (req.query.className)    extra.className    = req.query.className;
    if (req.query.academicYear) extra.academicYear = req.query.academicYear;
    if (req.query.semester)     extra.semester     = Number(req.query.semester);
    if (req.query.search)       extra.name         = { $regex: req.query.search.trim(), $options: 'i' };

    const filter = studentFilter(req, extra);
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip  = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    res.json({ students, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Сурагчдын мэдээлэл авахад алдаа гарлаа', error: err.message });
  }
});

// ── Нэг сурагч авах ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    // Teacher can only see their own students (or legacy ones without createdBy)
    if (req.user.role !== 'admin' && student.createdBy &&
        student.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Хандах эрхгүй' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

// ── Шинэ сурагч нэмэх ───────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { grades, academicYear, semester, photo } = req.body;
    const name      = sanitize(req.body.name);
    const className = sanitize(req.body.className);
    const email     = sanitize(String(req.body.email || '')).toLowerCase();
    if (!name)      return res.status(400).json({ message: 'Нэр шаардлагатай' });
    if (!className) return res.status(400).json({ message: 'Анги шаардлагатай' });
    if (email && !validator.isEmail(email)) return res.status(400).json({ message: 'Имэйл хаяг буруу байна' });
    const sem = Number(semester);
    if (semester !== undefined && ![1, 2].includes(sem)) return res.status(400).json({ message: 'Улирал 1 эсвэл 2 байх ёстой' });

    let validatedGrades = [];
    if (grades && grades.length > 0) {
      const result = validateAndCalcGrades(grades);
      if (result.error) return res.status(400).json({ message: result.error });
      validatedGrades = result.grades;
    }

    const student = new Student({
      name:         name.trim(),
      className:    className.trim(),
      grades:       validatedGrades,
      academicYear: academicYear || '2024-2025',
      semester:     semester || 1,
      photo:        photo || '',
      email:        email || '',
      createdBy:    req.user.id,
    });
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Сурагч нэмэхэд алдаа гарлаа', error: err.message });
  }
});

// ── Сурагч шинэчлэх ─────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    if (req.user.role !== 'admin' && student.createdBy &&
        student.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Хандах эрхгүй' });
    }

    const { grades, academicYear, semester, photo } = req.body;
    const updateData = {};
    if (req.body.name      !== undefined) updateData.name      = sanitize(req.body.name);
    if (req.body.className !== undefined) updateData.className = sanitize(req.body.className);
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (semester     !== undefined) updateData.semester     = semester;
    if (req.body.email !== undefined) {
      const email = sanitize(String(req.body.email || '')).toLowerCase();
      if (email && !validator.isEmail(email)) return res.status(400).json({ message: 'Имэйл хаяг буруу байна' });
      updateData.email = email;
    }
    if (photo !== undefined) {
      if (photo !== student.photo) await deleteCloudinaryImage(student.photo);
      updateData.photo = photo;
    }

    if (grades !== undefined) {
      const result = validateAndCalcGrades(grades);
      if (result.error) return res.status(400).json({ message: result.error });
      updateData.grades = result.grades;
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Шинэчлэхэд алдаа гарлаа', error: err.message });
  }
});

// ── Сурагч устгах ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    if (req.user.role !== 'admin' && student.createdBy &&
        student.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Хандах эрхгүй' });
    }
    await deleteCloudinaryImage(student.photo);
    await student.deleteOne();
    res.json({ message: 'Сурагч амжилттай устгагдлаа' });
  } catch (err) {
    res.status(500).json({ message: 'Устгахад алдаа гарлаа', error: err.message });
  }
});

module.exports = router;
