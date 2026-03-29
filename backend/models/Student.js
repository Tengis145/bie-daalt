const mongoose = require('mongoose');
 
const gradeSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  exam1: { type: Number, min: 0, max: 100, default: 0 },
  exam2: { type: Number, min: 0, max: 100, default: 0 },
  score: { type: Number, required: true, min: 0, max: 100 },
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
 