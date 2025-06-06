import { AlertTriangle, MapPin, Phone, Clock } from 'lucide-react';
import { Button } from './button';
import type { TriageSession } from '../../types';

interface EmergencyRecommendationsProps {
  session: TriageSession;
  onClose?: () => void;
}

export function EmergencyRecommendations({ session, onClose }: EmergencyRecommendationsProps) {
  const getRecommendationContent = () => {
    switch (session.urgency_level) {
      case 'critical':
        return {
          title: 'Emergency Care Required',
          description: 'Please go to the nearest Emergency Room immediately.',
          icon: AlertTriangle,
          iconColor: 'text-semantic-critical',
          bgColor: 'bg-semantic-critical/10',
          actions: [
            {
              label: 'Find Nearest ER',
              icon: MapPin,
              onClick: () => {
                const { latitude, longitude } = session.patient_current_location_json;
                window.open(
                  `https://www.google.com/maps/search/emergency+room/@${latitude},${longitude},13z`,
                  '_blank'
                );
              },
            },
            {
              label: 'Call 911',
              icon: Phone,
              onClick: () => {
                window.location.href = 'tel:911';
              },
            },
          ],
        };
      case 'high':
        return {
          title: 'Urgent Care Recommended',
          description: 'Visit an urgent care center within the next few hours.',
          icon: Clock,
          iconColor: 'text-semantic-high',
          bgColor: 'bg-semantic-high/10',
          actions: [
            {
              label: 'Find Urgent Care',
              icon: MapPin,
              onClick: () => {
                const { latitude, longitude } = session.patient_current_location_json;
                window.open(
                  `https://www.google.com/maps/search/urgent+care/@${latitude},${longitude},13z`,
                  '_blank'
                );
              },
            },
          ],
        };
      case 'moderate':
        return {
          title: 'Schedule an Appointment',
          description: 'Book a consultation with a healthcare provider soon.',
          icon: Clock,
          iconColor: 'text-semantic-moderate',
          bgColor: 'bg-semantic-moderate/10',
          actions: [
            {
              label: 'Find Healthcare Provider',
              icon: MapPin,
              onClick: () => {
                const { latitude, longitude } = session.patient_current_location_json;
                window.open(
                  `https://www.google.com/maps/search/doctor/@${latitude},${longitude},13z`,
                  '_blank'
                );
              },
            },
          ],
        };
      default:
        return {
          title: 'Self Care Advised',
          description: 'Monitor your symptoms and practice self-care.',
          icon: Clock,
          iconColor: 'text-semantic-low',
          bgColor: 'bg-semantic-low/10',
          actions: [],
        };
    }
  };

  const content = getRecommendationContent();

  return (
    <div className={`rounded-lg p-4 ${content.bgColor}`}>
      <div className="flex items-start">
        <div className={`${content.iconColor} mr-3`}>
          <content.icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
          {content.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={action.onClick}
                  className="flex items-center"
                >
                  <action.icon className="mr-1.5 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}