const Shipment = require('../models/Shipment');
const { sendShipmentStatusEmail } = require('../utils/email');

exports.createShipment = async (req, res, next) => {
  try {
    const trackingNumber = 'FL-TRK-' + Date.now();
    const shipment = await Shipment.create({ ...req.body, client: req.body.clientId || req.user._id, trackingNumber });
    res.status(201).json({ success: true, data: shipment });
  } catch (err) { next(err); }
};

exports.trackShipment = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await Shipment.findOne({ trackingNumber }).populate('client', 'firstName lastName email').populate('agent', 'firstName lastName');
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found. Please check your tracking number.' });
    res.status(200).json({ success: true, data: shipment });
  } catch (err) { next(err); }
};

exports.getMyShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ client: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: shipments.length, data: shipments });
  } catch (err) { next(err); }
};

exports.getAllShipments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const shipments = await Shipment.find(query).populate('client', 'firstName lastName email').sort('-createdAt').limit(limit * 1).skip((page - 1) * limit);
    const count = await Shipment.countDocuments(query);
    res.status(200).json({ success: true, count, pages: Math.ceil(count / limit), data: shipments });
  } catch (err) { next(err); }
};

exports.updateShipmentStatus = async (req, res, next) => {
  try {
    const { status, location, description } = req.body;
    const shipment = await Shipment.findById(req.params.id).populate('client', 'firstName email');
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    shipment.status = status;
    shipment.events.push({ status, location, description, updatedBy: req.user._id });
    if (status === 'delivered') shipment.actualDelivery = new Date();
    await shipment.save();
    if (shipment.client?.email) {
      await sendShipmentStatusEmail(shipment.client.email, shipment.client.firstName, shipment.trackingNumber, status);
    }
    res.status(200).json({ success: true, data: shipment });
  } catch (err) { next(err); }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [total, inTransit, delivered, exceptions] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: 'in_transit' }),
      Shipment.countDocuments({ status: 'delivered' }),
      Shipment.countDocuments({ status: 'exception' }),
    ]);
    res.status(200).json({ success: true, data: { total, inTransit, delivered, exceptions } });
  } catch (err) { next(err); }
};