import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import { User, Mail, Phone, MapPin, Briefcase, Clock, FileText, CheckCircle, Star } from 'lucide-react';
import './WorkerProfile.css';

const PublicWorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [reviews, setReviews] = useState([]); // New state
    const [loading, setLoading] = useState(true);

    if (!id || id === 'undefined') {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Invalid Worker ID. Please go back and try again.</div>;
    }

    useEffect(() => {
        const fetchWorkerAndReviews = async () => {
            try {
                const [workerRes, reviewsRes] = await Promise.all([
                    api.get(`/workers/${id}`),
                    api.get(`/reviews/worker/${id}`) // This should now work if worker.userId is correct? Wait, review uses worker's USER ID or WORKER ID?
                    // Controller createReview uses booking.workerId (which is the User ID of the worker in booking model context? Let's check Booking model)
                    // Assuming booking.workerId is the UserID of the worker.
                ]);

                // Oops, review route logic used workerId field in Review.
                // Review model: workerId (User ID). Route /worker/:workerId.
                // But wait, the URL param :id for PublicWorkerProfile is also UserID (from Services.jsx navigate(`/worker/${provider.userId}`)).
                // So passing `id` should be correct.

                setWorker(workerRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkerAndReviews();
    }, [id]);

    if (loading) return <div>Loading profile...</div>;
    // ...
    // ... inside return ...
    <div className="profile-section">
        <h3>Customer Reviews ({reviews.length})</h3>
        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map(review => (
                <div key={review._id} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ fontSize: '14px' }}>{review.customerId?.name || 'Customer'}</strong>
                        <div style={{ display: 'flex' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "#eab308" : "none"} stroke="#eab308" />
                            ))}
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{review.comment}</p>
                    <span style={{ fontSize: '11px', color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
    </div>
    if (!worker) return <div>Worker not found</div>;

    // Use worker data properly. Note: backend populates userId
    const name = worker.userId?.name || "Worker";
    const email = worker.userId?.email || "";

    return (
        <div className="worker-profile-page">
            <Navbar />

            <div className="worker-profile-container">
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {worker.profilePic ? (
                                <img src={worker.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : name.charAt(0)}
                        </div>
                        <h2>{name}</h2>
                        <p className="profile-role">{worker.skill} Specialist</p>
                        <div className="status-badge">
                            <CheckCircle size={14} /> Verified Professional
                        </div>
                    </div>

                    <div className="contact-info-card">
                        <h3>Contact Information</h3>
                        <div className="info-item">
                            <Mail size={18} />
                            <span>{email}</span>
                        </div>
                        <div className="info-item">
                            <Phone size={18} />
                            <span>{worker.phone}</span>
                        </div>
                        <div className="info-item">
                            <MapPin size={18} />
                            <span>{worker.city}, {worker.area}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="stats-grid">
                        <div className="stat-box">
                            <Star className="stat-icon" size={24} />
                            <div className="stat-content">
                                <h4>{worker.averageRating || 'New'}</h4>
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
                            {worker.description || `Hi, I am ${name}, a professional ${worker.skill || 'Worker'} with ${worker.experience || '0'} years of experience. I am dedicated to providing high-quality service in ${worker.area || 'your area'}.`}
                        </p>
                    </div>

                    <div className="profile-section">
                        <h3>Verified Documents</h3>
                        <div className="docs-grid">
                            <div className="doc-item">
                                <FileText size={24} />
                                <div>
                                    <h5>ID Verification</h5>
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Customer Reviews ({reviews.length})</h3>
                        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {reviews.length === 0 ? <p style={{ color: '#666' }}>No reviews yet.</p> : reviews.map(review => (
                                <div key={review._id} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong style={{ fontSize: '15px', color: '#333' }}>{review.customerId?.name || 'Customer'}</strong>
                                        <div style={{ display: 'flex' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "#eab308" : "none"} stroke="#eab308" />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#555', margin: '0 0 8px 0', lineHeight: '1.4' }}>{review.comment}</p>
                                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button
                            className="btn-manage-bookings"
                            style={{ background: '#07614A', color: 'white', border: 'none' }}
                            onClick={() => navigate(`/booking?workerId=${worker.userId._id}&service=${encodeURIComponent(worker.skill)}`)}
                        >
                            Book This Professional
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div >
    );
};

export default PublicWorkerProfile;
