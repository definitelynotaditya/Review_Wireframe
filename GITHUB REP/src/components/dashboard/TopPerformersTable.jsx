import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { FaTrophy, FaClock, FaPhone } from 'react-icons/fa';

const TopPerformersTable = ({ performers }) => {
    const { isDark } = useTheme();
    const { restaurant } = useAuthStore();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Sort by revenue (highest to lowest)
    const topPerformers = [...(performers || [])].sort((a, b) => 
        Number(b.total_revenue || 0) - Number(a.total_revenue || 0)
    ).slice(0, 5); // Get top 5 performers

    return (
        <div
            className={`p-6 rounded-xl ${
                isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <FaTrophy className={'text-[#B69549]'} size={20} />
                <h2 className={`text-md font-medium uppercase tracking-wide ${
									isDark ? "text-gray-200" : "text-gray-500"
								}`}>
                    Top Performers
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Rank
                            </th>
                            <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Server
                            </th>
                            <th className={`text-center py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Tables
                            </th>
                            <th className={`text-center py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Avg TAT
                            </th>
                            <th className={`text-center py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Calls
                            </th>
                            <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {topPerformers.length > 0 ? (
                            topPerformers.map((performer, index) => (
                                <tr
                                    key={index}
                                    className={`border-b transition-colors ${
                                        isDark
                                            ? 'border-gray-800 hover:bg-gray-800/50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="py-4 px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                            index === 0
                                                ? 'bg-[#B69549] text-white'
                                                : index === 1
                                                ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                : index === 2
                                                ? isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-3">
                                            {/* <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm">
                                                {performer.server_name?.charAt(0) || 'S'}
                                            </div> */}
                                            <div>
                                                <p className={`font-semibold text-sm ${
                                                    isDark ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    {performer.server_name || 'Server'}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {performer.server_code || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span className={`font-semibold ${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {performer.total_sessions || 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* <FaClock className={isDark ? 'text-gray-500' : 'text-gray-400'} size={12} /> */}
                                            <span className={`font-mono text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                {formatTime(performer.avg_turnaround_time || 0)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1">      
                                            <span className={`font-semibold ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                {performer.no_of_service_calls || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <span className={`font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                                            {restaurant?.currency_notation || '$'}{Number(performer.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-8 text-center">
                                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                        No data available
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopPerformersTable;