const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Quote = require('../models/Quote');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers, totalShipments, totalQuotes, totalContacts,
      activeShipments, pendingQuotes,
      recentShipments, recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Shipment.countDocuments(),
      Quote.countDocuments(),
      Contact.countDocuments(),
      Shipment.countDocuments({ status: { $in: ['in_transit', 'at_port', 'customs'] } }),
      Quote.countDocuments({ status: 'pending' }),
      Shipment.find().sort({ createdAt: -1 }).limit(5).populate('client', 'firstName lastName'),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt'),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await Shipment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const byType = await Shipment.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totals: { users: totalUsers, shipments: totalShipments, quotes: totalQuotes, contacts: totalContacts },
        active: { shipments: activeShipments, quotes: pendingQuotes },
        recentShipments, recentUsers, monthlyData, byType,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, data: { users, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = ['role', 'isActive'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;