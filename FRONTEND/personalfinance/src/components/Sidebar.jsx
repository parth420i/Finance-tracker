import { NavLink, useNavigate } from 'react-router-dom';
import {
    FiGrid, FiList, FiTarget, FiBarChart2, FiUploadCloud,
    FiSettings, FiLogOut, FiMoon, FiSun, FiDollarSign,
    FiClock, FiCreditCard, FiActivity, FiTag, FiCalendar, FiPieChart,
    FiShield,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
    { to: '/dashboard', icon: FiGrid, label: 'Overview' },
    { to: '/dashboard/transactions', icon: FiList, label: 'Transactions' },
    { to: '/dashboard/recurring', icon: FiClock, label: 'Scheduled / Recurring' },
    { to: '/dashboard/budgets', icon: FiTarget, label: 'Budgets' },
    { to: '/dashboard/debts', icon: FiShield, label: 'Debts' },
    {
        to: '/dashboard/charts',
        icon: FiPieChart,
        label: 'Charts',
        subItems: [
            { to: '/dashboard/charts?tab=categories', label: 'Categories' },
            { to: '/dashboard/charts?tab=time', label: 'Time' },

            { to: '/dashboard/charts?tab=forecasts', label: 'Forecasts' },
        ]
    },
    { to: '/dashboard/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/dashboard/csv', icon: FiUploadCloud, label: 'CSV Import/Export' },
    { to: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                        <FaRupeeSign className="text-white text-base" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 dark:text-white tracking-tight">
                        FinanceTracker
                    </span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <div key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.to === '/dashboard'}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="text-base flex-shrink-0" />
                                {item.label}
                            </NavLink>
                            {item.subItems && (
                                <div className="ml-9 mt-1 space-y-1">
                                    {item.subItems.map((sub) => (
                                        <NavLink
                                            key={sub.to}
                                            to={sub.to}
                                            onClick={onClose}
                                            className={({ isActive }) =>
                                                `block px-3 py-1.5 rounded-lg text-[13px] transition-all ${isActive
                                                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                                                }`
                                            }
                                        >
                                            {sub.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    <button
                        onClick={toggle}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        {isDark ? <FiSun className="text-base" /> : <FiMoon className="text-base" />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <FiLogOut className="text-base" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
