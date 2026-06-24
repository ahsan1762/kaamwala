import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';
import { Star, User as UserIcon, Calendar, Briefcase, Mail, Phone, Video, CreditCard, ShieldCheck } from 'lucide-react';
import './AdminUserDetails.css'; // We'll create a basic CSS file or use inline styles for simplicity in this artifact

const AdminUserDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/admin/users/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch user details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="loading-container">Loading details...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!data) return <div className="error-container">User not found</div>;

    const { user, workerProfile, reviews, bookings } = data;

    // Calculate total earnings if worker (rough estimate based on completed bookings)
    const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'work_done');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A';

    return (
        <div className="admin-user-details-page">
            <Navbar />
            <div className="container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                <Link to="/admin" style={{ display: 'inline-block', marginBottom: '20px', color: '#666', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>

                {/* Header Profile Section */}
                <div style={cardStyle} className="profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {workerProfile?.profilePic ? (
                                <img src={workerProfile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <UserIcon size={40} color="#888" />
                            )}
                        </div>
                        <div>
                            <h1 style={{ margin: '0 0 5px 0' }}>{user.name}</h1>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#666' }}>
                                <Badge role={user.role} />
                                <span><Mail size={14} style={{ marginRight: '5px' }} /> {user.email}</span>
                                {workerProfile?.phone && <span><Phone size={14} style={{ marginRight: '5px' }} /> {workerProfile.phone}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Worker Specific Details */}
                {user.role === 'worker' && workerProfile && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '20px 0' }}>
                        <div style={cardStyle}>
                            <h3>Stats & Verification</h3>
                            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                                <div style={rowStyle}>
                                    <span>Status:</span>
                                    <span style={{
                                        color: workerProfile.verificationStatus === 'approved' ? 'green' : 'orange',
                                        fontWeight: 'bold', textTransform: 'capitalize'
                                    }}>
                                        {workerProfile.verificationStatus}
                                    </span>
                                </div>
                                <div style={rowStyle}>
                                    <span>Rating:</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Star size={16} fill="orange" color="orange" /> {avgRating} ({reviews.length} reviews)
                                    </span>
                                </div>
                                <div style={rowStyle}>
                                    <span>Total Jobs:</span>
                                    <span>{completedBookings.length}</span>
                                </div>
                                <div style={rowStyle}>
                                    <span>Est. Earnings:</span>
                                    <span>Rs {totalEarnings}</span>
                                </div>
                                <div style={rowStyle}>
                                    <span>Skill:</span>
                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>{workerProfile.skill}</span>
                                </div>
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <h3>Documents & Links</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                <a href={workerProfile.document} target="_blank" rel="noreferrer" style={linkStyle}>
                                    <CreditCard size={18} /> View CNIC Front
                                </a>
                                {workerProfile.cnicBack && (
                                    <a href={workerProfile.cnicBack} target="_blank" rel="noreferrer" style={linkStyle}>
                                        <CreditCard size={18} /> View CNIC Back
                                    </a>
                                )}
                                {workerProfile.serviceVideo && (
                                    <a href={workerProfile.serviceVideo} target="_blank" rel="noreferrer" style={linkStyle}>
                                        <Video size={18} /> Watch Skill Video
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Section (Worker Only) */}
                {user.role === 'worker' && reviews.length > 0 && (
                    <div style={cardStyle}>
                        <h3>Reviews & Ratings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                            {reviews.map(review => (
                                <div key={review._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{review.customerId?.name || 'Unknown User'}</strong>
                                        <div style={{ display: 'flex' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? 'orange' : '#eee'} color={i < review.rating ? 'orange' : '#ccc'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>{review.comment}</p>
                                    <small style={{ color: '#999' }}>{review.bookingId?.service} &bull; {new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking History */}
                <div style={{ ...cardStyle, marginTop: '20px' }}>
                    <h3>Booking History</h3>
                    {bookings.length === 0 ? <p style={{ color: '#777' }}>No bookings found.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', textAlign: 'left', fontSize: '14px' }}>
                                        <th style={{ padding: '10px' }}>Date</th>
                                        <th style={{ padding: '10px' }}>{user.role === 'worker' ? 'Customer' : 'Worker'}</th>
                                        <th style={{ padding: '10px' }}>Service</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking._id} style={{ borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                            <td style={{ padding: '10px' }}>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                {user.role === 'worker' ? booking.customerId?.name : booking.workerId?.name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '10px' }}>{booking.service}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                                                    background: booking.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                                                    color: booking.status === 'completed' ? '#16a34a' : '#4b5563'
                                                }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>Rs {booking.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components & Styles
const Badge = ({ role }) => (
    <span style={{
        padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
        background: role === 'admin' ? '#fee2e2' : role === 'worker' ? '#dcfce7' : '#e0f2fe',
        color: role === 'admin' ? '#dc2626' : role === 'worker' ? '#16a34a' : '#0284c7'
    }}>
        {role}
    </span>
);

const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #eee'
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
    fontSize: '14px'
};

const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#0284c7',
    textDecoration: 'none',
    padding: '8px',
    background: '#f0f9ff',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'background 0.2s'
};

export default AdminUserDetails;
