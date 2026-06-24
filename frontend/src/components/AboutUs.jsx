import React from 'react';


import {
    Target,
    Heart,
    Users,
    Shield,
    Award,
    Clock,
    CheckCircle,
    Briefcase,
    Home,
    Star
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import './AboutUs.css';
import avatar from '../assets/avatar.png';

const AboutUs = () => {
    const values = [
        {
            icon: <Shield size={32} />,
            title: 'Trust & Safety',
            description: 'Every worker is verified with CNIC and background checks to ensure your safety and peace of mind.'
        },
        {
            icon: <Award size={32} />,
            title: 'Quality Service',
            description: 'We maintain high standards by training our workforce and monitoring service quality continuously.'
        },
        {
            icon: <Clock size={32} />,
            title: 'Punctuality',
            description: 'Time is valuable. Our workers arrive on schedule and complete tasks within promised timeframes.'
        },
        {
            icon: <Heart size={32} />,
            title: 'Customer First',
            description: 'Your satisfaction is our priority. We go above and beyond to exceed your expectations.'
        }
    ];

    const stats = [
        { number: '50,000+', label: 'Happy Customers' },
        { number: '5,000+', label: 'Verified Workers' },
        { number: '100+', label: 'Cities Covered' },
        { number: '200,000+', label: 'Jobs Completed' }
    ];

    const team = [
        {
            name: 'Muhammad Ahmed',
            role: 'Frontend Developer',
            image: avatar
        },
        {
            name: 'Fatima Hassan',
            role: 'Backend Developer',
            image: avatar
        },
        {
            name: 'Ali Raza',
            role: 'Design Lead & Backend Developer',
            image: avatar
        }
    ];

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-overlay"></div>
                <div className="about-hero-content">
                    <h1 className="about-hero-title">About KaamWala</h1>
                    <p className="about-hero-subtitle">
                        Connecting skilled workers with households across Pakistan since 2020
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-section">
                <div className="about-container">
                    <div className="story-grid">
                        <div className="story-content">
                            <span className="section-badge">Our Story</span>
                            <h2 className="story-title">From a Simple Idea to Pakistan's Leading Home Services Platform</h2>
                            <p className="story-text">
                                KaamWala was born from a simple observation: finding reliable home service workers in Pakistan was a frustrating experience. Homeowners struggled to find trustworthy professionals, while skilled workers lacked a platform to showcase their talents and find consistent work.
                            </p>
                            <p className="story-text">
                                Founded in 2020, we set out to bridge this gap by creating a platform that connects verified, skilled workers with households across Pakistan. Our name "KaamWala" (meaning "the one who works") reflects our commitment to empowering the hardworking individuals who make our homes better.
                            </p>
                            <p className="story-text">
                                Today, we're proud to serve over 50,000 households and have created opportunities for more than 5,000 skilled workers across 100+ cities in Pakistan.
                            </p>
                        </div>
                        <div className="story-image-wrapper">
                            <div className="story-image">
                                <img
                                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                    alt="KaamWala Team at Work"
                                />
                            </div>
                            <div className="floating-card">
                                <div className="floating-icon">
                                    <Home size={24} />
                                </div>
                                <span>Trusted by 50K+ Homes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="about-section bg-light">
                <div className="about-container">
                    <div className="mission-grid">
                        <div className="mission-card">
                            <div className="mission-icon">
                                <Target size={40} />
                            </div>
                            <h3>Our Mission</h3>
                            <p>
                                To empower skilled workers by providing them with a platform to showcase their talents and earn a dignified livelihood, while making home services accessible, affordable, and reliable for every Pakistani household.
                            </p>
                        </div>
                        <div className="mission-card vision-card">
                            <div className="mission-icon">
                                <Star size={40} />
                            </div>
                            <h3>Our Vision</h3>
                            <p>
                                To become Pakistan's most trusted home services ecosystem, where every skilled worker has the opportunity to thrive and every home has access to quality services at the tap of a button.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="about-container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section">
                <div className="about-container">
                    <div className="section-header">
                        <span className="section-badge">Our Values</span>
                        <h2 className="section-title">What We Stand For</h2>
                        <p className="section-subtitle">
                            The core principles that guide everything we do at KaamWala
                        </p>
                    </div>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">
                                    {value.icon}
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="about-section bg-light">
                <div className="about-container">
                    <div className="section-header">
                        <span className="section-badge">What We Offer</span>
                        <h2 className="section-title">Comprehensive Home Services</h2>
                        <p className="section-subtitle">
                            From AC repair to deep cleaning, we've got all your home needs covered
                        </p>
                    </div>
                    <div className="services-list">
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Plumbing & Pipe Fitting</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Electrical Work</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>AC Installation & Repair</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Home Cleaning</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Painting Services</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Carpentry Work</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Appliance Repair</span>
                        </div>
                        <div className="service-item">
                            <CheckCircle size={20} className="check-icon" />
                            <span>Pest Control</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-section">
                <div className="about-container">
                    <div className="section-header">
                        <span className="section-badge">Our Team</span>
                        <h2 className="section-title">Meet the Leadership</h2>
                        <p className="section-subtitle">
                            The passionate individuals driving KaamWala's mission forward
                        </p>
                    </div>
                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div key={index} className="team-card">
                                <div className="team-image">
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <h3>{member.name}</h3>
                                <p>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="about-container">
                    <div className="cta-content">
                        <Briefcase size={48} className="cta-icon" />
                        <h2>Ready to Experience KaamWala?</h2>
                        <p>Join thousands of satisfied customers and skilled workers on our platform</p>
                        <div className="cta-buttons">
                            <a href="/services" className="cta-btn primary">Book a Service</a>
                            <a href="/become-worker" className="cta-btn secondary">Become a Worker</a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default AboutUs;
