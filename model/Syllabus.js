const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:{ type: Date, default: Date.now },
});

const Syllabus = mongoose.model('Syllabus', SyllabusSchema);

module.exports = Syllabus;
