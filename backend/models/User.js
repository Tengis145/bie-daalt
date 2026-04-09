const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Имэйл хаяг буруу байна'],
  },
  password:     { type: String, minlength: 6, default: '' }, // Google-ээр нэвтэрвэл хоосон
  googleId:     { type: String, default: '' },               // Google OAuth ID
  role:         { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
  profileImage: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
}, { timestamps: true });

// Нууц үгийг хадгалахын өмнө шийфэрлэх
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Нууц үг шалгах метод
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
