import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../components/Spinner';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { ListTodo, CheckCircle2, Clock, AlertCircle, Inbox } from 'lucide-react';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Here's what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Tasks"
          value={stats?.totalTasks ?? 0}
          color="bg-blue-50/50 border border-blue-100"
          icon={<ListTodo className="text-blue-600" size={28} />}
        />
        <StatCard
          label="Completed"
          value={stats?.completedTasks ?? 0}
          color="bg-green-50/50 border border-green-100"
          icon={<CheckCircle2 className="text-green-600" size={28} />}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingTasks ?? 0}
          color="bg-yellow-50/50 border border-yellow-100"
          icon={<Clock className="text-yellow-600" size={28} />}
        />
        <StatCard
          label="Overdue"
          value={stats?.overdueTasks ?? 0}
          color="bg-red-50/50 border border-red-100"
          icon={<AlertCircle className="text-red-600" size={28} />}
        />
      </div>

      {/* Recent activity */}
      <div className="card border-gray-200/60 shadow-sm shadow-gray-200/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h2>
          <Link to="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
            View all
          </Link>
        </div>

        {stats?.recentActivity?.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Inbox className="text-gray-400" size={32} />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No recent activity</h3>
            <p className="text-gray-500 text-sm max-w-sm">You're all caught up! Create a project or a new task to get started.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {stats?.recentActivity?.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{task.project?.title}</span>
                    {task.dueDate && (
                      <span className={isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-500 font-semibold' : 'text-gray-400'}>
                        • Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
