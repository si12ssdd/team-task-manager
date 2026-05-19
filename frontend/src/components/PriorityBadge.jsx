import { ArrowDown, Minus, ArrowUp } from 'lucide-react';

const priorityStyles = {
  low: 'bg-gray-50 text-gray-600 border-gray-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const priorityIcons = {
  low: <ArrowDown size={12} className="mr-1" />,
  medium: <Minus size={12} className="mr-1" />,
  high: <ArrowUp size={12} className="mr-1" />,
};

function PriorityBadge({ priority }) {
  const defaultStyle = 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border shadow-sm ${priorityStyles[priority] || defaultStyle}`}>
      {priorityIcons[priority]}
      {priority}
    </span>
  );
}

export default PriorityBadge;
