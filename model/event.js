const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema({
  eventNames: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  eventDescription: { type: String },
  createdBy: { type: String, ref: 'User', required: true },
  eventstatus: { type: String, default: 'pending' } , 
eventid: { type: String, required: true, unique: true, default: uuidv4 }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
