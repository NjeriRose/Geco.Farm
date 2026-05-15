import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
      toast.success('Reset link sent to your email');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-600 rounded-2xl mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600 mb-4">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
              </p>
              <Button onClick={() => setSent(false)} variant="secondary" className="w-full">
                Send again
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
