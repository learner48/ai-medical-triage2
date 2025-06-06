import { Link } from 'react-router-dom';
import { Stethoscope, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">MedCare</span>
            </div>
            <p className="mt-4 text-gray-600">
              Connecting you to better health outcomes through AI-powered medical triage.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/find-doctor" className="text-gray-600 hover:text-gray-900">Find a Doctor</Link></li>
              <li><Link to="/triage/start" className="text-gray-600 hover:text-gray-900">Start Triage</Link></li>
              <li><Link to="/emergency" className="text-gray-600 hover:text-gray-900">Emergency Care</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase">About Us</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">Our Story</Link></li>
              <li><Link to="/team" className="text-gray-600 hover:text-gray-900">Team</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase">Connect</h3>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} MedCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}