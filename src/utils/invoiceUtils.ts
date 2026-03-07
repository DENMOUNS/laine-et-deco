import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "../types";

export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("FACTURE", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Laine & Déco", 20, 40);
  doc.text("Douala, Cameroun", 20, 45);
  doc.text("contact@laine-deco.com", 20, 50);
  
  doc.text(`Facture N°: INV-${order.id}`, 140, 40);
  doc.text(`Date: ${order.date}`, 140, 45);
  doc.text(`Statut: ${order.status.toUpperCase()}`, 140, 50);
  
  // Customer Info
  doc.setFontSize(14);
  doc.text("Client:", 20, 70);
  doc.setFontSize(12);
  doc.text(order.customer, 20, 78);
  doc.text(order.address || "N/A", 20, 84);
  
  // Table
  const tableData = order.orderDetails?.map(item => [
    item.name,
    item.quantity.toString(),
    `${item.price.toLocaleString()} FCFA`,
    `${(item.quantity * item.price).toLocaleString()} FCFA`
  ]) || [];
  
  autoTable(doc, {
    startY: 100,
    head: [["Produit", "Quantité", "Prix Unitaire", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [90, 90, 64] }, // Primary color
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(14);
  doc.text(`TOTAL: ${order.total.toLocaleString()} FCFA`, 140, finalY + 20);
  
  // System Generated Mention
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("FACTURE GÉNÉRÉE PAR LE SYSTÈME", 105, finalY + 40, { align: "center" });
  doc.setTextColor(0, 0, 0); // Reset color
  
  // Footer
  doc.setFontSize(10);
  doc.text("Merci pour votre confiance !", 105, 280, { align: "center" });
  
  doc.save(`Facture_${order.id}.pdf`);
};
