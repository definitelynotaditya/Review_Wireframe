import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../common/Loader.jsx';

const FeedbacksHistoryTable = ({ feedbackData = null, isLoading, isDark: propIsDark, colors: propColors }) => {
    const { isDark: contextIsDark, colors: contextColors } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
    const colors = propColors || contextColors;
    const [feedbackType, setFeedbackType] = useState('happy');

    const formatTime = (utcTime) => {
        if (!utcTime) return '--';
        const isoString = typeof utcTime === 'string' && !utcTime.endsWith('Z') ? `${utcTime}Z` : utcTime;
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '--';

        return date.toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDateWithTime = (dateString) => {
        if (!dateString) return '--';

        const isoString = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '--';

        const dateStr = date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        return `${dateStr} · ${formatTime(dateString)}`;
    };

    const activeResponse = feedbackType === 'happy' ? feedbackData?.happy : feedbackData?.unhappy;
    const rows = Array.isArray(activeResponse?.data) ? activeResponse.data : [];

    const totalFeedbacks = useMemo(() => {
        if (!activeResponse) return 0;

        if (feedbackType === 'happy') {
            return Number(activeResponse.total_happy_feedbacks || rows.length || 0);
        }

        return Number(activeResponse.total_feedbacks || rows.length || 0);
    }, [activeResponse, feedbackType, rows.length]);

    const getIssues = (row) => {
        const issues = [];
        if (row.food_issue) issues.push('Food');
        if (row.service_issue) issues.push('Service');
        if (row.experience_issue) issues.push('Experience');
        if (row.other_issue) issues.push('Other');
        return issues.length > 0 ? issues.join(', ') : '--';
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className={`${colors.card} rounded-xl overflow-hidden ${colors.shadow}`}>
            <div className={`p-4 border-b ${colors.border}`}>
                <div className={`inline-flex rounded-xl border ${colors.border} overflow-hidden`}>
                    <button
                        type="button"
                        onClick={() => setFeedbackType('happy')}
                        className={`px-5 py-2 text-sm font-medium transition-all ${
                            feedbackType === 'happy'
                                ? 'bg-[#B69549] text-white'
                                : isDark
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Thumbs Up
                    </button>
                    <button
                        type="button"
                        onClick={() => setFeedbackType('unhappy')}
                        className={`px-5 py-2 text-sm font-medium transition-all ${
                            feedbackType === 'unhappy'
                                ? 'bg-[#B69549] text-white'
                                : isDark
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Thumbs Down
                    </button>
                </div>
                <p className={`mt-3 text-sm ${colors.textSecondary}`}>
                    Total feedbacks: <span className={`font-semibold ${isDark ? 'text-white' : colors.text}`}>{totalFeedbacks}</span>
                </p>
            </div>

            {rows.length === 0 ? (
                <div className={`p-8 text-center ${colors.textMuted}`}>
                    No {feedbackType === 'happy' ? 'happy' : 'unhappy'} feedbacks available
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <colgroup>
                            <col className="w-[12%]" />
                            <col className="w-[10%]" />
                            <col className="w-[12%]" />
                            {/* <col className="w-[8%]" /> */}
                            {/* <col className="w-[8%]" /> */}
                            {/* <col className="w-[10%]" /> */}
                            {feedbackType === 'unhappy' && <col className="w-[13%]" />}
                            <col className="w-[10%]" />
                            <col className="w-[17%]" />
                        </colgroup>
                        <thead>
                            <tr className={`${colors.secondary} border-b ${colors.border}`}>
                                <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>GUEST</th>
                                <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>TABLE</th>
                                <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVER</th>
                                {/* <th className={`px-4 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>FOOD</th>
                                <th className={`px-4 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>SERVICE</th>
                                <th className={`px-4 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>EXPERIENCE</th> */}
                                {feedbackType === 'unhappy' && (
                                    <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>ISSUES</th>
                                )}
                                <th className={`px-4 py-4 text-center font-semibold ${isDark ? 'text-white' : colors.text}`}>CALLS</th>
                                <th className={`px-4 py-4 text-left font-semibold ${isDark ? 'text-white' : colors.text}`}>SUBMITTED AT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={`${row.session_id || 'row'}-${idx}`} className={`border-b ${colors.border}`}>
                                    <td className={`px-4 py-4 ${isDark ? 'text-white' : colors.text}`}>{row.guest_name || '--'}</td>
                                    <td className={`px-4 py-4 ${isDark ? 'text-white' : colors.text}`}>{row.table_number || '--'}</td>
                                    <td className={`px-4 py-4 ${isDark ? 'text-white' : colors.text}`}>{row.server_name || '--'}</td>
                                    {/* <td className={`px-4 py-4 text-center ${isDark ? 'text-white' : colors.text}`}>{row.food_rating ?? '--'}</td>
                                    <td className={`px-4 py-4 text-center ${isDark ? 'text-white' : colors.text}`}>{row.service_rating ?? '--'}</td>
                                    <td className={`px-4 py-4 text-center ${isDark ? 'text-white' : colors.text}`}>{row.experience_rating ?? '--'}</td> */}
                                    {feedbackType === 'unhappy' && (
                                        <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>{getIssues(row)}</td>
                                    )}
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                                            {row.total_service_calls || 0}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-300' : colors.textSecondary}`}>
                                        {formatDateWithTime(row.feedback_submitted_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FeedbacksHistoryTable;
