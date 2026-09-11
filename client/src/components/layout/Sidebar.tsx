import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Briefcase,
  Activity,
  Bell,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { RoleBadge } from '../ui/Badge';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clients', label: 'Clients', icon: Briefcase },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/activity', label: 'Activity Feed', icon: Activity },
  ];

  const pmLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const devLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const links =
    user.role === 'ADMIN'
      ? adminLinks
      : user.role === 'PROJECT_MANAGER'
      ? pmLinks
      : devLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-gray-300 flex flex-col z-30 shadow-xl border-r border-gray-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-800">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">ProjectPulse</h1>
          <p className="text-xs text-indigo-400 font-medium">ProjectHub</p>
        </div>
      </div>

      {/* User Info Capsule */}
      <div className="px-6 py-4 border-b border-gray-800/80 bg-gray-950/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-semibold text-sm border border-indigo-500/30">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <div className="mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        ProjectPulse v1.0.0 &bull; Agency Hub
      </div>
    </aside>
  );
}

