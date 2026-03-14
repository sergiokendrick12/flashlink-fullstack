const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  status:      { type: String, required: true },
  location:    { country: String, city: String, facility: String },
  description: String,
  timestamp:   { type: Date, default: Date.now },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, unique: true, required: true },
  quote:  { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agent:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  serviceType: String,
  origin:      { country: String, city: String, port: String, address: String },
  destination: { country: String, city: String, port: String, address: String },

  cargo: {
    description: String,
    weight: Number,
    volume: Number,
    containers: Number,
  },

  status: {
    type: String,
    enum: ['booked', 'picked_up', 'in_transit', 'at_port', 'customs', 'out_for_delivery', 'delivered', 'exception'],
    default: 'booked'
  },

  estimatedDelivery: Date,
  actualDelivery:    Date,

  events: [trackingEventSchema],

  documents: [{
    name: String, type: String, url: String, uploadedAt: Date,
  }],

  price:    Number,
  currency: { type: String, default: 'USD' },
  isPaid:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
