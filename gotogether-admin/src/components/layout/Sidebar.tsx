import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, AlertTriangle, MessageSquare, LineChart, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';

const links = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Rides', path: '/admin/rides', icon: Car },
  { name: 'SOS Alerts', path: '/admin/sos', icon: AlertTriangle },
  { name: 'Complaints', path: '/admin/complaints', icon: MessageSquare },
  { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight">GoTogether<span className="text-blue-500">Admin</span></h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
