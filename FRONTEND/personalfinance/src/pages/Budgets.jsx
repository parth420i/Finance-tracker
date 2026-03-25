import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiAlertTriangle, FiCalendar, FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import FAB from '../components/FAB';
import TransactionModal from '../components/TransactionModal';

const CATEGORIES = [
    'Food & Dining', 'Shopping', 'Transport', 'Housing', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Utilities', 'Other',
];

const BudgetCard = ({ budget, onDelete }) => {
    const spent = budget.spent || 0;
    const limit = budget.limit || 1; // Avoid division by zero
    const percentageUsed = budget.percentageUsed || (spent / limit) * 100;
    const remaining = budget.remaining || (limit - spent);
    const category = budget.category || 'Unknown';
    const startDate = budget.startDate;
    const endDate = budget.endDate;

    const isExceeded = spent > limit;

    // Color logic: Green < 70, Yellow 70-100, Red > 100
    const progressColor = percentageUsed > 100 ? 'bg-red-500' : percentageUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500';
    const cardBorder = isExceeded ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800';

    const formatDate = (date) => {
        if (!date) return '—';
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
    };

    const formatDateFull = (date) => {
        if (!date) return '—';
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    };

    return (
        <div className={`glass-card p-6 border ${cardBorder} transition-all relative group`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">{category}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1 mt-1">
                        <FiCalendar className="text-[9px]" />
                        {formatDate(startDate)}
                        <FiArrowRight className="mx-1" />
                        {formatDateFull(endDate)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isExceeded && <FiAlertTriangle className="text-red-500 animate-bounce" />}
                    <button onClick={() => onDelete(budget._id)} className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors">
                        <FiTrash2 className="text-sm" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Spent</p>
                    <p className={`text-xl font-black ${isExceeded ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>₹{(spent || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Limit</p>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">₹{(limit || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Remaining</p>
                    <p className={`text-sm font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {remaining < 0 ? `-₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${(remaining || 0).toLocaleString('en-IN')}`}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Usage</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{(percentageUsed || 0).toFixed(1)}%</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-50 dark:border-gray-800">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                        style={{ width: `${Math.min(percentageUsed || 0, 100)}%` }}
                    />
                </div>
                {isExceeded && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                        ⚠️ Limit exceeded by ₹{(spent - limit).toLocaleString('en-IN')}
                    </p>
                )}
            </div>
        </div>
    );
};

const AlertBanner = ({ budgets }) => {
    if (!budgets || !Array.isArray(budgets)) return null;
    const exceeded = budgets.filter(b => (b?.spent || 0) > (b?.limit || 0));
    if (exceeded.length === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col gap-2">
                {exceeded.map(b => (
                    <div key={b._id} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 font-bold">
                        <FiAlertTriangle className="flex-shrink-0" />
                        <span>Budget exceeded for {b.category}! (Over by ₹{(b.spent - b.limit).toLocaleString('en-IN')})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showTxModal, setShowTxModal] = useState(false);

    // Default range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [range, setRange] = useState({ start: firstDay, end: lastDay });

    const [form, setForm] = useState({
        category: 'Food & Dining',
        limit: '',
        startDate: firstDay,
        endDate: lastDay
    });

    const fetchBudgets = useCallback(async (signal) => {
        setLoading(true);
        try {
            const { data } = await api.get('/budgets', {
                params: { startDate: range.start, endDate: range.end },
                signal,
            });
            setBudgets(data);
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        const controller = new AbortController();
        fetchBudgets(controller.signal);
        return () => controller.abort();
    }, [fetchBudgets]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.limit || Number(form.limit) <= 0) { toast.error('Enter a valid limit'); return; }
        try {
            await api.post('/budgets', {
                ...form,
                limit: Number(form.limit)
            });
            toast.success('Budget set successfully!');
            setShowForm(false);
            setForm({ ...form, limit: '' });
            fetchBudgets();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating budget');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget tracking?')) return;
        try {
            await api.delete(`/budgets/${id}`);
            toast.success('Budget removed');
            fetchBudgets();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Budget Tracking</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage and track your spending goals</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-2">
                        <FiCalendar className="text-gray-400 text-sm" />
                        <input
                            type="date"
                            className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 outline-none"
                            value={range.start}
                            onChange={(e) => setRange({ ...range, start: e.target.value })}
                        />
                    </div>
                    <FiArrowRight className="text-gray-300" />
                    <div className="flex items-center gap-2 px-2">
                        <input
                            type="date"
                            className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 outline-none"
                            value={range.end}
                            onChange={(e) => setRange({ ...range, end: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30"
                >
                    <FiPlus /> New Budget
                </button>
            </div>

            <AlertBanner budgets={budgets} />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
                </div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FiCalendar className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">No active budgets found</h3>
                    <p className="text-gray-500 mt-1 max-w-xs mx-auto text-sm">There are no spending goals defined for the selected period.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((b) => <BudgetCard key={b._id} budget={b} onDelete={handleDelete} />)}
                </div>
            )}

            {showTxModal && <TransactionModal onClose={() => setShowTxModal(false)} onSuccess={fetchBudgets} />}
            <FAB onClick={() => setShowTxModal(true)} />

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="glass-card w-full max-w-md p-6 relative">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Setup Spending Goal</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 ring-blue-500 outline-none transition-all"
                                >
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Monthly Limit (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 10000"
                                    value={form.limit}
                                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 ring-blue-500 outline-none transition-all font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Starts On</label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Ends On</label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transform active:scale-95 transition-all">
                                    Set Budget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
