import { useState } from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { useFarm } from '../../contexts/FarmContext';
import { useExpenses, useSales } from '../../hooks/useFinancials';
import { usePlantings } from '../../hooks/useCrops';
import { useLivestock } from '../../hooks/useLivestock';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { generateFinancialReport, generateCropReport, generateLivestockReport } from '../../services/pdfService';
import { exportToCSV } from '../../services/exportService';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const { activeFarm } = useFarm();
  const { expenses } = useExpenses();
  const { sales } = useSales();
  const { plantings } = usePlantings();
  const { livestock } = useLivestock();

  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ from: monthAgo, to: today });

  const farmName = activeFarm?.name ?? 'Farm';

  function handleFinancialPDF() {
    const filtered = {
      expenses: expenses.filter((e) => e.expense_date >= dateRange.from && e.expense_date <= dateRange.to),
      sales: sales.filter((s) => s.sale_date >= dateRange.from && s.sale_date <= dateRange.to),
    };
    generateFinancialReport(farmName, filtered.expenses, filtered.sales, dateRange);
    toast.success('Financial report downloaded');
  }

  function handleCropPDF() {
    generateCropReport(farmName, plantings);
    toast.success('Crop report downloaded');
  }

  function handleLivestockPDF() {
    generateLivestockReport(farmName, livestock);
    toast.success('Livestock report downloaded');
  }

  function handleExpenseCSV() {
    exportToCSV(
      expenses as unknown as Record<string, unknown>[],
      [
        { key: 'expense_date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'amount_kes', label: 'Amount (KSh)' },
        { key: 'payment_method', label: 'Payment Method' },
      ],
      `${farmName}_Expenses`
    );
    toast.success('Expenses exported to CSV');
  }

  function handleSalesCSV() {
    exportToCSV(
      sales as unknown as Record<string, unknown>[],
      [
        { key: 'sale_date', label: 'Date' },
        { key: 'item_description', label: 'Item' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'total_amount_kes', label: 'Amount (KSh)' },
        { key: 'buyer_name', label: 'Buyer' },
        { key: 'payment_status', label: 'Status' },
      ],
      `${farmName}_Sales`
    );
    toast.success('Sales exported to CSV');
  }

  const reports = [
    {
      title: 'Financial Report',
      description: 'Revenue, expenses, and profit/loss summary with detailed breakdowns in KSh.',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      actions: [
        { label: 'Download PDF', onClick: handleFinancialPDF, icon: Download },
      ],
    },
    {
      title: 'Crop Report',
      description: 'All plantings with crop types, fields, seasons, status, and area.',
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-600',
      actions: [
        { label: 'Download PDF', onClick: handleCropPDF, icon: Download },
      ],
    },
    {
      title: 'Livestock Report',
      description: 'Complete livestock inventory with health status, types, and values.',
      icon: FileText,
      color: 'bg-amber-100 text-amber-600',
      actions: [
        { label: 'Download PDF', onClick: handleLivestockPDF, icon: Download },
      ],
    },
    {
      title: 'Export Expenses',
      description: 'Download all expenses as CSV for further analysis in Excel.',
      icon: FileSpreadsheet,
      color: 'bg-red-100 text-red-600',
      actions: [
        { label: 'Export CSV', onClick: handleExpenseCSV, icon: Download },
      ],
    },
    {
      title: 'Export Sales',
      description: 'Download all sales/revenue records as CSV.',
      icon: FileSpreadsheet,
      color: 'bg-blue-100 text-blue-600',
      actions: [
        { label: 'Export CSV', onClick: handleSalesCSV, icon: Download },
      ],
    },
  ];

  return (
    <>
      <PageHeader title="Reports & Export" subtitle="Generate PDF reports and export data" />

      <Card className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Date Range (for financial report)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="From" type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
          <Input label="To" type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.title}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${report.color}`}>
                <report.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{report.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {report.actions.map((action) => (
                <Button key={action.label} variant="secondary" size="sm" onClick={action.onClick} className="flex-1">
                  <action.icon className="h-4 w-4" /> {action.label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
