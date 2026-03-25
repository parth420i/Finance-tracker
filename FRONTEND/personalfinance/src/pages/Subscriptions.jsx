import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiDollarSign } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Subscriptions = () => {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newSub, setNewSub] = useState({ name: '', amount: '', category: 'Subscription', frequency: 'monthly', startDate: '' });

    const fetchSubs = async () => {
        try {
            const { data } = await api.get('/subscriptions');
            setSubs(data);
        } catch (err) {
            toast.error('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubs(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subscriptions', newSub);
            toast.success('Subscription added!');
            setShowModal(false);
            setNewSub({ name: '', amount: '', category: 'Subscription', frequency: 'monthly', startDate: '' });
            fetchSubs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subscription?')) return;
        try {
            await api.delete(`/subscriptions/${id}`);
            toast.success('Subscription deleted');
            fetchSubs();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'active') return null;
        const colors = { active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status] || colors.active}`}>{status}</span>;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading subscriptions...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Subscriptions</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-600/30">
                    <FiPlus /> Add Subscription
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub) => (
                    <div key={sub._id} className="glass-card p-5 relative group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <StatusBadge status={sub.status} />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1">{sub.name}</h3>
                                <p className="text-sm text-gray-500">{sub.frequency}</p>
                            </div>
                            <button onClick={() => handleDelete(sub._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <FiTrash2 />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">₹{sub.amount.toLocaleString('en-IN')}</span>
                            <span className="text-sm text-gray-500">/ {sub.frequency.replace('ly', '')}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <FiCalendar />
                            <span>Started: {new Date(sub.startDate).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-md p-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">New Subscription</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                                <input type="text" placeholder="e.g. Netflix" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
                                    <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" value={newSub.amount} onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Frequency</label>
                                    <select className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" value={newSub.frequency} onChange={(e) => setNewSub({ ...newSub, frequency: e.target.value })}>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annually">Annually</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Starting From</label>
                                <input type="date" className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800" value={newSub.startDate} onChange={(e) => setNewSub({ ...newSub, startDate: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
