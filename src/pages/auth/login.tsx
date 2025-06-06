import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-r from-blue-50 to-blue-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <p className="text-semantic-critical text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary-500 hover:text-primary-600"
              >
                Register
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}