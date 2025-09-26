const mongoose = require('mongoose');

const { v4: uuidv4 } = require('uuid'); 

const AttendanceSchema = new mongoose.Schema({
  a_studentId: {
    type: String,
    ref: 'User',
    required: true,
  },
  a_studentclass: {
    type: String,
    ref: 'Class',
    required: true,
  },
  a_date: {
    type: Date,
  },
  a_status: {
    type: String,
  },
  a_markeby: {
    type: String,
    ref: 'User',
  },
 a_phoneno: {
    type: String,
    required: true,
    validate: {
      validator: v => /^\d{6,14}$/.test(v),
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  countryCode: {
    type: String,
    required: true,
    default: '+91',
    validate: {
      validator: v => /^\+\d{1,4}$/.test(v),
      message: props => `${props.value} is not a valid country code!`
    }
  },

  leaveRequestId: {
    type: String,
    unique: true,
    required: true,
    default: uuidv4
  },
  leaveStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],

  },
  joinclass: {
    type: String,
    enum: ['Accept', 'Reject'],
  
  }

}, {
  timestamps: true,
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;
