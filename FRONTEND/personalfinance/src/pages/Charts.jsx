import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { FiPieChart, FiTrendingUp, FiActivity, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Charts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'categories';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const setActiveTab = (tab) => setSearchParams({ tab });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setData(data);
            } catch {
                toast.error('Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading charts...</div>;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const tabs = [
        { id: 'categories', label: 'Categories', icon: FiPieChart },
        { id: 'time', label: 'Time', icon: FiActivity },
        { id: 'forecasts', label: 'Forecasts', icon: FiTrendingUp },
    ];

    // Compute forecast using simple linear regression based on data.lineData
    let forecastData = [];
    if (data?.lineData && data.lineData.length > 0) {
        const n = data.lineData.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        data.lineData.forEach((point, i) => {
            const x = i;
            const y = point.balance;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        });

        const denominator = (n * sumX2 - sumX * sumX);
        const m = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
        const b = (sumY - m * sumX) / n;

        // Build array combining past 6 months + future 6 months
        const combinedData = [...data.lineData];

        const lastMonthStr = data.lineData[n - 1].month; // YYYY-MM
        const [lastYear, lastMonthIdx] = lastMonthStr.split('-');
        let lastDate = new Date(lastYear, lastMonthIdx - 1, 1);

        for (let i = 1; i <= 6; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setMonth(nextDate.getMonth() + i);
            const monthStr = nextDate.toISOString().slice(0, 7);
            const y = m * (n - 1 + i) + b;
            combinedData.push({ month: monthStr, balance: y });
        }
        forecastData = combinedData;
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Analytics Center</h1>

                {/* Custom Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="text-base" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar Placeholder (Mocking UI from screenshots) */}
            <div className="glass-card p-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><FiFilter /> Filters:</div>
                <select className="bg-white/50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-1 ring-blue-500 text-gray-800 dark:text-gray-200">
                    <option>Last 30 Days</option>
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                </select>
                <select className="bg-white/50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-1 ring-blue-500 text-gray-800 dark:text-gray-200">
                    <option>All Accounts</option>
                    <option>Checking</option>
                    <option>Savings</option>
                </select>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card p-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-8">Spending Distribution</h3>
                            {data?.pieData?.length > 0 ? (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.pieData}
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                labelLine={true}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                            >
                                                {data.pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                formatter={(v) => `₹${v.toFixed(2)}`}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                iconType="circle"
                                                wrapperStyle={{ paddingTop: '30px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-gray-400">No data available</div>
                            )}
                        </div>

                        <div className="glass-card p-8 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Categories</h3>
                            <div className="space-y-4">
                                {data?.pieData?.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</div>
                                        <div className="font-bold text-gray-900 dark:text-white">₹{item.value.toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'time' && (
                    <div className="glass-card p-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-8">Daily Cash Flow Tracking</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.barData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income Stream" />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Current Spending" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'forecasts' && (
                    <div className="space-y-6">
                        <div className="glass-card p-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Financial Health Forecast</h3>
                            <p className="text-gray-500 mb-8 max-w-2xl">Using regression analysis on your previous 6 months of data to predict your savings rate into the next half of the year.</p>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={forecastData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip formatter={(v) => `₹${Number(v).toFixed(2)}`} />
                                        <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} strokeDasharray="8 5" dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Predicted Saving Trend" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Charts;
