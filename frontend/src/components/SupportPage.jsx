import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { MessageSquare, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const SupportPage = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [complaints, setComplaints] = useState([]);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
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
            await api.post('/complaints', { subject, description });
            toast.success("Complaint submitted successfully");
            setSubject('');
            setDescription('');
            fetchComplaints();
            setActiveTab('history');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    };

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
                            color: activeTab === 'new' ? '#07614A' : '#666', fontWeight: 600
                        }}
                    >
                        New Ticket
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: activeTab === 'history' ? '3px solid #07614A' : '3px solid transparent',
                            color: activeTab === 'history' ? '#07614A' : '#666', fontWeight: 600
                        }}
                    >
                        My Tickets ({complaints.length})
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Subject / Issue Type</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Booking Issue, Payment Problem"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>Description</label>
                                <textarea
                                    rows="5"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe your issue in detail..."
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', resize: 'vertical' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#07614A', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '10px',
                                    fontWeight: 600, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <Send size={18} /> {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {complaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No complaints filed yet.</div>
                        ) : (
                            complaints.map(ticket => (
                                <div key={ticket._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{ticket.subject}</h3>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
                                            background: ticket.status === 'resolved' ? '#d1fae5' : '#f3f4f6',
                                            color: ticket.status === 'resolved' ? '#059669' : '#4b5563'
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' }}>{ticket.description}</p>

                                    {ticket.adminResponse && (
                                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px', borderLeft: '4px solid #07614A' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#07614A', marginBottom: '5px' }}>ADMIN RESPONSE</div>
                                            <div style={{ fontSize: '14px', color: '#333' }}>{ticket.adminResponse}</div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#999', display: 'flex', gap: '15px' }}>
                                        <span>ID: {ticket._id}</span>
                                        <span>Date: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportPage;
