const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, subject, message, type } = req.body;
    const contact = await Contact.create({ name, email, phone, company, subject, message, type, ipAddress: req.ip });
    await sendEmail({ to: email, templateName: 'contactConfirmation', templateData: [name] });
    await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New Contact: ${subject}`, html: `<p>From: ${name} (${email})<br/>Company: ${company || 'N/A'}<br/>Message: ${message}</p>` });
    res.status(201).json({ success: true, message: 'Message sent successfully. We will respond within 1-2 business days.' });
  } catch (err) { next(err); }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const contacts = await Contact.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (err) { next(err); }
};
