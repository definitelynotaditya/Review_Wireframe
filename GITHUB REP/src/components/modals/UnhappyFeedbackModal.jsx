import { useTheme } from '../../context/ThemeContext';
import { MdClose } from 'react-icons/md';

const UnhappyFeedbackModal = ({ isOpen, onClose, feedbackData }) => {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const issues = [
        { label: 'Food', count: feedbackData?.food_issue_count || 0 },
        { label: 'Service', count: feedbackData?.service_issue_count || 0 },
        { label: 'Experience', count: feedbackData?.experience_issue_count || 0 },
        { label: 'Other', count: feedbackData?.other_issue_count || 0 },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
                className={`w-full max-w-md rounded-lg overflow-hidden flex flex-col ${
                    isDark
                        ? 'bg-gray-900 border border-gray-700'
                        : 'bg-white border border-gray-300 shadow-lg'
                }`}
            >
                {/* Header */}
                <div className={`p-5 border-b ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                } flex justify-between items-center`}>
                    <h2 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Unhappy Feedback Issues
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-1 transition-colors ${
                            isDark
                                ? 'hover:bg-gray-700 text-gray-400'
                                : 'hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={`p-5 flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    {/* Total count */}
                    <div className="mb-5">
                        <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Unhappy Feedbacks
                        </p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            {feedbackData?.thumbs_down_count || 0}
                        </p>
                    </div>

                    {/* Issues breakdown */}
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Issues Reported
                    </p>

                    <div className="space-y-2">
                        {issues.map((issue, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded ${
                                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                                }`}
                            >
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {issue.label}
                                </span>
                                <span className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                    {issue.count}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Additional info */}
                    {/* {feedbackData?.avg_issues_per_negative_feedback && (
                        <div className={`mt-4 p-3 rounded text-sm ${
                            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Avg issues per feedback: <span className="font-semibold">{feedbackData.avg_issues_per_negative_feedback}</span>
                            </p>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default UnhappyFeedbackModal;
