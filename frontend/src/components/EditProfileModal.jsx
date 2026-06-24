import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

import { ISLAMABAD_AREAS } from '../constants';

const EditProfileModal = ({ worker, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        skill: worker.skill || '',
        experience: worker.experience || '',
        description: worker.description || '',
        location: worker.currentLocation || '',
        city: worker.city || '',
        area: worker.area || '',
        profilePic: null
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profilePic' && files) {
            setFormData(prev => ({ ...prev, profilePic: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('skill', formData.skill);
            submitData.append('experience', Number(formData.experience));
            submitData.append('description', formData.description);
            submitData.append('city', formData.city || 'Islamabad');
            submitData.append('area', formData.area || 'F10');
            submitData.append('availability', worker.availability || '9AM - 5PM');

            if (formData.profilePic) {
                submitData.append('profilePic', formData.profilePic);
            }

            await api.post('/worker/profile', submitData);
            toast.success("Profile updated successfully!");
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '500px',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '20px', color: '#07614A' }}>Edit Profile</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Profile Picture</label>
                        <input
                            type="file"
                            name="profilePic"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        {formData.profilePic && (
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                ✓ {formData.profilePic.name} selected
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Specialization</label>
                        <select
                            name="skill"
                            value={formData.skill}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        >
                            <option value="Plumber">Plumber</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Mason">Mason</option>
                            <option value="AC Repair">AC Repair</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Experience (Years)</label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                min="0"
                                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Area (Sector)</label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                            >
                                <option value="">Select Area</option>
                                {ISLAMABAD_AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>About Me</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe your services and expertise..."
                            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#07614A', color: 'white', padding: '10px',
                            border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
