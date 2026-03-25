import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const pageTitles = {
    '/dashboard': 'Overview',
    '/dashboard/transactions': 'Transactions',
    '/dashboard/budgets': 'Budgets',
    '/dashboard/reports': 'Reports & Insights',
    '/dashboard/csv': 'CSV Import / Export',
    '/dashboard/settings': 'Settings',
};

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { pathname } = useLocation();
    const title = pageTitles[pathname] || 'Dashboard';

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav title={title} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
