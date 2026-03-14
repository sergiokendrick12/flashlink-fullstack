const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guest fields
  guestName:   { type: String },
  guestEmail:  { type: String },
  guestPhone:  { type: String },
  guestCompany:{ type: String },

  serviceType: {
    type: String,
    enum: ['freight', 'port', 'rail', 'road', 'customs', 'warehousing', 'express'],
    required: true
  },
  origin:      { country: String, city: String, port: String },
  destination: { country: String, city: String, port: String },
  cargo: {
    type:        { type: String, enum: ['general', 'bulk', 'container', 'liquid', 'perishable', 'hazardous', 'oversized'] },
    description: String,
    weight:      Number,
    weightUnit:  { type: String, enum: ['kg', 'tons'], default: 'tons' },
    volume:      Number,
    containers:  Number,
    containerType: String,
  },
  timeline:    { type: String, enum: ['standard', 'express', 'flexible'] },
  incoterm:    String,
  additionalServices: [String],
  specialRequirements: String,
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  quotedPrice:  Number,
  currency:     { type: String, default: 'USD' },
  validUntil:   Date,
  agentNotes:   String,
  attachments:  [String],
}, { timestamps: true });

quoteSchema.pre('save', async function(next) {
  if (!this.quoteNumber) {
    const count = await mongoose.model('Quote').countDocuments();
    this.quoteNumber = `FL-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);
