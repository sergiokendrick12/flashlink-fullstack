const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const trackingEventSchema = new mongoose.Schema({
  status:      { type: String, required: true },
  location:    { type: String, required: true },
  description: { type: String },
  timestamp:   { type: Date, default: Date.now },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    default: () => `FL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2,4).toUpperCase()}`,
  },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Shipment details
  type:        { type: String, enum: ['sea', 'air', 'road', 'rail', 'multimodal'], required: true },
  status:      {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'at_port', 'customs_clearance', 'out_for_delivery', 'delivered', 'cancelled', 'on_hold'],
    default: 'pending',
  },

  origin: {
    address:  String,
    city:     { type: String, required: true },
    country:  { type: String, required: true },
    port:     String,
    coordinates: { lat: Number, lng: Number },
  },
  destination: {
    address:  String,
    city:     { type: String, required: true },
    country:  { type: String, required: true },
    port:     String,
    coordinates: { lat: Number, lng: Number },
  },

  cargo: {
    description:  { type: String, required: true },
    weight:       { type: Number, required: true }, // kg
    volume:       Number, // m³
    quantity:     Number,
    unit:         { type: String, enum: ['boxes', 'pallets', 'containers', 'kg', 'tons'], default: 'boxes' },
    value:        Number, // USD
    currency:     { type: String, default: 'USD' },
    hazardous:    { type: Boolean, default: false },
    fragile:      { type: Boolean, default: false },
    temperature:  String, // e.g. "2-8°C" for cold chain
  },

  container: {
    type:   { type: String, enum: ['20ft', '40ft', '40ft_hc', 'LCL', 'none'], default: 'none' },
    number: String,
    seal:   String,
  },

  dates: {
    pickup:       Date,
    departure:    Date,
    eta:          Date,
    delivered:    Date,
  },

  pricing: {
    baseRate:    Number,
    surcharges:  Number,
    insurance:   Number,
    customs:     Number,
    total:       Number,
    currency:    { type: String, default: 'USD' },
    paid:        { type: Boolean, default: false },
  },

  documents: [{
    name:     String,
    type:     { type: String, enum: ['bill_of_lading', 'invoice', 'packing_list', 'customs_form', 'insurance', 'other'] },
    url:      String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  trackingHistory: [trackingEventSchema],
  notes:       String,
  internalNotes: String,
}, { timestamps: true });

shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ owner: 1, status: 1 });
shipmentSchema.index({ 'origin.country': 1, 'destination.country': 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
