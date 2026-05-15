import { useState } from 'react';
import { User, MapPin, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import { useFarms } from '../../hooks/useFarms';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { KENYAN_COUNTIES, FARM_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const { activeFarm, refreshFarms } = useFarm();
  const { updateFarm, loading: farmLoading } = useFarms();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    county: profile?.county ?? '',
  });

  const [farmForm, setFarmForm] = useState({
    name: activeFarm?.name ?? '',
    county: activeFarm?.county ?? '',
    location: activeFarm?.location ?? '',
    size_acres: String(activeFarm?.size_acres ?? ''),
    farm_type: activeFarm?.farm_type ?? 'mixed',
    latitude: activeFarm?.latitude ? String(activeFarm.latitude) : '',
    longitude: activeFarm?.longitude ? String(activeFarm.longitude) : '',
    description: activeFarm?.description ?? '',
  });

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await updateProfile({
      full_name: profileForm.full_name,
      phone: profileForm.phone || null,
      county: profileForm.county || null,
    });
    if (error) toast.error(error);
    else toast.success('Profile updated');
  }

  async function handleFarmSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activeFarm) return;
    const { error } = await updateFarm(activeFarm.id, {
      name: farmForm.name,
      county: farmForm.county,
      location: farmForm.location || null,
      size_acres: parseFloat(farmForm.size_acres) || 0,
      farm_type: farmForm.farm_type as 'crop' | 'livestock' | 'mixed' | 'aquaculture',
      latitude: parseFloat(farmForm.latitude) || null,
      longitude: parseFloat(farmForm.longitude) || null,
      description: farmForm.description || null,
    });
    if (error) toast.error(error);
    else {
      toast.success('Farm details updated');
      await refreshFarms();
    }
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'farm', label: 'Farm Details' },
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile and farm" />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'profile' && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Your Profile</h3>
                <p className="text-xs text-slate-500">Update your personal information</p>
              </div>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
              <Input label="Full Name" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} required />
              <Input label="Phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+254 7XX XXX XXX" />
              <Select label="County" value={profileForm.county} onChange={(e) => setProfileForm({ ...profileForm, county: e.target.value })}
                options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))} placeholder="Select county" />
              <Button type="submit" size="md">
                <Save className="h-4 w-4" /> Save Profile
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'farm' && activeFarm && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Farm Details</h3>
                <p className="text-xs text-slate-500">Update your farm information and GPS coordinates</p>
              </div>
            </div>
            <form onSubmit={handleFarmSave} className="space-y-4 max-w-lg">
              <Input label="Farm Name" value={farmForm.name} onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="County" value={farmForm.county} onChange={(e) => setFarmForm({ ...farmForm, county: e.target.value })}
                  options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))} placeholder="Select county" />
                <Input label="Location" value={farmForm.location} onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })} placeholder="Specific area" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Size (acres)" type="number" value={farmForm.size_acres} onChange={(e) => setFarmForm({ ...farmForm, size_acres: e.target.value })} min="0" step="0.1" />
                <Select label="Farm Type" value={farmForm.farm_type} onChange={(e) => setFarmForm({ ...farmForm, farm_type: e.target.value })} options={[...FARM_TYPES]} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Latitude" type="number" value={farmForm.latitude} onChange={(e) => setFarmForm({ ...farmForm, latitude: e.target.value })}
                  step="0.0001" placeholder="-1.2921" helperText="For weather data" />
                <Input label="Longitude" type="number" value={farmForm.longitude} onChange={(e) => setFarmForm({ ...farmForm, longitude: e.target.value })}
                  step="0.0001" placeholder="36.8219" helperText="For weather data" />
              </div>
              <Input label="Description" value={farmForm.description} onChange={(e) => setFarmForm({ ...farmForm, description: e.target.value })} />
              <Button type="submit" loading={farmLoading}>
                <Save className="h-4 w-4" /> Save Farm Details
              </Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
