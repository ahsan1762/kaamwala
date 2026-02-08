import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // If we have token but no stored user (e.g. cleared cache), we might want to fetch me
                    // But for now reliance on login response saving it is consistent with previous logic
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (identifier, password) => {
        try {
            const res = await api.post('/auth/login', { identifier, password });
            const { token, ...userData } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData)); // Save user data
            setToken(token);
            setUser(userData);

            // Dispatch event for any components still listening to window
            window.dispatchEvent(new Event('auth-change'));

            return { success: true, role: userData.role };
        } catch (error) {
            console.error(error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password, role, cnic, phone) => {
        try {
            const res = await api.post('/auth/register', { name, email, password, role, cnic, phone });

            // Should now check if token is returned. If not, it means verification is required.
            if (res.data.token) {
                const { token, ...userData } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData)); // Save user data
                setToken(token);
                setUser(userData);
                window.dispatchEvent(new Event('auth-change'));
                return { success: true, role: userData.role };
            } else {
                // Success but no token (verification needed)
                return { success: true, message: res.data.message };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('auth-change'));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
