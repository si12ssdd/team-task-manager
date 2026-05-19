import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';

function ProjectCard({ project, onDelete, isAdmin }) {
  return (
    <div className="card hover:shadow-md transition-all duration-200 border-gray-200/60 shadow-sm shadow-gray-200/30 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <Link
            to={`/projects/${project._id}`}
            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors tracking-tight"
          >
            {project.title}
          </Link>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-medium">
            {project.description || 'No description'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(project._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete project"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map((member) => (
            <div
              key={member._id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm ring-1 ring-gray-100"
              title={member.name}
            >
              {member.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-100">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{formatDate(project.createdAt)}</span>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ title: '', description: '' });
      toast.success('Project created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-2 font-medium">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm text-blue-500">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 max-w-sm">
            {isAdmin ? 'Get started by creating your first project.' : 'You haven\'t been added to any projects yet.'}
          </p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary mt-6">
              <Plus size={18} className="mr-1" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Create project modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-5 mt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectsPage;
