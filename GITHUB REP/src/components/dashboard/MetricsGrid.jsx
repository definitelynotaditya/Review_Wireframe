import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { FaDollarSign, FaClock, FaSync, FaUsers } from 'react-icons/fa';
import { IoStar } from "react-icons/io5";

const MetricsGrid = ({ metrics }) => {
    const { isDark } = useTheme();
    const { restaurant } = useAuthStore();

    const formatCurrency = (value) => {
        const symbol = restaurant?.currency_notation || '$';
        return `${symbol}${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const cards = [
        {
            title: 'Total Sales',
            value: metrics?.totalSale || '0',
            format: formatCurrency,
            icon: FaDollarSign,
            suffix: '',
        },
        {
            title: 'Avg Rating',
            value: metrics?.avgRating || '0',
            format: (val) => Number(val).toFixed(1),
            icon: IoStar,
            suffix: '/5',
        },
        {
            title: 'Response Time',
            value: metrics?.responseTime || '0',
            format: (val) => Math.round(val),
            icon: FaClock,
            suffix: 'sec',
        },
        {
            title: 'Turnaround',
            value: metrics?.turnaround || '0',
            format: (val) => Math.round(val),
            icon: FaSync,
            suffix: 'min',
        },
        {
            title: 'Customer Revisit',
            value: metrics?.revisit || '0',
            format: (val) => val,
            icon: FaUsers,
            suffix: '%',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={`p-6 rounded-xl transition-all ${
                            isDark
                                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                                : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3
                                className={`text-xs font-medium uppercase tracking-wide ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                            >
                                {card.title}
                            </h3>
                            <Icon className={isDark ? 'text-yellow-500' : 'text-yellow-600'} size={16} />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className={`text-3xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                                {card.format(card.value)}
                            </p>
                            {card.suffix && (
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {card.suffix}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MetricsGrid;