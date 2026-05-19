import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const statusStyles = {
  todo: 'bg-gray-50 text-gray-700 border-gray-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
};

const statusIcons = {
  todo: <Circle size={12} className="mr-1.5" />,
  'in-progress': <Clock size={12} className="mr-1.5" />,
  completed: <CheckCircle2 size={12} className="mr-1.5" />,
};

const statusLabels = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

function StatusBadge({ status }) {
  const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${statusStyles[status] || defaultStyle}`}>
      {statusIcons[status]}
      {statusLabels[status] || status}
    </span>
  );
}

export default StatusBadge;
