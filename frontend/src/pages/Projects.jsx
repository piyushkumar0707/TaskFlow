import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getAllProjects, getMyProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

function ProjectCard({ project, isAdmin, onClick, onArchive, onDelete }) {
  const isArchived = project.status === 'archived';

  return (
    <div
      className={`group relative card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${isArchived ? 'opacity-60 grayscale-[0.3]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-8">
          <h3 className="text-base font-semibold text-on-surface mb-1 truncate">{project.name}</h3>
          <p className="text-sm text-on-surface-variant line-clamp-2">{project.description || 'No description.'}</p>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Archive/unarchive"
              onClick={(e) => { e.stopPropagation(); onArchive(); }}
            >
              <span className="material-symbols-outlined text-[16px]">{isArchived ? 'unarchive' : 'archive'}</span>
            </button>
            <button
              className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          isArchived ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
        }`}>
          {isArchived ? 'Archived' : 'Active'}
        </span>
        {/* Member avatars */}
        <div className="flex -space-x-2 ml-auto">
          {project.members?.slice(0, 4).map((m) => (
            <div key={m._id} className="w-7 h-7 rounded-full bg-primary-container border-2 border-white flex items-center justify-center text-white text-xs font-bold" title={m.name}>
              {m.name?.charAt(0)?.toUpperCase()}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-xs text-on-surface-variant font-medium">
              +{project.members.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-3">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">group</span>
          <span className="text-xs">{project.members?.length || 0} members</span>
        </div>
        <span className="text-xs text-on-surface-variant">
          {new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = isAdmin ? await getAllProjects() : await getMyProjects();
      setProjects(res.data.data.projects);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSubmitting(true);
    try {
      await createProject(form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (project) => {
    const newStatus = project.status === 'archived' ? 'active' : 'archived';
    try {
      await updateProject(project._id, { status: newStatus });
      toast.success(`Project ${newStatus === 'archived' ? 'archived' : 'unarchived'}`);
      fetchProjects();
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async (project) => {
    if (!confirm(`Delete "${project.name}"? This will also delete all tasks.`)) return;
    try {
      await deleteProject(project._id);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading)
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Projects</h1>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              className="w-64 pl-10 pr-4 h-10 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-outline-variant mb-6">
        {['all', 'active', 'archived'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="folder_open"
          title={search ? 'No matching projects' : 'No projects yet'}
          description={isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects.'}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              isAdmin={isAdmin}
              onClick={() => navigate(`/projects/${p._id}`)}
              onArchive={() => handleArchive(p)}
              onDelete={() => handleDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Project Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Website Redesign Q3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
            <textarea
              className="input-field h-24 resize-none"
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
