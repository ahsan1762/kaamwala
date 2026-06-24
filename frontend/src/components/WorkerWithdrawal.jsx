import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api';
import { Send, History, AlertCircle } from 'lucide-react';
import './WorkerWithdrawal.css';

const WorkerWithdrawal = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'easypaisa',
    });
    const [payoutInfo, setPayoutInfo] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('request');

    useEffect(() => {
        fetchPayoutInfo();
        fetchWithdrawalHistory();
    }, []);

    const fetchPayoutInfo = async () => {
        try {
            const res = await api.get('/worker/earnings');
            setPayoutInfo(res.data);
        } catch (error) {
            console.error('Error fetching payout info:', error);
            toast.error('Failed to load earnings');
        }
    };

    const fetchWithdrawalHistory = async () => {
        setFetchingHistory(true);
        try {
            const res = await api.get('/worker/withdrawal-history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load withdrawal history');
        } finally {
            setFetchingHistory(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || formData.amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (parseFloat(formData.amount) > (payoutInfo?.availableBalance || 0)) {
            toast.error('Insufficient balance');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/worker/request-withdrawal', {
                amount: parseFloat(formData.amount),
                method: formData.method,
            });

            toast.success(res.data.message);
            setFormData({ amount: '', method: 'easypaisa' });
            fetchPayoutInfo();
            fetchWithdrawalHistory();
            setActiveTab('history');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request withdrawal');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#f59e0b';
            case 'approved':
                return '#10b981';
            case 'rejected':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="withdrawal-container">
            <h2 className="page-title">Withdrawal Management</h2>

            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
                    onClick={() => setActiveTab('request')}
                >
                    <Send size={18} /> Request Withdrawal
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} /> Withdrawal History
                </button>
            </div>

            {activeTab === 'request' && (
                <div className="tab-content">
                    {payoutInfo && (
                        <div className="balance-panel">
                            <div className="balance-item">
                                <p className="balance-label">Available Balance</p>
                                <p className="balance-amount">Rs. {payoutInfo.availableBalance?.toLocaleString()}</p>
                            </div>
                            <div className="balance-item">
                                <p className="balance-label">Total Earnings</p>
                                <p className="balance-amount">Rs. {payoutInfo.totalEarnings?.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="withdrawal-form">
                        <div className="form-group">
                            <label>Withdrawal Amount</label>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter amount"
                                value={formData.amount}
                                onChange={handleChange}
                                min="100"
                                step="100"
                            />
                            <small>Minimum withdrawal: Rs. 100</small>
                        </div>

                        {formData.amount > 0 && (
                            <div className="fee-breakdown">
                                <div className="fee-item">
                                    <span>Requested Amount:</span>
                                    <strong>Rs. {parseFloat(formData.amount).toLocaleString()}</strong>
                                </div>
                                <div className="fee-item fee-warning">
                                    <span>Company Fee (20%):</span>
                                    <strong style={{ color: '#ef4444' }}>- Rs. {(parseFloat(formData.amount) * 0.20).toLocaleString()}</strong>
                                </div>
                                <div className="fee-item fee-total">
                                    <span>You Will Receive:</span>
                                    <strong style={{ color: '#10b981' }}>Rs. {(parseFloat(formData.amount) * 0.80).toLocaleString()}</strong>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Payment Method</label>
                            <select
                                name="method"
                                value={formData.method}
                                onChange={handleChange}
                            >
                                <option value="easypaisa">Easypaisa</option>
                                <option value="jazzcash">Jazz Cash</option>
                                <option value="bank">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="info-box">
                            <AlertCircle size={18} />
                            <div>
                                <p className="info-title">How it works</p>
                                <p className="info-text">
                                    Your withdrawal request will be sent to admin for verification. 
                                    Once approved, funds will be transferred to your selected payment method. 
                                    A 20% platform fee will be deducted from your withdrawal amount.
                                </p>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="tab-content">
                    {fetchingHistory ? (
                        <p className="loading-text">Loading history...</p>
                    ) : history.length === 0 ? (
                        <p className="empty-text">No withdrawal requests yet</p>
                    ) : (
                        <div className="history-list">
                            {history.map((request) => (
                                <div key={request._id} className="history-item">
                                    <div className="item-main">
                                        <div className="item-info">
                                            <p className="item-amount">Rs. {request.amount?.toLocaleString()}</p>
                                            <p className="item-method">{request.method.toUpperCase()}</p>
                                            {request.status === 'approved' && (
                                                <div className="fee-info-small">
                                                    <small>Company Fee: Rs. {request.companyFee?.toLocaleString()}</small>
                                                    <small style={{ color: '#10b981', fontWeight: 'bold' }}>You get: Rs. {request.netAmount?.toLocaleString()}</small>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-status">
                                            <span
                                                className="status-badge"
                                                style={{ 
                                                    backgroundColor: getStatusColor(request.status),
                                                    opacity: 0.2 
                                                }}
                                            >
                                                <span style={{ color: getStatusColor(request.status) }}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-footer">
                                        <small>{new Date(request.createdAt).toLocaleDateString()}</small>
                                        {request.adminNotes && (
                                            <small className="admin-notes">
                                                Admin: {request.adminNotes}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkerWithdrawal;
