import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
                <AlertTriangle size={80} color="#FFBB28" style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>404</h1>
                <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Page Not Found</h2>
                <p style={{ color: '#666', maxWidth: '400px', marginBottom: '30px' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/home" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#07614A', color: 'white', padding: '12px 24px',
                    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
                }}>
                    <Home size={18} /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
