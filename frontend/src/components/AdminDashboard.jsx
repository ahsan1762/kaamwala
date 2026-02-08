import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../api';
import { useSocket } from '../context/SocketContext';
import Navbar from './Navbar';

const AdminDashboard = () => {
    const [pendingWorkers, setPendingWorkers] = useState([]);
    const [users, setUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const workersRes = await api.get('/admin/pending-workers');
            setPendingWorkers(workersRes.data);

            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);

            const bookingsRes = await api.get('/admin/bookings');
            // Sort by createdAt desc
            const sorted = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentBookings(sorted);

            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Real-time Updates for Admin
    const { socket } = useSocket() || {};
    const socketInstance = useSocket();

    useEffect(() => {
        if (!socketInstance) return;

        const handleUpdate = () => {
            fetchData();
            toast.success("Dashboard Updated");
        };

        socketInstance.on('booking_created', handleUpdate);
        socketInstance.on('booking_updated', handleUpdate);

        return () => {
            socketInstance.off('booking_created', handleUpdate);
            socketInstance.off('booking_updated', handleUpdate);
        };
    }, [socketInstance]);

    const verifyWorker = async (workerId, status) => {
        try {
            await api.patch(`/admin/verify-worker/${workerId}`, { status });
            // Refresh
            const workersRes = await api.get('/admin/pending-workers');
            setPendingWorkers(workersRes.data);
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error("Error verifying worker", error);
            alert("Failed to verify worker");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            alert("User deleted");
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user");
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Delete this booking permanently?")) return;
        try {
            await api.delete(`/admin/bookings/${bookingId}`);
            setRecentBookings(recentBookings.filter(b => b._id !== bookingId));
            // Update stats logic omitted for brevity, but ideally refetch stats
        } catch (error) {
            console.error(error);
            alert("Failed to delete booking");
        }
    };

    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        try {
            await api.patch(`/admin/bookings/${bookingId}`, { status: newStatus });
            setRecentBookings(recentBookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    // Prepare data for charts
    const workerData = stats?.workersBySkill.map(item => ({ name: item._id, value: item.count })) || [];
    const bookingData = stats?.bookingsByStatus.map(item => ({ name: item._id, value: item.count })) || [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="admin-dashboard">
            <Navbar />
            <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px' }}>Admin Dashboard</h1>

                {/* Statistics Cards */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <div style={cardStyle}>
                            <h3>Total Users</h3>
                            <p style={statValueStyle}>{stats.overview.totalUsers}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Total Workers</h3>
                            <p style={statValueStyle}>{stats.overview.totalWorkers}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Pending Approvals</h3>
                            <p style={statValueStyle}>{stats.overview.pendingWorkers}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Total Orders</h3>
                            <p style={statValueStyle}>{stats.overview.totalBookings}</p>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                        <div style={{ ...cardStyle, height: '400px' }}>
                            <h3>Workers by Category</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={workerData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Workers" fill="#07614A" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ ...cardStyle, height: '400px' }}>
                            <h3>Order Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={bookingData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {bookingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Pending Approvals */}
                <div className="section" style={{ marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2>Pending Verification Requests ({pendingWorkers.length})</h2>
                    {pendingWorkers.length === 0 ? <p>No pending requests.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Skill</th>
                                        <th style={{ padding: '12px' }}>City</th>
                                        <th style={{ padding: '12px' }}>Documents</th>
                                        <th style={{ padding: '12px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingWorkers.map(worker => (
                                        <tr key={worker._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{worker.userId?.name}</td>
                                            <td style={{ padding: '12px' }}>{worker.skill}</td>
                                            <td style={{ padding: '12px' }}>{worker.city}</td>

                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    {worker.profilePic && (
                                                        <a href={worker.profilePic} target="_blank" rel="noopener noreferrer">
                                                            <img src={worker.profilePic} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        </a>
                                                    )}
                                                    {worker.document && (
                                                        <a href={worker.document} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'underline' }}>Front CNIC</a>
                                                    )}
                                                    {worker.cnicBack && (
                                                        <a href={worker.cnicBack} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'underline' }}>Back CNIC</a>
                                                    )}
                                                    {worker.serviceVideo && (
                                                        <a href={worker.serviceVideo} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'underline' }}>Service Video</a>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => verifyWorker(worker._id, 'approved')} style={{ marginRight: '8px', background: '#059669', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Approve</button>
                                                <button onClick={() => verifyWorker(worker._id, 'rejected')} style={{ background: '#dc2626', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Manage Bookings Section */}
                <div className="section" style={{ marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2>Manage Bookings ({recentBookings.length})</h2>
                    <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Customer</th>
                                    <th style={{ padding: '12px' }}>Service</th>
                                    <th style={{ padding: '12px' }}>Price</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(booking => (
                                    <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px' }}>{booking.customerId?.name}</td>
                                        <td style={{ padding: '12px' }}>{booking.service}</td>
                                        <td style={{ padding: '12px' }}>Rs {booking.price}</td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px',
                                                    background: booking.status === 'completed' ? '#f0fdf4' : '#fff'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="work_done">Work Done</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => handleDeleteBooking(booking._id)}
                                                style={{
                                                    background: '#fee2e2', color: '#dc2626', border: 'none',
                                                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Complaints Section */}
                <div className="section" style={{ marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Complaints / Support Tickets</h2>
                        <button onClick={() => window.location.reload()} style={{ fontSize: '13px', padding: '5px 10px', cursor: 'pointer' }}>Refresh</button>
                    </div>

                    <AdminComplaintsWidget />
                </div>

                {/* All Users */}
                <div className="section" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2>System Users ({users.length})</h2>
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Name</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: 500 }}>{u.name}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{u.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
                                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'worker' ? '#dcfce7' : '#f3f4f6',
                                                color: u.role === 'admin' ? '#dc2626' : u.role === 'worker' ? '#16a34a' : '#4b5563'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                disabled={u.role === 'admin'}
                                                style={{
                                                    background: 'none', border: '1px solid #ef4444', color: '#ef4444',
                                                    padding: '4px 10px', borderRadius: '4px', cursor: u.role === 'admin' ? 'not-allowed' : 'pointer', opacity: u.role === 'admin' ? 0.5 : 1
                                                }}
                                            >
                                                Delete
                                            </button>
                                            <Link to={`/admin/user/${u._id}`} style={{
                                                marginLeft: '8px',
                                                background: 'none', border: '1px solid #3b82f6', color: '#3b82f6',
                                                padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px'
                                            }}>
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center'
};

const statValueStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#07614A',
    margin: '10px 0 0 0'
};

const AdminComplaintsWidget = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/complaints');
                setComplaints(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const resolve = async (id) => {
        const reply = prompt("Enter resolution message for user:");
        if (!reply) return;
        try {
            await api.patch(`/complaints/${id}/status`, { status: 'resolved', adminResponse: reply });
            setComplaints(complaints.map(c => c._id === id ? { ...c, status: 'resolved', adminResponse: reply } : c));
        } catch (e) {
            alert("Failed");
        }
    };

    if (loading) return <div>Loading tickets...</div>;
    if (complaints.length === 0) return <p>No complaints found.</p>;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>User</th>
                    <th style={{ padding: '10px' }}>Subject</th>
                    <th style={{ padding: '10px' }}>Description</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {complaints.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{c.userId?.name} <br /><span style={{ fontSize: '11px', color: '#777' }}>{c.userId?.email}</span></td>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{c.subject}</td>
                        <td style={{ padding: '10px', fontSize: '13px', color: '#555', maxWidth: '300px' }}>{c.description}</td>
                        <td style={{ padding: '10px' }}>
                            <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                                background: c.status === 'resolved' ? '#d1fae5' : '#fee2e2',
                                color: c.status === 'resolved' ? '#059669' : '#dc2626'
                            }}>
                                {c.status}
                            </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                            {c.status !== 'resolved' && (
                                <button onClick={() => resolve(c._id)} style={{ background: '#07614A', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Resolve</button>
                            )}
                            {c.status === 'resolved' && <span style={{ fontSize: '12px', color: '#059669' }}>Resolved</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminDashboard;
