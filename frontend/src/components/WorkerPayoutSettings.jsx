import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api';
import { CheckCircle, Plus, X } from 'lucide-react';
import './WorkerPayoutSettings.css';

const WorkerPayoutSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [payoutInfo, setPayoutInfo] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [formData, setFormData] = useState({
        phoneNumber: '',
        accountNumber: '',
        accountTitle: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPayoutInfo();
    }, []);

    const fetchPayoutInfo = async () => {
        try {
            const res = await api.get('/worker/earnings');
            setPayoutInfo(res.data);
        } catch (error) {
            console.error('Error fetching payout info:', error);
            toast.error('Failed to load payout information');
        }
    };

    const validatePhone = (phone) => /^03\d{2}-\d{7}$/.test(phone);

    const formatPhoneNumber = (value) => {
        let cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
        
        if (cleaned.length <= 4) {
            return cleaned;
        } else if (cleaned.length <= 7) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        } else {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
        }
    };

    const handlePhoneChange = (value) => {
        const formatted = formatPhoneNumber(value);
        setFormData(prev => ({ ...prev, phoneNumber: formatted }));
        setErrors(prev => ({ ...prev, phoneNumber: '' }));
    };

    const handleAccountChange = (value) => {
        const formatted = formatPhoneNumber(value);
        setFormData(prev => ({ ...prev, accountNumber: formatted }));
        setErrors(prev => ({ ...prev, accountNumber: '' }));
    };

    const handleTitleChange = (e) => {
        setFormData(prev => ({ ...prev, accountTitle: e.target.value }));
        setErrors(prev => ({ ...prev, accountTitle: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!selectedMethod) {
            newErrors.method = 'Please select a payment method';
        }

        if (selectedMethod === 'bank') {
            if (!formData.accountNumber) {
                newErrors.accountNumber = 'Account number is required';
            } else if (!validatePhone(formData.accountNumber)) {
                newErrors.accountNumber = 'Invalid account format. Use: 03xx-xxxxxxx';
            }
            if (!formData.accountTitle) {
                newErrors.accountTitle = 'Account title is required';
            }
        } else if (selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') {
            if (!formData.phoneNumber) {
                newErrors.phoneNumber = 'Phone number is required';
            } else if (!validatePhone(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Invalid phone format. Use: 03xx-xxxxxxx';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {};

            if (selectedMethod === 'bank') {
                payload.bankAccount = formData.accountNumber;
                payload.accountTitle = formData.accountTitle;
                payload.preferredMethod = 'bankTransfer';
            } else if (selectedMethod === 'easypaisa') {
                payload.easypaisaPhone = formData.phoneNumber;
                payload.preferredMethod = 'easypaisa';
            } else if (selectedMethod === 'jazzcash') {
                payload.jazzcashPhone = formData.phoneNumber;
                payload.preferredMethod = 'jazzcash';
            }

            await api.put('/worker/payout-methods', payload);
            toast.success(`${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} added successfully!`);
            setSelectedMethod('');
            setFormData({ phoneNumber: '', accountNumber: '', accountTitle: '' });
            fetchPayoutInfo();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add payout method');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payout-settings-new">
            <div className="payout-grid">
                {/* Left Side - Balance Card */}
                <div className="balance-section">
                    <div className="balance-card">
                        <div className="balance-header">
                            
                            <h3>Available Withdrawal Amount</h3>
                        </div>
                        <div className="balance-display">
                            <span className="balance-amount">
                                Rs. {payoutInfo?.availableBalance?.toLocaleString() || '0'}
                            </span>
                            <span className="balance-subtitle">
                                Total Earnings: Rs. {payoutInfo?.totalEarnings?.toLocaleString() || '0'}
                            </span>
                        </div>
                    </div>

                    {/* Active Methods Display */}
                    <div className="active-methods">
                        <h4>Active Payment Methods</h4>
                        {payoutInfo?.payoutMethods && Object.keys(payoutInfo.payoutMethods).length > 0 ? (
                            <div className="methods-list">
                                {payoutInfo.payoutMethods.easypaisa?.enabled && (
                                    <div className="method-item">
                                        <CheckCircle size={20} />
                                        <span>Easypaisa: {payoutInfo.payoutMethods.easypaisa.phoneNumber}</span>
                                    </div>
                                )}
                                {payoutInfo.payoutMethods.jazzcash?.enabled && (
                                    <div className="method-item">
                                        <CheckCircle size={20} />
                                        <span>Jazz Cash: {payoutInfo.payoutMethods.jazzcash.phoneNumber}</span>
                                    </div>
                                )}
                                {payoutInfo.payoutMethods.bankTransfer?.enabled && (
                                    <div className="method-item">
                                        <CheckCircle size={20} />
                                        <span>Bank: {payoutInfo.payoutMethods.bankTransfer.accountNumber}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="no-methods">No payment methods added yet</p>
                        )}
                    </div>
                </div>

                {/* Right Side - Add Method Form */}
                <div className="form-section">
                    <div className="form-header">
                        <Plus size={24} />
                        <h3>Add Payment Method</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="payout-form">
                        {/* Method Selection Dropdown */}
                        <div className="form-group">
                            <label>Select Payment Method</label>
                            <select
                                value={selectedMethod}
                                onChange={(e) => {
                                    setSelectedMethod(e.target.value);
                                    setFormData({ phoneNumber: '', accountNumber: '', accountTitle: '' });
                                    setErrors({});
                                }}
                                className={`method-select ${errors.method ? 'error' : ''}`}
                            >
                                <option value="">Choose a payment method...</option>
                                <option value="easypaisa">📱 Easypaisa</option>
                                <option value="jazzcash">📱 Jazz Cash</option>
                                <option value="bank">🏦 Bank Account</option>
                            </select>
                            {errors.method && <span className="error-text">{errors.method}</span>}
                        </div>

                        {/* Easypaisa Phone Input */}
                        {selectedMethod === 'easypaisa' && (
                            <div className="form-group">
                                <label>Easypaisa Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="03xx-xxxxxxx"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    maxLength="13"
                                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                                />
                                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                                <small>Format: 03xx-xxxxxxx (e.g., 0321-1234567)</small>
                            </div>
                        )}

                        {/* Jazz Cash Phone Input */}
                        {selectedMethod === 'jazzcash' && (
                            <div className="form-group">
                                <label>Jazz Cash Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="03xx-xxxxxxx"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    maxLength="13"
                                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                                />
                                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                                <small>Format: 03xx-xxxxxxx (e.g., 0300-1234567)</small>
                            </div>
                        )}

                        {/* Bank Account Inputs */}
                        {selectedMethod === 'bank' && (
                            <>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input
                                        type="text"
                                        placeholder="03xx-xxxxxxx"
                                        value={formData.accountNumber}
                                        onChange={(e) => handleAccountChange(e.target.value)}
                                        maxLength="13"
                                        className={`form-input ${errors.accountNumber ? 'error' : ''}`}
                                    />
                                    {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
                                    <small>Format: 03xx-xxxxxxx or IBAN</small>
                                </div>

                                <div className="form-group">
                                    <label>Account Title (Account Holder Name)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Muhammad Ali"
                                        value={formData.accountTitle}
                                        onChange={handleTitleChange}
                                        className={`form-input ${errors.accountTitle ? 'error' : ''}`}
                                    />
                                    {errors.accountTitle && <span className="error-text">{errors.accountTitle}</span>}
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        {selectedMethod && (
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : `Add ${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}`}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WorkerPayoutSettings;
