import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiShield, FiCalendar, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LoanCard = ({ loan, onRepay, onDelete }) => {
    const title = loan.title || loan.name || 'Untitled';
    const principalAmount = loan.principalAmount || loan.amount || 0;
    const remainingBalance = typeof loan.remainingBalance === 'number' ? loan.remainingBalance : (typeof loan.remainingAmount === 'number' ? loan.remainingAmount : 0);
    const interestRate = loan.interestRate || 0;
    const monthlyInterest = loan.monthlyInterest || 0;
    const repaymentProgress = loan.repaymentProgress || 0;
    const totalRepaid = loan.totalRepaid || 0;
    const type = loan.type || 'loan';
    const note = loan.note;

    const isPaid = remainingBalance <= 0;

    // Color logic: Low (red), Mid (yellow), Near completion (green)
    const progressColor = repaymentProgress > 70 ? 'bg-emerald-500' : repaymentProgress > 30 ? 'bg-amber-500' : 'bg-red-500';
    const cardBorder = isPaid ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10' : 'border-gray-100 dark:border-gray-800';

    return (
        <div className={`glass-card p-6 border ${cardBorder} transition-all relative group hover:shadow-xl`}>
            <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                        {isPaid ? <FiCheckCircle /> : <FiShield />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">{title}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isPaid && (
                        <button
                            onClick={() => onRepay(loan)}
                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            REPAY
                        </button>
                    )}
                    <button onClick={() => onDelete(loan._id)} className="p-2 text-gray-300 hover:text-red-500 transition-all">
                        <FiTrash2 className="text-sm" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">Remaining Balance</p>
                    <p className={`text-xl font-black ${isPaid ? 'text-emerald-500' : 'text-gray-800 dark:text-white'}`}>
                        ₹{remainingBalance.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">Monthly Interest ({interestRate}%)</p>
                    <p className={`text-xl font-bold ${isPaid ? 'text-gray-400' : 'text-red-500'}`}>
                        ₹{monthlyInterest.toFixed(0)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-tight">Principal</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">₹{principalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-tight">Total Repaid</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{totalRepaid.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">Repayment Progress</span>
                    <span className="text-gray-800 dark:text-white">{repaymentProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-50 dark:border-gray-800">
                    <div
                        className={`h-full transition-all duration-1000 ${progressColor}`}
                        style={{ width: `${repaymentProgress}%` }}
                    />
                </div>
            </div>

            {note && <p className="mt-4 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">"{note}"</p>}
        </div>
    );
};

const Debts = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [repayModal, setRepayModal] = useState(null);
    const [repayForm, setRepayForm] = useState({ amount: '', note: '' });

    const [newDebt, setNewDebt] = useState({
        title: '',
        type: 'loan',
        principalAmount: '',
        interestRate: '',
        startDate: new Date().toISOString().split('T')[0],
        note: ''
    });

    const fetchDebts = useCallback(async () => {
        try {
            const { data } = await api.get('/debts');
            setDebts(data);
        } catch {
            toast.error('Failed to fetch loans');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDebts(); }, [fetchDebts]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDebt.title || !newDebt.principalAmount) return;
        try {
            await api.post('/debts', {
                ...newDebt,
                principalAmount: Number(newDebt.principalAmount),
                interestRate: Number(newDebt.interestRate || 0)
            });
            toast.success('Loan recorded!');
            setShowModal(false);
            setNewDebt({ title: '', type: 'loan', principalAmount: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], note: '' });
            fetchDebts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create');
        }
    };

    const handleRepay = async (e) => {
        e.preventDefault();
        if (!repayForm.amount || Number(repayForm.amount) <= 0) return;
        try {
            await api.post('/debts/repay', {
                loanId: repayModal._id,
                amount: Number(repayForm.amount),
                note: repayForm.note
            });
            toast.success('Repayment recorded successfully!');
            setRepayModal(null);
            setRepayForm({ amount: '', note: '' });
            fetchDebts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record repayment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this loan record?')) return;
        try {
            await api.delete(`/debts/${id}`);
            toast.success('Loan deleted');
            fetchDebts();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl" />)}
        </div>
    );

    const totalOwed = debts.reduce((sum, d) => sum + (d.remainingBalance || d.remainingAmount || 0), 0);

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Debts & Loans</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Remaining: <span className="font-bold text-red-500 text-lg ml-1">₹{totalOwed.toLocaleString('en-IN')}</span>
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95"
                >
                    <FiPlus className="text-lg" /> New Loan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {debts.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-card border-dashed border-2">
                        <FiShield className="text-5xl text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">No active loans or debts found</h3>
                        <p className="text-sm text-gray-400 mt-1">Start by adding your first financial obligation.</p>
                    </div>
                ) : (
                    debts.map((debt) => (
                        <LoanCard
                            key={debt._id}
                            loan={debt}
                            onRepay={(l) => setRepayModal(l)}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Create Loan Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="glass-card w-full max-w-md p-8 relative">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Setup New Loan</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Loan Title</label>
                                <input type="text" placeholder="e.g. Student Loan, Car Loan" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white" value={newDebt.title} onChange={(e) => setNewDebt({ ...newDebt, title: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Category</label>
                                    <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white" value={newDebt.type} onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}>
                                        <option value="loan">Loan</option>
                                        <option value="credit card">Credit Card</option>
                                        <option value="personal">Personal</option>
                                        <option value="mortgage">Mortgage</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Annual Interest (%)</label>
                                    <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Principal Amount (₹)</label>
                                <input type="number" placeholder="0.00" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white font-bold text-lg" value={newDebt.principalAmount} onChange={(e) => setNewDebt({ ...newDebt, principalAmount: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Start Date</label>
                                <input type="date" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white" value={newDebt.startDate} onChange={(e) => setNewDebt({ ...newDebt, startDate: e.target.value })} required />
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transform active:scale-95 transition-all">Record Loan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Repayment Modal */}
            {repayModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="glass-card w-full max-w-sm p-8 relative">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Make Repayment</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Paying towards <span className="text-blue-600 font-bold">{repayModal.title || repayModal.name}</span></p>

                        <form onSubmit={handleRepay} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Amount to Pay (₹)</label>
                                <input
                                    autoFocus
                                    type="number"
                                    max={repayModal.remainingBalance || repayModal.remainingAmount}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white font-black text-xl placeholder:text-gray-300"
                                    value={repayForm.amount}
                                    placeholder="0.00"
                                    onChange={(e) => setRepayForm({ ...repayForm, amount: e.target.value })}
                                    required
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Max allowed: ₹{(repayModal.remainingBalance || repayModal.remainingAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Note</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly EMI"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                                    value={repayForm.note}
                                    onChange={(e) => setRepayForm({ ...repayForm, note: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/20 transform active:scale-95 transition-all">
                                    Confirm Repayment
                                </button>
                                <button type="button" onClick={() => setRepayModal(null)} className="w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Go Back</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debts;
