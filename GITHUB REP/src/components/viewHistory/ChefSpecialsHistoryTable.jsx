import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { IoEye } from 'react-icons/io5';
import Loader from '../common/Loader.jsx';
import ChefSpecialsOrdersModal from '../modals/ChefSpecialsOrdersModal.jsx';

const PREVIEW_LIMIT = 2;

const formatDateWithTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return `${formattedDate} · ${formattedTime}`;
};

const ChefSpecialsHistoryTable = ({ data = [], isLoading, isDark: propIsDark, colors: propColors }) => {
    const { isDark: contextIsDark, colors: contextColors } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
    const colors = propColors || contextColors;
    const [selectedDish, setSelectedDish] = useState(null);

    const safeParseOrders = (orders) => {
        if (Array.isArray(orders)) return orders;
        if (typeof orders === 'string') {
            try {
                const parsed = JSON.parse(orders);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-8 text-center ${colors.textMuted}`}>
                No chef specials history data available
            </div>
        );
    }

    return (
        <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`${colors.secondary} border-b ${colors.border}`}>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>DISH NAME</th>
                            <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>ORDERS</th>
                            <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : colors.text}`}>TOTAL REVENUE</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>LATEST ORDER</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>RECENT ORDERS</th>
                            <th className="px-6 py-4 text-left font-semibold" aria-label="Actions"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => {
                            const orders = safeParseOrders(row.orders);
                            const previewOrders = orders.slice(0, PREVIEW_LIMIT);
                            const latestOrder = orders[0] || null;
                            const latestOrderDate = latestOrder?.ordered_at || latestOrder?.created_at || '';

                            return (
                                <tr
                                    key={`${row.dish_name}-${idx}`}
                                    className={`border-b ${colors.border}`}
                                >
                                    <td className={`px-6 py-3 align-middle font-medium ${isDark ? 'text-white' : colors.text}`}>
                                        {row.dish_name}
                                    </td>
                                    <td className="px-10 py-3 align-middle text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.ordered_count}
                                        </span>
                                    </td>
                                    <td className="px-12 py-3 align-middle text-right font-semibold text-[#B69549]">
                                        ₹{parseFloat(row.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className={`px-6 py-3 align-middle text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        <span className={isDark ? 'text-white' : colors.text}>
                                            {formatDateWithTime(latestOrderDate)}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-3 align-middle text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        <div className="flex flex-wrap gap-2">
                                            {previewOrders.map((order, orderIdx) => {
                                                const guest = order.guest_name || order.guest || 'Guest';

                                                return (
                                                    <span
                                                        key={orderIdx}
                                                        className={`truncate px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}
                                                        style={{ maxWidth: '100%' }}
                                                    >
                                                        {guest}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 align-middle text-left">
                                        {orders.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDish({
                                                    dish_name: row.dish_name,
                                                    ordered_count: row.ordered_count,
                                                    total_revenue: row.total_revenue,
                                                    orders,
                                                })}
                                                className={`inline-flex items-center justify-center rounded-full border px-3 py-2 transition-colors ${isDark
                                                    ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                                }`}
                                                aria-label={`View breakdown for ${row.dish_name}`}
                                            >
                                                <IoEye size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ChefSpecialsOrdersModal
                isOpen={!!selectedDish}
                onClose={() => setSelectedDish(null)}
                dishData={selectedDish}
                isDark={isDark}
                colors={colors}
            />
        </div>
    );
};

export default ChefSpecialsHistoryTable;
