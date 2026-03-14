const PDFDocument = require('pdfkit');

exports.generateQuotePDF = (quote, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=FlashLink-${quote.quoteNumber}.pdf`);
  doc.pipe(res);

  // Header
  doc.rect(0, 0, 612, 90).fill('#0B1C3F');
  doc.fontSize(26).fillColor('#F0A500').font('Helvetica-Bold').text('FlashLink', 50, 30);
  doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica').text('Logistics & Freight Solutions', 50, 62);

  // Quote Details
  doc.fontSize(18).fillColor('#0B1C3F').font('Helvetica-Bold').text('QUOTE DETAILS', 50, 110);
  doc.fontSize(12).fillColor('#6B7280').font('Helvetica').text(`Reference: ${quote.quoteNumber}`, 50, 135);
  doc.fontSize(12).fillColor('#6B7280').text(`Date: ${new Date(quote.createdAt).toDateString()}`, 50, 153);
  doc.fontSize(12).fillColor('#6B7280').text(`Status: ${quote.status?.toUpperCase()}`, 50, 171);

  doc.moveTo(50, 195).lineTo(545, 195).strokeColor('#E5E7EB').lineWidth(1).stroke();

  // Route
  doc.fontSize(14).fillColor('#0B1C3F').font('Helvetica-Bold').text('SHIPMENT ROUTE', 50, 210);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Origin:`, 50, 235);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.origin?.city || '—'}, ${quote.origin?.country || '—'}`, 200, 235);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Destination:`, 50, 255);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.destination?.city || '—'}, ${quote.destination?.country || '—'}`, 200, 255);

  doc.moveTo(50, 280).lineTo(545, 280).strokeColor('#E5E7EB').lineWidth(1).stroke();

  // Service Details
  doc.fontSize(14).fillColor('#0B1C3F').font('Helvetica-Bold').text('SERVICE DETAILS', 50, 295);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Service Type:`, 50, 320);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.serviceType || '—'}`, 200, 320);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Cargo:`, 50, 340);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.cargo?.description || '—'}`, 200, 340);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Weight:`, 50, 360);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.cargo?.weight ? quote.cargo.weight + ' kg' : '—'}`, 200, 360);
  doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Volume:`, 50, 380);
  doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.cargo?.volume ? quote.cargo.volume + ' m³' : '—'}`, 200, 380);

  doc.moveTo(50, 405).lineTo(545, 405).strokeColor('#E5E7EB').lineWidth(1).stroke();

  // Customer Info
  if (quote.user) {
    doc.fontSize(14).fillColor('#0B1C3F').font('Helvetica-Bold').text('CUSTOMER INFORMATION', 50, 420);
    doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Name:`, 50, 445);
    doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.user.firstName || ''} ${quote.user.lastName || ''}`, 200, 445);
    doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Email:`, 50, 465);
    doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.user.email || '—'}`, 200, 465);
    doc.fontSize(12).fillColor('#374151').font('Helvetica').text(`Company:`, 50, 485);
    doc.fontSize(12).fillColor('#0B1C3F').font('Helvetica-Bold').text(`${quote.user.company || '—'}`, 200, 485);
  }

  // Footer
  doc.fontSize(9).fillColor('#9CA3AF').font('Helvetica').text('© 2026 FlashLink Logistics. All rights reserved. This is an auto-generated document.', 50, 530, { align: 'center', width: 495 });

  doc.end();
};