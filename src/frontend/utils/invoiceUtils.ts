import type { Order } from '../../types';
import { toast } from 'sonner';
import { initFirebase } from '../../backend/firebase';

async function getAuthToken() {
  const { auth } = initFirebase();
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  return user.getIdToken();
}

async function readApiResponse(response: Response, fallbackMessage: string) {
  const rawBody = await response.text();
  if (!rawBody) {
    if (response.ok) return {};
    throw new Error(response.statusText || fallbackMessage || `Erreur API ${response.status}`);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(response.ok ? rawBody : response.statusText || rawBody || fallbackMessage);
  }
}

// ─── Client-side PDF generation using stored invoiceData or order fallback ──

/**
 * Generates an invoice PDF entirely on the client using jsPDF + jsPDF-AutoTable.
 * Works for any order with or without snapshot invoiceData.
 */
async function generateInvoiceClientSide(order: Order, isDuplicata: boolean): Promise<void> {
  const iv = order.invoiceData ?? {};

  // Fetch or fallback global config if not present in snapshot
  let cfg = iv.config;
  if (!cfg) {
    try {
      const res = await fetch('/api/dashboard/public/config/invoice_config/global');
      if (res.ok) {
        const data = await res.json();
        if (data && (data.phone || data.email || data.companyName || data.address)) {
          cfg = data;
        }
      }
    } catch {
      // Ignore network fallback error
    }
  }

  if (!cfg) {
    cfg = {
      companyName: 'Laine & Déco',
      address: '34 Rue des Artisans, Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@laineetdeco.com',
      paymentName: 'Laine & Déco Mobile Money',
      paymentPhone: '+237 6 00 00 00 00',
      message1: 'Merci pour votre confiance et votre commande !',
      message2: 'Pour toute réclamation, contactez notre service client.',
      footerMessage: 'Laine & Déco - Merci pour votre confiance !',
    };
  }

  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = (autoTableModule as any).default ?? autoTableModule;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Colors ────────────────────────────────────────────────────────────────
  const primary = iv.primaryColor ?? '#2c3e35';
  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    if (h.length < 6) return [44, 62, 53];
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const [pr, pg, pb] = hexToRgb(primary);

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageW, 38, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const companyName = cfg.companyName || 'Laine & Déco';
  doc.text(companyName, 14, 16);

  // FACTURE / DUPLICATA label
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const label = isDuplicata ? 'DUPLICATA' : 'FACTURE';
  const labelW = doc.getTextWidth(label);
  doc.text(label, pageW - 14 - labelW, 16);

  // Order ID
  doc.setFontSize(9);
  const orderId = iv.orderId ?? order.id ?? '-';
  doc.text(`N° ${orderId}`, pageW - 14 - doc.getTextWidth(`N° ${orderId}`), 22);

  // Date
  let formattedDate = '-';
  if (order.date) {
    formattedDate = order.date;
  } else if (order.createdAt) {
    try {
      const raw = (order.createdAt as any)?.seconds ? (order.createdAt as any).seconds * 1000 : order.createdAt;
      formattedDate = new Date(raw).toLocaleDateString('fr-FR');
    } catch {
      formattedDate = '-';
    }
  }
  doc.text(`Date : ${formattedDate}`, pageW - 14 - doc.getTextWidth(`Date : ${formattedDate}`), 28);

  // ── Section below header ─────────────────────────────────────────────────
  let y = 48;

  // Emitter info (left)
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DE', 14, y);
  doc.setFont('helvetica', 'normal');
  if (cfg.address) doc.text(cfg.address, 14, y + 5);
  if (cfg.phone) doc.text(`Tél: ${cfg.phone}`, 14, y + 10);
  if (cfg.email) doc.text(`Email: ${cfg.email}`, 14, y + 15);

  // Customer info (right column)
  const rightX = pageW / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', rightX, y);
  doc.setFont('helvetica', 'normal');
  const customerName = iv.customerName ?? order.customerName ?? order.customer ?? 'Client';
  doc.text(customerName, rightX, y + 5);
  const customerAddress = iv.address ?? order.address ?? '';
  if (customerAddress) doc.text(customerAddress.substring(0, 45), rightX, y + 10);
  const customerPhone = iv.phone ?? order.phone ?? '';
  if (customerPhone) doc.text(`Tél: ${customerPhone}`, rightX, y + 15);

  y += 28;

  // ── Items table ──────────────────────────────────────────────────────────
  let rawItems: any[] = iv.items ?? (Array.isArray(order.orderDetails) && order.orderDetails.length > 0 ? order.orderDetails : Array.isArray(order.items) ? order.items : []);
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    rawItems = [{
      name: order.description || `Commande ${order.id || ''}`,
      quantity: typeof order.items === 'number' ? order.items : 1,
      price: order.total || 0,
    }];
  }

  const tableBody = rawItems.map((item: any) => [
    item.name ?? item.productName ?? 'Produit',
    String(item.quantity ?? 1),
    `${Number(item.price ?? 0).toLocaleString('fr-FR')} FCFA`,
    `${(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString('fr-FR')} FCFA`,
  ]);

  const tableOptions = {
    startY: y,
    head: [['Désignation', 'Qté', 'Prix unitaire', 'Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [pr, pg, pb], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  };

  if (typeof autoTable === 'function') {
    autoTable(doc, tableOptions);
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(tableOptions);
  }

  y = ((doc as any).lastAutoTable?.finalY ?? y + 40) + 8;

  // ── Totals summary ───────────────────────────────────────────────────────
  const totalsX = pageW - 85;
  const computedSubtotal = rawItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const subtotal = iv.subtotal ?? order.subtotal ?? (computedSubtotal > 0 ? computedSubtotal : order.total ?? 0);
  const shippingFee = iv.shippingFee ?? order.shippingFee ?? 0;
  const giftFee = iv.giftFee ?? order.giftFee ?? (order.giftWrap?.enabled ? 2000 : 0);
  const discount = iv.discount ?? order.discount ?? 0;
  const total = iv.total ?? order.total ?? (subtotal + shippingFee + giftFee - discount);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const drawRow = (rowLabel: string, value: string, bold = false, color?: [number, number, number]) => {
    if (bold) doc.setFont('helvetica', 'bold');
    if (color) doc.setTextColor(...color);
    doc.text(rowLabel, totalsX, y);
    doc.text(value, pageW - 14, y, { align: 'right' });
    if (bold || color) { doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80); }
    y += 6;
  };

  if (subtotal) drawRow('Sous-total', `${subtotal.toLocaleString('fr-FR')} FCFA`);
  if (giftFee) drawRow('Coffret Kraft & Carte', `+${giftFee.toLocaleString('fr-FR')} FCFA`, false, [160, 110, 40]);
  if (shippingFee) drawRow('Livraison', `${shippingFee.toLocaleString('fr-FR')} FCFA`);
  if (discount) drawRow('Réduction', `-${discount.toLocaleString('fr-FR')} FCFA`, false, [180, 50, 50]);

  doc.setDrawColor(pr, pg, pb);
  doc.line(totalsX, y, pageW - 14, y);
  y += 4;
  drawRow('TOTAL', `${total.toLocaleString('fr-FR')} FCFA`, true, [pr, pg, pb]);

  // ── Gift Wrap & Calligraphy Note ──────────────────────────────────────────
  if (order.giftWrap?.enabled) {
    y += 4;
    doc.setFillColor(254, 250, 240);
    doc.roundedRect(14, y, pageW - 28, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(140, 90, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`[COFFRET CADEAU KRAFT & RUBAN ${order.giftWrap.ribbonColor?.toUpperCase() || 'DORÉ'}]`, 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    if (order.giftWrap.recipientName || order.giftWrap.senderName) {
      doc.text(`Pour : ${order.giftWrap.recipientName || '-'} | De la part de : ${order.giftWrap.senderName || '-'}`, 18, y + 11);
    }
    if (order.giftWrap.message) {
      doc.setFont('helvetica', 'italic');
      doc.text(`Message calligraphié : "${order.giftWrap.message}"`, 18, y + 17);
    }
    y += 26;
  }

  // ── Payment method ───────────────────────────────────────────────────────
  y += 6;
  const paymentMethod = iv.paymentMethod ?? order.paymentMethod;
  if (paymentMethod) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const pmLabel = paymentMethod === 'delivery' ? 'Paiement à la livraison' :
      paymentMethod === 'mobile' ? 'Mobile Money' : paymentMethod;
    doc.text(`Mode de paiement : ${pmLabel}`, 14, y);
    y += 6;
    if (cfg.paymentPhone && paymentMethod !== 'delivery') {
      doc.text(`${cfg.paymentName ?? ''} — ${cfg.paymentPhone}`, 14, y);
      y += 6;
    }
  }

  // ── Messages / footer ────────────────────────────────────────────────────
  if (cfg.message1 || cfg.message2) {
    y += 4;
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(14, y, pageW - 28, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    if (cfg.message1) doc.text(cfg.message1, 18, y + 6);
    if (cfg.message2) doc.text(cfg.message2, 18, y + 12);
    y += 22;
  }

  // Footer
  const footerMsg = cfg.footerMessage ?? 'Merci pour votre confiance !';
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, pageH - 18, pageW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(footerMsg, pageW / 2, pageH - 8, { align: 'center' });

  // Save PDF document
  doc.save(`Facture_${isDuplicata ? 'Duplicata_' : ''}${orderId}.pdf`);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(order: Order, isDuplicata: boolean = false) {
  if (!order) return;

  const loadingToast = toast.loading('Génération de la facture en cours...');

  try {
    await generateInvoiceClientSide(order, isDuplicata);
    toast.dismiss(loadingToast);
    toast.success('Facture générée avec succès');
  } catch (error: any) {
    console.error('Erreur génération facture:', error);
    toast.dismiss(loadingToast);
    toast.error(error?.message || 'Erreur lors de la génération de la facture');
  }
}
