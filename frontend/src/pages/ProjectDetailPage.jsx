import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatDate, isOverdue } from '../utils/dateUtils';

// task card shown inside each kanban column
function TaskCard({ task, isAdmin, myId, onEdit, onDelete, onStatusChange }) {
  const canEdit = isAdmin || task.assignedTo?._id === myId;
  const late = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm group">
      <div className="flex items-start gap-2">
        <p className="text-sm font-medium text-gray-900 flex-1 leading-snug">{task.title}</p>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-blue-500 p-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(task._id)} className="text-gray-400 hover:text-red-500 p-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`text-xs ${late ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {late ? '⚠ ' : ''}{formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
            {task.assignedTo.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{task.assignedTo.name}</span>
        </div>
      )}

      {canEdit && (
        <select
          className="mt-2 w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      )}
    </div>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultTaskForm = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' };
  const [taskForm, setTaskForm] = useState(defaultTaskForm);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`),
    ])
      .then(([projRes, tasksRes]) => {
        setProject(projRes.data);
        setTasks(tasksRes.data);
      })
      .catch(() => {
        toast.error('Could not load project');
        navigate('/projects');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowTaskModal(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setTaskForm(defaultTaskForm);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task needs a title');
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...taskForm,
        project: id,
        assignedTo: taskForm.assignedTo || null,
        dueDate: taskForm.dueDate || null,
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, body);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
        toast.success('Task updated');
      } else {
        const res = await api.post('/tasks', body);
        setTasks([res.data, ...tasks]);
        toast.success('Task added');
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Could not delete task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setSaving(true);
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data);
      setMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this person from the project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
    } catch {
      toast.error('Could not remove member');
    }
  };

  if (loading) return <Spinner />;
  if (!project) return null;

  const columns = [
    { key: 'todo', label: 'To Do', bg: 'bg-gray-50', tasks: tasks.filter((t) => t.status === 'todo') },
    { key: 'in-progress', label: 'In Progress', bg: 'bg-blue-50', tasks: tasks.filter((t) => t.status === 'in-progress') },
    { key: 'completed', label: 'Done', bg: 'bg-green-50', tasks: tasks.filter((t) => t.status === 'completed') },
  ];

  return (
    <div>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm">
              + Add Member
            </button>
            <button onClick={openCreate} className="btn-primary text-sm">
              + Add Task
            </button>
          </div>
        )}
      </div>

      {/* members strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Members ({project.members?.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {project.members?.length === 0 && (
            <p className="text-sm text-gray-400">No members added yet</p>
          )}
          {project.members?.map((m) => (
            <div key={m._id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                {m.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{m.name}</span>
              <span className="text-xs text-gray-400 capitalize">({m.role})</span>
              {isAdmin && (
                <button
                  onClick={() => handleRemoveMember(m._id)}
                  className="text-gray-300 hover:text-red-400 ml-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className={`${col.bg} rounded-xl p-3`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold text-gray-700">{col.label}</span>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isAdmin={isAdmin}
                  myId={user._id}
                  onEdit={openEdit}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {col.tasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* task modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleTaskSave} className="space-y-4 mt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="What needs to be done?"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Any extra details..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input-field" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select className="input-field" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* add member modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4 mt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              className="input-field"
              placeholder="teammate@example.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1.5">They need to have an account already.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectDetailPage;
