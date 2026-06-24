
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Wrench, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState('auto'); // 'auto', 'email', or 'cnic'

    // Determine if input is email or CNIC
    const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isCnic = (value) => /^\d{5}-\d{7}-\d{1}$/.test(value);

    // Auto-format CNIC as: xxxxx-xxxxxxx-x
    const formatCnic = (value) => {
        let digits = value.replace(/\D/g, '');
        digits = digits.slice(0, 13);
        let formatted = digits;
        if (digits.length > 12) {
            formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
        } else if (digits.length > 5) {
            formatted = digits.slice(0, 5) + '-' + digits.slice(5);
        }
        return formatted;
    };

    const handleIdentifierChange = (e) => {
        let value = e.target.value;
        
        // Only format as CNIC if user is typing numbers or if input matches CNIC pattern
        if ((inputType === 'auto' || inputType === 'cnic') && /^\d/.test(value)) {
            value = formatCnic(value);
        }
        
        setFormData(prev => ({ ...prev, identifier: value }));
        setErrors(prev => ({ ...prev, identifier: '', form: '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const { identifier } = formData;

        if (!identifier) {
            newErrors.identifier = 'Email or CNIC is required';
        } else if (!isEmail(identifier) && !isCnic(identifier)) {
            if (identifier.includes('@')) {
                newErrors.identifier = 'Invalid email format';
            } else {
                newErrors.identifier = 'Invalid CNIC format. Must be xxxxx-xxxxxxx-x';
            }
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            const res = await login(formData.identifier, formData.password);

            if (res.success) {
                toast.success(`Welcome back!`);
                if (res.role === 'admin') navigate('/admin-dashboard');
                else if (res.role === 'worker') navigate('/worker-dashboard');
                else navigate('/home');
            } else {
                // Show login failure as a general form error, not on a specific field
                setErrors({ form: res.message || 'Invalid credentials. Please try again.' });
            }
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-bg-overlay"></div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <Wrench size={40} color="#07614A" />
                    </div>
                    <h1 className="login-title">Welcome to KaamWala</h1>
                    <p className="login-subtitle">Login with your Email or CNIC</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* General form error (e.g. wrong credentials from server) */}
                    {errors.form && (
                        <div className="form-error-banner">
                            {errors.form}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email or CNIC Number</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="text"
                                name="identifier"
                                className={`input-field ${errors.identifier ? 'error' : ''}`}
                                placeholder="Enter email or xxxxx-xxxxxxx-x"
                                value={formData.identifier}
                                onChange={handleIdentifierChange}
                                maxLength="50"
                            />
                        </div>
                        {errors.identifier && <p className="error-message">{errors.identifier}</p>}
                        <p className="help-text">You can login with your email address or CNIC number</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className={`input-field ${errors.password ? 'error' : ''}`}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>

                    <div className="form-footer">
                        <Link to="/forgot-password" className="forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <p className="signup-text">
                        Don't have an account?
                        <Link to="/signup" className="signup-link">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
