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
import ProtectedRoute from './routes/ProtectedRoute';
import ThemeToggle from './components/common/ThemeToggle';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* ThemeToggle is placed outside Routes so it is visible on all pages */}
          <ThemeToggle />
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/firs" element={<ProtectedRoute><FIRList /></ProtectedRoute>} />
            <Route path="/firs/new" element={<ProtectedRoute><CreateFIR /></ProtectedRoute>} />
            <Route path="/firs/:id" element={<ProtectedRoute><FIRDetails /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
