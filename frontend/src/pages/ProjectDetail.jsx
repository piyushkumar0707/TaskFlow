import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getProjectById, addMember, removeMember, updateProject } from '../api/projectApi';
import { getTasksByProject, createTask } from '../api/taskApi';
import { getAllUsers } from '../api/userApi';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Forms
  const [selectedUserId, setSelectedUserId] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assigneeId: '' });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const load = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasksByProject(id),
      ]);
      setProject(projRes.data.data.project);
      setTasks(taskRes.data.data.tasks);
      if (isAdmin) {
        const usersRes = await getAllUsers();
        setAllUsers(usersRes.data.data.users);
      }
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error('Please select a user');
    setSubmitting(true);
    try {
      const res = await addMember(id, { userId: selectedUserId });
      setProject(res.data.data.project);
      toast.success('Member added!');
      setShowAddMember(false);
      setSelectedUserId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      const res = await removeMember(id, userId);
      setProject(res.data.data.project);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    setSubmitting(true);
    try {
      const res = await createTask(id, { ...taskForm, assigneeId: taskForm.assigneeId || null, dueDate: taskForm.dueDate || null });
      setTasks((prev) => [res.data.data.task, ...prev]);
      toast.success('Task created!');
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assigneeId: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!project) return null;

  const filteredTasks = tasks.filter((t) => {
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Users not already in project
  const nonMembers = allUsers.filter((u) => !project.members?.some((m) => m._id === u._id));

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-on-surface-variant mb-6">
        <button onClick={() => navigate('/projects')} className="hover:text-primary transition-colors">Projects</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-on-surface">{project.name}</h1>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">{project.description || 'No description.'}</p>
            <p className="text-xs text-outline mt-2">Created by {project.createdBy?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members Panel */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Members ({project.members?.length})</h2>
              {isAdmin && (
                <button className="btn-primary text-xs px-3 py-1.5 h-auto" onClick={() => setShowAddMember(true)}>
                  <span className="material-symbols-outlined text-[14px]">person_add</span>
                  Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {project.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{m.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{m.email}</p>
                  </div>
                  {isAdmin && m._id !== project.createdBy?._id && (
                    <button className="text-error hover:text-on-error-container p-1 rounded transition-colors" onClick={() => handleRemoveMember(m._id)}>
                      <span className="material-symbols-outlined text-[16px]">person_remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Task filters */}
            <div className="p-4 border-b border-outline-variant flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  className="input-field w-auto text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select
                  className="input-field w-auto text-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {isAdmin && (
                <button className="btn-primary" onClick={() => setShowAddTask(true)}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Task
                </button>
              )}
            </div>

            {/* Task list */}
            {filteredTasks.length === 0 ? (
              <EmptyState icon="assignment" title="No tasks found" description={isAdmin ? "Create the first task for this project." : "No tasks assigned to you here."} />
            ) : (
              <div className="divide-y divide-outline-variant">
                {filteredTasks.map((t) => (
                  <div
                    key={t._id}
                    className={`p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors cursor-pointer border-l-4 ${isOverdue(t) ? 'border-l-error' : 'border-l-transparent'}`}
                    onClick={() => navigate(`/tasks/${t._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-on-surface truncate ${t.status === 'done' ? 'line-through opacity-60' : ''}`}>{t.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        {t.assignee && (
                          <span className="text-xs text-on-surface-variant">{t.assignee.name}</span>
                        )}
                        {t.dueDate && (
                          <span className={`text-xs flex items-center gap-0.5 ${isOverdue(t) ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {new Date(t.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Select User</label>
            <select className="input-field" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
              <option value="">— choose a user —</option>
              {nonMembers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {nonMembers.length === 0 && (
              <p className="text-xs text-on-surface-variant mt-2">All users are already members.</p>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowAddMember(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting || nonMembers.length === 0}>
              {submitting ? <Spinner size="sm" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Create Task" size="md">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Title *</label>
            <input className="input-field" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
            <textarea className="input-field h-20 resize-none" placeholder="Task details..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Status</label>
              <select className="input-field" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Priority</label>
              <select className="input-field" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Due Date</label>
              <input type="date" className="input-field" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Assignee</label>
              <select className="input-field" value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowAddTask(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
