import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
    requireRole?: string;
    requirePermission?: string;
}

/**
 * Route guard. Redirects to /login when no user is signed in,
 * or to /horses when the user lacks the required role/permission.
 */
export const ProtectedRoute = ({ requireRole, requirePermission }: Props) => {
    const user = useAuthStore((s) => s.user);

    if (!user) return <Navigate to="/login" replace />;

    if (requireRole && !user.roles.includes(requireRole)) {
        return <Navigate to="/horses" replace />;
    }
    if (requirePermission && !user.permissions.includes(requirePermission)) {
        return <Navigate to="/horses" replace />;
    }
    return <Outlet />;
};
