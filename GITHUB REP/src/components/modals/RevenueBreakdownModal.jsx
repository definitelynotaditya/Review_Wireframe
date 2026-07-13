import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { IoClose } from 'react-icons/io5';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const RevenueBreakdownModal = ({ isOpen, onClose, revenueData }) => {
    const { colors, isDark } = useTheme();
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    if (!isOpen || !revenueData) return null;

    const { total_revenue = 0, total_bills = 0, avg_bill_value = 0, revenue_breakdown = [] } = revenueData;

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = [...revenue_breakdown].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
    });

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-slate-400" />;
        return sortConfig.direction === 'asc' ? 
            <FaSortUp className="text-[#B69549]" /> : 
            <FaSortDown className="text-[#B69549]" />;
    };

    const formatTime = (utcTime) => {
        // Add 'Z' if not present to ensure UTC parsing
        const isoString = typeof utcTime === 'string' && !utcTime.endsWith('Z') ? utcTime + 'Z' : utcTime;
        return new Date(isoString).toLocaleString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDateWithTime = (dateString) => {
        try {
            // Add 'Z' if not present to ensure UTC parsing
            const isoString = typeof dateString === 'string' && !dateString.endsWith('Z') ? dateString + 'Z' : dateString;
            const date = new Date(isoString);
            const dateStr = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            return dateStr + ' · ' + formatTime(dateString);
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`${colors.headerBg} px-6 py-4 border-b ${colors.border} flex justify-between items-center`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : colors.text}`}>Revenue Breakdown</h2>
                        <p className={`text-sm ${colors.textSecondary} mt-1`}>{total_bills} transactions</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 hover:${colors.hoverBg} rounded-lg transition-colors`}
                    >
                        <IoClose size={24} className={colors.text} />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className={`grid grid-cols-3 gap-4 px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Revenue</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">₹{parseFloat(total_revenue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Bills</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{total_bills}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Avg Bill Value</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">₹{parseFloat(avg_bill_value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-opacity-50 backdrop-blur">
                                <tr className={`${colors.headerBg} border-b ${colors.border}`}>
                                    <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('table_number')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Table {getSortIcon('table_number')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('guest_name')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Guest {getSortIcon('guest_name')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('server_name')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Server {getSortIcon('server_name')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-right font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('bill_amount')}
                                            className="flex items-center gap-2 ml-auto hover:text-[#B69549] transition-colors"
                                        >
                                            Amount {getSortIcon('bill_amount')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('created_at')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Date/Time {getSortIcon('created_at')}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((transaction, index) => (
                                    <tr
                                        key={transaction.session_id || index}
                                        className={`border-b ${colors.border} hover:${colors.hoverBg} transition-colors`}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${isDark ? 'text-white' : colors.text}`}>{transaction.table_number}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isDark ? 'text-white' : colors.text}>{transaction.guest_name || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isDark ? 'text-white' : colors.text}>{transaction.server_name || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-semibold text-[#B69549]">
                                                ₹{parseFloat(transaction.bill_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isDark ? 'text-gray-300' : colors.textSecondary}>{formatDateWithTime(transaction.created_at)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Close Button */}
                <div className={`border-t ${colors.border} px-6 py-4 flex justify-end`}>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#B69549] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RevenueBreakdownModal;
