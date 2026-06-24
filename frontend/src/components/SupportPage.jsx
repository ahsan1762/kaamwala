import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Send, Clock, User, Tag, AlertTriangle, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const STATUS_COLORS = {
    open: { bg: '#fef3c7', color: '#92400e' },
    in_progress: { bg: '#dbeafe', color: '#1e40af' },
    waiting_on_customer: { bg: '#f3e8ff', color: '#6b21a8' },
    resolved: { bg: '#d1fae5', color: '#065f46' },
    closed: { bg: '#e5e7eb', color: '#374151' },
};

const PRIORITY_COLORS = {
    low: { bg: '#e5e7eb', color: '#374151' },
    medium: { bg: '#fef3c7', color: '#92400e' },
    high: { bg: '#fee2e2', color: '#991b1b' },
    urgent: { bg: '#fecaca', color: '#7f1d1d' },
};

const CATEGORY_ICONS = {
    booking: '📋',
    payment: '💰',
    worker: '👷',
    technical: '🔧',
    other: '📝',
};

const SupportPage = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [complaints, setComplaints] = useState([]);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('other');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/my');
            setComplaints(res.data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/complaints', { subject, description, category, priority });
            toast.success("Ticket submitted successfully");
            setSubject('');
            setDescription('');
            setCategory('other');
            setPriority('medium');
            fetchComplaints();
            setActiveTab('history');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit ticket");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px',
        outline: 'none', boxSizing: 'border-box',
    };

    const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333', fontSize: '14px' };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#1a1a1a' }}>Support & Help</h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>We are here to help. Submit your query or complaint below.</p>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
                    <button
                        onClick={() => setActiveTab('new')}
                        style={{
                            padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: activeTab === 'new' ? '3px solid #07614A' : '3px solid transparent',
                            color: activeTab === 'new' ? '#07614A' : '#666', fontWeight: 600, fontSize: '15px'
                        }}
                    >
                        New Ticket
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: activeTab === 'history' ? '3px solid #07614A' : '3px solid transparent',
                            color: activeTab === 'history' ? '#07614A' : '#666', fontWeight: 600, fontSize: '15px'
                        }}
                    >
                        My Tickets ({complaints.length})
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Subject / Issue Title</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Booking Issue, Payment Problem"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                        <option value="booking">📋 Booking Issue</option>
                                        <option value="payment">💰 Payment Problem</option>
                                        <option value="worker">👷 Worker Concern</option>
                                        <option value="technical">🔧 Technical Issue</option>
                                        <option value="other">📝 Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Priority</label>
                                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🔴 High</option>
                                        <option value="urgent">⛔ Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    rows="5"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe your issue in detail. Include relevant booking IDs or order numbers if applicable."
                                    required
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#07614A', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '10px',
                                    fontWeight: 600, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px', opacity: loading ? 0.7 : 1
                                }}
                            >
                                <Send size={18} /> {loading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {complaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 40px', color: '#9ca3af', background: 'white', borderRadius: '16px' }}>
                                <AlertTriangle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px', color: '#6b7280' }}>No Tickets Yet</h3>
                                <p style={{ margin: 0, fontSize: '14px' }}>Submit your first ticket above and track it here.</p>
                            </div>
                        ) : (
                            complaints.map(ticket => {
                                const sc = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;
                                const pc = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium;
                                return (
                                    <div key={ticket._id} style={{
                                        background: 'white', padding: '20px', borderRadius: '12px',
                                        border: '1px solid #eee', borderLeft: `4px solid ${sc.color}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                            <div>
                                                <span style={{
                                                    fontFamily: 'monospace', fontSize: '13px', fontWeight: 700,
                                                    color: '#07614A', background: '#e6f7f2', padding: '3px 10px',
                                                    borderRadius: '4px', letterSpacing: '0.5px'
                                                }}>
                                                    {ticket.ticketId}
                                                </span>
                                                <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '8px 0 0' }}>{ticket.subject}</h3>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                                    fontWeight: 700, textTransform: 'uppercase', ...sc
                                                }}>
                                                    {ticket.status.replace(/_/g, ' ')}
                                                </span>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                                    fontWeight: 600, ...pc
                                                }}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                        </div>

                                        <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>{ticket.description}</p>

                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap', marginBottom: ticket.adminResponse ? '12px' : 0 }}>
                                            <span>{CATEGORY_ICONS[ticket.category] || '📝'} {ticket.category}</span>
                                            <span><Clock size={12} style={{ marginRight: '4px' }} />{formatDate(ticket.createdAt)}</span>
                                            {ticket.assignedTo && <span><User size={12} style={{ marginRight: '4px' }} />Assigned to {ticket.assignedTo.name}</span>}
                                        </div>

                                        {ticket.adminResponse && (
                                            <div style={{
                                                background: '#f0fdf4', padding: '16px', borderRadius: '8px',
                                                borderLeft: '4px solid #07614A', marginTop: '8px'
                                            }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#07614A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <User size={12} style={{ marginRight: '6px' }} /> Admin Response
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>{ticket.adminResponse}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportPage;
