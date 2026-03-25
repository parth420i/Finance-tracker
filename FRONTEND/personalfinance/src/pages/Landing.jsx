import { Link } from 'react-router-dom';
import { FiDollarSign, FiBarChart2, FiShield, FiDownload, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const features = [
    { icon: FiTrendingUp, title: 'Smart Analytics', desc: 'Track income and expenses with beautiful charts and real-time insights.' },
    { icon: FiTarget, title: 'Budget Goals', desc: 'Set category-wise budgets and get warned before you overspend.' },
    { icon: FiDownload, title: 'CSV Import / Export', desc: 'Bulk import transactions and export your data anytime, in any format.' },
    { icon: FiBarChart2, title: 'Visual Reports', desc: 'Pie, bar, and line charts give you a full picture of your finances.' },
    { icon: FiShield, title: 'Secure & Private', desc: 'JWT auth and encrypted passwords keep your data safe.' },
    { icon: FaRupeeSign, title: 'Multi-category', desc: 'Organize spending into 15+ categories for crystal-clear visibility.' },
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-transparent font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <FaRupeeSign className="text-white text-xs" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">FinanceTracker</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Home', 'Features', 'Support'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors">
                            Login
                        </Link>
                        <Link to="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-600/30">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section id="home" className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-44 h-44 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                        <FaRupeeSign className="text-7xl text-white/90" />
                    </div>

                    {/* Text */}
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-extrabold leading-tight mb-4">
                            Personal Finance<br />
                            <span className="text-blue-200">Tracker</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                            Manage your finances intelligently. Track expenses, set budgets, and gain insights to reach your financial goals.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link to="/dashboard" className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                                🚀 Try Web App
                            </Link>
                            <Link to="/login" className="flex items-center gap-2 bg-transparent border-2 border-white/50 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all">
                                Login
                            </Link>
                            <Link to="/signup" className="flex items-center gap-2 bg-blue-500/50 border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-500/70 transition-all">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-transparent">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Finances at a Glance</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                            Stop wondering where your money goes. FinanceTracker gives you a complete picture on a single screen.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card p-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <Icon className="text-blue-600 dark:text-blue-400 text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-blue-600/10 backdrop-blur-sm border-y border-blue-100 dark:border-blue-900">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to take control of your finances?</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Create your free account today and start tracking in minutes.</p>
                    <Link to="/signup" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 text-lg">
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Support / Footer */}
            <footer id="support" className="bg-gray-900/80 backdrop-blur-md text-gray-400 py-12">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                            <FaRupeeSign className="text-white text-xs" />
                        </div>
                        <span className="text-white font-bold">FinanceTracker</span>
                    </div>
                    <p className="text-sm">© 2026 FinanceTracker. Built with ❤️ for smarter finances.</p>
                    <div className="flex gap-6 text-sm">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#support" className="hover:text-white transition-colors">Support</a>
                        <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
