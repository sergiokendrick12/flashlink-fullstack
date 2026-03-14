const express = require('express');
const router = express.Router();
const { createQuote, getMyQuotes, getQuote, getAllQuotes, updateQuoteStatus } = require('../controllers/quoteController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { generateQuotePDF } = require('../utils/generatePDF');

router.post('/', optionalAuth, createQuote);
router.get('/my', protect, getMyQuotes);
router.get('/:id/pdf', protect, async (req, res, next) => {
  try {
    const Quote = require('../models/Quote');
    const quote = await Quote.findById(req.params.id).populate('user', 'firstName lastName email company');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    generateQuotePDF(quote, res);
  } catch (err) { next(err); }
});
router.get('/:id', protect, getQuote);
router.get('/', protect, authorize('admin', 'agent'), getAllQuotes);
router.put('/:id', protect, authorize('admin', 'agent'), updateQuoteStatus);

module.exports = router;