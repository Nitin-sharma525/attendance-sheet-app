const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  u_fullname: { type: String, required: true, trim: true }, 
  u_email: { type: String, unique: true, trim: true, lowercase: true, sparse: true },
  u_password: { type: String, minlength: 6 },  
  u_role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student,teacher,admin' },
  u_profileImage: { type: String, default: '' },
  u_uuid: { type: String, unique: true, required: true }, 
  u_createdat: { type: Date, default: Date.now },
  u_class:{type:String,require:true},
  u_college:{type:String,require:true},
  u_status:{type:String}
});


const User = mongoose.model('User', userSchema);

module.exports = User;
