import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Wrench, User, LogOut, Settings, LayoutDashboard, History, ChevronDown, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationDropdown from './NotificationDropdown';
import api from '../api';
import toast from 'react-hot-toast';
import './Navbar.css';
import './Notification.css'; // Ensure CSS is imported

import logo from '../assets/logo-kaamwala.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { socket } = useSocket() || {};
    const socketInstance = useSocket();

    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showBookingMenu, setShowBookingMenu] = useState(false);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    // Socket Listener for Notifications
    useEffect(() => {
        if (!socketInstance || !user) return;

        const handleNotification = (data) => {
            // We can optimistically add if data contains full notification, 
            // but usually socket just says "something happened". 
            // Ideally backend emits the generic 'notification' event whenever a Notification is created.
            // OR we listen to specific events and manually fetch/toast.

            // Strategy: Listen to specific events, toast, and REFRETCH list.
            toast("New Notification Received");
            fetchNotifications();
        };

        // If backend emits 'notification' event (generic), use that. 
        // But currently backend emits: 'booking_created', 'booking_updated', 'new_message'.
        // Let's listen to those relevant to us.

        socketInstance.on('booking_created', () => { if (user.role === 'worker') fetchNotifications(); });
        socketInstance.on('booking_updated', () => fetchNotifications());
        socketInstance.on('new_message', (msg) => {
            // Refresh notifications if I am the recipient (logic check is hard on client without data, but fetching is cheap)
            // The backend emits 'new_message' to everyone currently (simple implementation). 
            // We should check if the message is relevant, but 'fetchNotifications' will basically just get *my* new notifications from DB.
            // So calling it is safe and correct.
            fetchNotifications();
            toast('New message received', { icon: '💬' });
        });

        return () => {
            socketInstance.off('booking_created');
            socketInstance.off('booking_updated');
            socketInstance.off('new_message');
        };
    }, [socketInstance, user]);

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    // Close menus when clicking outside

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showBookingMenu) setShowBookingMenu(false);
            if (showUserMenu) setShowUserMenu(false);
        };

        if (showBookingMenu || showUserMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showBookingMenu, showUserMenu]);

    // Prevent closing when clicking inside the dropdown
    const handleBookingClick = (e) => {
        e.stopPropagation();
        setShowBookingMenu(!showBookingMenu);
        if (showUserMenu) setShowUserMenu(false);
    };

    const handleUserMenuClick = (e) => {
        e.stopPropagation();
        setShowUserMenu(!showUserMenu);
        if (showBookingMenu) setShowBookingMenu(false);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    const navLinks = [
        { name: 'Home', path: '/home' },
        { name: 'Services', path: '/services' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const getInitials = (user) => {
        const name = user.name || user.fullName;
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/home" className="nav-logo">
                    <img src={logo} alt="KaamWala Logo" className="logo-image" style={{ height: '90px', width: 'auto' }} />
                </Link>

                {/* Right Section Wrapper */}
                <div className="nav-right-section">

                    {/* Desktop Navigation Links */}
                    <div className="nav-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Booking Dropdown - Only for Customers or Guests */}
                        {(!user || user.role === 'customer') && (
                            <div
                                className="nav-item-dropdown"
                                onClick={handleBookingClick}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <span className={`nav-link ${location.pathname.includes('booking') ? 'active' : ''}`}>
                                    Booking
                                </span>
                                <ChevronDown size={16} color={location.pathname.includes('booking') ? '#07614A' : '#666'} />

                                {showBookingMenu && (
                                    <div className="dropdown booking-dropdown">
                                        <Link to="/booking?tab=new" className="dropdown-item">New Booking</Link>
                                        <Link to="/booking?tab=history" className="dropdown-item">Booking History</Link>
                                        <Link to="/booking?tab=track" className="dropdown-item">Track Booking</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Become a Worker Button - hide if worker is logged in */}
                    {(!user || user.role !== 'worker') && (
                        <Link to="/become-worker">
                            <button className="btn-become-worker">Become a Worker</button>
                        </Link>
                    )}

                    {/* Notification Bell */}
                    {user && (
                        <div className="nav-icon-container" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={24} color="#333" />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

                            {showNotifications && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onClose={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                                    onRead={handleRead}
                                    onMarkAllRead={handleMarkAllRead}
                                />
                            )}
                        </div>
                    )}

                    {/* Auth Section */}
                    <div className="nav-auth">
                        {user ? (
                            <div className="user-menu">
                                <div
                                    className="avatar"
                                    onClick={handleUserMenuClick}
                                >
                                    {getInitials(user)}
                                </div>

                                {showUserMenu && (
                                    <div className="dropdown user-dropdown-menu">
                                        <div className="dropdown-header">
                                            <p style={{ fontWeight: 600 }}>{user.name || user.fullName}</p>
                                            <p style={{ fontSize: '12px', color: '#666' }}>{user.email}</p>
                                        </div>
                                        {user.role === 'worker' ? (
                                            <>
                                                <Link to="/worker-profile" className="dropdown-item">
                                                    <User size={14} style={{ marginRight: '8px' }} /> Public Profile
                                                </Link>
                                                <Link to="/worker-dashboard" className="dropdown-item">
                                                    <LayoutDashboard size={14} style={{ marginRight: '8px' }} /> Dashboard
                                                </Link>
                                            </>
                                        ) : (
                                            <Link to="/booking?tab=history" className="dropdown-item">
                                                <LayoutDashboard size={14} style={{ marginRight: '8px' }} /> Dashboard
                                            </Link>
                                        )}
                                        <Link to="/profile" className="dropdown-item">
                                            <Settings size={14} style={{ marginRight: '8px' }} /> Account Settings
                                        </Link>
                                        <Link to="/support" className="dropdown-item">
                                            <AlertCircle size={14} style={{ marginRight: '8px' }} /> Support & Help
                                        </Link>
                                        {/* Settings link probably doesn't exist yet, can leave it or remove */}
                                        <div style={{ borderTop: '1px solid #eee', marginTop: '5px' }}>
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item btn-logout"
                                            >
                                                <LogOut size={14} style={{ marginRight: '8px' }} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="btn-login">Login</button>
                                </Link>
                                <Link to="/signup">
                                    <button className="btn-signup">Sign Up</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="mobile-toggle"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu">
                    {user && (
                        <div className="mobile-user-info" style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ width: '35px', height: '35px', fontSize: '14px' }}>{getInitials(user)}</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name || user.fullName}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{user.role === 'worker' ? 'Worker Account' : 'Customer Account'}</div>
                            </div>
                        </div>
                    )}
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={location.pathname === link.path ? 'active' : ''}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="mobile-dropdown-header">Booking</div>
                    <Link to="/booking?tab=new" className="mobile-sublink" onClick={() => setIsOpen(false)}>New Booking</Link>
                    <Link to="/booking?tab=history" className="mobile-sublink" onClick={() => setIsOpen(false)}>Booking History</Link>
                    <Link to="/booking?tab=track" className="mobile-sublink" onClick={() => setIsOpen(false)}>Track Booking</Link>

                    {(!user || user.role !== 'worker') && (
                        <Link to="/become-worker" onClick={() => setIsOpen(false)}>
                            <button className="btn-become-worker mobile-btn">Become a Worker</button>
                        </Link>
                    )}

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                        {user ? (
                            <button onClick={handleLogout} className="btn-logout" style={{ padding: '10px', width: '100%', textAlign: 'left' }}>Logout</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to="/login" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>
                                    <button className="btn-login" style={{ width: '100%' }}>Login</button>
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>
                                    <button className="btn-signup" style={{ width: '100%' }}>Sign Up</button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
