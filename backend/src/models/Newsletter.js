const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true, lowercase: true },
  firstName:  { type: String },
  isActive:   { type: Boolean, default: true },
  token:      { type: String },
  confirmedAt: { type: Date },
  source:     { type: String, default: 'website' },
}, { timestamps: true });

module.exports = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);