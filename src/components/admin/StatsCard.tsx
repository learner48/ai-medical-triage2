import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  iconColor?: string;
}

export function StatsCard({ icon: Icon, title, value, iconColor = 'text-primary-500' }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}