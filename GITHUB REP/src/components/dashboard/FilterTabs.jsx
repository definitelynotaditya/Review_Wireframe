import { useTheme } from '../../context/ThemeContext';

const FilterTabs = ({ activeFilter, onFilterChange, customDateFrom, customDateTo }) => {
    const { colors, isDark } = useTheme();
    
    const filters = [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'last_7_days', label: 'Week' },
        { id: 'this_month', label: 'Month' },
        { id: 'custom', label: 'Custom' },
    ];

    const getCustomLabel = () => {
        if (customDateFrom && customDateTo && activeFilter === 'custom') {
            const from = new Date(customDateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const to = new Date(customDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${from} - ${to}`;
        }
        return 'Custom';
    };

    return (
        <div className={`mb-6 ${colors.card} rounded-xl border ${colors.border} p-2`}>
            {/* Desktop version */}
            <div className="hidden sm:flex gap-4 flex-wrap">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                            activeFilter === filter.id
                                ? 'bg-[#B69549] text-white'
                                : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                        }`}
                    >
                        {filter.id === 'custom' ? getCustomLabel() : filter.label}
                    </button>
                ))}
            </div>

            {/* Mobile version with horizontal scroll */}
            <div className="sm:hidden overflow-x-auto scrollbar-none">
                <div className="flex space-x-2 min-w-max py-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                                activeFilter === filter.id
                                    ? 'bg-[#B69549] text-white'
                                    : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                            }`}
                        >
                            {filter.id === 'custom' ? getCustomLabel() : filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterTabs;