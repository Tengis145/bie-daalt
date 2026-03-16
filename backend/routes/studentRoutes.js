const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');

// Бүх student маршрутуудыг JWT-р хамгаалах
router.use(authMiddleware);
 
// Бүх сурагч авах / ангиар шүүх
router.get('/', async (req, res) => {
  try {
    const filter = req.query.className ? { className: req.query.className } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Сурагчдын мэдээлэл авахад алдаа гарлаа', error: err.message });
  }
});
 
// Нэг сурагч авах
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});
 
// Шинэ сурагч нэмэх
router.post('/', async (req, res) => {
  try {
    const { name, className, grades } = req.body;
    if (!name || !className) {
      return res.status(400).json({ message: 'Нэр болон анги шаардлагатай' });
    }
    const student = new Student({ name, className, grades: grades || [] });
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Сурагч нэмэхэд алдаа гарлаа', error: err.message });
  }
});
 
// Сурагчийн дүн шинэчлэх
router.put('/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Шинэчлэхэд алдаа гарлаа', error: err.message });
  }
});
 
// Сурагч устгах
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Сурагч олдсонгүй' });
    res.json({ message: 'Сурагч амжилттай устгагдлаа' });
  } catch (err) {
    res.status(500).json({ message: 'Устгахад алдаа гарлаа', error: err.message });
  }
});
 
// Ангиудын жагсаалт авах
router.get('/meta/classes', async (req, res) => {
  try {
    const classes = await Student.distinct('className');
    res.json(classes.sort());
  } catch (err) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: err.message });
  }
});
 
module.exports = router;