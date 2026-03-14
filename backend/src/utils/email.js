const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const templates = {
  welcome: (name) => ({
    subject: "Welcome to FlashLink",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><h2>Welcome, ${name}!</h2><p>Your FlashLink account is ready.</p><a href="${process.env.CLIENT_URL}/dashboard" style="background:#F0A500;color:#0B1C3F;padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:16px">Go to Dashboard</a></div></div>`
  }),
  quoteReceived: (name, quoteNumber) => ({
    subject: `Quote Request Received — ${quoteNumber}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><h2>Quote Request Received</h2><p>Hi ${name}, we received your quote request <strong>${quoteNumber}</strong>. Our team will respond within 24-48 hours.</p></div></div>`
  }),
  contactConfirmation: (name) => ({
    subject: "We received your message — FlashLink",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><h2>Thank you, ${name}!</h2><p>We will get back to you within 1-2 business days.</p></div></div>`
  }),
};

exports.sendEmail = async ({ to, templateName, templateData = [], subject, html }) => {
  try {
    const transporter = createTransporter();
    let mailOptions = { from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`, to };
    if (templateName && templates[templateName]) {
      const t = templates[templateName](...templateData);
      mailOptions.subject = t.subject;
      mailOptions.html = t.html;
    } else {
      mailOptions.subject = subject;
      mailOptions.html = html;
    }
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendQuoteStatusEmail = async (userEmail, userName, quoteNumber, status) => {
  const messages = {
    reviewing: { subject: `Your Quote ${quoteNumber} is Being Reviewed`, icon: '🔍', text: 'Our team is currently reviewing your quote request. We will get back to you shortly.' },
    quoted: { subject: `Your Quote ${quoteNumber} is Ready!`, icon: '✅', text: 'Great news! Your quote has been prepared. Our team will contact you with pricing details.' },
    accepted: { subject: `Quote ${quoteNumber} Accepted — Shipment Created!`, icon: '🎉', text: 'Your quote has been accepted and a shipment has been created. You can now track it in your dashboard.' },
    rejected: { subject: `Update on Your Quote ${quoteNumber}`, icon: '❌', text: 'Unfortunately we are unable to process your quote at this time. Please contact us for more information.' },
  };
  const msg = messages[status];
  if (!msg) return;
  await exports.sendEmail({
    to: userEmail,
    subject: msg.subject,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><div style="text-align:center;font-size:48px">${msg.icon}</div><h2 style="text-align:center">${msg.subject}</h2><p>Hi <strong>${userName}</strong>,</p><p>${msg.text}</p><div style="background:#F4F6FA;border-radius:8px;padding:16px;text-align:center;margin:24px 0"><p style="color:#6B7280;font-size:13px;margin:0 0 4px">Quote Reference</p><p style="font-size:20px;font-weight:700;margin:0;color:#0B1C3F">${quoteNumber}</p></div><div style="text-align:center"><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background:#F0A500;color:#0B1C3F;padding:12px 28px;border-radius:6px;font-weight:700;text-decoration:none">View Dashboard →</a></div></div></div>`,
  });
};

exports.sendShipmentStatusEmail = async (userEmail, userName, trackingNumber, status) => {
  const messages = {
    picked_up: { icon: '📦', text: 'Your shipment has been picked up and is on its way!' },
    in_transit: { icon: '🚢', text: 'Your shipment is now in transit toward its destination.' },
    at_port: { icon: '⚓', text: 'Your shipment has arrived at the port and is awaiting processing.' },
    customs: { icon: '📋', text: 'Your shipment is currently going through customs clearance.' },
    out_for_delivery: { icon: '🚛', text: 'Your shipment is out for delivery and will arrive soon!' },
    delivered: { icon: '✅', text: 'Your shipment has been delivered successfully. Thank you for choosing FlashLink!' },
  };
  const msg = messages[status];
  if (!msg) return;
  await exports.sendEmail({
    to: userEmail,
    subject: `Shipment ${trackingNumber} — ${status.replace(/_/g, ' ').toUpperCase()}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0B1C3F;padding:30px;text-align:center"><h1 style="color:#F0A500;margin:0">FlashLink</h1></div><div style="padding:40px;background:#fff"><div style="text-align:center;font-size:48px">${msg.icon}</div><h2 style="text-align:center">Shipment Update</h2><p>Hi <strong>${userName}</strong>,</p><p>${msg.text}</p><div style="background:#F4F6FA;border-radius:8px;padding:16px;text-align:center;margin:24px 0"><p style="color:#6B7280;font-size:13px;margin:0 0 4px">Tracking Number</p><p style="font-size:20px;font-weight:700;margin:0;color:#0B1C3F">${trackingNumber}</p></div><div style="text-align:center"><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/track/${trackingNumber}" style="background:#F0A500;color:#0B1C3F;padding:12px 28px;border-radius:6px;font-weight:700;text-decoration:none">Track Shipment →</a></div></div></div>`,
  });
};