import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { User, Mail, Phone, MapPin, Briefcase, Clock, FileText, CheckCircle, Star } from 'lucide-react';
import api from '../api';
import './WorkerProfile.css';
import { useAuth } from '../context/AuthContext';

import EditProfileModal from './EditProfileModal';

const WorkerProfile = () => {
    const { user: authUser } = useAuth();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchProfile = async () => {
        if (!authUser) {
            setLoading(false);
            return;
        }

        try {
            // Fetch basic worker profile (includes rating, skill, etc from WorkerProfile model)
            const res = await api.get('/worker/profile');
            let profile = res.data;

            // Fetch bookings count
            const bookingsRes = await api.get('/bookings/my');
            const completedCount = bookingsRes.data.filter(b => b.status === 'completed').length;

            // Merge data
            setWorker({
                ...profile,
                userId: profile.userId,
                completedJobs: completedCount,
                fullName: profile.userId.name,
                email: profile.userId.email,
                phone: profile.userId.phone || 'N/A',
                currentLocation: profile.city + ', ' + profile.area
            });
        } catch (error) {
            console.error("Error fetching profile", error);
            // If API fails (e.g. profile doesn't exist yet), try to construct basic info from authUser
            if (authUser) {
                setWorker({
                    userId: authUser,
                    fullName: authUser.name,
                    email: authUser.email,
                    phone: authUser.phone,
                    role: authUser.role
                    // Other fields will be undefined, handled by fallback in render
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [authUser]);

    if (loading) return <div>Loading...</div>;

    if (!worker) {
        return (
            <div className="worker-profile-page">
                <Navbar />
                <div className="section" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>Please login as a worker to view this page.</h2>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="worker-profile-page">
            <Navbar />

            <div className="worker-profile-container">
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {worker.fullName ? worker.fullName.charAt(0) : 'W'}
                        </div>
                        <h2>{worker.fullName || 'Worker'}</h2>
                        <p className="profile-role">{worker.skill} Specialist</p>
                        <div className="status-badge">
                            <CheckCircle size={14} /> Verified Professional
                        </div>
                    </div>

                    <div className="contact-info-card">
                        <h3>Contact Information</h3>
                        <div className="info-item">
                            <Mail size={18} />
                            <span>{worker.email}</span>
                        </div>
                        <div className="info-item">
                            <Phone size={18} />
                            <span>{worker.phone}</span>
                        </div>
                        <div className="info-item">
                            <MapPin size={18} />
                            <span>{worker.currentLocation}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="stats-grid">
                        <div className="stat-box">
                            <Star className="stat-icon" size={24} />
                            <div className="stat-content">
                                <h4>{worker.averageRating ? worker.averageRating.toFixed(1) : 'New'}</h4>
                                <p>Rating</p>
                            </div>
                        </div>
                        <div className="stat-box">
                            <Briefcase className="stat-icon" size={24} />
                            <div className="stat-content">
                                <h4>{worker.completedJobs || 0}</h4>
                                <p>Bookings</p>
                            </div>
                        </div>
                        <div className="stat-box">
                            <Clock className="stat-icon" size={24} />
                            <div className="stat-content">
                                <h4>{worker.experience || '0'} yrs</h4>
                                <p>Experience</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>About Me</h3>
                        <p className="description-text">
                            {worker.description || `Hi, I am ${worker.fullName}, a professional ${worker.skill || 'Worker'} with ${worker.experience || '0'} years of experience. I am dedicated to providing high-quality service in ${worker.area || 'your area'}.`}
                        </p>
                    </div>

                    <div className="profile-section">
                        <h3>My Documentation</h3>
                        <div className="docs-grid">
                            <div className="doc-item">
                                <FileText size={24} />
                                <div>
                                    <h5>CNIC Front</h5>
                                    <span>Verified</span>
                                </div>
                            </div>
                            <div className="doc-item">
                                <FileText size={24} />
                                <div>
                                    <h5>CNIC Back</h5>
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-edit-profile" onClick={() => setShowEditModal(true)}>Edit Profile</button>
                        <button className="btn-manage-bookings">Manage Bookings</button>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    worker={worker}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={fetchProfile}
                />
            )}

            <Footer />
        </div>
    );
};

export default WorkerProfile;
