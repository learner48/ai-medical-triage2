import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface QuickActionCardProps {
  title: string;
  primaryAction: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function QuickActionCard({ title, primaryAction, secondaryAction }: QuickActionCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        <Button
          onClick={primaryAction.onClick}
          className="w-full flex items-center justify-center"
        >
          <primaryAction.icon className="h-5 w-5 mr-2" />
          {primaryAction.label}
        </Button>
        {secondaryAction && (
          <Button
            variant="secondary"
            onClick={secondaryAction.onClick}
            className="w-full flex items-center justify-center"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}