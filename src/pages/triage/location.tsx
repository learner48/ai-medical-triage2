import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { MapPin } from 'lucide-react';

export default function TriageLocation() {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!zipCode || !city || !state) {
      setError('Please fill in all location fields');
      return;
    }

    // Basic US ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid US ZIP code');
      return;
    }

    const location = {
      zip_code: zipCode,
      city,
      state,
      country: 'US',
      timestamp: new Date().toISOString()
    };

    navigate('/triage/chat', { 
      state: { 
        location,
        manuallyEntered: true
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-r from-blue-50 to-blue-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="h-8 w-8 text-primary-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Enter Your Location
          </h1>
          
          <p className="text-gray-600 text-center mb-8">
            We need your location to connect you with nearby healthcare providers
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="12345"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter state (e.g., CA)"
              />
            </div>

            {error && (
              <p className="text-semantic-critical text-sm mt-2">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Continue to Triage
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}