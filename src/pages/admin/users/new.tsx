import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ErrorMessage } from '../../../components/ui/error-message';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'clinician',
    phoneNumber: '',
    primaryPracticeAddress: '',
    licensingJurisdictions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current admin's organization
      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!adminData?.organization_id) {
        throw new Error('Organization not found');
      }

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: formData.email,
            full_name: formData.fullName,
            role: formData.role,
            phone_number: formData.phoneNumber,
            organization_id: adminData.organization_id,
            primary_practice_address_json: formData.role === 'clinician' ? {
              address: formData.primaryPracticeAddress,
              // You would normally geocode this address to get lat/long
              latitude: 0,
              longitude: 0
            } : null,
            licensing_jurisdictions: formData.role === 'clinician' ? 
              formData.licensingJurisdictions.split(',').map(s => s.trim()) : 
              null
          }
        ]);

      if (profileError) throw profileError;

      // TODO: Send email with temporary password

      navigate('/admin/users');
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New User
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="clinician">Clinician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="phoneNumber" 
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {formData.role === 'clinician' && (
              <>
                <div>
                  <label 
                    htmlFor="primaryPracticeAddress" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Primary Practice Address
                  </label>
                  <textarea
                    id="primaryPracticeAddress"
                    value={formData.primaryPracticeAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryPracticeAddress: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label 
                    htmlFor="licensingJurisdictions" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Licensing Jurisdictions (comma-separated state codes)
                  </label>
                  <input
                    type="text"
                    id="licensingJurisdictions"
                    value={formData.licensingJurisdictions}
                    onChange={(e) => setFormData(prev => ({ ...prev, licensingJurisdictions: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="CA, NY, TX"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <ErrorMessage message={error} />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}