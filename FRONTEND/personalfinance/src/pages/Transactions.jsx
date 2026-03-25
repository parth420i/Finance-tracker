import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import TransactionModal from '../components/TransactionModal';
import FAB from '../components/FAB';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'All', 'Food & Dining', 'Shopping', 'Transport', 'Housing', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Utilities', 'Salary', 'Freelance',
    'Investments', 'Business', 'Gifts', 'Other',
];

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.category && filters.category !== 'All') params.category = filters.category;
            if (filters.search) params.search = filters.search;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            const { data } = await api.get('/transactions', { params: { ...params, limit: 100 } });
            setTransactions(data.transactions);
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Deleted');
            fetchTransactions();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (t) => { setEditData(t); setShowModal(true); };
    const handleAdd = () => { setEditData(null); setShowModal(true); };

    return (
        <div className="space-y-5 pb-20">
            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
                <div className="relative flex-1 min-w-48">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Filter by notes..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={() => setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' })}
                    className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </h3>
                </div>

                {loading ? (
                    <div className="p-6 space-y-3 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <FiFilter className="text-4xl mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No transactions found. Try adjusting filters or add one!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Category</th>
                                    <th className="px-6 py-3 text-left">Note</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">{t.category}</span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {t.note || '—'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-3 text-sm font-semibold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-blue-500 transition-colors p-1">
                                                    <FiEdit2 className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                                    <FiTrash2 className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <TransactionModal
                    onClose={() => { setShowModal(false); setEditData(null); }}
                    onSuccess={fetchTransactions}
                    editData={editData}
                />
            )}
            <FAB onClick={handleAdd} />
        </div>
    );
};

export default Transactions;
