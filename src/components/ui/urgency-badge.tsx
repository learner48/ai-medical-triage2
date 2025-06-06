import { cn } from '../../lib/utils';

interface UrgencyBadgeProps {
  level: 'low' | 'moderate' | 'high' | 'critical';
  className?: string;
}

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-semantic-low/10 text-semantic-low': level === 'low',
          'bg-semantic-moderate/10 text-semantic-moderate': level === 'moderate',
          'bg-semantic-high/10 text-semantic-high': level === 'high',
          'bg-semantic-critical/10 text-semantic-critical': level === 'critical',
        },
        className
      )}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} Urgency
    </span>
  );
}