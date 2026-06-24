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

const PAGE_SIZE = {
    WORKERS: 10,
    CUSTOMERS: 10,
    BOOKINGS: 15,
    COMPLAINTS: 10,
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const btnStyle = (disabled) => ({
        background: disabled ? '#e5e7eb' : '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '6px 10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        color: disabled ? '#9ca3af' : '#374151',
        minWidth: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const activeBtnStyle = {
        ...btnStyle(false),
        background: '#07614A',
        color: 'white',
        borderColor: '#07614A',
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
                style={btnStyle(currentPage === 1)}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ◀
            </button>
            {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: '6px 4px', color: '#9ca3af', fontSize: '14px' }}>...</span>
                ) : (
                    <button
                        key={page}
                        style={page === currentPage ? activeBtnStyle : btnStyle(false)}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}
            <button
                style={btnStyle(currentPage === totalPages)}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                ▶
            </button>
        </div>
    );
};

const AdminDashboard = () => {
    const [pendingWorkers, setPendingWorkers] = useState([]);
    const [users, setUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview');

    const [workerPage, setWorkerPage] = useState(1);
    const [customerPage, setCustomerPage] = useState(1);
    const [bookingPage, setBookingPage] = useState(1);
    const [complaintPage, setComplaintPage] = useState(1);

    const [workerSearch, setWorkerSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [bookingSearch, setBookingSearch] = useState('');
    const [complaintSearch, setComplaintSearch] = useState('');

    const fetchData = async () => {
        try {
            const workersRes = await api.get('/admin/pending-workers');
            setPendingWorkers(workersRes.data);

            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);

            const bookingsRes = await api.get('/admin/bookings');
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

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setComplaintsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchComplaints();
    }, []);

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
            const workersRes = await api.get('/admin/pending-workers');
            setPendingWorkers(workersRes.data);
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);
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

    const resolveComplaint = async (id) => {
        const complaint = complaints.find(c => c._id === id);
        const isResolved = complaint?.status === 'resolved' || complaint?.status === 'closed';
        const reply = prompt(isResolved ? "Enter additional response:" : "Enter resolution message for user:");
        if (!reply) return;
        try {
            const payload = { adminResponse: reply };
            if (!isResolved) payload.status = 'resolved';
            await api.patch(`/complaints/${id}/status`, payload);
            const res = await api.get('/complaints');
            setComplaints(res.data);
            toast.success('Ticket updated');
        } catch {
            alert("Failed");
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setWorkerPage(1);
        setCustomerPage(1);
        setBookingPage(1);
        setComplaintPage(1);
    };

    if (loading) return <div>Loading...</div>;

    const workers = users.filter(u => u.role === 'worker');
    const customers = users.filter(u => u.role === 'customer');

    const filteredWorkers = workers.filter(u =>
        !workerSearch || u.name?.toLowerCase().includes(workerSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(workerSearch.toLowerCase())
    );
    const filteredCustomers = customers.filter(u =>
        !customerSearch || u.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(customerSearch.toLowerCase())
    );
    const filteredBookings = recentBookings.filter(b =>
        !bookingSearch ||
        b.service?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.customerId?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.status?.toLowerCase().includes(bookingSearch.toLowerCase())
    );
    const filteredComplaints = complaints.filter(c =>
        !complaintSearch ||
        c.ticketId?.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.subject?.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.userId?.name?.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.status?.toLowerCase().includes(complaintSearch.toLowerCase())
    );

    const totalWorkerPages = Math.ceil(filteredWorkers.length / PAGE_SIZE.WORKERS);
    const totalCustomerPages = Math.ceil(filteredCustomers.length / PAGE_SIZE.CUSTOMERS);
    const totalBookingPages = Math.ceil(filteredBookings.length / PAGE_SIZE.BOOKINGS);
    const totalComplaintPages = Math.ceil(filteredComplaints.length / PAGE_SIZE.COMPLAINTS);

    const paginatedWorkers = filteredWorkers.slice((workerPage - 1) * PAGE_SIZE.WORKERS, workerPage * PAGE_SIZE.WORKERS);
    const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * PAGE_SIZE.CUSTOMERS, customerPage * PAGE_SIZE.CUSTOMERS);
    const paginatedBookings = filteredBookings.slice((bookingPage - 1) * PAGE_SIZE.BOOKINGS, bookingPage * PAGE_SIZE.BOOKINGS);
    const paginatedComplaints = filteredComplaints.slice((complaintPage - 1) * PAGE_SIZE.COMPLAINTS, complaintPage * PAGE_SIZE.COMPLAINTS);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'workers', label: `Workers (${filteredWorkers.length})` },
        { id: 'customers', label: `Customers (${filteredCustomers.length})` },
        { id: 'bookings', label: `Bookings (${filteredBookings.length})` },
        { id: 'complaints', label: `Complaints (${filteredComplaints.length})` },
    ];

    const workerData = stats?.workersBySkill.map(item => ({ name: item._id, value: item.count })) || [];
    const bookingData = stats?.bookingsByStatus.map(item => ({ name: item._id, value: item.count })) || [];
    const withdrawalFeesData = stats?.withdrawalsByStatus?.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count,
        fees: item.totalFees
    })) || [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const tabButtonStyle = (isActive) => ({
        padding: '10px 20px',
        border: 'none',
        background: isActive ? '#07614A' : '#f3f4f6',
        color: isActive ? 'white' : '#4b5563',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.2s',
    });

    const sectionStyle = {
        marginBottom: '40px',
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    };

    return (
        <div className="admin-dashboard">
            <Navbar />
            <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ margin: '0' }}>Admin Dashboard</h1>
                    <Link
                        to="/admin/withdrawals"
                        style={{
                            background: '#07614A',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Withdrawal Requests
                    </Link>
                </div>

                {/* Statistics Cards - Always Visible */}
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
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>Company Earnings</h3>
                            <p style={{ ...statValueStyle, color: 'white' }}>Rs {stats.overview.companyEarnings?.toLocaleString()}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0' }}>From {stats.overview.totalApprovedWithdrawals} withdrawals</p>
                        </div>
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>Pending Withdrawals</h3>
                            <p style={{ ...statValueStyle, color: 'white' }}>{stats.overview.pendingWithdrawals}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0' }}>Awaiting approval</p>
                        </div>
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>Amount Paid Out</h3>
                            <p style={{ ...statValueStyle, color: 'white' }}>Rs {stats.overview.totalAmountPaidOut?.toLocaleString()}</p>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0' }}>To workers (after fees)</p>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0', borderBottom: '2px solid #e5e7eb', overflowX: 'auto' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            style={tabButtonStyle(activeTab === tab.id)}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ==================== OVERVIEW TAB ==================== */}
                {activeTab === 'overview' && (
                    <div style={{ padding: '20px 0' }}>
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

                        {stats && withdrawalFeesData.length > 0 && (
                            <div style={{ ...cardStyle, marginBottom: '40px' }}>
                                <h3 style={{ marginTop: '0' }}>Withdrawal Fees by Status</h3>
                                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>Company earnings from 20% withdrawal fees</p>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={withdrawalFeesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'value') return [value + ' requests', 'Requests'];
                                                if (name === 'fees') return ['Rs ' + value?.toLocaleString(), 'Company Fees'];
                                                return value;
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="value" name="Requests" fill="#07614A" />
                                        <Bar dataKey="fees" name="Company Fees (Rs)" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Pending Approvals */}
                        <div className="section" style={sectionStyle}>
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
                    </div>
                )}

                {/* ==================== WORKERS TAB ==================== */}
                {activeTab === 'workers' && (
                    <div style={{ padding: '20px 0' }}>
                        {/* Pending Approvals */}
                        {pendingWorkers.length > 0 && (
                            <div className="section" style={sectionStyle}>
                                <h2>Pending Verification ({pendingWorkers.length})</h2>
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
                            </div>
                        )}

                        <div className="section" style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <h2>All Workers ({filteredWorkers.length})</h2>
                                <input
                                    type="text"
                                    placeholder="Search workers by name or email..."
                                    value={workerSearch}
                                    onChange={e => { setWorkerSearch(e.target.value); setWorkerPage(1); }}
                                    style={searchInputStyle}
                                />
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                            <th style={{ padding: '12px' }}>Name</th>
                                            <th style={{ padding: '12px' }}>Email</th>
                                            <th style={{ padding: '12px' }}>Status</th>
                                            <th style={{ padding: '12px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedWorkers.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No workers found</td></tr>
                                        ) : (
                                            paginatedWorkers.map(u => (
                                                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', fontWeight: 500 }}>{u.name}</td>
                                                    <td style={{ padding: '12px', color: '#666' }}>{u.email}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={roleBadgeStyle('worker')}>WORKER</span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                        <Link to={`/admin/user/${u._id}`} style={{ marginLeft: '8px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}>
                                                            View Profile
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={workerPage} totalPages={totalWorkerPages} onPageChange={setWorkerPage} />
                        </div>
                    </div>
                )}

                {/* ==================== CUSTOMERS TAB ==================== */}
                {activeTab === 'customers' && (
                    <div style={{ padding: '20px 0' }}>
                        <div className="section" style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <h2>All Customers ({filteredCustomers.length})</h2>
                                <input
                                    type="text"
                                    placeholder="Search customers by name or email..."
                                    value={customerSearch}
                                    onChange={e => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                                    style={searchInputStyle}
                                />
                            </div>
                            <div style={{ overflowX: 'auto' }}>
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
                                        {paginatedCustomers.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No customers found</td></tr>
                                        ) : (
                                            paginatedCustomers.map(u => (
                                                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', fontWeight: 500 }}>{u.name}</td>
                                                    <td style={{ padding: '12px', color: '#666' }}>{u.email}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={roleBadgeStyle('customer')}>CUSTOMER</span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                        <Link to={`/admin/user/${u._id}`} style={{ marginLeft: '8px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}>
                                                            View Profile
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={customerPage} totalPages={totalCustomerPages} onPageChange={setCustomerPage} />
                        </div>
                    </div>
                )}

                {/* ==================== BOOKINGS TAB ==================== */}
                {activeTab === 'bookings' && (
                    <div style={{ padding: '20px 0' }}>
                        <div className="section" style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <h2>All Bookings ({filteredBookings.length})</h2>
                                <input
                                    type="text"
                                    placeholder="Search by service, customer, or status..."
                                    value={bookingSearch}
                                    onChange={e => { setBookingSearch(e.target.value); setBookingPage(1); }}
                                    style={searchInputStyle}
                                />
                            </div>
                            <div style={{ overflowX: 'auto' }}>
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
                                        {paginatedBookings.length === 0 ? (
                                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No bookings found</td></tr>
                                        ) : (
                                            paginatedBookings.map(booking => (
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={bookingPage} totalPages={totalBookingPages} onPageChange={setBookingPage} />
                        </div>
                    </div>
                )}

                {/* ==================== COMPLAINTS TAB ==================== */}
                {activeTab === 'complaints' && (
                    <div style={{ padding: '20px 0' }}>
                        <div className="section" style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <h2>Support Tickets ({filteredComplaints.length})</h2>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        placeholder="Search by ticket ID, subject, user, or status..."
                                        value={complaintSearch}
                                        onChange={e => { setComplaintSearch(e.target.value); setComplaintPage(1); }}
                                        style={searchInputStyle}
                                    />
                                </div>
                            </div>
                            {complaintsLoading ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>Loading tickets...</div>
                            ) : complaints.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No tickets found.</div>
                            ) : (
                                <>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                            <thead>
                                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                                    <th style={{ padding: '10px' }}>Ticket</th>
                                                    <th style={{ padding: '10px' }}>User</th>
                                                    <th style={{ padding: '10px' }}>Subject</th>
                                                    <th style={{ padding: '10px' }}>Category</th>
                                                    <th style={{ padding: '10px' }}>Priority</th>
                                                    <th style={{ padding: '10px' }}>Status</th>
                                                    <th style={{ padding: '10px' }}>Date</th>
                                                    <th style={{ padding: '10px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedComplaints.map(c => {
                                                    const statusColors = {
                                                        open: { bg: '#fef3c7', color: '#92400e' },
                                                        in_progress: { bg: '#dbeafe', color: '#1e40af' },
                                                        waiting_on_customer: { bg: '#f3e8ff', color: '#6b21a8' },
                                                        resolved: { bg: '#d1fae5', color: '#065f46' },
                                                        closed: { bg: '#e5e7eb', color: '#374151' },
                                                    };
                                                    const priorityColors = {
                                                        low: { bg: '#e5e7eb', color: '#374151' },
                                                        medium: { bg: '#fef3c7', color: '#92400e' },
                                                        high: { bg: '#fee2e2', color: '#991b1b' },
                                                        urgent: { bg: '#fecaca', color: '#7f1d1d' },
                                                    };
                                                    const sc = statusColors[c.status] || statusColors.open;
                                                    const pc = priorityColors[c.priority] || priorityColors.medium;
                                                    return (
                                                        <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td style={{ padding: '10px' }}>
                                                                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#07614A', background: '#e6f7f2', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px' }}>
                                                                    {c.ticketId}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <div style={{ fontWeight: 500, fontSize: '14px' }}>{c.userId?.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.userId?.email}</div>
                                                            </td>
                                                            <td style={{ padding: '10px', fontWeight: 500, fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</td>
                                                            <td style={{ padding: '10px', fontSize: '13px', textTransform: 'capitalize' }}>{c.category}</td>
                                                            <td style={{ padding: '10px' }}>
                                                                <select
                                                                    value={c.priority || 'medium'}
                                                                    onChange={async (e) => {
                                                                        await api.patch(`/complaints/${c._id}/status`, { priority: e.target.value });
                                                                        const res = await api.get('/complaints');
                                                                        setComplaints(res.data);
                                                                        toast.success('Priority updated');
                                                                    }}
                                                                    style={{
                                                                        padding: '3px 6px', borderRadius: '4px', border: '1px solid #ddd',
                                                                        fontSize: '11px', fontWeight: 600, ...pc
                                                                    }}
                                                                >
                                                                    <option value="low">Low</option>
                                                                    <option value="medium">Medium</option>
                                                                    <option value="high">High</option>
                                                                    <option value="urgent">Urgent</option>
                                                                </select>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <select
                                                                    value={c.status}
                                                                    onChange={async (e) => {
                                                                        await api.patch(`/complaints/${c._id}/status`, { status: e.target.value });
                                                                        const res = await api.get('/complaints');
                                                                        setComplaints(res.data);
                                                                        toast.success('Status updated');
                                                                    }}
                                                                    style={{
                                                                        padding: '3px 6px', borderRadius: '4px', border: '1px solid #ddd',
                                                                        fontSize: '11px', fontWeight: 600, ...sc
                                                                    }}
                                                                >
                                                                    <option value="open">Open</option>
                                                                    <option value="in_progress">In Progress</option>
                                                                    <option value="waiting_on_customer">Waiting on Customer</option>
                                                                    <option value="resolved">Resolved</option>
                                                                    <option value="closed">Closed</option>
                                                                </select>
                                                            </td>
                                                            <td style={{ padding: '10px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                                                {new Date(c.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <button
                                                                    onClick={() => resolveComplaint(c._id)}
                                                                    style={{
                                                                        background: c.status === 'resolved' || c.status === 'closed' ? '#e5e7eb' : '#07614A',
                                                                        color: c.status === 'resolved' || c.status === 'closed' ? '#9ca3af' : 'white',
                                                                        border: 'none', padding: '5px 10px', borderRadius: '4px',
                                                                        cursor: c.status === 'resolved' || c.status === 'closed' ? 'not-allowed' : 'pointer',
                                                                        fontSize: '11px', fontWeight: 600
                                                                    }}
                                                                    disabled={c.status === 'resolved' || c.status === 'closed'}
                                                                >
                                                                    {c.adminResponse ? 'Reply' : 'Resolve'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination currentPage={complaintPage} totalPages={totalComplaintPages} onPageChange={setComplaintPage} />
                                </>
                            )}
                        </div>
                    </div>
                )}
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

const searchInputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    width: '260px',
    maxWidth: '100%',
    transition: 'border-color 0.2s',
};

const roleBadgeStyle = (role) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    background: role === 'worker' ? '#dcfce7' : '#f3f4f6',
    color: role === 'worker' ? '#16a34a' : '#4b5563'
});

export default AdminDashboard;
