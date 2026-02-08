import React, { useState, useEffect } from 'react';
import { Plus, History, MapPinned, Calendar, Clock, Wrench, User, Phone, MapPin, CreditCard, CheckCircle, Send, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import './Chat.css';

const Booking = () => {
    const { user, loading } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialTab = searchParams.get('tab') || 'new';
    const [activeTab, setActiveTab] = useState(initialTab);

    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="booking-page">
                    <div className="auth-required">
                        <div className="auth-card">
                            <User size={48} className="auth-icon" />
                            <h2>Login Required</h2>
                            <p>Please login to access booking features</p>
                            <button onClick={() => navigate('/login')} className="login-btn">
                                Login Now
                            </button>
                            <p className="signup-text">
                                Don't have an account? <a href="/signup">Sign up</a>
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const tabs = [
        { id: 'new', label: 'New Booking', icon: <Plus size={20} /> },
        { id: 'history', label: 'Booking History', icon: <History size={20} /> },
        { id: 'track', label: 'Track Booking', icon: <MapPinned size={20} /> }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/booking?tab=${tabId}`, { replace: true });
    };

    return (
        <>
            <Navbar />
            <div className="booking-page">
                {/* Hero Section */}
                <div className="booking-hero">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>Manage Your Bookings</h1>
                        <p>Book new services, view history, and track your ongoing bookings</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="booking-tabs-container">
                    <div className="booking-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`booking-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="booking-content">
                    {activeTab === 'new' && <NewBooking user={user} />}
                    {activeTab === 'history' && <BookingHistory user={user} />}
                    {activeTab === 'track' && <TrackBooking user={user} />}
                </div>
            </div>
            <Footer />
        </>
    );
};

// ========== NEW BOOKING COMPONENT ==========
const NewBooking = ({ user }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const serviceParam = searchParams.get('service');
    const workerIdParam = searchParams.get('workerId');

    const [step, setStep] = useState(1);
    const services = [
        { id: 'plumber', name: 'Plumber', price: 1299, icon: '🔧' },
        { id: 'electrician', name: 'Electrician', price: 1499, icon: '⚡' },
        { id: 'carpenter', name: 'Carpenter', price: 1599, icon: '🪚' },
        { id: 'mason', name: 'Mason', price: 1899, icon: '🧱' },
        { id: 'ac repair', name: 'AC & Repair', price: 1999, icon: '❄️' }, // key matched loosely or exact? Backend stores string.
        { id: 'general', name: 'General', price: 999, icon: '🛠️' }
    ];

    // Auto-select service if param exists
    const initialService = services.find(s => s.name === serviceParam || s.id === serviceParam?.toLowerCase())?.id || '';

    const [formData, setFormData] = useState({
        service: initialService,
        date: '',
        time: '',
        address: '',
        phone: user?.phone || '',
        notes: '',
        paymentMethod: 'cash'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingId, setBookingId] = useState('');

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceSelect = (serviceId) => {
        setFormData(prev => ({ ...prev, service: serviceId }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const serviceDate = new Date(`${formData.date} ${formData.time}`);

            const selectedServiceObj = services.find(s => s.id === formData.service);
            const bookingData = {
                service: selectedServiceObj?.name,
                serviceDate: serviceDate,
                address: formData.address,
                phone: formData.phone,
                notes: formData.notes,
                price: selectedServiceObj?.price,
                paymentMethod: formData.paymentMethod,
                workerId: workerIdParam || null // Use param if available
            };

            const res = await api.post('/bookings', bookingData);

            setBookingId(res.data._id);
            setLoading(false);
            setSuccess(true);
        } catch (error) {
            console.error("Booking error", error);
            toast.error("Failed to create booking." + (error.response?.data?.message || ""));
            setLoading(false);
        }
    };

    const validateStep = (stepNum) => {
        switch (stepNum) {
            case 1:
                return formData.service !== '';
            case 2:
                return formData.date !== '' && formData.time !== '';
            case 3:
                return formData.address !== '' && formData.phone !== '';
            default:
                return true;
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (success) {
        return (
            <div className="booking-success">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h2>Booking Placed!</h2>
                    <p>Your service request is pending worker acceptance.</p>
                    <div className="booking-id">
                        <span>Booking ID:</span>
                        <strong>{bookingId}</strong>
                    </div>
                    <div className="success-details">
                        <div className="detail-row">
                            <Calendar size={18} />
                            <span>{formData.date} at {formData.time}</span>
                        </div>
                        <div className="detail-row">
                            <MapPin size={18} />
                            <span>{formData.address}</span>
                        </div>
                    </div>
                    <div className="success-actions">
                        <button onClick={() => navigate('/booking?tab=track&id=' + bookingId)} className="track-btn">
                            Track Booking
                        </button>
                        <button onClick={() => { setSuccess(false); setStep(1); setFormData({ ...formData, service: '', date: '', time: '', address: '', notes: '' }); }} className="new-btn">
                            Book Another Service
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-booking">
            {/* Progress Steps */}
            <div className="progress-steps">
                {[1, 2, 3, 4].map(num => (
                    <div key={num} className={`progress-step ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
                        <div className="step-circle">{step > num ? '✓' : num}</div>
                        <span className="step-label">
                            {num === 1 && 'Service'}
                            {num === 2 && 'Schedule'}
                            {num === 3 && 'Details'}
                            {num === 4 && 'Confirm'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Select Service */}
            {step === 1 && (
                <div className="booking-step">
                    <h2>Select a Service</h2>
                    <p>Choose the service you need</p>
                    <div className="services-selection">
                        {services.map(service => (
                            <div
                                key={service.id}
                                className={`service-option ${formData.service === service.id ? 'selected' : ''}`}
                                onClick={() => handleServiceSelect(service.id)}
                            >
                                <span className="service-emoji">{service.icon}</span>
                                <h3>{service.name}</h3>
                                <p className="service-price">Starting from PKR {service.price}</p>
                            </div>
                        ))}
                    </div>
                    <div className="step-actions">
                        <button
                            className="next-btn"
                            disabled={!validateStep(1)}
                            onClick={() => setStep(2)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
                <div className="booking-step">
                    <h2>Select Date & Time</h2>
                    <p>Choose when you want the service</p>
                    <div className="datetime-selection">
                        <div className="form-group">
                            <label><Calendar size={18} /> Select Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={getMinDate()}
                            />
                        </div>
                        <div className="form-group">
                            <label><Clock size={18} /> Select Time Slot</label>
                            <div className="time-slots">
                                {timeSlots.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="step-actions">
                        <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                        <button
                            className="next-btn"
                            disabled={!validateStep(2)}
                            onClick={() => setStep(3)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Address & Contact */}
            {step === 3 && (
                <div className="booking-step">
                    <h2>Service Address & Contact</h2>
                    <p>Where should we send the professional?</p>
                    <div className="address-form">
                        <div className="form-group">
                            <label><MapPin size={18} /> Complete Address (F10 & F11 Sector Only)</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your complete address in F10 or F11 Sector, Islamabad"
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label><Phone size={18} /> Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+92 3XX XXXXXXX"
                            />
                        </div>
                        <div className="form-group">
                            <label><Wrench size={18} /> Additional Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any specific requirements or issues to mention..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="step-actions">
                        <button className="back-btn" onClick={() => setStep(2)}>Back</button>
                        <button
                            className="next-btn"
                            disabled={!validateStep(3)}
                            onClick={() => setStep(4)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
                <div className="booking-step">
                    <h2>Confirm Your Booking</h2>
                    <p>Review your booking details</p>
                    <div className="booking-summary">
                        <div className="summary-card">
                            <h3>Booking Summary</h3>
                            <div className="summary-row">
                                <span>Service</span>
                                <strong>{services.find(s => s.id === formData.service)?.name}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Date</span>
                                <strong>{formData.date}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Time</span>
                                <strong>{formData.time}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Location</span>
                                <strong>F10 & F11 Sector, Islamabad</strong>
                            </div>
                            <div className="summary-row">
                                <span>Address</span>
                                <strong>{formData.address}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Phone</span>
                                <strong>{formData.phone}</strong>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Estimated Price</span>
                                <strong>PKR {services.find(s => s.id === formData.service)?.price}</strong>
                            </div>
                        </div>

                        <div className="payment-section">
                            <h3><CreditCard size={20} /> Payment Method</h3>
                            <div className="payment-options">
                                <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={handleChange}
                                    />
                                    <span>💵 Cash on Completion</span>
                                </label>
                                <label className={`payment-option ${formData.paymentMethod === 'jazzcash' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="jazzcash"
                                        checked={formData.paymentMethod === 'jazzcash'}
                                        onChange={handleChange}
                                    />
                                    <span>📱 JazzCash</span>
                                </label>
                                <label className={`payment-option ${formData.paymentMethod === 'easypaisa' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="easypaisa"
                                        checked={formData.paymentMethod === 'easypaisa'}
                                        onChange={handleChange}
                                    />
                                    <span>📱 Easypaisa</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="step-actions">
                        <button className="back-btn" onClick={() => setStep(3)}>Back</button>
                        <button
                            className="confirm-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== BOOKING HISTORY COMPONENT ==========
const BookingHistory = ({ user }) => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                // Backend returns array of bookings. 
                // We need to map them slightly if format differs, or just use as is. 
                // Backend populate returns populated workerId object.
                const mappedBookings = res.data.map(b => ({
                    id: b._id,
                    service: b.service,
                    date: new Date(b.serviceDate).toLocaleDateString(),
                    time: new Date(b.serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: b.status,
                    price: b.price,
                    address: b.address,
                    paymentMethod: b.paymentMethod,
                    createdAt: b.createdAt
                }));
                setBookings(mappedBookings);
            } catch (error) {
                console.error("Error fetching bookings", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'status-confirmed'; // Mapping accepted -> confirmed color style
            case 'pending': return 'status-progress'; // Pending is initial
            case 'in-progress': return 'status-progress';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const activeBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'confirmed') return booking.status === 'accepted';
        if (filter === 'pending') return booking.status === 'pending';
        if (filter === 'completed') return booking.status === 'completed';
        if (filter === 'cancelled') return booking.status === 'cancelled' || booking.status === 'rejected';
        return booking.status === filter;
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-PK', options);
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading bookings...</div>;

    if (bookings.length === 0) {
        return (
            <div className="empty-state">
                <History size={64} className="empty-icon" />
                <h2>No Booking History</h2>
                <p>You haven't made any bookings yet</p>
                <button onClick={() => window.location.href = '/booking?tab=new'} className="book-now-btn">
                    Book Your First Service
                </button>
            </div>
        );
    }

    return (
        <div className="booking-history">
            <div className="history-header">
                <h2>Your Booking History</h2>
                <div className="filter-tabs">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            className={`filter-tab ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bookings-list">
                {activeBookings.length > 0 ? (
                    activeBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-card-header">
                                <div className="booking-info">
                                    <h3>{booking.service}</h3>
                                    <span className="booking-id">#{booking.id.slice(-6)}</span>
                                </div>
                                <span className={`booking-status ${getStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                                </span>
                            </div>
                            <div className="booking-card-body">
                                <div className="booking-detail">
                                    <Calendar size={16} />
                                    <span>{booking.date} at {booking.time}</span>
                                </div>
                                <div className="booking-detail">
                                    <MapPin size={16} />
                                    <span>{booking.address}</span>
                                </div>
                                <div className="booking-detail">
                                    <CreditCard size={16} />
                                    <span>PKR {booking.price} • {booking.paymentMethod?.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="booking-card-footer">
                                <span className="booked-on">Booked on {formatDate(booking.createdAt)}</span>
                                <button
                                    onClick={() => window.location.href = `/booking?tab=track&id=${booking.id}`}
                                    className="track-link"
                                >
                                    Track Booking →
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No bookings found for this filter</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const RatingForm = ({ onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        onSubmit(rating, comment);
        setSubmitted(true);
    };

    if (submitted) return <p style={{ color: '#07614A', fontWeight: 600 }}>Thank you for your feedback!</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={24}
                        fill={star <= rating ? "#eab308" : "none"}
                        stroke="#eab308"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <textarea
                placeholder="Write your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
            <button
                onClick={handleSubmit}
                style={{ background: '#07614A', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
                Submit Review
            </button>
        </div>
    );
};

// ========== CHAT BOX COMPONENT ==========
const ChatBox = ({ bookingId, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}/messages`);
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [bookingId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(`/bookings/${bookingId}/messages`, { text: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                Chat with {user.role === 'customer' ? 'Professional' : 'Customer'}
            </div>
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginTop: '20px' }}>No messages yet. Start conversation.</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg._id} className={`message ${msg.senderId._id === user._id || msg.senderId === user._id ? 'sent' : 'received'}`}>
                            {msg.text}
                            <span className="message-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-btn">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

import PaymentModal from './PaymentModal';

// ========== TRACK BOOKING COMPONENT ==========

const TrackBooking = ({ user: propUser }) => { // Renamed propUser to avoid conflict with useAuth user
    const { user } = useAuth(); // Get user from context
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [searchParams] = useSearchParams();
    const urlBookingId = searchParams.get('id');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const socket = useSocket();
    const navigate = useNavigate();
    const location = useLocation();

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        socket.on('booking_updated', (updatedBooking) => {
            setBookings(prev => prev.map(b => b.id === updatedBooking._id ? { // Assuming updatedBooking._id matches b.id
                id: updatedBooking._id,
                service: updatedBooking.service,
                date: new Date(updatedBooking.serviceDate).toLocaleDateString(),
                time: new Date(updatedBooking.serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: updatedBooking.status,
                address: updatedBooking.address,
                estimatedArrival: updatedBooking.estimatedArrival,
                paymentMethod: updatedBooking.paymentMethod,
                price: updatedBooking.price,
                paymentStatus: updatedBooking.paymentStatus,
                timeline: getTimeline(updatedBooking.status, updatedBooking.createdAt, updatedBooking.updatedAt)
            } : b));
            if (selectedBooking && selectedBooking.id === updatedBooking._id) { // Assuming updatedBooking._id matches selectedBooking.id
                setSelectedBooking(prev => ({ // Update selected booking with new data
                    ...prev,
                    id: updatedBooking._id,
                    service: updatedBooking.service,
                    date: new Date(updatedBooking.serviceDate).toLocaleDateString(),
                    time: new Date(updatedBooking.serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: updatedBooking.status,
                    address: updatedBooking.address,
                    estimatedArrival: updatedBooking.estimatedArrival,
                    paymentMethod: updatedBooking.paymentMethod,
                    price: updatedBooking.price,
                    paymentStatus: updatedBooking.paymentStatus,
                    timeline: getTimeline(updatedBooking.status, updatedBooking.createdAt, updatedBooking.updatedAt)
                }));
            }
            toast.success(`Booking status updated: ${updatedBooking.status}`);
        });

        return () => {
            socket.off('booking_updated');
        };
    }, [socket, selectedBooking]);


    React.useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                const userBookings = res.data.map(b => ({
                    id: b._id,
                    service: b.service,
                    date: new Date(b.serviceDate).toLocaleDateString(),
                    time: new Date(b.serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: b.status,
                    address: b.address,
                    estimatedArrival: b.estimatedArrival,
                    paymentMethod: b.paymentMethod, // Added paymentMethod
                    price: b.price, // Added price
                    paymentStatus: b.paymentStatus, // Added paymentStatus
                    // Mock timeline based on status
                    timeline: getTimeline(b.status, b.createdAt, b.updatedAt)
                }));

                // Show all bookings in tracking, prioritize active for default selection
                setBookings(userBookings);

                const active = userBookings.filter(b => b.status === 'pending' || b.status === 'accepted' || b.status === 'in-progress' || b.status === 'work_done');

                if (urlBookingId) {
                    const found = userBookings.find(b => b.id === urlBookingId);
                    if (found) setSelectedBooking(found);
                } else if (active.length > 0) {
                    setSelectedBooking(active[0]);
                } else if (userBookings.length > 0) {
                    setSelectedBooking(userBookings[0]); // Fallback to most recent
                }
            } catch (error) {
                console.error("Error fetching bookings", error);
            }
        };

        if (user) {
            fetchBookings();
            const interval = setInterval(fetchBookings, 2000); // Faster polling (2s)
            return () => clearInterval(interval);
        }
    }, [user, urlBookingId]);

    // Update selectedBooking when bookings list updates
    useEffect(() => {
        if (selectedBooking && bookings.length > 0) {
            // Find updated version of currently selected booking
            const updated = bookings.find(b => b.id === selectedBooking.id);
            if (updated) {
                // Determine if we need to update state (avoid deep loop, just check key fields)
                if (updated.status !== selectedBooking.status || updated.price !== selectedBooking.price || updated.paymentStatus !== selectedBooking.paymentStatus) {
                    setSelectedBooking(updated);
                }
            }
        }
    }, [bookings, selectedBooking]);

    const handleConfirmCompletion = async () => {
        if (!selectedBooking) return;
        try {
            // Updated logic: Work Done -> Customer Confirms -> Moves to 'completed' but might be unpaid.
            // Or maybe Work Done -> Pay Now -> Paid -> Completed?
            // Let's stick to: Work Done -> Pay Now -> Completed.
            // But if cash, just confirm.

            // Actually, let's keep it simple:
            // Work Done -> User sees Pay Button (if card/online) OR Confirm Button (if cash).
            // For now, let's allow "Pay Now" for any payment method to simulate paying current bill.

            // If cash, we just confirm.
            if (selectedBooking.paymentMethod === 'cash') {
                await api.patch(`/bookings/${selectedBooking.id}/status`, { status: 'completed' }); // Mark fully complete
                toast.success("Job marked as completed!");
                window.location.reload();
            } else {
                // If online payment pending
                setShowPaymentModal(true);
            }
        } catch (error) {
            console.error("Error confirming completion", error);
            toast.error("Failed to confirm completion");
        }
    };

    const getTimeline = (status, createdAt, updatedAt) => {
        const steps = [
            { status: 'Booking Placed', completed: true, time: createdAt },
            { status: 'Order Accepted', completed: ['accepted', 'work_done', 'completed'].includes(status), time: status !== 'pending' ? updatedAt : null },
            { status: 'Work Finished', completed: ['work_done', 'completed'].includes(status), time: null },
            { status: 'Job Completed', completed: status === 'completed', time: status === 'completed' ? updatedAt : null }
        ];
        return steps;
    };

    const handleRate = async (rating, comment) => {
        try {
            await api.post('/reviews', {
                bookingId: selectedBooking.id,
                rating,
                comment
            });
            toast.success("Review submitted! Thank you.");
            setSelectedBooking(prev => ({ ...prev, isReviewed: true })); // Optimistic update
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleSearch = () => {
        // We already fetched all bookings, just find in state or re-fetch if needed.
        // For simplicity search in known bookings (including completed)
        // Ideally we should have a generic search API or fetch all history again.
        // Let's just alert if not found in active list or tell user to check history.
        toast('Please check Booking History tab for all bookings. Tracking is only for active bookings.', { icon: 'ℹ️' });
    };

    // ... rest of render logic

    if (bookings.length === 0 && !selectedBooking) {
        return (
            <div className="empty-state">
                <MapPinned size={64} className="empty-icon" />
                <h2>No Active Bookings</h2>
                <p>You don't have any active bookings to track</p>
                <button onClick={() => window.location.href = '/booking?tab=new'} className="book-now-btn">
                    Book a New Service
                </button>
            </div>
        );
    }

    return (
        <div className="track-booking">
            <div className="track-header">
                <h2>Track Your Booking</h2>
            </div>

            {bookings.length > 1 && (
                <div className="booking-selector">
                    <label>Select Booking:</label>
                    <select
                        value={selectedBooking?.id || ''}
                        onChange={(e) => {
                            const booking = bookings.find(b => b.id === e.target.value);
                            setSelectedBooking(booking);
                        }}
                    >
                        {bookings.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.service} - {b.date} (#{b.id.slice(-6)})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedBooking && (
                <div className="tracking-wrapper" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="tracking-container" style={{ flex: 1 }}>
                        <div className="tracking-card">
                            <div className="tracking-header">
                                <div>
                                    <h3>{selectedBooking.service}</h3>
                                    <p className="tracking-id">Booking ID: #{selectedBooking.id}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`booking-status ${selectedBooking.status === 'completed' ? 'status-completed' : 'status-confirmed'}`}>
                                        {selectedBooking.status === 'work_done' ? 'Payment Pending' : selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                    </span>

                                    {/* Action Buttons */}
                                    {selectedBooking.status === 'work_done' && selectedBooking.paymentStatus !== 'paid' && (
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            style={{ display: 'block', marginTop: '10px', background: '#07614A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                                        >
                                            Pay PKR {selectedBooking.price}
                                        </button>
                                    )}

                                    {selectedBooking.status === 'accepted' && selectedBooking.estimatedArrival && (
                                        <div style={{ marginTop: '8px', color: '#07614A', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                            <Clock size={16} /> Arriving in {selectedBooking.estimatedArrival}
                                        </div>
                                    )}
                                    {selectedBooking.status === 'pending' && (
                                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Waiting for worker acceptance</p>
                                    )}
                                </div>
                            </div>

                            <div className="tracking-details">
                                <div className="detail-item">
                                    <Calendar size={18} />
                                    <div>
                                        <span className="label">Scheduled Date</span>
                                        <strong>{selectedBooking.date}</strong>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <Clock size={18} />
                                    <div>
                                        <span className="label">Time Slot</span>
                                        <strong>{selectedBooking.time}</strong>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <MapPin size={18} />
                                    <div>
                                        <span className="label">Service Address</span>
                                        <strong>{selectedBooking.address}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="tracking-timeline">
                                <h4>Booking Status</h4>
                                <div className="timeline">
                                    {selectedBooking.timeline.map((step, index) => (
                                        <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                                            <div className="timeline-icon">
                                                {step.completed ? <CheckCircle size={20} /> : <div className="circle"></div>}
                                            </div>
                                            <div className="timeline-content">
                                                <h4>{step.status}</h4>
                                                {step.time && <span className="step-time">{new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Section for Completed Jobs */}
                            {selectedBooking.status === 'completed' && (
                                <div className="review-section" style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #eee' }}>
                                    <h3>Rate this Service</h3>
                                    <RatingForm onSubmit={handleRate} />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Chat Box */}
                    {['accepted', 'in-progress', 'work_done'].includes(selectedBooking.status) && (
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <ChatBox bookingId={selectedBooking.id} user={user} />
                        </div>
                    )}
                </div>
            )}

            {showPaymentModal && selectedBooking && (
                <PaymentModal
                    booking={selectedBooking}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={() => {
                        toast.success("Payment Received! Job Completed.");
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default Booking;
