import { useState } from 'react';
import { FiUser, FiMail, FiMoon, FiSun, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
        if (!form.email.trim()) { toast.error('Email cannot be empty'); return; }
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', { name: form.name.trim(), email: form.email.trim() });
            // Update localStorage with new user info
            localStorage.setItem('financeUser', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
            toast.success('Profile updated! Refreshing...');
            // Reload to update all components with new user info
            setTimeout(() => window.location.reload(), 800);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-8">
            {/* Profile */}
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-5">Profile Information</h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {form.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{form.name || user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{form.email || user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-60"
                    >
                        <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-5">Appearance</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isDark ? <FiMoon className="text-blue-400 text-xl" /> : <FiSun className="text-amber-500 text-xl" />}
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle app theme</p>
                        </div>
                    </div>
                    <button
                        onClick={toggle}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isDark ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="glass-card p-5 text-center">
                <p className="text-sm text-gray-400">FinanceTracker v1.0.0 · Built with MERN Stack</p>
            </div>
        </div>
    );
};

export default Settings;
