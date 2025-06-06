import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingSpinner } from './components/ui/loading-spinner';

const Home = lazy(() => import('./pages/Home'));
const HospitalInfo = lazy(() => import('./pages/HospitalInfo'));
const Login = lazy(() => import('./pages/auth/login'));
const Register = lazy(() => import('./pages/auth/register'));
const TriageStart = lazy(() => import('./pages/triage/start'));
const TriageLocation = lazy(() => import('./pages/triage/location'));
const TriageChat = lazy(() => import('./pages/triage/chat'));
const ClinicianDashboard = lazy(() => import('./pages/clinician/dashboard'));
const CaseList = lazy(() => import('./pages/clinician/case-list'));
const CaseDetail = lazy(() => import('./pages/clinician/case-detail'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/users'));
const AddUser = lazy(() => import('./pages/admin/users/new'));
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/Dashboard'));
const OrganizationManagement = lazy(() => import('./pages/super-admin/organizations'));
const AddOrganization = lazy(() => import('./pages/super-admin/organizations/new'));
const GlobalSettings = lazy(() => import('./pages/super-admin/settings'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hospitals" element={<HospitalInfo />} />
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Register />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/triage/start" element={<TriageStart />} />
                <Route path="/triage/location" element={<TriageLocation />} />
                <Route 
                  path="/triage/chat" 
                  element={
                    <ProtectedRoute>
                      <TriageChat />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/clinician"
                  element={
                    <ProtectedRoute>
                      <ClinicianDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clinician/cases"
                  element={
                    <ProtectedRoute>
                      <CaseList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clinician/cases/:id"
                  element={
                    <ProtectedRoute>
                      <CaseDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/new"
                  element={
                    <ProtectedRoute>
                      <AddUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/organizations"
                  element={
                    <ProtectedRoute>
                      <OrganizationManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/organizations/new"
                  element={
                    <ProtectedRoute>
                      <AddOrganization />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/settings"
                  element={
                    <ProtectedRoute>
                      <GlobalSettings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;