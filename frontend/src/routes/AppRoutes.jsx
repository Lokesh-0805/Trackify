import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import GiveFeedback from '../pages/GiveFeedback';
import FeedbackHistory from '../pages/FeedbackHistory';
import HRDashboard from '../pages/HRDashboard';
import FeedbackFormPlaceholder from '../pages/FeedbackFormPlaceholder';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/give-feedback" element={<GiveFeedback />} />
          <Route path="/feedback-history" element={<FeedbackHistory />} />
          <Route path="/employee/feedback/:assignmentId" element={<FeedbackFormPlaceholder />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
          <Route path="/hr" element={<HRDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
