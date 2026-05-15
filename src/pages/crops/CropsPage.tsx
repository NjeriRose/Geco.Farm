import { useState } from 'react';
import { Plus, Sprout } from 'lucide-react';
import { usePlantings, useCropTypes } from '../../hooks/useCrops';
import { useFields } from '../../hooks/useFields';
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
import { PLANTING_STATUSES, SEASONS } from '../../lib/constants';
import { formatKES, formatDate } from '../../lib/utils';
import type { Planting } from '../../types';
import toast from 'react-hot-toast';

export function CropsPage() {
  const { plantings, loading, createPlanting, updatePlanting, deletePlanting } = usePlantings();
  const { cropTypes } = useCropTypes();
  const { fields } = useFields();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editItem, setEditItem] = useState<Planting | null>(null);

  const [form, setForm] = useState({
    field_id: '', crop_type_id: '', season: '', planting_date: '',
    expected_harvest_date: '', area_acres: '', seed_cost_kes: '', notes: '',
  });

  if (loading) return <LoadingSpinner />;

  function resetForm() {
    setForm({ field_id: '', crop_type_id: '', season: '', planting_date: '',
      expected_harvest_date: '', area_acres: '', seed_cost_kes: '', notes: '' });
    setEditItem(null);
  }

  function openEdit(p: Planting) {
    setEditItem(p);
    setForm({
      field_id: p.field_id, crop_type_id: p.crop_type_id, season: p.season ?? '',
      planting_date: p.planting_date, expected_harvest_date: p.expected_harvest_date ?? '',
      area_acres: String(p.area_acres), seed_cost_kes: String(p.seed_cost_kes), notes: p.notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      field_id: form.field_id,
      crop_type_id: form.crop_type_id,
      season: (form.season || undefined) as 'long_rains' | 'short_rains' | 'irrigated' | 'year_round' | undefined,
      planting_date: form.planting_date,
      expected_harvest_date: form.expected_harvest_date || undefined,
      area_acres: parseFloat(form.area_acres) || 0,
      seed_cost_kes: parseFloat(form.seed_cost_kes) || 0,
      notes: form.notes || undefined,
    };

    const { error } = editItem
      ? await updatePlanting(editItem.id, data)
      : await createPlanting(data);

    if (error) { toast.error(error); return; }
    toast.success(editItem ? 'Planting updated' : 'Planting added');
    setShowForm(false);
    resetForm();
  }

  async function handleStatusChange(p: Planting, status: string) {
    const { error } = await updatePlanting(p.id, { status } as Partial<Planting>);
    if (error) toast.error(error);
    else toast.success('Status updated');
  }

  const filtered = plantings
    .filter((p) => activeTab === 'all' || p.status === activeTab)
    .filter((p) =>
      !search || (p.crop_type?.name ?? '').toLowerCase().includes(search.toLowerCase())
    );

  const tabs = [
    { key: 'all', label: 'All', count: plantings.length },
    ...PLANTING_STATUSES.map((s) => ({
      key: s.value, label: s.label,
      count: plantings.filter((p) => p.status === s.value).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Crops"
        subtitle={`${plantings.length} plantings this season`}
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Planting
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search crops..." />
      </div>

      {filtered.length === 0 && !loading ? (
        <EmptyState
          icon={Sprout}
          title="No plantings yet"
          description="Start tracking your crops by adding your first planting."
          actionLabel="Add Planting"
          onAction={() => { resetForm(); setShowForm(true); }}
        />
      ) : (
        <DataTable
          keyExtractor={(p) => p.id}
          data={filtered}
          onRowClick={openEdit}
          columns={[
            { key: 'crop', header: 'Crop', render: (p: Planting) => (
              <div>
                <p className="font-medium">{p.crop_type?.name ?? 'Unknown'}</p>
                <p className="text-xs text-slate-500">{p.field?.name ?? ''}</p>
              </div>
            )},
            { key: 'planting_date', header: 'Planted', render: (p: Planting) => formatDate(p.planting_date) },
            { key: 'area_acres', header: 'Area', render: (p: Planting) => `${p.area_acres} acres`, hideOnMobile: true },
            { key: 'seed_cost_kes', header: 'Seed Cost', render: (p: Planting) => formatKES(p.seed_cost_kes), hideOnMobile: true },
            { key: 'status', header: 'Status', render: (p: Planting) => {
              const s = PLANTING_STATUSES.find((st) => st.value === p.status);
              return <StatusBadge colorClass={s?.color ?? ''}>{s?.label ?? p.status}</StatusBadge>;
            }},
            { key: 'actions', header: '', render: (p: Planting) => (
              <select
                className="text-xs border rounded px-1 py-0.5"
                value={p.status}
                onChange={(e) => { e.stopPropagation(); handleStatusChange(p, e.target.value); }}
                onClick={(e) => e.stopPropagation()}
              >
                {PLANTING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            ), hideOnMobile: true },
          ]}
        />
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editItem ? 'Edit Planting' : 'New Planting'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Crop" value={form.crop_type_id} onChange={(e) => setForm({ ...form, crop_type_id: e.target.value })}
              options={cropTypes.map((c) => ({ value: c.id, label: `${c.name}${c.variety ? ` (${c.variety})` : ''}` }))} placeholder="Select crop" required />
            <Select label="Field" value={form.field_id} onChange={(e) => setForm({ ...form, field_id: e.target.value })}
              options={fields.map((f) => ({ value: f.id, label: `${f.name} (${f.size_acres} acres)` }))} placeholder="Select field" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Season" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}
              options={[...SEASONS]} placeholder="Select season" />
            <Input label="Planting Date" type="date" value={form.planting_date} onChange={(e) => setForm({ ...form, planting_date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Expected Harvest" type="date" value={form.expected_harvest_date} onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })} />
            <Input label="Area (acres)" type="number" value={form.area_acres} onChange={(e) => setForm({ ...form, area_acres: e.target.value })} min="0" step="0.1" required />
          </div>
          <Input label="Seed Cost (KSh)" type="number" prefix="KSh" value={form.seed_cost_kes} onChange={(e) => setForm({ ...form, seed_cost_kes: e.target.value })} min="0" />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" className="flex-1">{editItem ? 'Update' : 'Add Planting'}</Button>
          </div>
          {editItem && (
            <Button type="button" variant="danger" className="w-full" onClick={async () => {
              await deletePlanting(editItem.id);
              toast.success('Planting deleted');
              setShowForm(false); resetForm();
            }}>Delete Planting</Button>
          )}
        </form>
      </Modal>
    </>
  );
}
