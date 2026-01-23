import { Navigate, Outlet } from 'react-router-dom';
import { api } from '@/lib/api';

interface UserProtectedRouteProps {
    redirectPath?: string;
    children?: React.ReactNode;
}

/**
 * Protects dashboard routes from unauthenticated users.
 * Redirects to /login if no user token is present.
 */
const UserProtectedRoute = ({
    redirectPath = '/login',
    children
}: UserProtectedRouteProps) => {
    if (!api.user.isAuthenticated()) {
        return <Navigate to={redirectPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default UserProtectedRoute;
