import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import FIRList from './pages/firs/FIRList';
import CreateFIR from './pages/firs/CreateFIR';
import FIRDetails from './pages/firs/FIRDetails';
import CaseList from './pages/cases/CaseList';
import CreateCase from './pages/cases/CreateCase';
import CaseDetails from './pages/cases/CaseDetails';
import SuspectList from './pages/suspects/SuspectList';
import CreateSuspect from './pages/suspects/CreateSuspect';
import SuspectDetails from './pages/suspects/SuspectDetails';
import NotificationsList from './pages/notifications/NotificationsList';
import MapDashboard from './pages/map/MapDashboard';
import AILogs from './pages/admin/AILogs';
import ProtectedRoute from './routes/ProtectedRoute';
import ThemeToggle from './components/common/ThemeToggle';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
          <ThemeToggle />
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* FIR Routes */}
            <Route path="/firs" element={<ProtectedRoute><FIRList /></ProtectedRoute>} />
            <Route path="/firs/new" element={<ProtectedRoute><CreateFIR /></ProtectedRoute>} />
            <Route path="/firs/:id" element={<ProtectedRoute><FIRDetails /></ProtectedRoute>} />
            
            {/* Case Routes */}
            <Route path="/cases" element={<ProtectedRoute><CaseList /></ProtectedRoute>} />
            <Route path="/cases/new" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />

            {/* Suspect Routes */}
            <Route path="/suspects" element={<ProtectedRoute><SuspectList /></ProtectedRoute>} />
            <Route path="/suspects/new" element={<ProtectedRoute><CreateSuspect /></ProtectedRoute>} />
            <Route path="/suspects/:id" element={<ProtectedRoute><SuspectDetails /></ProtectedRoute>} />

            {/* Notification Routes */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationsList /></ProtectedRoute>} />

            {/* Map Routes */}
            <Route path="/map" element={<ProtectedRoute><MapDashboard /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/ai-logs" element={
              <ProtectedRoute>
                <AILogs />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
