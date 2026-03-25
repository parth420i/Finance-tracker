import { useState, useEffect, useCallback } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import SummaryCard from '../components/SummaryCard';
import TransactionModal from '../components/TransactionModal';
import FAB from '../components/FAB';
import api from '../utils/api';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const Overview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const { data: res } = await api.get('/dashboard');
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const { totalIncome = 0, totalExpense = 0, balance = 0, pieData = [], barData = [], lineData = [], recentTransactions = [], insights = [] } = data || {};

    return (
        <div className="space-y-6 pb-20">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard title="Net Balance" value={balance} icon={FaRupeeSign} color="blue" subtitle="Total across all time" />
                <SummaryCard title="Total Income" value={totalIncome} icon={FiTrendingUp} color="green" />
                <SummaryCard title="Total Expense" value={totalExpense} icon={FiTrendingDown} color="red" />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 space-y-2">
                    {insights.map((ins, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                            <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                            {ins}
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="glass-card p-6 min-h-[400px] flex flex-col">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-6">Expense Distribution</h3>
                    {pieData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No expense data yet</div>
                    ) : (
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Bar Chart — last 7 days */}
                <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                            <Bar dataKey="income" fill="#10B981" radius={[4, 4, 4, 4]} name="Income" />
                            <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 4, 4]} name="Expense" />
                            <Legend />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Line Chart — balance trend */}
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Balance Trend (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} name="Balance" />
                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={1.5} dot={false} name="Income" />
                        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={1.5} dot={false} name="Expense" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
                </div>
                {recentTransactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No transactions yet. Add your first one!</div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {recentTransactions.map((t) => (
                            <div key={t._id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                                        {t.category[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{t.category}</p>
                                        <p className="text-xs text-gray-400">{t.note || new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && <TransactionModal onClose={() => setShowModal(false)} onSuccess={fetchDashboard} />}
            <FAB onClick={() => setShowModal(true)} />
        </div>
    );
};

export default Overview;
