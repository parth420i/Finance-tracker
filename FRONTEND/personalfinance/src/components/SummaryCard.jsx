const SummaryCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    const colorMap = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
    };
    const bgMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20',
        green: 'bg-emerald-50 dark:bg-emerald-900/20',
        red: 'bg-red-50 dark:bg-red-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                        ₹{typeof value === 'number' ? value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${bgMap[color]} flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
                        <Icon className="text-white text-base" />
                    </div>
                </div>
            </div>
            {trend !== undefined && (
                <div className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% from last month
                </div>
            )}
        </div>
    );
};

export default SummaryCard;
