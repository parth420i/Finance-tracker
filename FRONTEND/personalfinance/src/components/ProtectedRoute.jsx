import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, initialLoading } = useAuth();

    if (initialLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying session...</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;
