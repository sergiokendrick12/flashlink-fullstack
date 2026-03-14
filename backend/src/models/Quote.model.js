const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    default: () => `QT-${Date.now().toString(36).toUpperCase()}`,
  },
  // Can be guest or logged-in user
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name:    String,
    email:   String,
    phone:   String,
    company: String,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'expired'],
    default: 'pending',
  },
  serviceType: {
    type: String,
    enum: ['sea_freight', 'air_freight', 'road_freight', 'rail_freight', 'port_handling', 'customs_clearance', 'warehousing', 'multimodal'],
    required: true,
  },
  origin: {
    city:    { type: String, required: true },
    country: { type: String, required: true },
    port:    String,
  },
  destination: {
    city:    { type: String, required: true },
    country: { type: String, required: true },
    port:    String,
  },
  cargo: {
    description: { type: String, required: true },
    weight:      Number,
    volume:      Number,
    quantity:    Number,
    unit:        String,
    hazardous:   { type: Boolean, default: false },
    value:       Number,
  },
  preferredDate: Date,
  additionalNotes: String,

  // Admin response
  quotedPrice: Number,
  currency:    { type: String, default: 'USD' },
  validUntil:  Date,
  adminNotes:  String,
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: Date,

  convertedToShipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
