const mongoose = require('mongoose');
const { title } = require('process');


const userSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: String, ref: 'User', required: true },
    noticeDate: { type: Date, default: Date.now },
});

const Notice = mongoose.model('Notice', userSchema);
module.exports = Notice;
