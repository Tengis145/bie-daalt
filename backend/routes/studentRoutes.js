const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');

// Бүх student маршрутуудыг JWT-р хамгаалах
router.use(authMiddleware);

// ── Grade validation helper ──────────────────────────────────
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
    // Backend-д score-г автоматаар тооцоолно — frontend-ийн утгыг орлуулна
    g.exam1       = exam1;
    g.exam2       = exam2;
    g.attendance  = attendance;
    g.independent = independent;
    g.score       = exam1 + exam2 + attendance + independent;
  }
  return { grades };
}

// ── Ангиудын жагсаалт авах (/:id-ийн ӨМНӨ байх ёстой) ───────
router.get('/meta/classes', async (_req, res) => {
  try {
    const classes = await Student.distinct('className');
    res.json(classes.sort());
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

// ── Бүх сурагч авах / ангиар шүүх ───────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = req.query.className ? { className: req.query.className } : {};
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
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});

// ── Шинэ сурагч нэмэх ───────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, className, grades } = req.body;
    if (!name || !name.trim())       return res.status(400).json({ message: 'Нэр шаардлагатай' });
    if (!className || !className.trim()) return res.status(400).json({ message: 'Анги шаардлагатай' });

    let validatedGrades = [];
    if (grades && grades.length > 0) {
      const result = validateAndCalcGrades(grades);
      if (result.error) return res.status(400).json({ message: result.error });
      validatedGrades = result.grades;
    }

    const student = new Student({ name: name.trim(), className: className.trim(), grades: validatedGrades });
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Сурагч нэмэхэд алдаа гарлаа', error: err.message });
  }
});

// ── Сурагчийн дүн шинэчлэх ──────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { grades, name, className } = req.body;
    const updateData = {};

    if (name     !== undefined) updateData.name      = name.trim();
    if (className !== undefined) updateData.className = className.trim();

    if (grades !== undefined) {
      const result = validateAndCalcGrades(grades);
      if (result.error) return res.status(400).json({ message: result.error });
      updateData.grades = result.grades;
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Шинэчлэхэд алдаа гарлаа', error: err.message });
  }
});

// ── Сурагч устгах ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    res.json({ message: 'Сурагч амжилттай устгагдлаа' });
  } catch (err) {
    res.status(500).json({ message: 'Устгахад алдаа гарлаа', error: err.message });
  }
});

module.exports = router;
