import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';

function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => toast.error('Could not load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Give the project a name');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/projects', { title, description });
      setProjects([res.data, ...projects]);
      setShowCreate(false);
      setTitle('');
      setDescription('');
      toast.success('Project created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This will also delete all tasks in this project. Continue?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium text-gray-500">No projects yet</p>
          <p className="text-sm mt-1">
            {isAdmin ? 'Create one to get started.' : "You haven't been added to any projects."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow group">
              <div className="flex items-start justify-between">
                <Link
                  to={`/projects/${project._id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-base leading-snug"
                >
                  {project.title}
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors ml-2 opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {project.description && (
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{project.description}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex -space-x-1.5">
                  {project.members?.slice(0, 5).map((m) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-700"
                    >
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                      +{project.members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4 mt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectsPage;
