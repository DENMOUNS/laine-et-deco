import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../../types';
import { toast } from 'sonner';

export const generateInvoicePDF = (order: Order, isDuplicata: boolean = false) => {
  try {
    if (!order) {
      console.error('generateInvoicePDF called with null order');
      return;
    }
    const doc = new jsPDF();
    const primaryColor = [26, 32, 44]; // Deep primary
    const accentColor = [227, 24, 55]; // Accent red

    console.log('Generating invoice for order:', order.id);

    if (isDuplicata) {
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.text('DUPLICATA', 105, 150, { align: 'center', angle: 45 });
    }

    // Header with styling
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('LAINE & DECO', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Reçu de paiement officiel', 20, 32);

    // Invoice Details Box
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(255, 255, 255);
    try {
      (doc as any).roundedRect(120, 15, 70, 25, 3, 3, 'FD');
    } catch (e) {
      doc.rect(120, 15, 70, 25, 'FD');
    }
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`NUMÉRO: ${order.id || 'N/A'}`, 125, 25);
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: ${order.date || new Date().toLocaleDateString()}`, 125, 32);

    // Client Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customerName || order.customer || 'Client Laine & Deco', 20, 67);
    doc.text(order.address || 'Douala, Cameroun', 20, 74);
    doc.text(order.phone || '', 20, 81);

    // Products Table
    const orderItems = order.orderDetails || (Array.isArray(order.items) ? order.items : []);
    const tableRows = orderItems.map((item: any) => [
      item.name || 'Article',
      (item.quantity || 0).toString(),
      `${(item.price || 0).toLocaleString()} FCFA`,
      `${((item.price || 0) * (item.quantity || 0)).toLocaleString()} FCFA`
    ]);

    if (tableRows.length === 0) {
      tableRows.push(['Aucun article listé', '0', '0 FCFA', '0 FCFA']);
    }

    autoTable(doc, {
      startY: 100,
      head: [['Désignation', 'Qté', 'Prix Unitaire', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor as [number, number, number], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 }
    });

    // Totals
    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 10;
    doc.setDrawColor(241, 245, 249);
    doc.line(120, finalY, 190, finalY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TOTAL:', 120, finalY + 10);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`${(order.total || 0).toLocaleString()} FCFA`, 190, finalY + 10, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Merci pour votre confiance chez Laine & Deco.', 105, 280, { align: 'center' });
    doc.text('Site web conçu par Landry MOUTONGO', 105, 285, { align: 'center' });

    doc.save(`Facture_Laine_Deco_${order.id || 'Order'}.pdf`);
    toast.success('Facture générée avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération de la facture. Veuillez vérifier les données de la commande.');
  }
};
