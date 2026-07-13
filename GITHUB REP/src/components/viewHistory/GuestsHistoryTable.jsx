import { useState } from 'react';
import { IoEye } from 'react-icons/io5';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../common/Loader.jsx';
import GuestsTablesVisitedModal from '../modals/GuestsTablesVisitedModal.jsx';

const GuestsHistoryTable = ({ data = [], isLoading, isDark: propIsDark, colors: propColors }) => {
    const [selectedGuest, setSelectedGuest] = useState(null);
    const { isDark: contextIsDark, colors: contextColors } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
    const colors = propColors || contextColors;

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
        try {
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

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-8 text-center ${colors.textMuted}`}>
                No guest history data available
            </div>
        );
    }

    return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} border ${colors.border}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className={`${colors.secondary} border-b ${colors.border}`}>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>GUEST NAME</th>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>VISITS</th>
                            <th className={`px-4 py-4 text-right font-semibold ${isDark ? 'text-white' : colors.text}`}>TOTAL BILL</th>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>CALLS</th>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>FOOD</th>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVICE</th>
                            <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>EXPERIENCE</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>LAST VISIT</th>
                            <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>TABLES VISITED</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => {
                            const tablesArray = Array.isArray(row.tables)
                                ? row.tables
                                : (typeof row.tables === 'string' ? row.tables.split(',').map(s => s.trim()) : []);

                            return (
                                <tr key={`${row.guest_name || 'guest'}-${idx}`} className={`border-b ${colors.border} transition-colors hover:${isDark ? 'bg-slate-800/40' : 'bg-gray-50'}`}>
                                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : colors.text}`}>{row.guest_name || '-'}</td>
                                    <td className={`px-4 py-3 text-center`}>
                                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.visits_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-[#B69549]">
                                        ₹{parseFloat(row.total_bill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.total_service_calls}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 ${isDark ? 'text-white' : colors.text}`}>{row.avg_food_rating ? parseFloat(row.avg_food_rating).toFixed(1) + '/5' : '-'}</td>
                                    <td className={`px-4 py-3 ${isDark ? 'text-white' : colors.text}`}>{row.avg_service_rating ? parseFloat(row.avg_service_rating).toFixed(1) + '/5' : '-'}</td>
                                    <td className={`px-4 py-3 ${isDark ? 'text-white' : colors.text}`}>{row.avg_experience_rating ? parseFloat(row.avg_experience_rating).toFixed(1) + '/5' : '-'}</td>
                                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        <div className="text-right">
                                            {formatDateWithTime(row.last_visit)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {tablesArray.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedGuest({ name: row.guest_name, tables: tablesArray })}
                                                aria-label={`View tables visited by ${row.guest_name || 'guest'}`}
                                                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${isDark
                                                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <IoEye size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <GuestsTablesVisitedModal
                isOpen={!!selectedGuest}
                onClose={() => setSelectedGuest(null)}
                guestName={selectedGuest?.name}
                tables={selectedGuest?.tables}
            />
        </div>
    );
};

export default GuestsHistoryTable;
