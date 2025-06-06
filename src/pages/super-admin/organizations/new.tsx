import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ErrorMessage } from '../../../components/ui/error-message';
import { ArrowLeft, Building2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function AddOrganization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    description: '',
    mainAddress: '',
    phoneNumber: '',
    emergencyContact: '',
    websiteUrl: '',
    bookingUrl: '',
    specialtiesSupported: '',
    operatingHours: JSON.stringify({
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' }
    }, null, 2),
    adminEmail: '',
    adminFullName: '',
    adminPhoneNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate a temporary password for the admin
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create organization with pending status
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            name: formData.name,
            type: formData.type,
            description: formData.description,
            main_address_json: {
              address: formData.mainAddress,
              // You would normally geocode this address
              latitude: 0,
              longitude: 0
            },
            phone_number: formData.phoneNumber,
            emergency_contact: formData.emergencyContact,
            website_url: formData.websiteUrl,
            booking_url: formData.bookingUrl,
            specialties_supported: formData.specialtiesSupported.split(',').map(s => s.trim()),
            operating_hours_json: JSON.parse(formData.operatingHours),
            approval_status: 'pending' // Set initial approval status
          }
        ])
        .select()
        .single();

      if (orgError) throw orgError;

      // Create admin user (initially inactive)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.adminFullName,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;

      // Create admin profile (initially inactive and unapproved)
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: formData.adminEmail,
            full_name: formData.adminFullName,
            phone_number: formData.adminPhoneNumber,
            role: 'admin',
            organization_id: orgData.id,
            is_active: false,
            is_approved: false
          }
        ]);

      if (profileError) throw profileError;

      // Create notification for super admins
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            recipient_user_id: (await supabase.auth.getUser()).data.user?.id,
            notification_type: 'in_app',
            message_content: `New organization "${formData.name}" requires approval`,
            related_entity_type: 'organization',
            related_entity_id: orgData.id,
            status: 'pending'
          }
        ]);

      if (notifError) throw notifError;

      // TODO: Send email with temporary password to admin (once approved)

      navigate('/super-admin/organizations');
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/super-admin/organizations')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Organizations
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Building2 className="h-8 w-8 text-primary-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Organization
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Organization Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="practice">Medical Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Main Address
                  </label>
                  <textarea
                    value={formData.mainAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainAddress: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Online Presence
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Booking URL
                  </label>
                  <input
                    type="url"
                    value={formData.bookingUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bookingUrl: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Practice Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Practice Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Specialties Supported (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.specialtiesSupported}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialtiesSupported: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Cardiology, Orthopedics, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Operating Hours (JSON)
                  </label>
                  <textarea
                    value={formData.operatingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                    rows={8}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Admin Account */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Administrator Account
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.adminFullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminFullName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.adminPhoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminPhoneNumber: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <ErrorMessage message={error} />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/super-admin/organizations')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}