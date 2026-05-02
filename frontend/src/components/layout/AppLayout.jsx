import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const BREADCRUMBS = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks/mine': 'My Tasks',
  '/admin/users': 'Users',
};

export default function AppLayout() {
  const { pathname } = useLocation();

  // Determine breadcrumb
  const breadcrumb =
    BREADCRUMBS[pathname] ||
    (pathname.startsWith('/projects/') ? 'Project Detail' : null) ||
    (pathname.startsWith('/tasks/') ? 'Task Detail' : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Navbar breadcrumb={breadcrumb} />
        <main className="flex-1 mt-16 p-6 max-w-[1280px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
