import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, Beef, Wallet, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { Package, ClipboardList, CloudSun, FileText, Settings, LogOut, Leaf, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';

const mainTabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/crops', icon: Sprout, label: 'Crops' },
  { to: '/livestock', icon: Beef, label: 'Livestock' },
  { to: '/finances', icon: Wallet, label: 'Finance' },
];

const moreItems = [
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/weather', icon: CloudSun, label: 'Weather' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {mainTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg min-w-[60px]',
                  isActive ? 'text-green-600' : 'text-slate-500'
                )
              }
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-slate-500 min-w-[60px]"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-up menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-600 rounded-lg">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Geco Farm</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="px-3 py-3 space-y-1">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                      isActive ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="px-3 py-3 border-t border-slate-200">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                  {profile ? getInitials(profile.full_name) : '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                </div>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
