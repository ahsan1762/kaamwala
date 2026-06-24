import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Wrench, Eye, EyeOff, CheckCircle, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Signup.css';
import './Login.css';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [role, setRole] = useState('user'); // 'user' maps to 'customer'
    // Actually backend expects 'customer' or 'worker'.
    // The UI uses 'user' for customer.
    // I will pass 'customer' if role is 'user'.

    const [formData, setFormData] = useState({
        name: '',
        cnic: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = 'Full name is required';

        // CNIC Format: xxxxx-xxxxxxx-x
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!formData.cnic) {
            newErrors.cnic = 'CNIC is required';
        } else if (!cnicRegex.test(formData.cnic)) {
            newErrors.cnic = 'CNIC format must be xxxxx-xxxxxxx-x';
        }

        // Phone Format: 03xx-xxxxxxx
        const phoneRegex = /^03\d{2}-\d{7}$/;
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone format must be 03xx-xxxxxxx';
        }

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';

        // Password: At least 6 chars, 1 capital, 1 number, 1 special char
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character';
        }

        if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        if (!agreedToTerms) newErrors.terms = 'You must agree to the terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            const backendRole = role === 'user' ? 'customer' : 'worker';
            console.log('Sending Registration Data:', { ...formData, role: backendRole }); // Debugging

            const res = await register(formData.name, formData.email, formData.password, backendRole, formData.cnic, formData.phone);

            if (res.success) {
                if (res.message) {
                    // Show success message for verification
                    setSuccessMessage(res.message);
                } else {
                    // Direct login (fallback)
                    if (backendRole === 'worker') {
                        navigate('/become-worker');
                    } else {
                        navigate('/home');
                    }
                }
            } else {
                // Route error to the correct field based on backend message
                const msg = res.message || '';
                if (msg.toLowerCase().includes('cnic')) {
                    setErrors({ cnic: msg });
                } else if (msg.toLowerCase().includes('email')) {
                    setErrors({ email: msg });
                } else {
                    setErrors({ form: msg });
                }
            }
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Auto-format phone number as: 03xx-xxxxxxx
    const handlePhoneChange = (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        digits = digits.slice(0, 11);
        let formatted = digits;
        if (digits.length > 4) {
            formatted = digits.slice(0, 4) + '-' + digits.slice(4);
        }
        setFormData(prev => ({ ...prev, phone: formatted }));
        setErrors(prev => ({ ...prev, phone: '' }));
    };

    // Auto-format CNIC as: xxxxx-xxxxxxx-x
    const handleCnicChange = (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        digits = digits.slice(0, 13);
        let formatted = digits;
        if (digits.length > 12) {
            formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
        } else if (digits.length > 5) {
            formatted = digits.slice(0, 5) + '-' + digits.slice(5);
        }
        setFormData(prev => ({ ...prev, cnic: formatted }));
        setErrors(prev => ({ ...prev, cnic: '' }));
    };

    if (successMessage) {
        return (
            <div className="signup-container">
                <div className="login-bg-overlay"></div>
                <div className="signup-card" style={{ textAlign: 'center' }}>
                    <div className="login-header">
                        <div className="login-icon"><CheckCircle size={40} color="#07614A" /></div>
                        <h1 className="login-title">Registration Successful</h1>
                        <p className="login-subtitle">{successMessage}</p>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <Link to="/login" className="submit-btn" style={{ display: 'inline-block', textDecoration: 'none', lineHeight: '40px' }}>
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-container">
            <div className="login-bg-overlay"></div>
            <div className="signup-card">
                <div className="login-header">
                    <div className="login-icon"><Wrench size={40} color="#07614A" /></div>
                    <h1 className="login-title">Create Account</h1>
                    <p className="login-subtitle">Join KaamWala community</p>
                </div>

                <div className="role-tabs">
                    <button className={`role-tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>Customer</button>
                    <button className={`role-tab ${role === 'worker' ? 'active' : ''}`} onClick={() => navigate('/become-worker')}>Worker</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* General form error for unmatched backend messages */}
                    {errors.form && (
                        <div className="form-error-banner">
                            {errors.form}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input type="text" name="name" className={`input-field ${errors.name ? 'error' : ''}`} placeholder="Full Name" value={formData.name} onChange={handleChange} />
                        </div>
                        {errors.name && <p className="error-message">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">CNIC (with dashes)</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                name="cnic"
                                className={`input-field ${errors.cnic ? 'error' : ''}`}
                                placeholder="xxxxx-xxxxxxx-x"
                                value={formData.cnic}
                                onChange={handleCnicChange}
                                maxLength="15"
                            />
                        </div>
                        {errors.cnic && <p className="error-message">{errors.cnic}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-wrapper">
                            <Phone className="input-icon" size={20} />
                            <input
                                type="text"
                                name="phone"
                                className={`input-field ${errors.phone ? 'error' : ''}`}
                                placeholder="03xx-xxxxxxx"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                maxLength="12"
                            />
                        </div>
                        {errors.phone && <p className="error-message">{errors.phone}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                name="email"
                                className={`input-field ${errors.email ? 'error' : ''}`}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input type={showPassword ? 'text' : 'password'} name="password" className={`input-field ${errors.password ? 'error' : ''}`} placeholder="Password" value={formData.password} onChange={handleChange} />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input type="password" name="confirmPassword" className="input-field" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                    </div>
                    <div className="form-group">
                        <label className="checkbox-group">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                            <span>I agree to the <Link to="/terms" className="signup-link">Terms & Conditions</Link></span>
                        </label>
                        {errors.terms && <p className="error-message">{errors.terms}</p>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
                    <p className="signup-text" style={{ marginTop: '20px' }}>Already have account? <Link to="/login" className="signup-link">Login</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
