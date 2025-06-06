import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/auth';
import { 
  Stethoscope, 
  Clock, 
  Shield, 
  MessageSquare,
  ArrowRight,
  Video,
  AlertTriangle
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Symptom Assessment',
      description: 'Advanced AI technology evaluates your symptoms and determines urgency levels in real-time.'
    },
    {
      icon: Video,
      title: 'Secure Video Consultations',
      description: 'Connect with licensed healthcare providers through HIPAA-compliant video calls.'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your health information is protected with enterprise-grade security and HIPAA compliance.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access medical triage assistance anytime, anywhere in the United States.'
    }
  ];

  const urgencyLevels = [
    {
      level: 'Critical',
      color: 'bg-semantic-critical/10 text-semantic-critical',
      icon: AlertTriangle,
      description: 'Immediate emergency care required'
    },
    {
      level: 'High',
      color: 'bg-semantic-high/10 text-semantic-high',
      description: 'Urgent care recommended within hours'
    },
    {
      level: 'Moderate',
      color: 'bg-semantic-moderate/10 text-semantic-moderate',
      description: 'Medical attention needed soon'
    },
    {
      level: 'Low',
      color: 'bg-semantic-low/10 text-semantic-low',
      description: 'Self-care and monitoring advised'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                AI-Powered Medical Triage Assistant
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Get instant medical guidance and connect with healthcare professionals when needed. Our AI system helps assess your symptoms and determine the appropriate level of care.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/triage/start')}
                  className="flex items-center justify-center"
                >
                  Start Symptom Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!user && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="flex items-center justify-center"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="/19727bf7e94b5 (1).png"
                alt="AI Medical Assistant Interface"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Comprehensive Medical Triage Solution
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Advanced technology meets healthcare expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Levels Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Understanding Urgency Levels
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our AI system categorizes symptoms into four urgency levels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {urgencyLevels.map((level, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg ${level.color}`}
              >
                <div className="flex items-center mb-4">
                  {level.icon && <level.icon className="h-6 w-6 mr-2" />}
                  <h3 className="text-lg font-semibold">
                    {level.level} Urgency
                  </h3>
                </div>
                <p className="text-sm">
                  {level.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Stethoscope className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Begin your symptom assessment now and get immediate guidance on your health concerns.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/triage/start')}
            className="bg-white text-primary-500 hover:bg-gray-100"
          >
            Start Triage Assessment
          </Button>
        </div>
      </section>
    </div>
  );
}