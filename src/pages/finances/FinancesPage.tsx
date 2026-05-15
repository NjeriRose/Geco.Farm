import { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useExpenses, useSales } from '../../hooks/useFinancials';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../../lib/constants';
import { formatKES, formatDate } from '../../lib/utils';
import type { Expense, Sale } from '../../types';
import toast from 'react-hot-toast';

export function FinancesPage() {
  const { expenses, totalExpenses, loading: eLoading, createExpense, deleteExpense } = useExpenses();
  const { sales, totalRevenue, loading: sLoading, createSale, deleteSale } = useSales();
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: '', description: '', amount_kes: '', payment_method: 'cash',
    reference_number: '', expense_date: new Date().toISOString().split('T')[0], notes: '',
  });

  const [saleForm, setSaleForm] = useState({
    item_type: 'crop', item_description: '', quantity: '', unit: '', unit_price_kes: '',
    total_amount_kes: '', buyer_name: '', buyer_phone: '', payment_method: 'mpesa',
    payment_status: 'paid', reference_number: '', sale_date: new Date().toISOString().split('T')[0], notes: '',
  });

  if (eLoading || sLoading) return <LoadingSpinner />;

  const netProfit = totalRevenue - totalExpenses;

  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createExpense({
      category: expenseForm.category,
      description: expenseForm.description,
      amount_kes: parseFloat(expenseForm.amount_kes) || 0,
      payment_method: expenseForm.payment_method,
      reference_number: expenseForm.reference_number || undefined,
      expense_date: expenseForm.expense_date,
      notes: expenseForm.notes || undefined,
    });
    if (error) { toast.error(error); return; }
    toast.success('Expense recorded');
    setShowExpenseForm(false);
    setExpenseForm({ category: '', description: '', amount_kes: '', payment_method: 'cash',
      reference_number: '', expense_date: new Date().toISOString().split('T')[0], notes: '' });
  }

  async function handleSaleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(saleForm.quantity) || undefined;
    const unitPrice = parseFloat(saleForm.unit_price_kes) || undefined;
    const total = parseFloat(saleForm.total_amount_kes) || (qty && unitPrice ? qty * unitPrice : 0);

    const { error } = await createSale({
      item_type: saleForm.item_type,
      item_description: saleForm.item_description,
      quantity: qty,
      unit: saleForm.unit || undefined,
      unit_price_kes: unitPrice,
      total_amount_kes: total,
      buyer_name: saleForm.buyer_name || undefined,
      buyer_phone: saleForm.buyer_phone || undefined,
      payment_method: saleForm.payment_method,
      payment_status: saleForm.payment_status,
      reference_number: saleForm.reference_number || undefined,
      sale_date: saleForm.sale_date,
      notes: saleForm.notes || undefined,
    });
    if (error) { toast.error(error); return; }
    toast.success('Sale recorded');
    setShowSaleForm(false);
    setSaleForm({ item_type: 'crop', item_description: '', quantity: '', unit: '', unit_price_kes: '',
      total_amount_kes: '', buyer_name: '', buyer_phone: '', payment_method: 'mpesa',
      payment_status: 'paid', reference_number: '', sale_date: new Date().toISOString().split('T')[0], notes: '' });
  }

  const tabs = [
    { key: 'expenses', label: 'Expenses', count: expenses.length },
    { key: 'sales', label: 'Sales / Revenue', count: sales.length },
  ];

  return (
    <>
      <PageHeader
        title="Finances"
        subtitle="Track income and expenses in KSh"
        action={
          <Button onClick={() => activeTab === 'expenses' ? setShowExpenseForm(true) : setShowSaleForm(true)}>
            <Plus className="h-4 w-4" /> {activeTab === 'expenses' ? 'Add Expense' : 'Record Sale'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Revenue" value={formatKES(totalRevenue)} iconColor="text-green-600" iconBg="bg-green-100" />
        <StatCard icon={TrendingDown} label="Expenses" value={formatKES(totalExpenses)} iconColor="text-red-600" iconBg="bg-red-100" />
        <StatCard icon={DollarSign} label="Net Profit" value={formatKES(netProfit)}
          iconColor={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
          iconBg={netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <EmptyState icon={Wallet} title="No expenses recorded" description="Track farm expenses to understand your costs." actionLabel="Add Expense" onAction={() => setShowExpenseForm(true)} />
          ) : (
            <DataTable
              keyExtractor={(e) => e.id}
              data={expenses}
              columns={[
                { key: 'date', header: 'Date', render: (e: Expense) => formatDate(e.expense_date) },
                { key: 'category', header: 'Category', render: (e: Expense) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.value === e.category);
                  return cat?.label ?? e.category;
                }},
                { key: 'description', header: 'Description', render: (e: Expense) => e.description },
                { key: 'amount', header: 'Amount', render: (e: Expense) => (
                  <span className="font-medium text-red-700">{formatKES(e.amount_kes)}</span>
                )},
                { key: 'payment', header: 'Payment', render: (e: Expense) => {
                  const pm = PAYMENT_METHODS.find((p) => p.value === e.payment_method);
                  return pm?.label ?? e.payment_method;
                }, hideOnMobile: true },
                { key: 'actions', header: '', render: (e: Expense) => (
                  <Button variant="ghost" size="sm" onClick={() => { deleteExpense(e.id); toast.success('Deleted'); }}>Delete</Button>
                ), hideOnMobile: true },
              ]}
            />
          )
        ) : (
          sales.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No sales recorded" description="Record your farm sales and track revenue." actionLabel="Record Sale" onAction={() => setShowSaleForm(true)} />
          ) : (
            <DataTable
              keyExtractor={(s) => s.id}
              data={sales}
              columns={[
                { key: 'date', header: 'Date', render: (s: Sale) => formatDate(s.sale_date) },
                { key: 'item', header: 'Item', render: (s: Sale) => s.item_description },
                { key: 'amount', header: 'Amount', render: (s: Sale) => (
                  <span className="font-medium text-green-700">{formatKES(s.total_amount_kes)}</span>
                )},
                { key: 'buyer', header: 'Buyer', render: (s: Sale) => s.buyer_name ?? '-', hideOnMobile: true },
                { key: 'status', header: 'Status', render: (s: Sale) => {
                  const ps = PAYMENT_STATUSES.find((p) => p.value === s.payment_status);
                  return <StatusBadge colorClass={ps?.color ?? ''}>{ps?.label ?? s.payment_status}</StatusBadge>;
                }},
                { key: 'actions', header: '', render: (s: Sale) => (
                  <Button variant="ghost" size="sm" onClick={() => { deleteSale(s.id); toast.success('Deleted'); }}>Delete</Button>
                ), hideOnMobile: true },
              ]}
            />
          )
        )}
      </div>

      {/* Expense Modal */}
      <Modal isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Record Expense" size="lg">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <Select label="Category" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            options={[...EXPENSE_CATEGORIES]} placeholder="Select category" required />
          <Input label="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="What was this expense for?" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Amount (KSh)" type="number" prefix="KSh" value={expenseForm.amount_kes}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount_kes: e.target.value })} min="0" required />
            <Select label="Payment Method" value={expenseForm.payment_method} onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
              options={[...PAYMENT_METHODS]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
            <Input label="Reference (M-Pesa code, receipt #)" value={expenseForm.reference_number}
              onChange={(e) => setExpenseForm({ ...expenseForm, reference_number: e.target.value })} placeholder="e.g., QKL1234ABC" />
          </div>
          <Input label="Notes" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Record Expense</Button>
          </div>
        </form>
      </Modal>

      {/* Sale Modal */}
      <Modal isOpen={showSaleForm} onClose={() => setShowSaleForm(false)} title="Record Sale" size="lg">
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Item Type" value={saleForm.item_type} onChange={(e) => setSaleForm({ ...saleForm, item_type: e.target.value })}
              options={[{ value: 'crop', label: 'Crop' }, { value: 'livestock', label: 'Livestock' }, { value: 'produce', label: 'Produce' }, { value: 'product', label: 'Product' }, { value: 'other', label: 'Other' }]} />
            <Input label="Item Description" value={saleForm.item_description}
              onChange={(e) => setSaleForm({ ...saleForm, item_description: e.target.value })} placeholder="e.g., 10 bags of maize" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Quantity" type="number" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} />
            <Input label="Unit" value={saleForm.unit} onChange={(e) => setSaleForm({ ...saleForm, unit: e.target.value })} placeholder="bags, kg, litres" />
            <Input label="Price per Unit (KSh)" type="number" prefix="KSh" value={saleForm.unit_price_kes} onChange={(e) => setSaleForm({ ...saleForm, unit_price_kes: e.target.value })} />
          </div>
          <Input label="Total Amount (KSh)" type="number" prefix="KSh" value={saleForm.total_amount_kes}
            onChange={(e) => setSaleForm({ ...saleForm, total_amount_kes: e.target.value })}
            helperText="Auto-calculated from qty × price, or enter manually" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Buyer Name" value={saleForm.buyer_name} onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })} />
            <Input label="Buyer Phone" type="tel" value={saleForm.buyer_phone} onChange={(e) => setSaleForm({ ...saleForm, buyer_phone: e.target.value })} placeholder="+254 7XX XXX XXX" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Payment" value={saleForm.payment_method} onChange={(e) => setSaleForm({ ...saleForm, payment_method: e.target.value })} options={[...PAYMENT_METHODS]} />
            <Select label="Status" value={saleForm.payment_status} onChange={(e) => setSaleForm({ ...saleForm, payment_status: e.target.value })} options={[...PAYMENT_STATUSES]} />
            <Input label="Date" type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} required />
          </div>
          <Input label="Reference Number" value={saleForm.reference_number} onChange={(e) => setSaleForm({ ...saleForm, reference_number: e.target.value })} placeholder="M-Pesa/receipt ref" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowSaleForm(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Record Sale</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
