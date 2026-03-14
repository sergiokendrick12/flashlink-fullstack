const Newsletter = require('../models/Newsletter');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');

exports.subscribe = async (req, res, next) => {
  try {
    const { email, firstName } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.status(200).json({ success: true, message: 'You have been resubscribed!' });
      }
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    const token = uuidv4();
    await Newsletter.create({ email, firstName, token, confirmedAt: new Date() });
    await sendEmail({ to: email, subject: 'Welcome to FlashLink Newsletter', html: `<p>Hi ${firstName || 'there'}! You are now subscribed to FlashLink updates. <a href="${process.env.CLIENT_URL}/unsubscribe?token=${token}">Unsubscribe</a></p>` });
    res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter!' });
  } catch (err) { next(err); }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.params;
    const sub = await Newsletter.findOneAndUpdate({ token }, { isActive: false }, { new: true });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err) { next(err); }
};
