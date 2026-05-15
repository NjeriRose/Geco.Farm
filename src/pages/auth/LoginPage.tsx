import { SignIn } from '@clerk/react';
import { Leaf } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-600 rounded-2xl mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Geco Farm</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your farm</p>
        </div>
        <div className="flex justify-center">
          <SignIn routing="hash" signUpUrl="/register" />
        </div>
      </div>
    </div>
  );
}
