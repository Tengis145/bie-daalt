const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/auth');

// Cloudinary тохиргоо (.env-аас уншина)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — зургийг шууд Cloudinary руу хадгална
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bie-daalt',          // Cloudinary дахь хавтас
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }], // Max 400x400
  },
});

// Зөвхөн зураг файл зөвшөөрөх
const fileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Зөвхөн зураг файл (.jpg, .jpeg, .png, .gif, .webp) оруулах боломжтой'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB хязгаар
});

// POST /api/upload — Зураг Cloudinary руу upload хийх
router.post('/', authMiddleware, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Зураг оруулахад алдаа гарлаа' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Зураг сонгоогүй байна' });
    }
    // multer-storage-cloudinary нь req.file.path дотор Cloudinary URL-г буцаана
    res.json({
      message: 'Зураг амжилттай хадгалагдлаа',
      url: req.file.path,
    });
  });
});

module.exports = router;
