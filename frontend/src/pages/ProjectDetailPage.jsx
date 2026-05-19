import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { ChevronLeft, UserPlus, Plus, X, Edit2, Trash2 } from 'lucide-react';

function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
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

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...taskForm,
        project: id,
        assignedTo: taskForm.assignedTo || null,
        dueDate: taskForm.dueDate || null,
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
        toast.success('Task updated');
      } else {
        const res = await api.post('/tasks', payload);
        setTasks([res.data, ...tasks]);
        toast.success('Task created');
      }

      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      toast.error('Failed to update status');
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
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return <Spinner />;
  if (!project) return null;

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const columns = [
    { key: 'todo', label: 'Todo', tasks: todoTasks, color: 'bg-gray-100/80 border-gray-200/60' },
    { key: 'in-progress', label: 'In Progress', tasks: inProgressTasks, color: 'bg-blue-50/80 border-blue-100/60' },
    { key: 'completed', label: 'Completed', tasks: completedTasks, color: 'bg-green-50/80 border-green-100/60' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-3 transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 mt-2 font-medium max-w-2xl">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary">
              <UserPlus size={18} />
              Add Member
            </button>
            <button onClick={openCreateTask} className="btn-primary">
              <Plus size={18} />
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card mb-8 border-gray-200/60 shadow-sm shadow-gray-200/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Team Members ({project.members?.length})</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-2.5 bg-white border border-gray-200 shadow-sm rounded-full pl-1.5 pr-4 py-1.5"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-xs font-bold text-blue-700">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700">{member.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{member.role}</span>
              {isAdmin && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-all ml-1"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </div>
          ))}
          {project.members?.length === 0 && (
            <p className="text-sm text-gray-500 italic">No members yet</p>
          )}
        </div>
      </div>

      {/* Task board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.key} className={`rounded-2xl p-4 border ${col.color}`}>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide">{col.label}</h3>
              <span className="bg-white shadow-sm border border-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {col.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isAdmin={isAdmin}
                  currentUserId={user._id}
                  onEdit={openEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {col.tasks.length === 0 && (
                <div className="border-2 border-dashed border-gray-300/50 rounded-xl py-6 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-xs font-medium">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-5 mt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Optional details"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select
                className="input-field cursor-pointer"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                className="input-field cursor-pointer"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
            <input
              type="date"
              className="input-field cursor-pointer"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign To</label>
            <select
              className="input-field cursor-pointer"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              {project.members?.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add member modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-5 mt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Member Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="member@example.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <p className="text-xs font-medium text-gray-500 mt-2">The user must already have an account.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TaskCard({ task, isAdmin, currentUserId, onEdit, onDelete, onStatusChange }) {
  const isAssigned = task.assignedTo?._id === currentUserId;
  const canEdit = isAdmin || isAssigned;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 flex-1 leading-snug">{task.title}</p>
        {isAdmin && (
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit Task"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 font-medium">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${overdue ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
            {overdue ? '⚠ ' : ''}DUE {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-[10px] font-bold text-blue-700 shadow-sm">
            {task.assignedTo.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-gray-600">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Status change for assigned member */}
      {canEdit && (
        <div className="mt-3">
          <select
            className="text-xs font-semibold border border-gray-200 bg-gray-50 rounded-lg px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all cursor-pointer shadow-sm text-gray-700"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;
