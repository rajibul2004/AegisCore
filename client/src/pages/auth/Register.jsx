import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, User, Key, Users, Loader2, Fingerprint, Eye, EyeOff,ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('public');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, socialLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.verificationRequired) {
        navigate('/verify-email', { state: { verificationToken: res.verificationToken } });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (e) => {
    e.preventDefault();
    // Simulate social login popup and token retrieval
    setIsLoading(true);
    try {
      const provider = e.currentTarget.textContent.trim().toLowerCase();
      // Stub payload for demonstration since real OAuth isn't wired up
      await socialLogin(provider, `${provider}user@example.com`, `Demo ${provider} User`, `social_${Date.now()}`, '', role);
      navigate('/');
    } catch (err) {
      setError('Social authentication failed');
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
        
        <div className="z-10 text-center flex flex-col justify-center items-center px-12 relative">

            <img src="/favicon.png" className="h-32 w-32 rounded-3xl object-contain" alt="AegisCore Logo" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">Confirm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                    </button>
                  </div>
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

          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
            <span className="h-px w-full bg-gray-200 dark:bg-gray-800"></span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={handleSocialLogin}
              className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Google</span>
            </button>
            <button
              onClick={handleSocialLogin}
              className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Facebook</span>
            </button>
          </div>

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
