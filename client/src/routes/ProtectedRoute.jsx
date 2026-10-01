import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0B] flex flex-col items-center justify-center transition-colors duration-200">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full h-24 w-24 animate-pulse"></div>
          <img 
            src="/favicon.png" 
            alt="Loading" 
            className="h-16 w-16 animate-bounce relative z-10 drop-shadow-2xl opacity-90"
          />
        </div>
        <p className="mt-6 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest animate-pulse">
          Authenticating AegisCore...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.isVerified && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-xl text-red-600 dark:text-red-500">Access Denied</div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
