import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';
import Navbar from './Navbar';
import { BadgeCheck, Clock, MapPin, Phone, Calendar, DollarSign, XCircle, CheckCircle } from 'lucide-react';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { socket } = useSocket() || {}; // Handle potential null context safely, though provider wraps app
    const socketInstance = useSocket(); // useSocket returns the socket instance directly based on my Context def.

    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({}); // { bookingId: count }

    // UI States
    const [selectedBookingForAccept, setSelectedBookingForAccept] = useState(null);
    const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
    const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
    const [arrivalTime, setArrivalTime] = useState('');
    const [finalPrice, setFinalPrice] = useState('');

    const fetchData = async () => {
        try {
            const profileRes = await api.get('/worker/profile');
            setProfile(profileRes.data);

            const bookingsRes = await api.get('/worker/bookings');
            setBookings(bookingsRes.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Profile not found -> Redirect to creation
                // Do not log error to avoid confusion
                navigate('/become-worker');
            } else {
                console.error("Error fetching dashboard data", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socketInstance) return;

        const handleNewBooking = (newBooking) => {
            // Only update if the booking is for this worker
            // Ensure ID comparison is safe (handle ObjectId vs String)
            const bookingWorkerId = newBooking.workerId?._id || newBooking.workerId;
            if (String(bookingWorkerId) === String(user._id)) {
                toast.success("New Job Request Received!");
                fetchData();
            }
        };

        const handleBookingUpdate = (updatedBooking) => {
            // Refresh if involved
            const bookingWorkerId = updatedBooking.workerId?._id || updatedBooking.workerId;
            if (String(bookingWorkerId) === String(user._id)) {
                fetchData();
            }
        };

        const handleNewMessage = (message) => {
            // If chat is open for this booking, don't increment (or maybe do, and let chat box handle read)
            // For now, simpler: always increment, and clear when opening chat.
            if (!selectedBookingForChat || selectedBookingForChat._id !== message.bookingId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.bookingId]: (prev[message.bookingId] || 0) + 1
                }));
                toast('New message', { icon: '💬' });
            }
        };

        socketInstance.on('booking_created', handleNewBooking);
        socketInstance.on('booking_updated', handleBookingUpdate);
        socketInstance.on('new_message', handleNewMessage);

        return () => {
            socketInstance.off('booking_created', handleNewBooking);
            socketInstance.off('booking_updated', handleBookingUpdate);
            socketInstance.off('new_message', handleNewMessage);
        };
    }, [socketInstance, user, selectedBookingForChat]);

    // State moved to top

    const handleAcceptClick = (booking) => {
        setSelectedBookingForAccept(booking);
        setArrivalTime(''); // reset
    };

    const confirmAccept = async () => {
        if (!arrivalTime) return alert("Please enter arrival time");
        await handleStatusUpdate(selectedBookingForAccept._id, 'accepted', { estimatedArrival: arrivalTime });
        setSelectedBookingForAccept(null);
    };

    // New: Handle Mark Done Click (Open Invoice Modal)
    const handleMarkDoneClick = (booking) => {
        setSelectedBookingForInvoice(booking);
        setFinalPrice(booking.price); // Pre-fill with existing price
    };

    // New: Confirm Invoice
    const confirmInvoice = async () => {
        if (!finalPrice || finalPrice < 0) return alert("Please enter a valid amount");
        await handleStatusUpdate(selectedBookingForInvoice._id, 'work_done', { price: finalPrice });
        setSelectedBookingForInvoice(null);
    };

    const handleStatusUpdate = async (bookingId, status, additionalData = {}) => {
        try {
            const payload = { status, ...additionalData };

            await api.patch(`/bookings/${bookingId}/status`, payload);
            // Refresh bookings
            const bookingsRes = await api.get('/worker/bookings');
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    // Chat Box Component
    const WorkerChatBox = ({ bookingId }) => {
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState('');

        useEffect(() => {
            const fetchMessages = async () => {
                try {
                    const res = await api.get(`/bookings/${bookingId}/messages`);
                    setMessages(res.data);
                } catch (error) {
                    console.error("Error", error);
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
                console.error("Error", error);
            }
        };

        return (
            <div className="chat-box" style={{ height: '350px', margin: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                    {messages.map(msg => (
                        <div key={msg._id} style={{
                            padding: '8px 12px', margin: '5px', borderRadius: '12px', maxWidth: '80%', wordWrap: 'break-word',
                            alignSelf: msg.senderId._id === user._id || msg.senderId === user._id ? 'flex-end' : 'flex-start',
                            background: msg.senderId._id === user._id || msg.senderId === user._id ? '#07614A' : '#e5e7eb',
                            color: msg.senderId._id === user._id || msg.senderId === user._id ? 'white' : 'black',
                            marginLeft: msg.senderId._id === user._id || msg.senderId === user._id ? 'auto' : '0'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} style={{ display: 'flex', padding: '10px', gap: '10px' }}>
                    <input
                        style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button type="submit" style={{ background: '#07614A', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Send</button>
                </form>
            </div>
        );
    };

    if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const upcomingBookings = bookings.filter(b => b.status === 'accepted');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    return (
        <div className="worker-dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.name || 'Worker'}!</h1>
                    <p>Manage your bookings and profile</p>
                </div>

                {/* Verification Status Banner */}
                <div className={`verification-banner ${profile?.verificationStatus}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <BadgeCheck size={32} color={profile?.verificationStatus === 'approved' ? '#07614A' : '#f59e0b'} />
                        <div>
                            <h3 style={{ margin: 0 }}>
                                Verification Status: {profile?.verificationStatus === 'approved' ? 'Verified Professional' : 'Pending Verification'}
                            </h3>
                            {profile?.verificationStatus !== 'approved' && (
                                <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.8 }}>
                                    You will be able to accept bookings once your profile is approved.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <span className="stat-value">{bookings.filter(b => b.status === 'completed').length}</span>
                        <span className="stat-label">Jobs Completed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{profile?.averageRating ? profile.averageRating.toFixed(1) : 'New'}</span>
                        <span className="stat-label">Average Rating ({profile?.reviewsCount || 0})</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">Rs {bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + (b.price || 0), 0)}</span>
                        <span className="stat-label">Total Earnings</span>
                    </div>
                </div>

                {/* New Requests Section */}
                {pendingBookings.length > 0 && (
                    <section className="mb-8">
                        <div className="section-title">
                            New Job Requests <span className="badge">{pendingBookings.length}</span>
                        </div>
                        <div className="requests-grid">
                            {pendingBookings.map(booking => (
                                <div key={booking._id} className="request-card">
                                    <div className="request-header">
                                        <div className="customer-info">
                                            <div className="customer-avatar">
                                                {booking.customerId?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{booking.customerId?.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>New Customer</div>
                                            </div>
                                        </div>
                                        <span className="request-time">Just now</span>
                                    </div>
                                    <div className="request-body">
                                        <div className="request-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Service</span>
                                                <span className="detail-value">{booking.service}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Price</span>
                                                <span className="detail-value"><DollarSign size={14} /> Rs {booking.price}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Date & Time</span>
                                                <span className="detail-value"><Calendar size={14} /> {new Date(booking.serviceDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value"><MapPin size={14} /> {booking.address}</span>
                                            </div>
                                        </div>

                                        {profile?.verificationStatus === 'approved' ? (
                                            <div className="request-actions">
                                                <button onClick={() => handleStatusUpdate(booking._id, 'rejected')} className="btn-reject">Decline</button>
                                                <button onClick={() => handleAcceptClick(booking)} className="btn-accept">Accept Job</button>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '10px', background: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '14px' }}>
                                                Verification Required to ccept
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Schedule */}
                <section>
                    <div className="section-title">Upcoming Schedule</div>
                    <div className="bookings-table-container">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingBookings.concat(pastBookings).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No scheduled jobs yet.</td>
                                    </tr>
                                ) : (
                                    upcomingBookings.concat(pastBookings).map(booking => (
                                        <tr key={booking._id}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{booking.customerId?.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{booking.phone}</div>
                                            </td>
                                            <td>{booking.service}</td>
                                            <td>
                                                <div>{new Date(booking.serviceDate).toLocaleDateString()}</div>
                                                {/* Time if available */}
                                            </td>
                                            <td>{booking.address}</td>
                                            <td>
                                                <span className={`status-badge ${booking.status}`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {booking.status === 'accepted' && (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button
                                                            onClick={() => handleMarkDoneClick(booking)}
                                                            style={{ background: 'none', border: '1px solid #1e40af', color: '#1e40af', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                                                        >
                                                            Mark Done
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBookingForChat(booking);
                                                                setUnreadCounts(prev => ({ ...prev, [booking._id]: 0 }));
                                                            }}
                                                            style={{ background: 'none', border: '1px solid #07614A', color: '#07614A', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                                                        >
                                                            Chat
                                                            {unreadCounts[booking._id] > 0 && (
                                                                <span style={{
                                                                    marginLeft: '5px',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    borderRadius: '50%',
                                                                    padding: '2px 6px',
                                                                    fontSize: '10px'
                                                                }}>
                                                                    {unreadCounts[booking._id]}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {booking.status === 'completed' && <CheckCircle size={18} color="green" />}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Acceptance Modal */}
            {selectedBookingForAccept && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
                        <h3>Accept Job</h3>
                        <p style={{ marginBottom: '10px' }}>When will you arrive at {selectedBookingForAccept.address}?</p>
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Estimated Time</label>
                            <select
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select time...</option>
                                <option value="15 minutes">15 minutes</option>
                                <option value="30 minutes">30 minutes</option>
                                <option value="45 minutes">45 minutes</option>
                                <option value="1 hour">1 hour</option>
                                <option value="2 hours">2 hours</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button onClick={() => setSelectedBookingForAccept(null)} style={{ padding: '8px 15px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={confirmAccept} style={{ padding: '8px 15px', background: '#07614A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm & Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Invoice Modal - ADDED */}
            {selectedBookingForInvoice && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0 }}>Create Final Invoice</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Enter the final amount agreed with the customer. This should include service charges and any additional parts.
                        </p>

                        <div style={{ margin: '20px 0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Final Amount (PKR)</label>
                            <input
                                type="number"
                                value={finalPrice}
                                onChange={(e) => setFinalPrice(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
                                    fontSize: '18px', fontWeight: 'bold', color: '#07614A'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedBookingForInvoice(null)}
                                style={{ padding: '10px 15px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmInvoice}
                                style={{ padding: '10px 20px', background: '#07614A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Send Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {selectedBookingForChat && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                            <h3>Chat with Customer</h3>
                            <button onClick={() => setSelectedBookingForChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
                        </div>
                        <WorkerChatBox bookingId={selectedBookingForChat._id} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;
