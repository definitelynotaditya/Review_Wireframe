import { useTheme } from '../../context/ThemeContext';
import Loader from '../common/Loader.jsx';

const RatingsHistoryTable = ({ data = [], ratingsSummary = null, isLoading, isDark: propIsDark, colors: propColors }) => {
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

    const toOneDecimal = (value) => {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) return '0.0';
        return numeric.toFixed(1);
    };

    const fallbackTotalRatings = data.length;
    const fallbackFoodAverage =
        data.length > 0
            ? data.reduce((sum, row) => sum + (Number(row.food_rating) || 0), 0) / data.length
            : 0;
    const fallbackServiceAverage =
        data.length > 0
            ? data.reduce((sum, row) => sum + (Number(row.service_rating) || 0), 0) / data.length
            : 0;
    const fallbackExperienceAverage =
        data.length > 0
            ? data.reduce((sum, row) => sum + (Number(row.experience_rating) || 0), 0) / data.length
            : 0;

    const totalRatings = Number(ratingsSummary?.total_ratings) || fallbackTotalRatings;
    const averageFoodRating =
        ratingsSummary?.average_food_rating !== undefined
            ? Number(ratingsSummary.average_food_rating)
            : fallbackFoodAverage;
    const averageServiceRating =
        ratingsSummary?.average_service_rating !== undefined
            ? Number(ratingsSummary.average_service_rating)
            : fallbackServiceAverage;
    const averageExperienceRating =
        ratingsSummary?.average_experience_rating !== undefined
            ? Number(ratingsSummary.average_experience_rating)
            : fallbackExperienceAverage;

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow} p-8 text-center ${colors.textMuted}`}>
                No ratings history data available
            </div>
        );
    }

    return (
        <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow}`}>
            <div className={`px-6 py-4 border-b ${colors.border}`}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Total Ratings</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{totalRatings}</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Avg Food Rating</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{toOneDecimal(averageFoodRating)}/5</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Avg Service Rating</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{toOneDecimal(averageServiceRating)}/5</p>
                    </div>
                    <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                        <p className={`${colors.textSecondary} text-sm font-medium`}>Avg Experience Rating</p>
                        <p className="text-2xl font-bold text-[#B69549] mt-2">{toOneDecimal(averageExperienceRating)}/5</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`${colors.secondary} border-b ${colors.border}`}>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>GUEST NAME</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>FOOD RATING</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVICE RATING</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>EXPERIENCE RATING</th>
                            <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>DATE/TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={`${row.session_id}-${idx}`} className={`border-b ${colors.border}`}>
                                <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : colors.text}`}>{row.guest_name || '-'}</td>
                                <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{parseInt(row.food_rating || 0)}/5</td>
                                <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{parseInt(row.service_rating || 0)}/5</td>
                                <td className={`px-6 py-4 ${isDark ? 'text-white' : colors.text}`}>{parseInt(row.experience_rating || 0)}/5</td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                    {formatDateWithTime(row.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RatingsHistoryTable;
