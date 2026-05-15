import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AppLayout() {
  const { user, loading: authLoading } = useAuth();
  const { farms, loading: farmLoading } = useFarm();

  if (authLoading || farmLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (farms.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
