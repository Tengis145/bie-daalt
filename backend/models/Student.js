const mongoose = require('mongoose');
 
const gradeSchema = new mongoose.Schema({
  subject:     { type: String, required: true },
  exam1:       { type: Number, min: 0, max: 30,  default: 0 }, // Шалгалт 1  (max 30)
  exam2:       { type: Number, min: 0, max: 30,  default: 0 }, // Шалгалт 2  (max 30)
  attendance:  { type: Number, min: 0, max: 20,  default: 0 }, // Ирц        (max 20)
  independent: { type: Number, min: 0, max: 20,  default: 0 }, // Бие даалт  (max 20)
  score:       { type: Number, min: 0, max: 100, default: 0 }, // Нийт = дээрхийн нийлбэр
});
 
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  className: { type: String, required: true },
  grades: [gradeSchema],
}, { timestamps: true });
 
studentSchema.virtual('average').get(function () {
  if (!this.grades || this.grades.length === 0) return 0;
  const total = this.grades.reduce((sum, g) => sum + g.score, 0);
  return (total / this.grades.length).toFixed(1);
});
 
studentSchema.set('toJSON', { virtuals: true });
 
module.exports = mongoose.model('Student', studentSchema);
 