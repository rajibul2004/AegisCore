import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import PoliceDashboard from './PoliceDashboard';
import PublicDashboard from './PublicDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  // Render the correct dashboard content based on role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'police':
        return <PoliceDashboard />;
      case 'public':
      default:
        return <PublicDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default DashboardRouter;
