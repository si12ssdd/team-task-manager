import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Spinner from '../components/Spinner';
import { formatDate, isOverdue } from '../utils/dateUtils';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('dashboard fetch failed', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const firstName = user?.name?.split(' ')[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hey, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's a quick look at what's going on.</p>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalTasks ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">tasks</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Done</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.completedTasks ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">completed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.pendingTasks ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">in progress or todo</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-red-500 uppercase tracking-wide mb-1">Overdue</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.overdueTasks ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">past due date</p>
        </div>
      </div>

      {/* recent tasks */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
            See all
          </Link>
        </div>

        {!stats?.recentActivity?.length ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Nothing here yet. Create a project to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentActivity.map((task) => {
              const late = isOverdue(task.dueDate) && task.status !== 'completed';
              return (
                <div key={task._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {task.project?.title}
                      {task.dueDate && (
                        <span className={late ? ' text-red-500 font-medium' : ''}>
                          {' · '}{late ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
