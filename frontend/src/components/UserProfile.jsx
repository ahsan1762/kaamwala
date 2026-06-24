import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { user, login } = useAuth(); // We might need to update context user after save
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || user.fullName,
                email: user.email
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password) {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character");
                return;
            }
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email
            };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const res = await api.put('/auth/profile', updateData);

            // Update local storage and context if returned token/user
            localStorage.setItem('user', JSON.stringify(res.data));
            // Trigger auth change event usually handled by context, but we can just reload or let context sync
            window.dispatchEvent(new Event('auth-change'));

            setMessage('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page-wrapper">
            <Navbar />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {formData.name.charAt(0).toUpperCase()}
                        </div>
                        <h2>My Profile</h2>
                        <p>{user?.role === 'worker' ? 'Worker Account' : 'Customer Account'}</p>
                    </div>

                    <div className="profile-content">
                        {message && <div className="success-message">{message}</div>}
                        {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="profile-form-group">
                                <label>Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" style={{ position: 'absolute', marginTop: '10px', marginLeft: '10px', color: '#666' }} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="profile-input"
                                        style={{ paddingLeft: '35px' }}
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" style={{ position: 'absolute', marginTop: '10px', marginLeft: '10px', color: '#666' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="profile-input"
                                        style={{ paddingLeft: '35px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>
                            <h4 style={{ marginBottom: '15px' }}>Change Password</h4>

                            <div className="profile-form-group">
                                <label>New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" style={{ position: 'absolute', marginTop: '10px', marginLeft: '10px', color: '#666' }} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="profile-input"
                                        style={{ paddingLeft: '35px' }}
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                            </div>

                            <div className="profile-form-group">
                                <label>Confirm New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" style={{ position: 'absolute', marginTop: '10px', marginLeft: '10px', color: '#666' }} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="profile-input"
                                        style={{ paddingLeft: '35px' }}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfile;
