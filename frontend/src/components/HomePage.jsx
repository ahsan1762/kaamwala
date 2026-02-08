import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wrench, Zap, Hammer, HardHat, Wind, Settings, Star, ShieldCheck, Clock, CheckCircle, Calendar, MoveRight, ReceiptIndianRupee, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ISLAMABAD_AREAS, SERVICE_TYPES } from '../constants';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchService, setSearchService] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [activeBooking, setActiveBooking] = useState(null);
    const [stats, setStats] = useState({
        customers: '10,000+',
        workers: '500+',
        services: '20+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/public/stats');
                setStats({
                    customers: res.data.customers + '+',
                    workers: res.data.workers + '+',
                    services: res.data.services + '+'
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchStats();

        if (user) {
            const fetchActiveBooking = async () => {
                try {
                    const res = await api.get('/bookings/my');
                    // Find most meaningful active booking (accepted > work_done > pending)
                    const active = res.data.find(b => b.status === 'accepted' || b.status === 'work_done' || b.status === 'in-progress')
                        || res.data.find(b => b.status === 'pending');

                    if (active) setActiveBooking(active);
                } catch (error) {
                    console.error("Error fetching active booking", error);
                }
            };
            fetchActiveBooking();
        }
    }, [user]);

    const services = [
        { name: 'Plumber', icon: Wrench, desc: ['Pipe Repair', 'Leak Fixing', 'Bathroom Fitting'] },
        { name: 'Electrician', icon: Zap, desc: ['Wiring', 'Fan Installation', 'Light Fitting'] },
        { name: 'Carpenter', icon: Hammer, desc: ['Furniture Assembly', 'Door Repair', 'Custom Work'] },
        { name: 'Mason', icon: HardHat, desc: ['Brickwork', 'Plastering', 'Tiling'] },
        { name: 'AC & Repair', icon: Wind, desc: ['AC Installation', 'Repair', 'Gas Charging'] },
        { name: 'General', icon: Settings, desc: ['Furniture Assembly', 'TV Mounting', 'Painting'] },
    ];

    const features = [
        { icon: ShieldCheck, title: 'Verified Professionals', desc: 'All workers are background verified and certified' },
        { icon: ReceiptIndianRupee, title: 'Transparent Pricing', desc: 'No hidden charges. Pay what you see' },
        { icon: Clock, title: '24/7 Support', desc: 'Round the clock customer support' },
        { icon: Star, title: '100% Satisfaction', desc: '30-day service guarantee on all work' },
    ];

    const steps = [
        { num: '1', icon: Search, title: 'Choose Your Service', desc: 'Browse through our wide range of services and select what you need' },
        { num: '2', icon: Calendar, title: 'Select Date & Time', desc: 'Pick a verified professional and schedule at your convenience' },
        { num: '3', icon: CheckCircle, title: 'Get It Done', desc: 'Our professional arrives on time and completes the job perfectly' },
    ];

    return (
        <div className="homepage">
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">

                    {activeBooking ? (
                        <div className="active-booking-widget" onClick={() => navigate(`/booking?tab=track&id=${activeBooking._id}`)}>
                            <div className="widget-header">
                                <span className="pulse-dot"></span>
                                <span>Active Booking</span>
                            </div>
                            <div className="widget-content">
                                <h3>{activeBooking.service}</h3>
                                <div className="widget-status">
                                    {activeBooking.status === 'work_done' ? 'Waiting for Confirmation' :
                                        activeBooking.status === 'accepted' ? 'Order Accepted' :
                                            activeBooking.status.replace('-', ' ').toUpperCase()}
                                </div>
                                {activeBooking.estimatedArrival && activeBooking.status === 'accepted' && (
                                    <div className="widget-arrival">
                                        <Clock size={14} /> Arriving in {activeBooking.estimatedArrival}
                                    </div>
                                )}
                            </div>
                            <div className="widget-action">
                                Track Now <ChevronRight size={16} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="hero-title">
                                Find Trusted Service<br />Professionals Near You
                            </h1>
                            <p className="hero-subtitle">
                                Book verified plumbers, electricians, carpenters & more in minutes.
                            </p>
                        </>
                    )}

                    <div className="search-card">
                        <div className="search-input-group">
                            <Wrench className="search-icon" size={20} />
                            <select
                                className="search-field"
                                value={searchService}
                                onChange={(e) => setSearchService(e.target.value)}
                            >
                                <option value="" disabled>What service do you need?</option>
                                {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="search-input-group">
                            <MapPin className="search-icon" size={20} />
                            <select
                                className="search-field"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            >
                                <option value="">Select Location</option>
                                {ISLAMABAD_AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <button className="search-btn" onClick={() => {
                            let url = '/services';
                            const params = [];
                            if (searchService) params.push(`type=${encodeURIComponent(searchService)}`);
                            if (searchLocation) params.push(`location=${encodeURIComponent(searchLocation)}`);
                            if (params.length > 0) url += `?${params.join('&')}`;
                            navigate(url);
                        }}>
                            Search
                        </button>
                    </div>

                    <div className="stats-container">
                        {[
                            { num: stats.customers, label: 'Happy Customers' },
                            { num: stats.workers, label: 'Verified Pros' },
                            { num: stats.services, label: 'Services' },
                        ].map((stat, i) => (
                            <div key={i} className="stat-item">
                                <span className="stat-number">{stat.num}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section bg-light">
                <div className="section-header">
                    <h2 className="section-title">Our Services</h2>
                    <p className="section-subtitle">Professional services at your doorstep</p>
                </div>

                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.name} className="service-card">
                            <div className="service-header">
                                <div className="service-icon">
                                    <service.icon size={32} />
                                </div>
                                <span className="price-tag">Starts Rs1299</span>
                            </div>
                            <h3 className="service-name">{service.name}</h3>
                            <ul className="service-features">
                                {service.desc.map((item, i) => (
                                    <li key={i}>
                                        <div className="dot"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="book-btn" onClick={() => navigate(`/services?type=${encodeURIComponent(service.name)}`)}>
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Book a professional in 3 simple steps</p>
                </div>

                <div className="steps-grid">
                    {steps.map((step, i) => (
                        <div key={i} className="step-card">
                            <div className="step-number">{step.num}</div>
                            <step.icon size={40} color="#07614A" style={{ marginBottom: '15px' }} />
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section bg-light">
                <div className="section-header">
                    <h2 className="section-title">Why Choose KaamWala</h2>
                    <p className="section-subtitle">Your trust is our priority</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon-wrapper">
                                <feature.icon size={32} />
                            </div>
                            <h3 className="step-title" style={{ fontSize: '18px' }}>{feature.title}</h3>
                            <p className="step-desc" style={{ fontSize: '14px' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2 className="cta-title">Ready to Get Started?</h2>
                <p className="cta-subtitle">Book your first service today and experience the difference.</p>
                <button className="cta-btn" onClick={() => navigate('/services')}>
                    Book Now <MoveRight size={24} />
                </button>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
