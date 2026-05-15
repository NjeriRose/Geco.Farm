import { useState } from 'react';
import { Plus, Beef } from 'lucide-react';
import { useLivestock, useLivestockTypes } from '../../hooks/useLivestock';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { LIVESTOCK_HEALTH_STATUSES, LIVESTOCK_STATUSES } from '../../lib/constants';
import { formatKES } from '../../lib/utils';
import type { Livestock } from '../../types';
import toast from 'react-hot-toast';

export function LivestockPage() {
  const { livestock, loading, createLivestock, updateLivestock, deleteLivestock } = useLivestock();
  const { types } = useLivestockTypes();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editItem, setEditItem] = useState<Livestock | null>(null);

  const [form, setForm] = useState({
    livestock_type_id: '', tag_number: '', name: '', gender: '',
    date_of_birth: '', date_acquired: '', acquisition_cost_kes: '', weight_kg: '', notes: '',
  });

  if (loading) return <LoadingSpinner />;

  function resetForm() {
    setForm({ livestock_type_id: '', tag_number: '', name: '', gender: '',
      date_of_birth: '', date_acquired: '', acquisition_cost_kes: '', weight_kg: '', notes: '' });
    setEditItem(null);
  }

  function openEdit(l: Livestock) {
    setEditItem(l);
    setForm({
      livestock_type_id: l.livestock_type_id, tag_number: l.tag_number ?? '',
      name: l.name ?? '', gender: l.gender ?? '', date_of_birth: l.date_of_birth ?? '',
      date_acquired: l.date_acquired ?? '', acquisition_cost_kes: String(l.acquisition_cost_kes),
      weight_kg: l.weight_kg ? String(l.weight_kg) : '', notes: l.notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      livestock_type_id: form.livestock_type_id,
      tag_number: form.tag_number || undefined,
      name: form.name || undefined,
      gender: (form.gender || undefined) as 'male' | 'female' | undefined,
      date_of_birth: form.date_of_birth || undefined,
      date_acquired: form.date_acquired || undefined,
      acquisition_cost_kes: parseFloat(form.acquisition_cost_kes) || 0,
      weight_kg: parseFloat(form.weight_kg) || undefined,
      notes: form.notes || undefined,
    };

    const { error } = editItem
      ? await updateLivestock(editItem.id, data)
      : await createLivestock(data);

    if (error) { toast.error(error); return; }
    toast.success(editItem ? 'Animal updated' : 'Animal added');
    setShowForm(false);
    resetForm();
  }

  const filtered = livestock
    .filter((l) => activeTab === 'all' || l.status === activeTab)
    .filter((l) =>
      !search || (l.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.tag_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.livestock_type?.name ?? '').toLowerCase().includes(search.toLowerCase())
    );

  const tabs = [
    { key: 'all', label: 'All', count: livestock.length },
    ...LIVESTOCK_STATUSES.map((s) => ({
      key: s.value, label: s.label,
      count: livestock.filter((l) => l.status === s.value).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Livestock"
        subtitle={`${livestock.filter((l) => l.status === 'active').length} active animals`}
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Animal
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, tag, or type..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Beef}
          title="No livestock yet"
          description="Start tracking your animals by adding your first entry."
          actionLabel="Add Animal"
          onAction={() => { resetForm(); setShowForm(true); }}
        />
      ) : (
        <DataTable
          keyExtractor={(l) => l.id}
          data={filtered}
          onRowClick={openEdit}
          columns={[
            { key: 'animal', header: 'Animal', render: (l: Livestock) => (
              <div>
                <p className="font-medium">{l.name || l.tag_number || 'Unnamed'}</p>
                <p className="text-xs text-slate-500">{l.livestock_type?.name ?? ''}</p>
              </div>
            )},
            { key: 'tag_number', header: 'Tag', render: (l: Livestock) => l.tag_number || '-', hideOnMobile: true },
            { key: 'gender', header: 'Gender', render: (l: Livestock) => l.gender ? l.gender.charAt(0).toUpperCase() + l.gender.slice(1) : '-', hideOnMobile: true },
            { key: 'health', header: 'Health', render: (l: Livestock) => {
              const h = LIVESTOCK_HEALTH_STATUSES.find((s) => s.value === l.health_status);
              return <StatusBadge colorClass={h?.color ?? ''}>{h?.label ?? l.health_status}</StatusBadge>;
            }},
            { key: 'value', header: 'Value', render: (l: Livestock) => formatKES(l.acquisition_cost_kes), hideOnMobile: true },
            { key: 'status', header: 'Status', render: (l: Livestock) => {
              const s = LIVESTOCK_STATUSES.find((st) => st.value === l.status);
              return <StatusBadge colorClass={s?.color ?? ''}>{s?.label ?? l.status}</StatusBadge>;
            }},
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editItem ? 'Edit Animal' : 'New Animal'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Type / Breed" value={form.livestock_type_id} onChange={(e) => setForm({ ...form, livestock_type_id: e.target.value })}
            options={types.map((t) => ({ value: t.id, label: `${t.name}${t.breed ? ` — ${t.breed}` : ''}` }))} placeholder="Select type" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tag Number" value={form.tag_number} onChange={(e) => setForm({ ...form, tag_number: e.target.value })} placeholder="e.g., KF-001" />
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Optional name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} placeholder="Select" />
            <Input label="Weight (kg)" type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} min="0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            <Input label="Date Acquired" type="date" value={form.date_acquired} onChange={(e) => setForm({ ...form, date_acquired: e.target.value })} />
          </div>
          <Input label="Acquisition Cost (KSh)" type="number" prefix="KSh" value={form.acquisition_cost_kes} onChange={(e) => setForm({ ...form, acquisition_cost_kes: e.target.value })} min="0" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" className="flex-1">{editItem ? 'Update' : 'Add Animal'}</Button>
          </div>
          {editItem && (
            <Button type="button" variant="danger" className="w-full" onClick={async () => {
              await deleteLivestock(editItem.id);
              toast.success('Animal removed');
              setShowForm(false); resetForm();
            }}>Delete Animal</Button>
          )}
        </form>
      </Modal>
    </>
  );
}
