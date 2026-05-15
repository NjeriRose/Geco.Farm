import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { KENYAN_COUNTIES } from '../../lib/constants';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const { user, signUp } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', county: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.full_name,
      phone: form.phone || undefined,
      county: form.county || undefined,
    });
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Please check your email to verify.');
    }
    setLoading(false);
  }

  const countyOptions = KENYAN_COUNTIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-600 rounded-2xl mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-sm text-slate-500 mt-1">Start managing your farm today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder="John Kamau"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+254 7XX XXX XXX"
              helperText="Optional — for M-Pesa notifications"
            />
            <Select
              label="County"
              value={form.county}
              onChange={(e) => update('county', e.target.value)}
              options={countyOptions}
              placeholder="Select your county"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Minimum 6 characters"
              required
              helperText="At least 6 characters"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
