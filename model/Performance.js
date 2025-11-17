const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    classId: { type: String, required: true },
    marks: Number,
    attendance: Number,
    remarks: String,
});


module.exports = mongoose.model('Performance', PerformanceSchema);
