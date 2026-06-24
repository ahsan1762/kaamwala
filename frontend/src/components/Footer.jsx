import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

import logo from '../assets/logo-kaamwala.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Column 1: About */}
                <div className="footer-brand">
                    <h3>
                        <img src={logo} alt="KaamWala Logo" style={{ height: '200px', width: 'auto', marginRight: '10px' }} />
                    </h3>
                    <p className="footer-desc">
                        Your trusted partner for all home services. Verified professionals, transparent pricing, and quality guaranteed.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon"><Facebook size={18} /></a>
                        <a href="#" className="social-icon"><Twitter size={18} /></a>
                        <a href="#" className="social-icon"><Instagram size={18} /></a>
                        <a href="#" className="social-icon"><Linkedin size={18} /></a>
                    </div>
                </div>

                {/* Column 2: Services */}
                <div className="footer-col">
                    <h4>Services</h4>
                    <ul className="footer-links">
                        {['Plumber', 'Electrician', 'Carpenter', 'Mason', 'AC Repair', 'General Tasks'].map((service) => (
                            <li key={service}>
                                <Link to={`/services/${service.toLowerCase().replace(' ', '-')}`}>
                                    {service}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Quick Links */}
                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        {['About Us', 'Contact Us', 'Careers', 'Terms & Conditions', 'Privacy Policy'].map((link) => (
                            <li key={link}>
                                <Link to={`/${link.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 4: Contact */}
                <div className="footer-col">
                    <h4>Contact Us</h4>
                    <ul className="contact-info">
                        <li>
                            <Mail className="contact-icon" size={18} />
                            <span>support@kaamwala.com</span>
                        </li>
                        <li>
                            <Phone className="contact-icon" size={18} />
                            <span>0315-1234567</span>
                        </li>
                        <li>
                            <MapPin className="contact-icon" size={18} />
                            <span>F10 & F11 Markaz, Islamabad</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2024 KaamWala. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
