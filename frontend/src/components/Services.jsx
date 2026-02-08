import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Wrench, Zap, Hammer, HardHat, Wind, Settings } from 'lucide-react';
import './Services.css';

const Services = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceType = searchParams.get('type');
    const locationSearch = searchParams.get('location');
    const [reviews, setReviews] = useState([]);
    const [providers, setProviders] = useState([]);

    const serviceCategories = [
        { name: 'Plumber', icon: Wrench, desc: ['Pipe Repair', 'Leak Fixing', 'Bathroom Fitting'] },
        { name: 'Electrician', icon: Zap, desc: ['Wiring', 'Fan Installation', 'Light Fitting'] },
        { name: 'Carpenter', icon: Hammer, desc: ['Furniture Assembly', 'Door Repair', 'Custom Work'] },
        { name: 'Mason', icon: HardHat, desc: ['Brickwork', 'Plastering', 'Tiling'] },
        { name: 'AC & Repair', icon: Wind, desc: ['AC Installation', 'Repair', 'Gas Charging'] },
        { name: 'General', icon: Settings, desc: ['Furniture Assembly', 'TV Mounting', 'Painting'] },
    ];

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                // Build query params
                const params = {};
                if (serviceType) params.skill = serviceType;
                if (locationSearch) {
                    // Extract just the area/sector name (e.g. "F-7" from "F-7 Sector, Islamabad")
                    // to ensure broader matching with backend regex
                    params.area = locationSearch.split(',')[0].trim();
                }

                const res = await api.get('/workers/search', { params });

                const mappedProviders = res.data.map(worker => ({
                    id: worker._id,
                    userId: worker.userId?._id, // Keep userId for reference if needed
                    name: worker.userId?.name || 'Worker',
                    specialty: worker.skill,
                    location: `${worker.area}, ${worker.city}`,
                    rating: worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New',
                    reviews: worker.reviewsCount || 0,
                    price: worker.hourlyRate || 500,
                    image: worker.profilePic || `https://i.pravatar.cc/300?u=${worker._id}`,
                    bio: `Professional ${worker.skill} available in ${worker.area}. Availability: ${worker.availability}`
                }));

                setProviders(mappedProviders);
            } catch (error) {
                console.error("Error fetching workers", error);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await api.get('/reviews/recent');
                setReviews(res.data);
            } catch (error) {
                // Fallback to empty or keep loading state
                console.error("Error fetching reviews", error);
            }
        };

        fetchWorkers();
        fetchReviews();
    }, [serviceType, locationSearch]);

    const handleBookNow = (provider) => {
        if (user && user.role === 'worker') {
            alert("Workers cannot book services using a worker account. Please login as a customer.");
            return;
        }
        // Navigate to booking page with workerId (User ID) and service
        navigate(`/booking?workerId=${provider.userId}&service=${encodeURIComponent(provider.specialty)}`);
    };

    return (
        <div className="services-page">
            <Navbar />

            {/* Hero Section */}
            <div className="services-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Professional Home Services in F10 & F11, Islamabad</h1>
                    <p>Verified experts for all your home maintenance needs in F10 & F11. Book Instantly.</p>
                </div>
            </div>

            {/* Providers Listing */}
            <section className="section bg-light">
                <div className="services-header" style={{ backgroundColor: 'transparent', color: '#333', padding: '0 20px 40px' }}>
                    {serviceType ? (
                        <>
                            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>{serviceType}s {locationSearch ? `in ${locationSearch}` : 'Available'}</h2>
                            <p style={{ color: '#666' }}>Top rated professionals ready to help</p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>All Available Professionals in F10 & F11</h2>
                            <p style={{ color: '#666' }}>Browse our top rated experts in F10 & F11, Islamabad</p>
                        </>
                    )}
                </div>

                <div className="services-container">
                    {providers.length > 0 ? (
                        providers.map((provider) => (
                            <div key={provider.id} className="provider-card">
                                <img src={provider.image} alt={provider.name} className="provider-image" style={{ objectFit: 'cover' }} />
                                <div className="provider-details">
                                    <div className="provider-header">
                                        <h3 className="provider-name">{provider.name}</h3>
                                        <div className="provider-rating">
                                            <Star size={16} fill="#eab308" stroke="#eab308" />
                                            <span>{provider.rating}</span>
                                            <span style={{ color: '#999', fontSize: '12px', fontWeight: 'normal' }}>({provider.reviews})</span>
                                        </div>
                                    </div>

                                    <p className="provider-specialty">{provider.specialty}</p>
                                    <div className="provider-location">
                                        <MapPin size={14} />
                                        <span>{provider.location}</span>
                                    </div>

                                    <p className="provider-bio">{provider.bio}</p>
                                    <p className="provider-price">Starting from <span className="currency">PKR</span> {provider.price}</p>

                                    <button className="book-provider-btn" onClick={() => handleBookNow(provider)}>
                                        Book Now
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (provider.userId) {
                                                navigate(`/worker/${provider.userId}`);
                                            } else {
                                                alert("Worker profile is incomplete (User ID missing)");
                                            }
                                        }}
                                        disabled={!provider.userId}
                                        style={{
                                            marginTop: '10px', width: '100%', padding: '10px', background: 'transparent',
                                            border: '1px solid #07614A', color: '#07614A', borderRadius: '8px', cursor: provider.userId ? 'pointer' : 'not-allowed', fontWeight: 600,
                                            opacity: provider.userId ? 1 : 0.5
                                        }}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h2>No professionals found</h2>
                            <p>Try searching for a different service or location.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Service Categories (Our Services) */}
            <section className="section bg-white">
                <div className="section-header">
                    <h2 className="section-title">Our Services</h2>
                    <p className="section-subtitle">Comprehensive solutions for your home</p>
                </div>
                <div className="services-grid">
                    {serviceCategories.map((service) => (
                        <div key={service.name} className="service-category-card">
                            <div className="service-icon-wrapper">
                                <service.icon size={32} />
                            </div>
                            <h3 className="category-title">{service.name}</h3>
                            <ul className="category-features">
                                {service.desc.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Customer Reviews */}
            <section className="section bg-white">
                <div className="section-header">
                    <h2 className="section-title">Customer Reviews</h2>
                    <p className="section-subtitle">What people in F10 & F11 are saying</p>
                </div>
                <div className="reviews-grid">
                    {reviews.map((review, i) => (
                        <div key={i} className="review-card">
                            <div className="review-header">
                                <div className="initial-circle">{review.name.charAt(0)}</div>
                                <div className="reviewer-info">
                                    <h4>{review.name}</h4>
                                    <span>{review.location}</span>
                                </div>
                            </div>
                            <div className="review-rating">
                                {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} size={16} fill={idx < review.rating ? "#eab308" : "none"} stroke="#eab308" />
                                ))}
                            </div>
                            <p className="review-text">"{review.text}"</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Services;
