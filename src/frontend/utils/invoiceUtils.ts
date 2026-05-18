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
    const primaryColor = [44, 62, 53]; // Laine & Deco dark green
    const textColor = [50, 50, 50]; 
    const bgColor = [238, 238, 238]; // Light grey matching template
    
    // Page Background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(0, 0, 210, 297, 'F');


    if (isDuplicata) {
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(80);
      doc.setFont('helvetica', 'bold');
      doc.text('DUPLICATA', 105, 150, { align: 'center', angle: 45 });
    }

    // Top Header: "FACTURE" and Logo
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.text('FACTURE', 20, 30);

    // Modern simple logo simulation (right aligned)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(28);
    doc.text('L&D', 185, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Laine & Déco', 185, 32, { align: 'right' });

    // Client Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('À :', 20, 50);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(order.customerName || order.customer || 'Client', 20, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.address || 'Douala, Cameroun', 20, 62);
    
    // Middle Info (Phone / Email)
    doc.text(order.phone || '+237 000 000 000', 90, 57);
    doc.text('Client Email', 90, 62);

    // Right Info (Company info & Date)
    doc.text(`N° ${order.id || 'N/A'}`, 150, 57);
    doc.text(order.date || new Date().toLocaleDateString(), 150, 62);
    doc.text('contact@laine-deco.com', 150, 67);

    // Products Table
    const orderItems = order.orderDetails || (Array.isArray(order.items) ? order.items : []);
    const tableRows = orderItems.map((item: any) => [
      item.name || 'Article',
      `${(item.price || 0).toLocaleString()} FCFA`,
      (item.quantity || 0).toString(),
      `${((item.price || 0) * (item.quantity || 0)).toLocaleString()} FCFA`
    ]);

    if (tableRows.length === 0) {
      tableRows.push(['Aucun article listé', '0 FCFA', '0', '0 FCFA']);
    }

    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Prix Unitaire', 'Qté', 'Total']],
      body: tableRows,
      theme: 'plain',
      headStyles: { 
        textColor: [20, 20, 20],
        fontStyle: 'bold',
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [230, 230, 230]
      },
      bodyStyles: {
        fillColor: [240, 240, 240],
        textColor: textColor as [number, number, number],
        fontSize: 10,
        cellPadding: 8
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80, fontStyle: 'bold', textColor: primaryColor as [number, number, number] },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      didDrawPage: function (data) {
        // Draw the rounded border around the table structure
        if (data.cursor && data.table) {
          doc.setDrawColor(150, 150, 150);
          doc.setLineWidth(0.5);
          // (x, y, w, h, rx, ry, style)
          const startY = data.settings.startY;
          const endY = data.cursor.y;
          // Approximate drawing a border for the table
          try {
            (doc as any).roundedRect(14, startY - 2, 182, endY - startY + 4, 3, 3, 'S');
          } catch(e) {
             doc.rect(14, startY - 2, 182, endY - startY + 4, 'S'); 
          }
        }
      }
    });

    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 15;

    // Bottom Section
    // Left: Payment & Terms
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Paiement :', 20, finalY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('Mobile Money / Orange Money :', 20, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text('+237 000 000 000 (Laine & Déco)', 20, finalY + 13);
    
    if (order.paymentMethod) {
      doc.setFont('helvetica', 'bold');
      doc.text('Méthode :', 80, finalY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(order.paymentMethod, 80, finalY + 13);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('Conditions & Retours', 20, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Les articles faits sur-mesure ne sont ni repris ni échangés.', 20, finalY + 36);
    doc.text('Merci de vérifier votre commande à la réception.', 20, finalY + 41);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Merci pour votre confiance !', 20, finalY + 55);

    // Right: Total Box
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    try {
      (doc as any).roundedRect(110, finalY - 5, 80, 12, 3, 3, 'F');
    } catch(e) {
      doc.rect(110, finalY - 5, 80, 12, 'F');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Total', 115, finalY + 3);
    doc.text(`${(order.total || 0).toLocaleString()} FCFA`, 185, finalY + 3, { align: 'right' });

    // Signature
    doc.setFont('times', 'italic');
    doc.setFontSize(20);
    doc.setTextColor(50, 50, 50);
    doc.text('Landry M.', 160, finalY + 45, { align: 'center' });
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(135, finalY + 48, 185, finalY + 48);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Direction Laine & Déco', 160, finalY + 53, { align: 'center' });

    doc.save(`Facture_Laine_Deco_${order.id || 'Order'}.pdf`);
    toast.success('Facture générée avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération de la facture. Veuillez vérifier les données de la commande.');
  }
};
