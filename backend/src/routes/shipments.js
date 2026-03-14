const express = require('express');
const router = express.Router();
const { createShipment, trackShipment, getMyShipments, getAllShipments, updateShipmentStatus, getDashboardStats } = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin', 'agent'), createShipment);
router.get('/track/:trackingNumber', trackShipment);
router.get('/stats', protect, authorize('admin', 'agent'), getDashboardStats);
router.get('/my', protect, getMyShipments);
router.get('/', protect, authorize('admin', 'agent'), getAllShipments);
router.put('/:id/status', protect, authorize('admin', 'agent'), updateShipmentStatus);

router.get('/:id/invoice', protect, async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const Shipment = require('../models/Shipment');

    const shipment = await Shipment.findById(req.params.id).populate('client', 'firstName lastName email company phone');
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    // Calculate exact height needed
    const eventCount = shipment.events?.length || 0;
    const baseHeight = 105 + 50 + 130 + 50 + 90 + 50 + 90 + 50 + 90 + 50;
    const eventsHeight = eventCount > 0 ? 30 + (eventCount * 28) + 10 : 0;
    const totalHeight = baseHeight + eventsHeight + 100;

    const doc = new PDFDocument({ margin: 50, size: [595, totalHeight], autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FlashLink-Invoice-${shipment.trackingNumber}.pdf`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 80).fill('#0B1C3F');
    doc.fillColor('#F0A500').font('Helvetica-Bold').fontSize(22).text('FlashLink', 50, 25);
    doc.fillColor('white').font('Helvetica').fontSize(10).text('Global Logistics & Freight', 50, 52);
    doc.fillColor('white').font('Helvetica').fontSize(10).text('SHIPMENT INVOICE', 420, 35);

    const col1 = 50, col2 = 320;
    let y = 105;

    const sectionTitle = (title) => {
      doc.fillColor('#0B1C3F').font('Helvetica-Bold').fontSize(13).text(title, col1, y);
      doc.moveTo(50, y + 17).lineTo(545, y + 17).strokeColor('#E5E7EB').lineWidth(1).stroke();
      y += 30;
    };

    const row = (label, value, x, yPos) => {
      doc.fillColor('#9CA3AF').font('Helvetica').fontSize(9).text(label, x, yPos);
      doc.fillColor('#0B1C3F').font('Helvetica-Bold').fontSize(10).text(value || '—', x, yPos + 13);
    };

    sectionTitle('Invoice Details');
    row('TRACKING NUMBER', shipment.trackingNumber, col1, y);
    row('INVOICE DATE', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), col2, y);
    y += 40;
    row('SERVICE TYPE', (shipment.serviceType || '').toUpperCase(), col1, y);
    row('STATUS', (shipment.status || '').replace(/_/g, ' ').toUpperCase(), col2, y);
    y += 40;
    row('ESTIMATED DELIVERY', shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : '—', col1, y);
    row('ACTUAL DELIVERY', shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleDateString() : '—', col2, y);
    y += 50;

    sectionTitle('Client Information');
    row('NAME', `${shipment.client?.firstName || ''} ${shipment.client?.lastName || ''}`, col1, y);
    row('EMAIL', shipment.client?.email || '—', col2, y);
    y += 40;
    row('COMPANY', shipment.client?.company || '—', col1, y);
    row('PHONE', shipment.client?.phone || '—', col2, y);
    y += 50;

    sectionTitle('Shipment Route');
    row('ORIGIN CITY', shipment.origin?.city || '—', col1, y);
    row('DESTINATION CITY', shipment.destination?.city || '—', col2, y);
    y += 40;
    row('ORIGIN COUNTRY', shipment.origin?.country || '—', col1, y);
    row('DESTINATION COUNTRY', shipment.destination?.country || '—', col2, y);
    y += 50;

    sectionTitle('Cargo Details');
    row('DESCRIPTION', shipment.cargo?.description || '—', col1, y);
    row('WEIGHT', shipment.cargo?.weight ? `${shipment.cargo.weight} kg` : '—', col2, y);
    y += 40;
    row('VOLUME', shipment.cargo?.volume ? `${shipment.cargo.volume} m³` : '—', col1, y);
    row('QUANTITY', shipment.cargo?.quantity ? `${shipment.cargo.quantity} units` : '—', col2, y);
    y += 50;

    if (shipment.events && shipment.events.length > 0) {
      sectionTitle('Tracking History');
      shipment.events.forEach(ev => {
        doc.fillColor('#6B7280').font('Helvetica').fontSize(9)
          .text(new Date(ev.timestamp || ev.createdAt).toLocaleString(), col1, y)
          .text((ev.status || '').replace(/_/g, ' ').toUpperCase(), col2, y);
        if (ev.description) {
          doc.fillColor('#0B1C3F').font('Helvetica').fontSize(9).text(ev.description, col1, y + 12);
        }
        y += 28;
      });
      y += 10;
    }

    y += 20;
    doc.rect(0, y, 595, 60).fill('#0B1C3F');
    doc.fillColor('rgba(255,255,255,0.6)').font('Helvetica').fontSize(8)
      .text('FlashLink Logistics — Your trusted partner for global freight', 50, y + 15, { align: 'center', width: 495 })
      .text('www.flashlink.com | support@flashlink.com', 50, y + 30, { align: 'center', width: 495 });

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;