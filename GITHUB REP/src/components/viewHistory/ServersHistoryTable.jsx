import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../common/Loader.jsx';
import ServerSessionsBreakdownModal from '../modals/ServerSessionsBreakdownModal.jsx';

const ServersHistoryTable = ({ data = [], isLoading, isDark: propIsDark, colors: propColors }) => {
    const { isDark: contextIsDark, colors: contextColors } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
    const colors = propColors || contextColors;
    const [selectedServer, setSelectedServer] = useState(null);
    const [hoveredServer, setHoveredServer] = useState(null);

    // Convert seconds to readable format
    const formatSeconds = (seconds) => {
        const secs = parseInt(seconds || 0);
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m ${remainingSecs}s`;
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-8 text-center ${colors.textMuted}`}>
                No server history data available
            </div>
        );
    }

    return (
        <>
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`${colors.secondary} border-b ${colors.border}`}>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVER NAME</th>
                                <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVER CODE</th>
                                <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>TABLES SERVED</th>
                                <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>GUESTS SERVED</th>
                                <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVICE CALLS</th>
                                <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>AVG TURNAROUND</th>
                                <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : colors.text}`}>TOTAL REVENUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => {
                                const isSelected = selectedServer?.server_code === row.server_code;
                                return (
                                <tr 
                                    key={`${row.server_code}-${idx}`}
                                    onClick={() => setSelectedServer(row)}
                                    onMouseEnter={() => setHoveredServer(row.server_code)}
                                    onMouseLeave={() => setHoveredServer(null)}
                                    style={{
                                        borderLeftWidth: (isSelected || hoveredServer === row.server_code) ? '2px' : '1px',
                                        borderLeftColor: (isSelected || hoveredServer === row.server_code) ? '#B69549' : (isDark ? '#475569' : '#E5E7EB'),
                                        borderLeftStyle: 'solid',
                                        transition: 'all 0.2s'
                                    }}
                                    className={`cursor-pointer ${
                                        isSelected || hoveredServer === row.server_code
                                            ? `${isDark ? 'bg-slate-700/40' : 'bg-yellow-50'}` 
                                            : `${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-yellow-50'}`
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <span className={`font-medium transition-colors ${
                                            isSelected || hoveredServer === row.server_code
                                                ? 'text-[#B69549]' 
                                                : `${isDark ? 'text-white' : colors.text}`
                                        }`}>
                                            {row.server_name || '-'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{row.server_code}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.tables_served}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.guests_served}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.service_calls_attended}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {formatSeconds(row.avg_turnaround_seconds)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-[#B69549]">
                                        ₹{parseFloat(row.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ServerSessionsBreakdownModal
                isOpen={!!selectedServer}
                onClose={() => setSelectedServer(null)}
                serverData={selectedServer}
            />
        </>
    );
};

export default ServersHistoryTable;
