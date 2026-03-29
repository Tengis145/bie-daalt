const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');

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
    if (exam1 < 0 || exam1 > 30)             return { error: `${g.subject}: Шалгалт 1 оноо 0-30 байх ёстой` };
    if (exam2 < 0 || exam2 > 30)             return { error: `${g.subject}: Шалгалт 2 оноо 0-30 байх ёстой` };
    if (attendance < 0 || attendance > 20)   return { error: `${g.subject}: Ирц оноо 0-20 байх ёстой` };
    if (independent < 0 || independent > 20) return { error: `${g.subject}: Бие даалт оноо 0-20 байх ёстой` };
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

    const filter = studentFilter(req, extra);
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
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
    const { name, className, grades, academicYear, semester, photo } = req.body;
    if (!name || !name.trim())           return res.status(400).json({ message: 'Нэр шаардлагатай' });
    if (!className || !className.trim()) return res.status(400).json({ message: 'Анги шаардлагатай' });

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

    const { grades, name, className, academicYear, semester, photo } = req.body;
    const updateData = {};
    if (name         !== undefined) updateData.name         = name.trim();
    if (className    !== undefined) updateData.className    = className.trim();
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (semester     !== undefined) updateData.semester     = semester;
    if (photo        !== undefined) updateData.photo        = photo;

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
    await student.deleteOne();
    res.json({ message: 'Сурагч амжилттай устгагдлаа' });
  } catch (err) {
    res.status(500).json({ message: 'Устгахад алдаа гарлаа', error: err.message });
  }
});

module.exports = router;
