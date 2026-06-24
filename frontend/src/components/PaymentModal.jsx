import React, { useState } from 'react';
import { X, Smartphone, CheckCircle } from 'lucide-react';
import api from '../api';
import './PaymentModal.css';

const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
    const [method, setMethod] = useState('jazzcash');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [details, setDetails] = useState({
        mobileNumber: '',
        mpin: ''
    });

    const validateMobileNumber = (number) => {
        const regex = /^03\d{2}-\d{7}$/;
        return regex.test(number);
    };

    const validateMpin = (mpin) => {
        return /^\d{4}$/.test(mpin);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'mobileNumber') {
            formattedValue = value.replace(/[^\d-]/g, '');
            if (formattedValue.length === 4 && !formattedValue.includes('-')) {
                formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
            }
        }

        if (name === 'mpin') {
            formattedValue = value.replace(/[^\d]/g, '').slice(0, 4);
        }

        setDetails(prev => ({ ...prev, [name]: formattedValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!details.mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!validateMobileNumber(details.mobileNumber)) {
            newErrors.mobileNumber = 'Format should be 03XX-XXXXXXX';
        }

        if (!details.mpin) {
            newErrors.mpin = 'MPIN is required';
        } else if (!validateMpin(details.mpin)) {
            newErrors.mpin = 'MPIN must be 4 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.post('/payment/process', {
                bookingId: booking.id,
                paymentMethod: method,
                amount: booking.price,
                mobileNumber: details.mobileNumber,
                mpin: details.mpin
            });
            setSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="payment-modal-overlay">
                <div className="payment-modal">
                    <div className="payment-success">
                        <CheckCircle size={64} className="success-icon" />
                        <h2>Payment Successful!</h2>
                        <p>Transaction Completed</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>Complete Payment</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="amount-display">
                    <span className="label">Total Amount</span>
                    <span className="price">PKR {booking.price}</span>
                </div>

                <div className="payment-methods">
                    <button
                        className={`method-btn ${method === 'jazzcash' ? 'active' : ''}`}
                        onClick={() => setMethod('jazzcash')}
                    >
                        <Smartphone size={20} /> JazzCash
                    </button>
                    <button
                        className={`method-btn ${method === 'easypaisa' ? 'active' : ''}`}
                        onClick={() => setMethod('easypaisa')}
                    >
                        <Smartphone size={20} /> EasyPaisa
                    </button>
                </div>

                <div className="payment-form">
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="text"
                            name="mobileNumber"
                            placeholder="03XX-XXXXXXX"
                            value={details.mobileNumber}
                            onChange={handleChange}
                            maxLength={12}
                            style={{ borderColor: errors.mobileNumber ? '#dc2626' : '' }}
                        />
                        {errors.mobileNumber && (
                            <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.mobileNumber}
                            </span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>MPIN (4 Digits)</label>
                        <input
                            type="password"
                            name="mpin"
                            placeholder="••••"
                            value={details.mpin}
                            onChange={handleChange}
                            maxLength={4}
                            style={{ borderColor: errors.mpin ? '#dc2626' : '' }}
                        />
                        {errors.mpin && (
                            <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                {errors.mpin}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    className="pay-now-btn"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : `Pay PKR ${booking.price}`}
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
