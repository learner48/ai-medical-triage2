import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Video,
  Shield,
  DollarSign,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function HospitalInfo() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Triage',
      description: 'Our advanced AI system pre-screens patients and determines urgency levels, reducing wait times and improving resource allocation.'
    },
    {
      icon: Users,
      title: 'Doctor Management',
      description: 'Easily add and manage clinicians, with automatic case routing based on location and licensing jurisdictions.'
    },
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Secure, HIPAA-compliant video consultations with 20-minute duration for efficient patient care.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliance',
      description: 'Enterprise-grade security and full HIPAA compliance for all patient data and communications.'
    }
  ];

  const pricingTiers = [
    {
      name: 'Basic',
      price: 299,
      description: 'Perfect for small clinics',
      features: [
        '100 triages/month included',
        'Up to 5 clinicians',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      price: 599,
      description: 'Ideal for growing practices',
      features: [
        '300 triages/month included',
        'Up to 15 clinicians',
        'Advanced analytics',
        'Priority support',
        'EHR integration'
      ]
    },
    {
      name: 'Enterprise',
      price: 999,
      description: 'For large healthcare networks',
      features: [
        'Unlimited triages',
        'Unlimited clinicians',
        'Custom analytics',
        '24/7 support',
        'EHR integration',
        'Custom branding'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Transform Your Practice with AI-Powered Triage
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Streamline patient care, reduce wait times, and improve resource allocation with our
                intelligent medical triage platform.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={() => navigate('/super-admin/organizations/new')}
                  className="flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/telehealth.jpg"
                alt="Doctor using telehealth platform"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Comprehensive Healthcare Solution
          </h2>
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

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 rounded-full p-2">
                  <Building2 className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  1. Organization Setup
                </h3>
              </div>
              <p className="text-gray-600">
                Register your organization and configure your settings. Add your clinicians
                and set up their profiles with licensing jurisdictions and practice locations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 rounded-full p-2">
                  <Users className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  2. Doctor Management
                </h3>
              </div>
              <p className="text-gray-600">
                Doctors can set their availability and view cases within their 50-mile radius
                and licensed states. They can claim cases and conduct video consultations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 rounded-full p-2">
                  <MessageSquare className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  3. Patient Care
                </h3>
              </div>
              <p className="text-gray-600">
                Patients interact with AI for initial triage, and doctors receive cases based
                on urgency. Conduct video consultations and manage patient care efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 transition-colors"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-primary-500">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/super-admin/organizations/new')}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">
            Need a custom plan? Contact us for enterprise pricing.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join leading healthcare providers in delivering efficient, AI-powered patient care.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary-500 hover:bg-gray-100"
            onClick={() => navigate('/super-admin/organizations/new')}
          >
            Schedule a Demo
          </Button>
        </div>
      </section>
    </div>
  );
}