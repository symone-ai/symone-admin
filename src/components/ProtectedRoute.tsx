import { Navigate, Outlet } from 'react-router-dom';
import { api } from '@/lib/api';

interface ProtectedRouteProps {
    redirectPath?: string;
    children?: React.ReactNode;
}

const ProtectedRoute = ({ redirectPath = '/admin/login', children }: ProtectedRouteProps) => {
    if (!api.auth.isAuthenticated()) {
        return <Navigate to={redirectPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
