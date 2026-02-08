import React from 'react';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api';

const NotificationDropdown = ({ notifications, onClose, onRead, onMarkAllRead }) => {

    if (!notifications || notifications.length === 0) {
        return (
            <div className="notification-dropdown">
                <div className="notification-header">
                    <h4>Notifications</h4>
                    <button onClick={onClose}><X size={16} /></button>
                </div>
                <div className="notification-empty">
                    <p>No notifications yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h4>Notifications</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onMarkAllRead} className="mark-all-btn">Mark all read</button>
                    <button onClick={onClose}><X size={16} /></button>
                </div>
            </div>
            <div className="notification-list">
                {notifications.map(n => (
                    <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => onRead(n._id)}>
                        <div className="notification-content">
                            <p className="notification-text">{n.message}</p>
                            <span className="notification-time">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        {!n.isRead && <span className="unread-dot"></span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationDropdown;
