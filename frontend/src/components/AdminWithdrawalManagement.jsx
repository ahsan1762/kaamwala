import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import './AdminWithdrawalManagement.css';

const AdminWithdrawalManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/withdrawal-requests', {
                params: { status: filterStatus }
            });
            setRequests(res.data);
        } catch (error) {
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setActionType('approve');
        setAdminNotes('Approved');
        setShowModal(true);
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setActionType('reject');
        setAdminNotes('');
        setShowModal(true);
    };

    const submitAction = async () => {
        if (!adminNotes.trim() && actionType === 'reject') {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        try {
            const endpoint = actionType === 'approve'
                ? `/admin/withdrawal-requests/${selectedRequest._id}/approve`
                : `/admin/withdrawal-requests/${selectedRequest._id}/reject`;

            await api.patch(endpoint, { adminNotes });

            toast.success(actionType === 'approve' ? 'Withdrawal approved' : 'Withdrawal rejected');
            setShowModal(false);
            setSelectedRequest(null);
            setAdminNotes('');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={18} style={{ color: '#f59e0b' }} />;
            case 'approved':
                return <CheckCircle size={18} style={{ color: '#10b981' }} />;
            case 'rejected':
                return <XCircle size={18} style={{ color: '#ef4444' }} />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-withdrawal">
            <h2 className="page-title">Withdrawal Requests</h2>

            <div className="filter-tabs">
                {['pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                        onClick={() => setFilterStatus(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="loading-text">Loading requests...</p>
            ) : requests.length === 0 ? (
                <p className="empty-text">No {filterStatus} requests</p>
            ) : (
                <div className="requests-table-wrapper">
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Worker</th>
                                <th>Email</th>
                                <th>Requested</th>
                                <th>Company Fee (20%)</th>
                                <th>Worker Receives</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                {filterStatus === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request._id}>
                                    <td><strong>{request.workerName}</strong></td>
                                    <td>{request.workerId?.email || 'N/A'}</td>
                                    <td className="amount">Rs. {request.amount?.toLocaleString()}</td>
                                    <td className="fee-amount" style={{ color: '#ef4444' }}>
                                        Rs. {request.companyFee?.toLocaleString() || (request.amount * 0.20)?.toLocaleString()}
                                    </td>
                                    <td className="amount" style={{ color: '#10b981', fontWeight: 'bold' }}>
                                        Rs. {request.netAmount?.toLocaleString() || (request.amount * 0.80)?.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className="method-badge">
                                            {request.method === 'bank' ? 'Bank' : request.method.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${request.status}`}>
                                            {getStatusIcon(request.status)}
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                    </td>
                                    {filterStatus === 'pending' && (
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn approve-btn"
                                                onClick={() => handleApprove(request)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="action-btn reject-btn"
                                                onClick={() => handleReject(request)}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {actionType === 'approve'
                                    ? 'Approve Withdrawal Request'
                                    : 'Reject Withdrawal Request'}
                            </h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="request-info">
                                <p><strong>Worker:</strong> {selectedRequest?.workerName}</p>
                                <p><strong>Method:</strong> {selectedRequest?.method.toUpperCase()}</p>
                                <p><strong>Account:</strong> {selectedRequest?.methodDetails}</p>
                            </div>

                            <div className="fee-breakdown-modal">
                                <div className="fee-row">
                                    <span>Requested Amount:</span>
                                    <strong>Rs. {selectedRequest?.amount?.toLocaleString()}</strong>
                                </div>
                                <div className="fee-row fee-warning">
                                    <span>Company Fee (20%):</span>
                                    <strong style={{ color: '#ef4444' }}>- Rs. {(selectedRequest?.companyFee || selectedRequest?.amount * 0.20)?.toLocaleString()}</strong>
                                </div>
                                <div className="fee-row fee-total">
                                    <span>Worker Will Receive:</span>
                                    <strong style={{ color: '#10b981' }}>Rs. {(selectedRequest?.netAmount || selectedRequest?.amount * 0.80)?.toLocaleString()}</strong>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    {actionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder={
                                        actionType === 'approve'
                                            ? 'Enter approval notes (optional)'
                                            : 'Enter reason for rejection'
                                    }
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={submitAction}
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? 'Processing...'
                                    : (actionType === 'approve' ? 'Approve' : 'Reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWithdrawalManagement;
