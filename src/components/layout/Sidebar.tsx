import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, Beef, Package, Wallet, ClipboardList,
  CloudSun, FileText, Settings, ChevronDown, LogOut, Leaf,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crops', icon: Sprout, label: 'Crops' },
  { to: '/livestock', icon: Beef, label: 'Livestock' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/finances', icon: Wallet, label: 'Finances' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/weather', icon: CloudSun, label: 'Weather' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const { farms, activeFarm, setActiveFarm } = useFarm();
  const [farmDropdown, setFarmDropdown] = useState(false);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-600 rounded-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Geco Farm</span>
        </div>
      </div>

      {/* Farm selector */}
      {activeFarm && (
        <div className="px-3 py-3 border-b border-slate-200">
          <div className="relative">
            <button
              onClick={() => setFarmDropdown(!farmDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors min-h-[44px]"
            >
              <span className="truncate">{activeFarm.name}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>
            {farmDropdown && farms.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    onClick={() => { setActiveFarm(farm); setFarmDropdown(false); }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg',
                      farm.id === activeFarm.id && 'bg-green-50 text-green-700 font-medium'
                    )}
                  >
                    {farm.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
            {profile ? getInitials(profile.full_name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile?.role}</p>
          </div>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-slate-100" title="Sign out">
            <LogOut className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
