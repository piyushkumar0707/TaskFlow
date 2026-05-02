import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getDashboard } from '../api/dashboardApi';
import Spinner from '../components/common/Spinner';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

function StatCard({ icon, label, value, color = 'bg-indigo-50 text-indigo-700' }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value ?? 0}</p>
        <p className="text-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );

  if (!data)
    return <EmptyState icon="error" title="Failed to load dashboard" description="Please refresh the page." />;

  // ── Admin View ──────────────────────────────────────────────────────────
  if (user?.role === 'admin') {
    const totalTasks = Object.values(data.tasksByStatus).reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Dashboard</h1>
          <p className="text-sm text-on-surface-variant">Welcome back, {user.name} 👋</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon="folder_open" label="Total Projects" value={data.projects?.total} color="bg-indigo-50 text-indigo-700" />
          <StatCard icon="task_alt" label="Total Tasks" value={totalTasks} color="bg-blue-50 text-blue-700" />
          <StatCard icon="schedule" label="Overdue Tasks" value={data.overdueTasks?.length} color="bg-red-50 text-red-700" />
          <StatCard icon="check_circle" label="Completed" value={data.tasksByStatus?.done} color="bg-green-50 text-green-700" />
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          {/* Project Progress */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
              Project Progress
            </h2>
            {data.projectStats?.length === 0 ? (
              <EmptyState icon="folder_open" title="No projects yet" />
            ) : (
              <div className="space-y-4">
                {data.projectStats?.map((ps) => (
                  <div key={ps._id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface truncate max-w-[60%]">{ps.projectName}</span>
                      <span className="text-on-surface-variant font-medium">{Math.round(ps.completionPercent || 0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(ps.completionPercent || 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{ps.doneTasks}/{ps.totalTasks} tasks done</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Tasks */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-error">schedule</span>
              Overdue Tasks
              {data.overdueTasks?.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {data.overdueTasks.length}
                </span>
              )}
            </h2>
            {data.overdueTasks?.length === 0 ? (
              <EmptyState icon="check_circle" title="All caught up!" description="No overdue tasks." />
            ) : (
              <div className="space-y-3">
                {data.overdueTasks.slice(0, 6).map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => navigate(`/tasks/${t._id}`)}
                  >
                    <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{t.title}</p>
                      <p className="text-xs text-on-surface-variant">{t.project?.name}</p>
                    </div>
                    <span className="text-xs text-error font-medium shrink-0">{formatDate(t.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">history</span>
            Recent Activity
          </h2>
          {data.recentActivity?.length === 0 ? (
            <EmptyState icon="history" title="No recent activity" />
          ) : (
            <div className="divide-y divide-outline-variant">
              {data.recentActivity.map((t) => (
                <div
                  key={t._id}
                  className="py-3 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low -mx-6 px-6 transition-colors"
                  onClick={() => navigate(`/tasks/${t._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{t.title}</p>
                    <p className="text-xs text-on-surface-variant">{t.project?.name}</p>
                  </div>
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-outline shrink-0">{timeAgo(t.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Member View ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface mb-1">My Dashboard</h1>
        <p className="text-sm text-on-surface-variant">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="pending_actions" label="Todo" value={data.myTasksByStatus?.todo} color="bg-gray-100 text-gray-700" />
        <StatCard icon="autorenew" label="In Progress" value={data.myTasksByStatus?.in_progress} color="bg-blue-50 text-blue-700" />
        <StatCard icon="check_circle" label="Done" value={data.myTasksByStatus?.done} color="bg-green-50 text-green-700" />
      </div>

      {/* Overdue */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-error">schedule</span>
          My Overdue Tasks
        </h2>
        {data.myOverdueTasks?.length === 0 ? (
          <EmptyState icon="check_circle" title="No overdue tasks!" description="You're all caught up." />
        ) : (
          <div className="space-y-2">
            {data.myOverdueTasks.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100"
                onClick={() => navigate(`/tasks/${t._id}`)}
              >
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{t.title}</p>
                  <p className="text-xs text-on-surface-variant">{t.project?.name}</p>
                </div>
                <span className="text-xs text-error font-medium">{formatDate(t.dueDate)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks by Project */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-on-surface mb-4">My Tasks by Project</h2>
        {data.myTasksByProject?.length === 0 ? (
          <EmptyState icon="folder_open" title="No tasks assigned" description="Ask your admin to assign you tasks." />
        ) : (
          <div className="space-y-4">
            {data.myTasksByProject.map((group) => (
              <div key={group._id}>
                <h3 className="text-sm font-semibold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                  {group.projectName}
                </h3>
                <div className="space-y-1 pl-6">
                  {group.tasks.map((t) => (
                    <div key={t._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low cursor-pointer" onClick={() => navigate(`/tasks/${t._id}`)}>
                      <StatusBadge status={t.status} />
                      <span className="text-sm text-on-surface flex-1 truncate">{t.title}</span>
                      {t.dueDate && <span className="text-xs text-on-surface-variant">{formatDate(t.dueDate)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
