const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String },
  company: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['general', 'support', 'partnership', 'media'], default: 'general' },
  status:  { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  ipAddress: String,
}, { timestamps: true });

module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);