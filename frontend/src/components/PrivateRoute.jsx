
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (user.role === 'worker') return <Navigate to="/worker-dashboard" replace />;
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PrivateRoute;
