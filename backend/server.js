require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger); // Лог бичигддэг middleware

// Зурган файлуудыг статик байдлаар дамжуулах
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB холболт
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ebs_grades')
  .then(() => console.log('✅ MongoDB холболт амжилттай:', process.env.MONGODB_URI || 'mongodb://localhost:27017/ebs_grades'))
  .catch(err => console.error('❌ MongoDB холболт алдаа:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ЕБС Дүн Бүртгэлийн API ажиллаж байна' });
});

// Алдааны middleware
app.use((err, req, res, next) => {
  console.error('Серверийн алдаа:', err.stack);
  res.status(500).json({ message: 'Серверийн дотоод алдаа', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер ажиллаж байна: http://localhost:${PORT}`);
});
