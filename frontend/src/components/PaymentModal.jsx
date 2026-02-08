import React, { useState } from 'react';
import { CreditCard, X, Smartphone, CheckCircle } from 'lucide-react';
import api from '../api';
import './PaymentModal.css';

const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
    const [method, setMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [details, setDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        mobileNumber: '',
        mpin: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            await api.post('/payment/process', {
                bookingId: booking.id,
                paymentMethod: method,
                amount: booking.price
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
                        className={`method-btn ${method === 'card' ? 'active' : ''}`}
                        onClick={() => setMethod('card')}
                    >
                        <CreditCard size={20} /> Debit/Credit Card
                    </button>
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
                    {method === 'card' ? (
                        <>
                            <div className="form-group">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="0000 0000 0000 0000"
                                    value={details.cardNumber}
                                    onChange={handleChange}
                                    maxLength={19}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        value={details.expiry}
                                        onChange={handleChange}
                                        maxLength={5}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVC</label>
                                    <input
                                        type="password"
                                        name="cvc"
                                        placeholder="123"
                                        value={details.cvc}
                                        onChange={handleChange}
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    placeholder="03XX XXXXXXX"
                                    value={details.mobileNumber}
                                    onChange={handleChange}
                                    maxLength={11}
                                />
                            </div>
                            <div className="form-group">
                                <label>MPIN</label>
                                <input
                                    type="password"
                                    name="mpin"
                                    placeholder="****"
                                    value={details.mpin}
                                    onChange={handleChange}
                                    maxLength={4}
                                />
                            </div>
                        </>
                    )}
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
