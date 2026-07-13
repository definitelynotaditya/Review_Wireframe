import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiX, FiCalendar } from 'react-icons/fi';

const CustomDateRangeModal = ({ isOpen, onClose, onApply, initialDateFrom, initialDateTo }) => {
    const { colors, isDark } = useTheme();
    const [dateFrom, setDateFrom] = useState(initialDateFrom || '');
    const [dateTo, setDateTo] = useState(initialDateTo || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDateFrom(initialDateFrom || '');
            setDateTo(initialDateTo || '');
            setError('');
        }
    }, [isOpen, initialDateFrom, initialDateTo]);

    const handleApply = () => {
        // Validate dates
        if (!dateFrom || !dateTo) {
            setError('Please select both start and end dates');
            return;
        }

        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);

        if (fromDate > toDate) {
            setError('Start date must be before or equal to end date');
            return;
        }

        // Check if dates are in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (fromDate > today || toDate > today) {
            setError('Dates cannot be in the future');
            return;
        }

        onApply(dateFrom, dateTo);
        onClose();
    };

    const handleCancel = () => {
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD format for max attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${colors.card} rounded-2xl p-6 w-full max-w-md shadow-xl`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <FiCalendar className={colors.textPrimary} size={24} />
                        <h2 className={`text-xl font-bold ${colors.textPrimary}`}>
                            Custom Date Range
                        </h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        className={`${colors.textMuted} ${colors.hover} p-2 rounded-xl transition-colors duration-200 hover:cursor-pointer`}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Date Inputs */}
                <div className="space-y-4 mb-6">
                    {/* Start Date */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setError('');
                            }}
                            max={today}
                            className={`w-full px-4 py-3 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B69549] transition-all duration-200`}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setError('');
                            }}
                            max={today}
                            min={dateFrom || undefined}
                            className={`w-full px-4 py-3 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B69549] transition-all duration-200`}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Info Text */}
                    <div className={`p-3 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'} rounded-lg`}>
                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Select a date range to view dashboard metrics for that period.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className={`px-6 py-2.5 ${colors.buttonSecondary} rounded-xl font-medium transition-colors duration-200`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2.5 bg-[#B69549] text-white rounded-xl font-medium transition-colors duration-200 hover:bg-[#A08842]"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomDateRangeModal;
