import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('financeToken');
            const savedUser = localStorage.getItem('financeUser');

            if (!token || !savedUser) {
                setInitialLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (err) {
                console.error('Session expired or invalid');
                localStorage.removeItem('financeToken');
                localStorage.removeItem('financeUser');
                setUser(null);
            } finally {
                setInitialLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('financeToken', data.token);
            localStorage.setItem('financeUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
            setUser({ _id: data._id, name: data.name, email: data.email });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/signup', { name, email, password });
            localStorage.setItem('financeToken', data.token);
            localStorage.setItem('financeUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
            setUser({ _id: data._id, name: data.name, email: data.email });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Signup failed' };
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (idToken) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', { idToken });
            localStorage.setItem('financeToken', data.token);
            localStorage.setItem('financeUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
            setUser({ _id: data._id, name: data.name, email: data.email });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Google login failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('financeToken');
        localStorage.removeItem('financeUser');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, initialLoading, login, signup, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
