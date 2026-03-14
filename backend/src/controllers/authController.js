const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefresh(user._id);
  res.status(statusCode).json({ success: true, token, refreshToken, user });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, company, phone, country } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ firstName, lastName, email, password, company, phone, country });
    await sendEmail({ to: email, templateName: 'welcome', templateData: [firstName] });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, company, phone, country } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, company, phone, country }, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'FlashLink — Password Reset Request',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><h2>Password Reset</h2><p>Hi ${user.firstName},</p><p>You requested a password reset. Click the button below to reset your password. This link expires in 30 minutes.</p><div style="text-align:center;margin:30px 0"><a href="${resetUrl}" style="background:#F0A500;color:#0B1C3F;padding:14px 28px;border-radius:6px;font-weight:700;text-decoration:none">Reset Password →</a></div><p style="color:#9CA3AF;font-size:12px">If you did not request this, please ignore this email.</p></div></div>`
    });
    res.status(200).json({ success: true, message: 'Reset email sent!' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = require('crypto').createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const token = signToken(user._id);
    res.status(200).json({ success: true, token });
  } catch (err) { res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
};
