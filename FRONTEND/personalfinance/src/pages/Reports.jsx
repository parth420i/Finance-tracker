import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../utils/api';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                {[1, 2].map((i) => <div key={i} className="h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
            </div>
        );
    }

    const { totalIncome = 0, totalExpense = 0, balance = 0, pieData = [], barData = [], insights = [] } = data || {};

    return (
        <div className="space-y-6 pb-8">
            {/* Insights */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-blue-500" /> AI Insights
                </h3>
                {insights.length === 0 ? (
                    <p className="text-sm text-gray-400">Add more transactions to generate insights.</p>
                ) : (
                    <div className="space-y-3">
                        {insights.map((ins, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                                <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-300">{ins}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Income', value: totalIncome, color: 'text-emerald-600' },
                    { label: 'Total Expense', value: totalExpense, color: 'text-red-500' },
                    { label: 'Net Balance', value: balance, color: balance >= 0 ? 'text-blue-600' : 'text-red-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>${Math.abs(value).toFixed(2)}</p>
                    </div>
                ))}
            </div>

            {/* Spending by category */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Spending by Category</h3>
                {pieData.length === 0 ? (
                    <p className="text-sm text-gray-400">No expense data.</p>
                ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 w-full lg:max-w-xs">
                            {pieData.slice(0, 8).map((item, idx) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                    <div className="flex-1 flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                        <span className="font-medium text-gray-800 dark:text-white">${item.value.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Daily spending bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Last 7 Days — Income vs Expense</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                        <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                        <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Reports;
