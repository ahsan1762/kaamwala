import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api';
import './Login.css'; // Reusing login styles for container

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                if (res.data.success) {
                    setStatus('success');
                    setMessage(res.data.message);
                } else {
                    setStatus('error');
                    setMessage(res.data.message || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token]);

    return (
        <div className="login-container">
            <div className="login-bg-overlay"></div>
            <div className="login-card" style={{ textAlign: 'center' }}>
                <div className="login-header">
                    <div className="login-icon">
                        {status === 'verifying' && <Loader size={40} className="spin" color="#07614A" />}
                        {status === 'success' && <CheckCircle size={40} color="#07614A" />}
                        {status === 'error' && <XCircle size={40} color="#EF4444" />}
                    </div>
                    <h1 className="login-title">
                        {status === 'verifying' ? 'Verifying Email...' :
                            status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                    </h1>
                    <p className="login-subtitle">{message}</p>
                </div>

                {status !== 'verifying' && (
                    <div style={{ marginTop: '20px' }}>
                        <Link to="/login">
                            <button className="submit-btn">Go to Login</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
