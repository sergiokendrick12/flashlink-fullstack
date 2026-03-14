const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe } = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');
const Newsletter = require('../models/Newsletter');

router.post('/subscribe', subscribe);
router.get('/unsubscribe/:token', unsubscribe);
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const subs = await Newsletter.find().sort('-createdAt');
    res.status(200).json({ success: true, count: subs.length, data: subs });
  } catch (err) { next(err); }
});

module.exports = router;