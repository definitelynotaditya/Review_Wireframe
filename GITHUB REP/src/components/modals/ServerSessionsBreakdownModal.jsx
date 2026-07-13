import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { IoClose } from 'react-icons/io5';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ServerSessionsBreakdownModal = ({ isOpen, onClose, serverData }) => {
    const { colors, isDark } = useTheme();
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    if (!isOpen || !serverData) return null;

    const sessions = Array.isArray(serverData.server_sessions) ? serverData.server_sessions : [];

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-slate-400" />;
        return sortConfig.direction === 'asc'
            ? <FaSortUp className="text-[#B69549]" />
            : <FaSortDown className="text-[#B69549]" />;
    };

    const toSortableValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value;

        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && value !== '') return numericValue;

        return String(value);
    };

    const sortedSessions = [...sessions].sort((a, b) => {
        const aVal = toSortableValue(a[sortConfig.key]);
        const bVal = toSortableValue(b[sortConfig.key]);

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortConfig.direction === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
    });

    const formatSeconds = (seconds) => {
        const secs = parseInt(seconds || 0, 10);
        if (!secs) return '-';

        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${remainingSecs}s`;
    };

    const formatTime = (utcTime) => {
        if (!utcTime) return '-';
        return new Date(utcTime).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDateWithTime = (dateString) => {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            const dateStr = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            return `${dateStr} · ${formatTime(dateString)}`;
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
                <div className={`${colors.headerBg} px-6 py-4 border-b ${colors.border} flex justify-between items-center`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : colors.text}`}>
                            Server Breakdown - {serverData.server_name || '-'}
                        </h2>
                        <p className={`text-sm ${colors.textSecondary} mt-1`}>
                            Code: {serverData.server_code || '-'} · {sessions.length} sessions
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                    >
                        <IoClose size={24} className={isDark ? 'text-white' : colors.text} />
                    </button>
                </div>

                <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Tables Served</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{serverData.tables_served || 0}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Guests Served</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{serverData.guests_served || 0}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Service Calls</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{serverData.service_calls_attended || 0}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Avg Turnaround</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{formatSeconds(serverData.avg_turnaround_seconds)}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Revenue</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">
                            ₹{parseFloat(serverData.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                                    <th className={`px-4 py-3 text-right font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('revenue')}
                                            className="flex items-center gap-2 ml-auto hover:text-[#B69549] transition-colors"
                                        >
                                            Revenue {getSortIcon('revenue')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('total_service_calls')}
                                            className="flex items-center gap-2 mx-auto hover:text-[#B69549] transition-colors"
                                        >
                                            Service Calls {getSortIcon('total_service_calls')}
                                        </button>
                                    </th>
                                    <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>
                                        <button
                                            onClick={() => handleSort('session_turnaround_seconds')}
                                            className="flex items-center gap-2 hover:text-[#B69549] transition-colors"
                                        >
                                            Turnaround {getSortIcon('session_turnaround_seconds')}
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
                                {sortedSessions.map((session) => (
                                    <tr
                                        key={session.session_id}
                                        className={`border-b ${colors.border} ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50'} transition-colors`}
                                    >
                                        <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : colors.text}`}>
                                            {session.table_number || '-'}
                                        </td>
                                        <td className={`px-4 py-3 ${isDark ? 'text-white' : colors.text}`}>
                                            {session.guest_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#B69549]">
                                            ₹{parseFloat(session.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                                {session.total_service_calls || 0}
                                            </span>
                                        </td>
                                        <td className={`${isDark ? 'text-gray-300' : colors.textSecondary} px-4 py-3`}>
                                            {formatSeconds(session.session_turnaround_seconds)}
                                        </td>
                                        <td className={`${isDark ? 'text-gray-300' : colors.textSecondary} px-4 py-3`}>
                                            {formatDateWithTime(session.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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

export default ServerSessionsBreakdownModal;
