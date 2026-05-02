import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const navLinks = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/projects', icon: 'folder_open', label: 'Projects' },
  { to: '/tasks/mine', icon: 'task_alt', label: 'My Tasks' },
];

const adminLinks = [
  { to: '/admin/users', icon: 'group', label: 'Users' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-[18px]">task_alt</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-base tracking-tight">TaskFlow</h1>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            {user?.role === 'admin' ? 'Admin Console' : 'Member View'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Admin
              </p>
            </div>
            {adminLinks.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User profile + logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
