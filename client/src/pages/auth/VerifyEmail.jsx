import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MailCheck, Loader2, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationEmail } = useContext(AuthContext);

  const verificationToken = location.state?.verificationToken;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendMessage, setResendMessage] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!verificationToken) {
      navigate('/login');
    }
  }, [verificationToken, navigate]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await verifyEmail(verificationToken, code);
      // AuthContext will update user, and ProtectedRoute will catch it and redirect to /onboarding if needed
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      setResendMessage('');
      setError('');
      await resendVerificationEmail(verificationToken);
      setResendCooldown(60);
      setResendMessage('A new verification code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!verificationToken) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0A0A0B] dark:to-[#111113] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4">
                <MailCheck className="w-10 h-10 text-indigo-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white text-center">Verify your email</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-center font-medium text-sm">Enter the 6-digit code sent to your email to complete registration.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {resendMessage && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{resendMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-black bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...</>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
                className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>

              <button
                onClick={() => navigate('/login')}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
