import React, { useState } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Headphones,
    Building,
    CheckCircle,
    Facebook,
    Instagram,
    Twitter,
    Linkedin
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import './ContactUs.css';

import api from '../api';
import toast from 'react-hot-toast';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/contact', formData);
            setLoading(false);
            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            toast.success("Message sent successfully!");
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error("Failed to send message. Please try again.");
        }
    };

    const contactInfo = [
        {
            icon: <Phone size={24} />,
            title: 'Phone',
            details: ['+92 300 1234567', '+92 42 35761234'],
            action: 'tel:+923001234567'
        },
        {
            icon: <Mail size={24} />,
            title: 'Email',
            details: ['support@kaamwala.pk', 'info@kaamwala.pk'],
            action: 'mailto:support@kaamwala.pk'
        },
        {
            icon: <MapPin size={24} />,
            title: 'Head Office',
            details: ['F10 & F11 Markaz,', 'Islamabad, Pakistan'],
            action: '#'
        },
        {
            icon: <Clock size={24} />,
            title: 'Working Hours',
            details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
            action: '#'
        }
    ];

    const offices = [
        {
            city: 'Islamabad',
            address: 'Main Office, F10 & F11 Markaz',
            phone: '+92 51 35761234'
        }
    ];

    const faqs = [
        {
            question: 'How do I book a service?',
            answer: 'You can book a service by browsing our services page, selecting the service you need, choosing a time slot, and confirming your booking. You can also call our helpline for assistance.'
        },
        {
            question: 'Are your workers verified?',
            answer: 'Yes, all our workers undergo thorough background checks including CNIC verification, address verification, and skill assessment before joining our platform.'
        },
        {
            question: 'What if I\'m not satisfied with the service?',
            answer: 'Customer satisfaction is our priority. If you\'re not satisfied, contact us within 24 hours and we\'ll either send another worker or provide a full refund.'
        },
        {
            question: 'How can I become a worker?',
            answer: 'Visit our "Become a Worker" page, fill out the registration form with your CNIC and skills, and our team will contact you for verification within 48 hours.'
        }
    ];

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-overlay"></div>
                <div className="contact-hero-content">
                    <h1 className="contact-hero-title">Get in Touch</h1>
                    <p className="contact-hero-subtitle">
                        Have questions or need help? We're here for you 7 days a week
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="contact-info-section">
                <div className="contact-container">
                    <div className="contact-info-grid">
                        {contactInfo.map((info, index) => (
                            <a href={info.action} key={index} className="contact-info-card">
                                <div className="info-icon">
                                    {info.icon}
                                </div>
                                <h3>{info.title}</h3>
                                {info.details.map((detail, i) => (
                                    <p key={i}>{detail}</p>
                                ))}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map Section */}
            <section className="contact-form-section">
                <div className="contact-container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="form-wrapper">
                            <div className="form-header">
                                <MessageSquare size={32} className="form-icon" />
                                <h2>Send us a Message</h2>
                                <p>Fill out the form below and we'll get back to you within 24 hours</p>
                            </div>

                            {submitted ? (
                                <div className="success-message">
                                    <CheckCircle size={48} />
                                    <h3>Thank You!</h3>
                                    <p>Your message has been sent successfully. We'll get back to you soon.</p>
                                    <button
                                        className="send-another-btn"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+92 300 1234567"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Subject *</label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="booking">Booking Issue</option>
                                                <option value="complaint">Complaint</option>
                                                <option value="worker">Worker Registration</option>
                                                <option value="partnership">Business Partnership</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Your Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help you?"
                                            rows="5"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Map & Quick Help */}
                        <div className="side-content">
                            {/* Map Placeholder */}
                            <div className="map-container">
                                <iframe
                                    title="KaamWala Office Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.0897674768993!2d74.35513731512!3d31.51042818138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMwJzM3LjUiTiA3NMKwMjEnMjcuNSJF!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>

                            {/* Quick Help */}
                            <div className="quick-help">
                                <div className="help-header">
                                    <Headphones size={28} />
                                    <div>
                                        <h3>Need Immediate Help?</h3>
                                        <p>Our support team is available</p>
                                    </div>
                                </div>
                                <a href="tel:+923001234567" className="helpline-btn">
                                    <Phone size={20} />
                                    Call Helpline: +92 300 1234567
                                </a>
                            </div>

                            {/* Social Links */}
                            <div className="social-section">
                                <h3>Connect With Us</h3>
                                <div className="social-links">
                                    <a href="#" className="social-link facebook">
                                        <Facebook size={22} />
                                    </a>
                                    <a href="#" className="social-link instagram">
                                        <Instagram size={22} />
                                    </a>
                                    <a href="#" className="social-link twitter">
                                        <Twitter size={22} />
                                    </a>
                                    <a href="#" className="social-link linkedin">
                                        <Linkedin size={22} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Offices */}
            <section className="offices-section">
                <div className="contact-container">
                    <div className="section-header">
                        <Building size={32} className="section-icon" />
                        <h2>Our Office</h2>
                        <p>Visit us at any of our locations across Pakistan</p>
                    </div>
                    <div className="offices-grid">
                        {offices.map((office, index) => (
                            <div key={index} className="office-card">
                                <div className="office-icon">
                                    <MapPin size={24} />
                                </div>
                                <h3>{office.city}</h3>
                                <p className="office-address">{office.address}</p>
                                <p className="office-phone">
                                    <Phone size={16} />
                                    {office.phone}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="contact-container">
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>Quick answers to common questions</p>
                    </div>
                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-card">
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default ContactUs;
