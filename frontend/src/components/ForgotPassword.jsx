import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Login.css'; // Reusing Login styles for consistency

import toast from 'react-hot-toast';
import api from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Reset link sent!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-bg-overlay"></div>

            <div className="login-card">
                {!submitted ? (
                    <>
                        <div className="login-header">
                            <h1 className="login-title">Forgot Password?</h1>
                            <p className="login-subtitle">Enter your email to receive a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="input-field"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" style={{ marginBottom: '15px' }} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <Link to="/login" className="signup-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'inline-flex', padding: '15px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a', marginBottom: '15px' }}>
                            <CheckCircle size={40} />
                        </div>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>Check your mail</h2>
                        <p style={{ color: '#6b7280', marginBottom: '30px' }}>We have sent a password recover instructions to your email.</p>
                        <Link to="/login">
                            <button className="submit-btn">Back to Login</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
