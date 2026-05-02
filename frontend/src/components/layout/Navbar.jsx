import useAuth from '../../hooks/useAuth';

export default function Navbar({ breadcrumb }) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex items-center justify-between px-6 z-40"
      style={{ left: '240px', width: 'calc(100% - 240px)' }}
    >
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-on-surface text-base tracking-tight">TaskFlow</span>
        {breadcrumb && (
          <>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
            <span className="text-on-surface-variant">{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-on-surface leading-none">{user?.name}</p>
            <p className="text-xs text-on-surface-variant mt-0.5 capitalize">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
              }`}>
                {user?.role}
              </span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
