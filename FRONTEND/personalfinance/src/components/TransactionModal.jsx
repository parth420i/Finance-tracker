import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Food & Dining', 'Shopping', 'Transport', 'Housing', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Utilities', 'Salary', 'Freelance',
    'Investments', 'Business', 'Gifts', 'Other',
];

const TransactionModal = ({ onClose, onSuccess, editData }) => {
    const isEdit = !!editData;
    const [form, setForm] = useState({
        amount: editData?.amount || '',
        type: editData?.type || 'expense',
        category: editData?.category || 'Food & Dining',
        date: editData?.date ? editData.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        note: editData?.note || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/transactions/${editData._id}`, form);
                toast.success('Transaction updated!');
            } else {
                await api.post('/transactions', form);
                toast.success('Transaction added!');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isEdit ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <FiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        {['expense', 'income'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setForm({ ...form, type: t })}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.type === t
                                    ? t === 'expense'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-emerald-500 text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
                        <input
                            name="note"
                            type="text"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Add a description, explicitly stating any updates..."
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Please explicitly mention any changes or updates regarding this transaction here.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-60"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
