const Quote = require('../models/Quote');
const { sendEmail, sendQuoteStatusEmail } = require('../utils/email');

exports.createQuote = async (req, res, next) => {
  try {
    const quoteData = { ...req.body };
    if (req.user) quoteData.user = req.user._id;
    const quote = await Quote.create(quoteData);

    const recipientEmail = req.user?.email || quoteData.guestEmail;
    const recipientName = req.user ? req.user.firstName : quoteData.guestName;
    if (recipientEmail) {
      await sendEmail({ to: recipientEmail, templateName: 'quoteReceived', templateData: [recipientName, quote.quoteNumber] });
    }
    await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New Quote Request: ${quote.quoteNumber}`, html: `<p>New quote request from ${recipientName} (${recipientEmail}). Service: ${quote.serviceType}</p>` });

    res.status(201).json({ success: true, data: quote, message: 'Quote request submitted successfully' });
  } catch (err) { next(err); }
};

exports.getMyQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (err) { next(err); }
};

exports.getQuote = async (req, res, next) => {
  try {
    const query = req.user?.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const quote = await Quote.findOne(query).populate('user', 'firstName lastName email company');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    res.status(200).json({ success: true, data: quote });
  } catch (err) { next(err); }
};

exports.getAllQuotes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const quotes = await Quote.find(query).populate('user', 'firstName lastName email company').sort('-createdAt').limit(limit * 1).skip((page - 1) * limit);
    const count = await Quote.countDocuments(query);
    res.status(200).json({ success: true, count, pages: Math.ceil(count / limit), data: quotes });
  } catch (err) { next(err); }
};

exports.updateQuoteStatus = async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'firstName email');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
    if (req.body.status && quote.user?.email) {
      await sendQuoteStatusEmail(quote.user.email, quote.user.firstName, quote.quoteNumber, req.body.status);
    }
    res.status(200).json({ success: true, data: quote });
  } catch (err) { next(err); }
};