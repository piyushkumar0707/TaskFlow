import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getTaskById, updateTask, updateTaskStatus, deleteTask } from '../api/taskApi';
import { getAllUsers } from '../api/userApi';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';

function isOverdue(task) {
  return task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTaskById(id);
        const t = res.data.data.task;
        setTask(t);
        setEditForm({
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.substring(0, 10) : '',
          assigneeId: t.assignee?._id || '',
        });
        if (isAdmin) {
          const usersRes = await getAllUsers();
          setAllUsers(usersRes.data.data.users);
        }
      } catch {
        toast.error('Task not found or access denied');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateTaskStatus(id, newStatus);
      setTask(res.data.data.task);
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateTask(id, { ...editForm, assigneeId: editForm.assigneeId || null, dueDate: editForm.dueDate || null });
      setTask(res.data.data.task);
      toast.success('Task updated!');
      setShowEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task permanently?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      navigate(-1);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!task) return null;

  const canEditStatus = isAdmin || task.assignee?._id === user?._id;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant mb-6">
        <button onClick={() => navigate('/projects')} className="hover:text-primary">Projects</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        {task.project && (
          <>
            <button onClick={() => navigate(`/projects/${task.project._id}`)} className="hover:text-primary">{task.project.name}</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </>
        )}
        <span className="text-on-surface font-medium truncate">{task.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: main content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-on-surface flex-1 pr-4">{task.title}</h1>
              {isAdmin && (
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => setShowEdit(true)}>
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {isOverdue(task) && (
                <span className="inline-flex items-center gap-1 text-xs text-error font-semibold">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Overdue
                </span>
              )}
            </div>

            {/* Status dropdown (for assignee/admin) */}
            {canEditStatus && (
              <div className="mt-5 pt-5 border-t border-outline-variant">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Update Status</label>
                <div className="flex gap-2 flex-wrap">
                  {['todo', 'in_progress', 'done'].map((s) => (
                    <button
                      key={s}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        task.status === s
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      onClick={() => task.status !== s && handleStatusChange(s)}
                    >
                      {s === 'todo' ? 'Todo' : s === 'in_progress' ? 'In Progress' : 'Done'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-3">Description</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="lg:w-72 space-y-4">
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-widest mb-4 pb-2 border-b border-outline-variant">
              Metadata
            </h3>
            <div className="space-y-4">
              {/* Assignee */}
              <div>
                <p className="text-xs text-on-surface-variant mb-1.5">Assignee</p>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                      {task.assignee.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-on-surface">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-on-surface-variant">Unassigned</span>
                )}
              </div>

              {/* Project */}
              <div>
                <p className="text-xs text-on-surface-variant mb-1.5">Project</p>
                {task.project ? (
                  <button className="text-sm text-primary hover:underline flex items-center gap-1" onClick={() => navigate(`/projects/${task.project._id}`)}>
                    <span className="material-symbols-outlined text-[14px]">folder</span>
                    {task.project.name}
                  </button>
                ) : <span className="text-sm text-on-surface-variant">—</span>}
              </div>

              {/* Due Date */}
              <div>
                <p className="text-xs text-on-surface-variant mb-1.5">Due Date</p>
                {task.dueDate ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                    isOverdue(task) ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'
                  }`}>
                    <span className="material-symbols-outlined text-[12px]">{isOverdue(task) ? 'warning' : 'calendar_today'}</span>
                    {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                ) : <span className="text-sm text-on-surface-variant">No due date</span>}
              </div>

              {/* Timestamps */}
              <div className="pt-3 border-t border-outline-variant space-y-1.5">
                <div className="flex justify-between text-xs text-outline">
                  <span>Created</span>
                  <span>{new Date(task.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between text-xs text-outline">
                  <span>Updated</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            {isAdmin && (
              <div className="mt-6 pt-4 border-t border-outline-variant">
                <button className="btn-danger w-full justify-center" onClick={handleDelete}>
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task" size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Title</label>
            <input className="input-field" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
            <textarea className="input-field h-20 resize-none" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Status</label>
              <select className="input-field" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Priority</label>
              <select className="input-field" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Due Date</label>
              <input type="date" className="input-field" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Assignee</label>
              <select className="input-field" value={editForm.assigneeId} onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
