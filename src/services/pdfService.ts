import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatKES, formatDate } from '../lib/utils';
import type { Expense, Sale, Planting, Livestock } from '../types';

function addHeader(doc: jsPDF, title: string, farmName: string) {
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74);
  doc.text('Geco Farm', 14, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(farmName, 14, 28);
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(title, 14, 40);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${formatDate(new Date())}`, 14, 48);
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(14, 52, 196, 52);
}

export function generateFinancialReport(
  farmName: string,
  expenses: Expense[],
  sales: Sale[],
  dateRange: { from: string; to: string }
) {
  const doc = new jsPDF();
  addHeader(doc, 'Financial Report', farmName);

  doc.setFontSize(10);
  doc.text(`Period: ${formatDate(dateRange.from)} — ${formatDate(dateRange.to)}`, 14, 60);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount_kes, 0);
  const totalRevenue = sales.reduce((s, e) => s + e.total_amount_kes, 0);
  const netProfit = totalRevenue - totalExpenses;

  doc.setFontSize(12);
  doc.text(`Total Revenue: ${formatKES(totalRevenue)}`, 14, 72);
  doc.text(`Total Expenses: ${formatKES(totalExpenses)}`, 14, 80);
  doc.setTextColor(netProfit >= 0 ? 22 : 220, netProfit >= 0 ? 163 : 38, netProfit >= 0 ? 74 : 38);
  doc.text(`Net Profit: ${formatKES(netProfit)}`, 14, 88);
  doc.setTextColor(0);

  if (expenses.length > 0) {
    doc.setFontSize(14);
    doc.text('Expenses', 14, 102);
    autoTable(doc, {
      startY: 106,
      head: [['Date', 'Category', 'Description', 'Amount (KSh)', 'Payment']],
      body: expenses.map((e) => [
        formatDate(e.expense_date),
        e.category,
        e.description,
        formatKES(e.amount_kes),
        e.payment_method,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });
  }

  if (sales.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 120;
    doc.setFontSize(14);
    doc.text('Sales / Revenue', 14, finalY + 14);
    autoTable(doc, {
      startY: finalY + 18,
      head: [['Date', 'Item', 'Qty', 'Amount (KSh)', 'Buyer', 'Status']],
      body: sales.map((s) => [
        formatDate(s.sale_date),
        s.item_description,
        s.quantity ? `${s.quantity} ${s.unit ?? ''}` : '-',
        formatKES(s.total_amount_kes),
        s.buyer_name ?? '-',
        s.payment_status,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
    });
  }

  doc.save(`${farmName}_Financial_Report.pdf`);
}

export function generateCropReport(farmName: string, plantings: Planting[]) {
  const doc = new jsPDF();
  addHeader(doc, 'Crop Report', farmName);

  autoTable(doc, {
    startY: 58,
    head: [['Crop', 'Field', 'Season', 'Planted', 'Area (acres)', 'Status']],
    body: plantings.map((p) => [
      p.crop_type?.name ?? '-',
      p.field?.name ?? '-',
      p.season ?? '-',
      formatDate(p.planting_date),
      p.area_acres.toString(),
      p.status,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save(`${farmName}_Crop_Report.pdf`);
}

export function generateLivestockReport(farmName: string, livestock: Livestock[]) {
  const doc = new jsPDF();
  addHeader(doc, 'Livestock Report', farmName);

  autoTable(doc, {
    startY: 58,
    head: [['Tag', 'Name', 'Type/Breed', 'Gender', 'Status', 'Health', 'Weight (kg)']],
    body: livestock.map((l) => [
      l.tag_number ?? '-',
      l.name ?? '-',
      l.livestock_type?.name ?? '-',
      l.gender ?? '-',
      l.status,
      l.health_status,
      l.weight_kg?.toString() ?? '-',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save(`${farmName}_Livestock_Report.pdf`);
}
