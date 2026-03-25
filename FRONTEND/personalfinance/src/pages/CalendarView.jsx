import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            // Fetch for current month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const lastDay = new Date(year, month + 1, 0).getDate();
            const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const end = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
            const { data } = await api.get(`/transactions?startDate=${start}&endDate=${end}&limit=500`);
            setTransactions(data.transactions);
        } catch {
            toast.error('Failed to load transactions');
        }
    };

    useEffect(() => { fetchTransactions(); }, [currentDate]);

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth(currentDate.getFullYear(), currentDate.getMonth()); i++) days.push(i);

    const getDayTransactions = (day) => {
        if (!day) return [];
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });
    };

    const [selectedDayTxs, setSelectedDayTxs] = useState(null);

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Expense Calendar</h1>
                <div className="flex items-center gap-4 glass-card px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/20 dark:hover:bg-gray-800 rounded-lg"><FiChevronLeft /></button>
                    <span className="font-bold min-w-[120px] text-center text-gray-800 dark:text-white">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/20 dark:hover:bg-gray-800 rounded-lg"><FiChevronRight /></button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day, idx) => {
                        const dayTxs = getDayTransactions(day);
                        const dayTotal = dayTxs.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum - t.amount, 0);

                        return (
                            <div key={idx} className={`min-h-[100px] border-r border-b border-gray-50 dark:border-gray-800/50 p-2 ${!day ? 'bg-gray-50/50 dark:bg-gray-950/20' : ''}`}>
                                {day && (
                                    <>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-semibold ${new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() ? 'w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full' : 'text-gray-500'}`}>
                                                {day}
                                            </span>
                                            {dayTotal > 0 && <span className="text-[10px] font-bold text-red-500">-₹{dayTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                                        </div>
                                        <div className="space-y-1">
                                            {dayTxs.slice(0, 3).map(t => (
                                                <div key={t._id} className={`text-[9px] px-1.5 py-0.5 rounded-md truncate ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                                    {t.category}
                                                </div>
                                            ))}
                                            {dayTxs.length > 3 && (
                                                <button onClick={() => setSelectedDayTxs({ day, txs: dayTxs })} className="text-[8px] text-gray-400 text-center w-full py-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors">
                                                    + {dayTxs.length - 3} more
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDayTxs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="glass-card w-full max-w-sm p-6 relative">
                        <button onClick={() => setSelectedDayTxs(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-xl leading-none">
                            &times;
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Transactions</h2>
                        <p className="text-sm text-gray-500 mb-4">{new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDayTxs.day).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>

                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                            {selectedDayTxs.txs.map(t => (
                                <div key={t._id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/30">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{t.category}</p>
                                        {t.note && <p className="text-xs text-gray-500">{t.note}</p>}
                                    </div>
                                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
