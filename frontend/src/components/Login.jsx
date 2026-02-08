
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Wrench, Eye, EyeOff, Mail } from 'lucide-react'; // Changed CreditCard to Mail
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState('user'); // 'user' is actually 'customer' in backend, but let's map it
    const [formData, setFormData] = useState({
        cnic: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!formData.cnic) {
            newErrors.cnic = 'CNIC is required';
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
            const res = await login(formData.cnic, formData.password);

            if (res.success) {
                toast.success(`Welcome back!`);
                // Redirect based on role
                if (res.role === 'admin') navigate('/admin-dashboard');
                else if (res.role === 'worker') navigate('/worker-dashboard'); // or worker-profile
                else navigate('/home');
            } else {
                setErrors({ cnic: res.message });
            }
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
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
                    <p className="login-subtitle">Login with your CNIC</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">CNIC (or Email for Admin)</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="text"
                                name="cnic"
                                className={`input-field ${errors.cnic ? 'error' : ''}`}
                                placeholder="Enter CNIC (e.g. 12345-1234567-1)"
                                value={formData.cnic}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.cnic && <p className="error-message">{errors.cnic}</p>}
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
