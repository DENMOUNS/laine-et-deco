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

// ─── Client-side PDF generation using stored invoiceData ──────────────────────

/**
 * Generates an invoice PDF entirely on the client using jsPDF + jsPDF-AutoTable.
 * Relies on `order.invoiceData` which is snapshotted at order-creation time in
 * CheckoutView.buildOrderInvoiceData(), so no extra network round-trip is needed.
 */
async function generateInvoiceClientSide(order: Order, isDuplicata: boolean): Promise<void> {
  const iv = order.invoiceData ?? {};
  const cfg = iv.config ?? {};

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

  // Logo placeholder or company name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const companyName = cfg.companyName || 'Laine & Déco';
  doc.text(companyName, 14, 16);

  // FACTURE / DUPLICATA label (right side)
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
  const orderDate = order.date ?? (order.createdAt ? new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('fr-FR') : '-');
  doc.text(`Date : ${orderDate}`, pageW - 14 - doc.getTextWidth(`Date : ${orderDate}`), 28);

  // ── Section below header ─────────────────────────────────────────────────
  let y = 48;

  // Emitter info (left)
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DE', 14, y);
  doc.setFont('helvetica', 'normal');
  if (cfg.address) { doc.text(cfg.address, 14, y + 5); }
  if (cfg.phone) { doc.text(`Tél: ${cfg.phone}`, 14, y + 10); }
  if (cfg.email) { doc.text(`Email: ${cfg.email}`, 14, y + 15); }

  // Customer info (right column)
  const rightX = pageW / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', rightX, y);
  doc.setFont('helvetica', 'normal');
  const customerName = iv.customerName ?? order.customer ?? '-';
  doc.text(customerName, rightX, y + 5);
  const customerAddress = iv.address ?? order.address ?? '';
  if (customerAddress) doc.text(customerAddress, rightX, y + 10);
  const customerPhone = iv.phone ?? order.phone ?? '';
  if (customerPhone) doc.text(`Tél: ${customerPhone}`, rightX, y + 15);

  y += 28;

  // ── Items table ──────────────────────────────────────────────────────────
  const items: any[] = iv.items ?? order.orderDetails ?? [];
  const tableBody = items.map((item: any) => [
    item.name ?? item.productName ?? '-',
    String(item.quantity ?? 1),
    `${Number(item.price ?? 0).toLocaleString('fr-FR')} FCFA`,
    `${(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString('fr-FR')} FCFA`,
  ]);

  autoTable(doc, {
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
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Totals summary ───────────────────────────────────────────────────────
  const totalsX = pageW - 80;
  const subtotal = iv.subtotal ?? 0;
  const shippingFee = iv.shippingFee ?? order.shippingFee ?? 0;
  const giftFee = iv.giftFee ?? order.giftFee ?? (order.giftWrap?.enabled ? 2000 : 0);
  const discount = iv.discount ?? 0;
  const total = iv.total ?? order.total ?? 0;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const drawRow = (label: string, value: string, bold = false, color?: [number, number, number]) => {
    if (bold) doc.setFont('helvetica', 'bold');
    if (color) doc.setTextColor(...color);
    doc.text(label, totalsX, y);
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

  // Save
  doc.save(`Facture_${isDuplicata ? 'Duplicata_' : ''}${orderId}.pdf`);
}

// ─── Server-side fallback (for orders without invoiceData) ────────────────────

async function createInvoiceJob(orderId: string, isDuplicata: boolean = false): Promise<string> {
  const token = await getAuthToken();

  const response = await fetch('/api/dashboard/invoice/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, isDuplicata }),
  });

  const data = await readApiResponse(response, 'Endpoint de facture introuvable');
  if (!response.ok) {
    throw new Error(data?.error || 'Impossible de créer la tâche de facture');
  }

  if (!data?.jobId) {
    throw new Error("La tâche de facture n'a pas été créée correctement");
  }

  return data.jobId;
}

async function pollInvoiceJob(jobId: string, timeoutMs: number = 60000): Promise<string> {
  const token = await getAuthToken();
  const startTime = Date.now();
  const pollIntervalMs = 1000;

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`/api/dashboard/invoice/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await readApiResponse(response, 'Endpoint de suivi facture introuvable');

    if (!response.ok) {
      throw new Error(data?.error || 'Impossible de vérifier la facture');
    }

    if (data.status === 'completed') {
      if (!data.pdfUrl) throw new Error('Lien PDF manquant');
      return data.pdfUrl;
    }

    if (data.status === 'failed') {
      throw new Error(data?.error || 'Génération de facture échouée');
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Génération de facture trop longue, veuillez réessayer');
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(order: Order, isDuplicata: boolean = false) {
  if (!order) return;

  const loadingToast = toast.loading('Génération de la facture en cours...');

  try {
    // Fast path: use the config snapshot stored in the order itself
    if (order.invoiceData?.config) {
      await generateInvoiceClientSide(order, isDuplicata);
      toast.dismiss(loadingToast);
      toast.success('Facture générée avec succès');
      return;
    }

    // Fallback: old orders without invoiceData — go through server job
    const jobId = await createInvoiceJob(order.id, isDuplicata);
    const pdfUrl = await pollInvoiceJob(jobId, 60000);

    toast.dismiss(loadingToast);

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Facture_Laine_Deco_${order.id || 'Order'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Facture générée avec succès');
  } catch (error: any) {
    toast.dismiss(loadingToast);
    toast.error(error?.message || 'Erreur lors de la génération de la facture');
  }
}
