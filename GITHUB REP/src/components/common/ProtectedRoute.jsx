import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, token } = useAuthStore();
    const location = useLocation();

    // Check if user is authenticated
    if (!isAuthenticated || !token) {
        // Save the attempted location for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;