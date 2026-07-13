import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiArrowLeft } from 'react-icons/fi';
import Loader from '../common/Loader.jsx';

const TablesHistoryTable = ({ data = [], isLoading, isDark: propIsDark, colors: propColors }) => {
    const { isDark: contextIsDark, colors: contextColors } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
    const colors = propColors || contextColors;
    const [selectedTable, setSelectedTable] = useState(null);

    // Format time for display
    const formatTime = (utcTime) => {
        const isoString = typeof utcTime === 'string' && !utcTime.endsWith('Z') ? utcTime + 'Z' : utcTime;
        return new Date(isoString).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Format date with time for display
    const formatDateWithTime = (dateString) => {
        if (!dateString) return '--';

        try {
            const isoString = typeof dateString === 'string' && !dateString.endsWith('Z') ? dateString + 'Z' : dateString;
            const date = new Date(isoString);
            if (Number.isNaN(date.getTime())) return '--';
            const dateStr = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            return dateStr + ' · ' + formatTime(dateString);
        } catch {
            return '--';
        }
    };

    // Group data by table number
    const tablesByNumber = data.reduce((acc, item) => {
        const tableNum = item.table_number;
        if (!acc[tableNum]) {
            acc[tableNum] = [];
        }
        acc[tableNum].push(item);
        return acc;
    }, {});

    const tableNumbers = Object.keys(tablesByNumber).sort((a, b) => parseInt(a) - parseInt(b));

    // Calculate stats for a table
    const getTableStats = (tableNum) => {
        const sessions = tablesByNumber[tableNum];
        return {
            totalRevenue: sessions.reduce((sum, s) => sum + (parseFloat(s.revenue) || 0), 0),
            totalServiceCalls: sessions.reduce((sum, s) => sum + (s.total_service_calls || 0), 0),
            totalChefSpecialCalls: sessions.reduce((sum, s) => sum + (s.total_chef_special_calls || 0), 0),
            totalManagerCalls: sessions.reduce((sum, s) => sum + (s.total_manager_calls || 0), 0),
            totalPowerbankCalls: sessions.reduce((sum, s) => sum + (s.total_powerbank_calls || 0), 0),
            sessionCount: sessions.length,
        };
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-8 text-center ${colors.textMuted}`}>
                No table history data available
            </div>
        );
    }

    // Detailed view for selected table
    if (selectedTable) {
        const sessions = tablesByNumber[selectedTable];
        const stats = getTableStats(selectedTable);

        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow}`}>
                {/* Header with back button */}
                <div className={`${colors.secondary} border-b ${colors.border} px-6 py-4 flex items-center gap-4`}>
                    <button
                        onClick={() => setSelectedTable(null)}
                        className={`p-2 rounded-lg ${colors.hover} transition-colors`}
                    >
                        <FiArrowLeft size={20} className={colors.textPrimary} />
                    </button>
                    <h3 className={`text-xl font-bold ${colors.textPrimary}`}>Table {selectedTable} - Activities</h3>
                </div>

                {/* Summary Stats Row */}
                <div className={`px-6 py-4 border-b ${colors.border}`}>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                            <p className={`${colors.textSecondary} text-sm font-medium`}>Total Revenue</p>
                            <p className="text-2xl font-bold text-[#B69549] mt-2">
                                ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                            <p className={`${colors.textSecondary} text-sm font-medium`}>Service Calls</p>
                            <p className="text-2xl font-bold text-[#B69549] mt-2">{stats.totalServiceCalls}</p>
                        </div>
                        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                            <p className={`${colors.textSecondary} text-sm font-medium`}>Chef Special</p>
                            <p className="text-2xl font-bold text-[#B69549] mt-2">{stats.totalChefSpecialCalls}</p>
                        </div>
                        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                            <p className={`${colors.textSecondary} text-sm font-medium`}>Manager Calls</p>
                            <p className="text-2xl font-bold text-[#B69549] mt-2">{stats.totalManagerCalls}</p>
                        </div>
                        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                            <p className={`${colors.textSecondary} text-sm font-medium`}>Powerbank</p>
                            <p className="text-2xl font-bold text-[#B69549] mt-2">{stats.totalPowerbankCalls}</p>
                        </div>
                    </div>
                </div>

                {/* Sessions Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`${colors.secondary} border-b ${colors.border}`}>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>GUEST</th>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVER</th>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>REVENUE</th>
                                <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>CALLS</th>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SESSION START</th>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SESSION END</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, idx) => (
                                <tr key={idx} className={`border-b ${colors.border}`}>
                                    <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{session.guest_name || '-'}</td>
                                    <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{session.server_name}</td>
                                    <td className="px-6 py-4 font-semibold text-[#B69549]">₹{parseFloat(session.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {session.total_service_calls}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        {formatDateWithTime(session.session_start_time)}
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        {formatDateWithTime(session.session_end_time)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Grid view of tables
    return (
        <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-6`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {tableNumbers.map((tableNum) => {
                    const stats = getTableStats(tableNum);
                    return (
                        <button
                            key={tableNum}
                            onClick={() => setSelectedTable(tableNum)}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                isDark
                                    ? 'bg-slate-700 border-slate-600 hover:border-[#B69549]'
                                    : 'bg-gray-100 border-gray-300 hover:border-[#B69549]'
                            }`}
                        >
                            <div className={`text-2xl font-semibold ${colors.textPrimary} text-center mb-2`}>{tableNum}</div>
                            <div className={`text-sm text-center ${colors.textSecondary}`}>
                                ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TablesHistoryTable;
