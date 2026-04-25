require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const swaggerUi   = require('swagger-ui-express');
const swaggerSpec  = require('./swagger');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://bie-daalt-smoky.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Зурган файлуудыг статик байдлаар дамжуулах
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB холболт
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ebs_grades')
  .then(() => logger.info('MongoDB connected', { uri: process.env.MONGODB_URI || 'localhost' }))
  .catch(err => logger.error('MongoDB connection failed', { error: err.message }));

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ЕБС Дүн Бүртгэлийн API ажиллаж байна' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Серверийн дотоод алдаа', error: err.message });
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
