import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Clock, Users, AlertTriangle, List, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ClinicianDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeCases: 0,
    criticalCases: 0,
    totalPatients: 0,
    completedConsultations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: activeCases } = await supabase
        .from('triage_sessions')
        .select('id, urgency_level')
        .in('status', ['initiated', 'in_progress', 'pending_review']);

      const { data: consultations } = await supabase
        .from('video_consultations')
        .select('id')
        .eq('status', 'completed');

      setStats({
        activeCases: activeCases?.length || 0,
        criticalCases: activeCases?.filter(c => c.urgency_level === 'critical').length || 0,
        totalPatients: new Set(activeCases?.map(c => c.patient_id)).size,
        completedConsultations: consultations?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Clinician Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your cases and consultations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeCases}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-semantic-critical" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.criticalCases}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-semantic-moderate" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-semantic-high" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Consultations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.completedConsultations}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/clinician/cases')}
                className="w-full flex items-center justify-center"
              >
                <List className="h-5 w-5 mr-2" />
                View All Cases
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/clinician/availability')}
                className="w-full flex items-center justify-center"
              >
                <Clock className="h-5 w-5 mr-2" />
                Manage Availability
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-gray-500 text-center py-8">
              Activity feed coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}