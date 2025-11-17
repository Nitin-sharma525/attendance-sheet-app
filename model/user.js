const { verify } = require('crypto');
const mongoose = require('mongoose');
const { type } = require('os');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  u_fullname: { type: String, trim: true },
  u_email: { type: String, unique: true, trim: true, lowercase: true, sparse: true },
  u_password: { type: String, minlength: 6 },
  u_role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  u_profileImage: [{ type: String }],
  u_uuid: { type: String, unique: true, default: uuidv4() },
  u_createdat: { type: Date, default: Date.now },
  u_class: { type: String, },
  u_college: { type: String, },
  u_status: { type: String, enum: ['1', '0'], default: '1' },
  otp: { type: String },
  otpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
