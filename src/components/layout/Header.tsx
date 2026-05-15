import { Bell, Leaf } from 'lucide-react';
import { useFarm } from '../../contexts/FarmContext';

export function Header() {
  const { activeFarm } = useFarm();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-600 rounded-lg">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Geco Farm</p>
            {activeFarm && (
              <p className="text-xs text-slate-500">{activeFarm.name}</p>
            )}
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 relative">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </header>
  );
}
