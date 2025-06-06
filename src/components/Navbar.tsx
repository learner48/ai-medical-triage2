import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationBell } from './ui/notifications/NotificationBell';
import { useAuthStore } from '../store/auth';

export default function Navbar() {
  const { user, signOut } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center">
            <Stethoscope className="h-8 w-8 text-primary-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">MedCare</span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-8">
              <Link to="/hospitals" className="text-gray-700 hover:text-gray-900">
                For Hospitals
              </Link>
              <Link to="/find-doctor" className="text-gray-700 hover:text-gray-900">
                Find a Doctor
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-gray-900">
                Services
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900">
                About Us
              </Link>
            </div>
            
            {user ? (
              <>
                <NotificationBell />
                <Button onClick={() => signOut()}>Sign Out</Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}