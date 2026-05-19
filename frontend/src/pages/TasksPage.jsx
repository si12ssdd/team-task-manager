import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { Search, Trash2, Inbox } from 'lucide-react';

const statusOptions = ['all', 'todo', 'in-progress', 'completed'];
const priorityOptions = ['all', 'low', 'medium', 'high'];

function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const filtered = tasks.filter((task) => {
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchSearch =
      !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.project?.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  if (loading) return <Spinner />;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
        <p className="text-gray-500 mt-2 font-medium">
          {isAdmin ? 'All tasks across your projects' : 'Tasks assigned to you'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Status' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="input-field w-auto min-w-[140px]"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Task table */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
            <Inbox className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No tasks found</h3>
          <p className="text-gray-500 max-w-sm">We couldn't find any tasks matching your current filters.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden border-gray-200/60 shadow-sm shadow-gray-200/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Task</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Project</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Assigned To</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Priority</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Due Date</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 tracking-wide">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((task) => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                  const canChangeStatus = isAdmin || task.assignedTo?._id === user._id;

                  return (
                    <tr key={task._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{task.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-medium">
                          {task.project?.title || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm">
                              {task.assignedTo.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-700 font-medium">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <span className={`font-medium ${overdue ? 'text-red-600 bg-red-50 px-2 py-1 rounded-md' : 'text-gray-600'}`}>
                            {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {canChangeStatus ? (
                          <select
                            className="text-sm font-medium border border-gray-200 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                          >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <StatusBadge status={task.status} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Task"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
