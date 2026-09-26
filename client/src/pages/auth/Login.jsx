import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, Loader2, Fingerprint } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Left Side - Branding / Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-gray-900 to-black items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="z-10 text-center px-12">
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 inline-block mb-8 shadow-2xl">
            <Fingerprint className="h-20 w-20 text-blue-400 mx-auto" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">Case<span className="text-blue-500">Intel</span></h1>
          <p className="text-lg text-blue-200 max-w-md mx-auto font-medium">Next-generation AI-powered crime investigation and case management system.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8 sm:p-12 transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please sign in to your account to continue.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    placeholder="officer@department.gov"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
