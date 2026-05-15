import { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { useInventory, useInventoryCategories } from '../../hooks/useInventory';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { formatKES } from '../../lib/utils';
import type { InventoryItem } from '../../types';
import toast from 'react-hot-toast';

export function InventoryPage() {
  const { items, lowStockItems, loading, createItem, updateItem, deleteItem } = useInventory();
  const { categories } = useInventoryCategories();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    category_id: '', name: '', quantity: '', unit: '', unit_cost_kes: '',
    reorder_level: '', supplier: '', storage_location: '', expiry_date: '', notes: '',
  });

  if (loading) return <LoadingSpinner />;

  function resetForm() {
    setForm({ category_id: '', name: '', quantity: '', unit: '', unit_cost_kes: '',
      reorder_level: '', supplier: '', storage_location: '', expiry_date: '', notes: '' });
    setEditItem(null);
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setForm({
      category_id: item.category_id, name: item.name, quantity: String(item.quantity),
      unit: item.unit, unit_cost_kes: String(item.unit_cost_kes), reorder_level: String(item.reorder_level),
      supplier: item.supplier ?? '', storage_location: item.storage_location ?? '',
      expiry_date: item.expiry_date ?? '', notes: item.notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      category_id: form.category_id,
      name: form.name,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      unit_cost_kes: parseFloat(form.unit_cost_kes) || 0,
      reorder_level: parseFloat(form.reorder_level) || 0,
      supplier: form.supplier || undefined,
      storage_location: form.storage_location || undefined,
      expiry_date: form.expiry_date || undefined,
      notes: form.notes || undefined,
    };

    const { error } = editItem
      ? await updateItem(editItem.id, data)
      : await createItem(data);

    if (error) { toast.error(error); return; }
    toast.success(editItem ? 'Item updated' : 'Item added');
    setShowForm(false);
    resetForm();
  }

  const filtered = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${items.length} items tracked`}
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        }
      />

      {lowStockItems.length > 0 && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">Low Stock Alert</p>
              <p className="text-xs text-orange-700 mt-1">
                {lowStockItems.map((i) => i.name).join(', ')} — below reorder level
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory items"
          description="Track your farm supplies, chemicals, and equipment."
          actionLabel="Add Item"
          onAction={() => { resetForm(); setShowForm(true); }}
        />
      ) : (
        <DataTable
          keyExtractor={(i) => i.id}
          data={filtered}
          onRowClick={openEdit}
          columns={[
            { key: 'name', header: 'Item', render: (i: InventoryItem) => (
              <div className="flex items-center gap-2">
                <p className="font-medium">{i.name}</p>
                {i.reorder_level > 0 && i.quantity <= i.reorder_level && (
                  <Badge variant="warning">Low</Badge>
                )}
              </div>
            )},
            { key: 'category', header: 'Category', render: (i: InventoryItem) => i.category?.name ?? '-', hideOnMobile: true },
            { key: 'quantity', header: 'Quantity', render: (i: InventoryItem) => `${i.quantity} ${i.unit}` },
            { key: 'value', header: 'Value', render: (i: InventoryItem) => formatKES(i.quantity * i.unit_cost_kes), hideOnMobile: true },
            { key: 'supplier', header: 'Supplier', render: (i: InventoryItem) => i.supplier ?? '-', hideOnMobile: true },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editItem ? 'Edit Item' : 'New Item'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select category" required />
            <Input label="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., DAP Fertilizer" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="0" required />
            <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, litres, bags" required />
            <Input label="Unit Cost (KSh)" type="number" prefix="KSh" value={form.unit_cost_kes} onChange={(e) => setForm({ ...form, unit_cost_kes: e.target.value })} min="0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Reorder Level" type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} min="0" helperText="Alert when stock falls below this" />
            <Input label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Storage Location" value={form.storage_location} onChange={(e) => setForm({ ...form, storage_location: e.target.value })} placeholder="e.g., Store A" />
            <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" className="flex-1">{editItem ? 'Update' : 'Add Item'}</Button>
          </div>
          {editItem && (
            <Button type="button" variant="danger" className="w-full" onClick={async () => {
              await deleteItem(editItem.id);
              toast.success('Item deleted');
              setShowForm(false); resetForm();
            }}>Delete Item</Button>
          )}
        </form>
      </Modal>
    </>
  );
}
