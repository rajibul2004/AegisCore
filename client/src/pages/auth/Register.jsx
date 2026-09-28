import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, User, Key, ShieldCheck, Users, Loader2, Fingerprint } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('public');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Side - Premium Branding / Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 items-center justify-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-32 left-32 w-[32rem] h-[32rem] bg-indigo-300 dark:bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-40 dark:opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/2 right-32 w-[32rem] h-[32rem] bg-cyan-300 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-40 dark:opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="z-10 text-center px-12 relative">
          <div className="bg-white/60 dark:bg-white/5 p-8 rounded-[2rem] backdrop-blur-xl border border-gray-200 dark:border-white/10 inline-block mb-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-gray-900/5 dark:ring-white/20">
            <ShieldCheck className="h-24 w-24 text-indigo-600 dark:text-indigo-300 mx-auto" strokeWidth={1} />
          </div>
          <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 drop-shadow-sm dark:drop-shadow-2xl">Apply for Access</h1>
          <p className="text-xl text-gray-600 dark:text-indigo-100/80 max-w-md mx-auto font-light leading-relaxed tracking-wide">Secure your credentials and gain access to the intelligence network.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-[#0A0A0B] p-8 sm:p-12 transition-colors duration-300">
        <div className="w-full max-w-[420px] space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400 font-medium">Enter your details to register for access.</p>
          </div>
          
          {error && (
            <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex items-center animate-in slide-in-from-top-2 fade-in">
              <span className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-sm"
                    placeholder="officer@department.gov"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Modern Role Selection */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">Clearance Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Public Role */}
                  <div
                    onClick={() => setRole('public')}
                    className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 ${
                      role === 'public'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-md ring-1 ring-indigo-600 ring-offset-2 dark:ring-offset-[#0A0A0B]'
                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Users className={`w-5 h-5 mb-2 ${role === 'public' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Public</span>
                  </div>

                  {/* Police Role */}
                  <div
                    onClick={() => setRole('police')}
                    className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 ${
                      role === 'police'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-md ring-1 ring-indigo-600 ring-offset-2 dark:ring-offset-[#0A0A0B]'
                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 mb-2 ${role === 'police' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Police</span>
                  </div>

                  {/* Admin Role */}
                  <div
                    onClick={() => setRole('admin')}
                    className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 ${
                      role === 'admin'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-md ring-1 ring-indigo-600 ring-offset-2 dark:ring-offset-[#0A0A0B]'
                        : 'border-transparent bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Key className={`w-5 h-5 mb-2 ${role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none dark:focus:ring-offset-[#0A0A0B] mt-8"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : 'Submit Application'}
            </button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
