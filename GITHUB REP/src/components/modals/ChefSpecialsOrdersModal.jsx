import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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

const ChefSpecialsOrdersModal = ({ isOpen, onClose, dishData, isDark, colors }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'ordered_at', direction: 'desc' });

    if (!isOpen || !dishData) return null;

    const orders = Array.isArray(dishData.orders) ? dishData.orders : [];
    const uniqueGuests = new Set(orders.map((order) => order.guest_name || order.guest || 'Guest'));

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = [...orders].sort((a, b) => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
                <div className={`${colors.headerBg} px-6 py-4 border-b ${colors.border} flex justify-between items-center`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : colors.text}`}>
                            Chef Specials Breakdown
                        </h2>
                        <p className={`text-sm ${colors.textSecondary} mt-1`}>
                            {dishData.dish_name} · {orders.length} orders
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-2 hover:${colors.hoverBg} rounded-lg transition-colors`}
                    >
                        <IoClose size={22} className={isDark ? 'text-white' : colors.text} />
                    </button>
                </div>

                <div className={`grid grid-cols-3 gap-4 px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Orders</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{orders.length}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Unique Guests</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{uniqueGuests.size}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Revenue</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">
                            ₹{parseFloat(dishData.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-auto px-6 py-4 scrollbar-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-opacity-50 backdrop-blur">
                                <tr className={`${colors.headerBg} border-b ${colors.border}`}>
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
                                            onClick={() => handleSort('ordered_at')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Date/Time {getSortIcon('ordered_at')}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map((order, index) => {
                                    const guest = order.guest_name || order.guest || 'Guest';
                                    const server = order.server_name || order.server || 'Server';
                                    const orderedAt = order.ordered_at || order.created_at || '';

                                    return (
                                        <tr
                                            key={`${orderedAt}-${index}`}
                                            className={`border-b ${colors.border} hover:${colors.hoverBg} transition-colors`}
                                        >
                                            <td className="px-4 py-3">
                                                <span className={isDark ? 'text-white' : colors.text}>{guest}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={isDark ? 'text-white' : colors.text}>{server}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={isDark ? 'text-white' : colors.text}>{order.table_number || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={isDark ? 'text-gray-300' : colors.textSecondary}>
                                                    {formatDateWithTime(orderedAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={`border-t ${colors.border} px-6 py-4 flex justify-end`}>
                    <button
                        type="button"
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

export default ChefSpecialsOrdersModal;