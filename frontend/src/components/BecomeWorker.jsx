import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext'; // Also import useAuth properly
import { CheckCircle, Wrench, Clock, Briefcase, User, Mail, Phone, MapPin, Camera, Video, ArrowLeft, Lock } from 'lucide-react';
import './BecomeWorker.css';
import { ISLAMABAD_AREAS, SERVICE_TYPES } from '../constants';

const BecomeWorker = () => {
    const navigate = useNavigate();
    const regFormRef = useRef(null);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cnic: '',
        password: '',
        serviceType: '',
        experience: '',
        location: '',
        description: '',
        profilePic: null,
        cnicFront: null,
        cnicBack: null,
        showcaseVideo: null
    });

    // Removed conflicting useEffect. Logic is now merged in the main checkUserStatus useEffect.

    const scrollToForm = () => {
        regFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateStep = () => {
        if (step === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^03\d{2}-\d{7}$/; // 03xx-xxxxxxx
            const cnicRegex = /^\d{5}-\d{7}-\d{1}$/; // xxxxx-xxxxxxx-x
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

            if (!formData.fullName || !formData.email || !formData.phone || !formData.cnic) {
                alert('Please fill in all personal details.');
                return false;
            }

            if (!isProfileCreationOnly) {
                if (!formData.password) {
                    alert('Please enter a password.');
                    return false;
                }
                if (!passwordRegex.test(formData.password)) {
                    alert('Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character.');
                    return false;
                }
            } else {
                // Profile Creation Mode: Validate Professional Fields
                if (!formData.serviceType || !formData.experience || !formData.location || !formData.description) {
                    alert('Please fill in all professional details.');
                    return false;
                }
            }

            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.');
                return false;
            }

            if (!phoneRegex.test(formData.phone)) {
                alert('Please enter a valid Pakistani phone number (e.g., 03xx-xxxxxxx).');
                return false;
            }

            if (!cnicRegex.test(formData.cnic)) {
                alert('Please enter a valid CNIC number (Format: xxxxx-xxxxxxx-x).');
                return false;
            }

            return true;
        } else if (step === 2) {
            if (!formData.profilePic || !formData.cnicFront || !formData.cnicBack) {
                alert('Please upload all required identity documents.');
                return false;
            }
            return true;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            window.scrollTo({ top: regFormRef.current.offsetTop - 100, behavior: 'smooth' });
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        window.scrollTo({ top: regFormRef.current.offsetTop - 100, behavior: 'smooth' });
        setStep(step - 1);
    };

    const { register, login, user: authUser } = useAuth(); // Use context
    const [isProfileCreationOnly, setIsProfileCreationOnly] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            // We use authUser from context if available, or check localstorage backup
            const userStr = localStorage.getItem('user');
            const userObj = authUser || (userStr ? JSON.parse(userStr) : null);

            if (userObj && userObj.role === 'worker') {
                try {
                    // Check if profile exists
                    await api.get('/worker/profile');
                    // If success, they have a profile, redirect
                    navigate('/worker-profile');
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        // User exists but no profile. Allow them to create profile.
                        setIsProfileCreationOnly(true);
                        setFormData(prev => ({
                            ...prev,
                            fullName: userObj.name,
                            email: userObj.email,
                            cnic: userObj.cnic || prev.cnic,
                            phone: userObj.phone || prev.phone // Pre-fill phone if available
                        }));
                        // Auto-scroll to form for better UX
                        setTimeout(() => {
                            regFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 500);
                    }
                }
            }
        };
        checkUserStatus();
    }, [navigate, authUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            console.log("DEBUG: Starting Submission...");

            // 1. Register User (Skip if already registered/logged in)
            if (!isProfileCreationOnly) {
                const regRes = await register(
                    formData.fullName,
                    formData.email,
                    formData.password,
                    'worker',
                    formData.cnic,
                    formData.phone
                );

                if (!regRes.success) {
                    if (regRes.message && regRes.message.includes('Account with this CNIC already exists')) {
                        if (window.confirm("An account with this CNIC already exists. Would you like to reset your password?")) {
                            navigate('/forgot-password');
                        }
                    } else {
                        alert('Registration failed: ' + regRes.message);
                    }
                    setSubmitting(false);
                    return;
                }

                if (regRes.message && !regRes.role) {
                    // Must verify email first
                    alert(regRes.message);
                    navigate('/login');
                    return;
                }
            }

            // 2. Login (Already handled or skipped)

            // 3. Create Profile
            const profileFormData = new FormData();
            profileFormData.append('skill', formData.serviceType);
            profileFormData.append('city', 'Islamabad');
            profileFormData.append('area', formData.location);
            profileFormData.append('availability', '9AM - 6PM'); // Default

            if (formData.profilePic) profileFormData.append('profilePic', formData.profilePic);
            // document is Front CNIC
            if (formData.cnicFront) profileFormData.append('document', formData.cnicFront);
            if (formData.cnicBack) profileFormData.append('cnicBack', formData.cnicBack);
            if (formData.serviceVideo) profileFormData.append('serviceVideo', formData.serviceVideo);

            console.log("DEBUG: Sending Profile Data to Backend...");
            for (let pair of profileFormData.entries()) {
                console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            const res = await api.post('/worker/profile', profileFormData);
            console.log("DEBUG: Response Success:", res.data);

            setSubmitting(false);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert('An error occurred during registration.');
            setSubmitting(false);
        }
    };

    // Services and Areas now imported from constants.js

    return (
        <div className="become-worker-page">
            <Navbar />

            {/* Hero Section */}
            <div className="worker-hero">
                <div className="worker-hero-overlay"></div>
                <div className="worker-hero-content">
                    <h1>{isProfileCreationOnly ? 'Complete Your Worker Profile' : 'Join KaamWala as a Service Partner'}</h1>
                    <p>{isProfileCreationOnly ? 'You are almost there! Fill out your details to get verified.' : 'Verified experts earn more. Complete our 3-step registration and start getting bookings in Islamabad.'}</p>
                    <button className="btn-start-reg" onClick={scrollToForm}>
                        {isProfileCreationOnly ? 'Continue Application' : 'Start Registration'}
                    </button>
                </div>
            </div>

            {/* Benefits section is brief here to keep focus on form */}
            <section className="worker-benefits-mini">
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon"><Briefcase size={24} /></div>
                        <h3>Regular Work</h3>
                        <p>No marketing costs.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon"><Clock size={24} /></div>
                        <h3>Flexibility</h3>
                        <p>Work your way.</p>
                    </div>
                </div>
            </section>

            <div className="registration-section" ref={regFormRef}>
                {submitted ? (
                    <div className="registration-card success-message">
                        <div className="success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h2>Application Under Review</h2>
                        <p>Excellent! We've received your documents and video, <strong>{formData.fullName}</strong>. Our verification team will review your profile shortly.</p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' }}>
                            <Link to="/login">
                                <button className="submit-worker-btn" style={{ background: '#07614A' }}>Login to Account</button>
                            </Link>
                            <button className="submit-worker-btn" style={{ background: '#666' }} onClick={() => { setStep(1); setSubmitted(false); }}>
                                Register New Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="registration-card">
                        {/* Progress Bar - Only show for Profile Creation Wizard */}
                        {isProfileCreationOnly && (
                            <div className="step-progress-wrapper">
                                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                                    <div className="step-num">1</div>
                                    <span>Details</span>
                                </div>
                                <div className="step-connector">
                                    <div className="connector-fill" style={{ width: step > 1 ? (step === 2 ? '50%' : '100%') : '0%' }}></div>
                                </div>
                                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                                    <div className="step-num">2</div>
                                    <span>Identity</span>
                                </div>
                                <div className="step-connector">
                                    <div className="connector-fill" style={{ width: step > 2 ? '100%' : '0%' }}></div>
                                </div>
                                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                                    <div className="step-num">3</div>
                                    <span>Showcase</span>
                                </div>
                            </div>
                        )}

                        <div className="step-header">
                            {!isProfileCreationOnly ? (
                                <h2>Create Worker Account</h2>
                            ) : (
                                <>
                                    <h2>{step === 1 ? 'Professional Profile' : step === 2 ? 'Identity Verification' : 'Video Showcase'}</h2>
                                    <p>Step {step} of 3</p>
                                </>
                            )}
                        </div>

                        <form className="worker-form" onSubmit={handleSubmit}>

                            {/* STEP 1: Details */}
                            {step === 1 && (
                                <div className="form-step-content animation-fade">
                                    {/* Account Details - Always visible, but read-only during profile creation */}
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <div className="input-wrapper">
                                            <User className="input-icon" size={20} />
                                            <input type="text" name="fullName" required className="input-field" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} disabled={isProfileCreationOnly} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <div className="input-wrapper">
                                                <Mail className="input-icon" size={20} />
                                                <input type="email" name="email" required className="input-field" placeholder="email@example.com" value={formData.email} onChange={handleChange} disabled={isProfileCreationOnly} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <div className="input-wrapper">
                                                <Phone className="input-icon" size={20} />
                                                <input type="tel" name="phone" required className="input-field" placeholder="03xx-xxxxxxx" value={formData.phone} onChange={handleChange} disabled={isProfileCreationOnly && formData.phone} maxLength="12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CNIC Number</label>
                                        <div className="input-wrapper">
                                            <Briefcase className="input-icon" size={20} />
                                            <input type="text" name="cnic" required className="input-field" placeholder="xxxxx-xxxxxxx-x" value={formData.cnic} onChange={handleChange} disabled={isProfileCreationOnly} maxLength="15" />
                                        </div>
                                    </div>
                                    {!isProfileCreationOnly && (
                                        <div className="form-group">
                                            <label className="form-label">Set Password</label>
                                            <div className="input-wrapper">
                                                <Lock size={20} className="input-icon" />
                                                <input type="password" name="password" required className="input-field" placeholder="Create a password (A-Z, 0-9, symbol)" value={formData.password} onChange={handleChange} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Details - Only visible during Profile Creation Phase (Step 2 of lifecycle) */}
                                    {isProfileCreationOnly && (
                                        <>
                                            <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                                <h3 style={{ fontSize: '18px', color: '#07614A', marginBottom: '15px' }}>Professional Details</h3>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Service Type</label>
                                                    <select name="serviceType" required className="input-field" value={formData.serviceType} onChange={handleChange}>
                                                        <option value="">Select Service</option>
                                                        <option value="">Select Service</option>
                                                        {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Experience (Years)</label>
                                                    <input type="number" name="experience" required className="input-field" placeholder="e.g. 5" value={formData.experience} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Primary Area (Islamabad)</label>
                                                <select name="location" required className="input-field" value={formData.location} onChange={handleChange}>
                                                    <option value="">Select Area</option>
                                                    <option value="">Select Area</option>
                                                    {ISLAMABAD_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Brief Description</label>
                                                <textarea name="description" rows="3" className="input-field" style={{ padding: '12px' }} placeholder="Tell us about your work..." value={formData.description} onChange={handleChange}></textarea>
                                            </div>
                                        </>
                                    )}

                                    {/* Navigation Button Changes Based on Mode */}
                                    {!isProfileCreationOnly ? (
                                        <button type="submit" className="submit-worker-btn" disabled={submitting}>
                                            {submitting ? 'Creating Account...' : 'Register & Verify Email'}
                                        </button>
                                    ) : (
                                        <button type="button" className="submit-worker-btn" onClick={nextStep}>Next: Verification Documents</button>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Identity Documents */}
                            {step === 2 && (
                                <div className="form-step-content animation-fade">
                                    <div className="file-upload-group">
                                        <label className="form-label">Profile Picture (Passport Size)</label>
                                        <div className="file-input-box">
                                            <Camera size={24} />
                                            <input type="file" name="profilePic" accept="image/*" required onChange={handleChange} />
                                            <span>{formData.profilePic ? formData.profilePic.name : 'Click to upload photo'}</span>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="file-upload-group">
                                            <label className="form-label">CNIC Front Side</label>
                                            <div className="file-input-box">
                                                <Briefcase size={20} />
                                                <input type="file" name="cnicFront" accept="image/*" required onChange={handleChange} />
                                                <span>{formData.cnicFront ? formData.cnicFront.name : 'Upload Front'}</span>
                                            </div>
                                        </div>
                                        <div className="file-upload-group">
                                            <label className="form-label">CNIC Back Side</label>
                                            <div className="file-input-box">
                                                <Briefcase size={20} />
                                                <input type="file" name="cnicBack" accept="image/*" required onChange={handleChange} />
                                                <span>{formData.cnicBack ? formData.cnicBack.name : 'Upload Back'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-navigation-btns">
                                        <button type="button" className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                                        <button type="button" className="submit-worker-btn" onClick={nextStep}>Next: Video Upload</button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Video Showcase */}
                            {step === 3 && (
                                <div className="form-step-content animation-fade">
                                    <div className="file-upload-group">
                                        <label className="form-label">Short Work Video</label>
                                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Upload a 30-60 second video of yourself working or explaining your expertise for customer trust.</p>
                                        <div className="file-input-box video-box">
                                            <Video size={32} />
                                            <input type="file" name="serviceVideo" accept="video/*" required onChange={handleChange} />
                                            <span>{formData.serviceVideo ? formData.serviceVideo.name : 'Select video file'}</span>
                                        </div>
                                    </div>
                                    <div className="form-navigation-btns">
                                        <button type="button" className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                                        <button type="submit" className="submit-worker-btn" disabled={submitting}>
                                            {submitting ? 'Submitting Application...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BecomeWorker;
