import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Leaf, MapPin, Ruler, Tractor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import { useFarms } from '../../hooks/useFarms';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { KENYAN_COUNTIES, FARM_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

export function FarmSetupPage() {
  const { userId } = useAuth();
  const { farms, refreshFarms } = useFarm();
  const { createFarm, loading } = useFarms();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    county: '',
    location: '',
    size_acres: '',
    farm_type: 'mixed' as const,
    description: '',
  });

  if (!userId) return <Navigate to="/login" replace />;
  if (farms.length > 0) return <Navigate to="/dashboard" replace />;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createFarm({
      name: form.name,
      county: form.county,
      location: form.location || undefined,
      size_acres: parseFloat(form.size_acres) || 0,
      farm_type: form.farm_type,
      description: form.description || undefined,
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success('Farm created successfully!');
      await refreshFarms();
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-600 rounded-2xl mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Farm</h1>
          <p className="text-sm text-slate-500 mt-1">Tell us about your farm to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Farm Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., Kamau Family Farm"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="County"
                value={form.county}
                onChange={(e) => update('county', e.target.value)}
                options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
                placeholder="Select county"
              />
              <div className="relative">
                <Input
                  label="Location"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Specific area"
                />
                <MapPin className="absolute right-3 top-8 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Farm Size (acres)"
                  type="number"
                  value={form.size_acres}
                  onChange={(e) => update('size_acres', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <Ruler className="absolute right-3 top-8 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Select
                  label="Farm Type"
                  value={form.farm_type}
                  onChange={(e) => update('farm_type', e.target.value)}
                  options={[...FARM_TYPES]}
                />
                <Tractor className="absolute right-3 top-8 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <Input
              label="Description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Brief description of your farm (optional)"
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Farm & Get Started
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
