import { cn } from '../../lib/utils';

interface CaseStatusBadgeProps {
  status: 'initiated' | 'in_progress' | 'pending_review' | 'assigned' | 'resolved' | 'escalated' | 'cancelled' | 'resumed';
  className?: string;
}

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': status === 'initiated',
          'bg-yellow-100 text-yellow-800': status === 'in_progress',
          'bg-purple-100 text-purple-800': status === 'pending_review',
          'bg-green-100 text-green-800': status === 'assigned',
          'bg-gray-100 text-gray-800': status === 'resolved',
          'bg-red-100 text-red-800': status === 'escalated',
          'bg-gray-100 text-gray-800': status === 'cancelled',
          'bg-blue-100 text-blue-800': status === 'resumed',
        },
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}