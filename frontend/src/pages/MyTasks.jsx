import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyTasks, updateTaskStatus } from '../api/taskApi';
import PriorityBadge from '../components/common/PriorityBadge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getMyTasks()
      .then((res) => setTasks(res.data.data.tasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.data.task : t)));
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filtered = tasks.filter((t) => statusFilter === 'all' || t.status === statusFilter);

  const grouped = filtered.reduce((acc, task) => {
    const key = task.project?._id || 'unassigned';
    const label = task.project?.name || 'Unassigned';
    if (!acc[key]) acc[key] = { label, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const counts = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">My Tasks</h1>
          <div className="flex flex-wrap gap-2">
            {[['todo', 'gray', counts.todo], ['in_progress', 'blue', counts.in_progress], ['done', 'green', counts.done]].map(([s, c, n]) => (
              <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-${c}-50 text-${c}-700 text-xs font-semibold border border-${c}-200`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-${c}-500`} />{n} {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-outline-variant shadow-sm">
          <select className="appearance-none bg-transparent text-sm font-medium text-on-surface focus:ring-0 cursor-pointer outline-none py-1 px-2 border-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon="task_alt" title="No tasks found" description="You have no tasks matching the current filter." />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([key, group]) => (
            <div key={key} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-3 border-l-4 border-l-primary">
                <span className="material-symbols-outlined text-[18px] text-primary">folder</span>
                <h2 className="text-sm font-semibold text-on-surface">{group.label}</h2>
                <span className="ml-auto text-xs text-on-surface-variant font-medium">{group.tasks.length} tasks</span>
              </div>
              <div className="divide-y divide-outline-variant">
                {group.tasks.map((t) => (
                  <div key={t._id} className={`p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors border-l-4 ${isOverdue(t) ? 'border-l-error' : 'border-l-transparent'}`}>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/tasks/${t._id}`)}>
                      <p className={`text-sm font-medium text-on-surface truncate ${t.status === 'done' ? 'line-through opacity-60' : ''}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <PriorityBadge priority={t.priority} />
                        {t.dueDate && (
                          <span className={`text-xs ${isOverdue(t) ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                            {isOverdue(t) ? 'Overdue · ' : ''}{new Date(t.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        className={`appearance-none text-xs font-semibold rounded-lg py-1.5 pl-3 pr-7 border cursor-pointer outline-none ${t.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' : t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
