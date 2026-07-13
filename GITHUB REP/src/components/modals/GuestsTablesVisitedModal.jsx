import { useTheme } from '../../context/ThemeContext';
import { IoClose } from 'react-icons/io5';

const GuestsTablesVisitedModal = ({ isOpen, onClose, guestName, tables = [] }) => {
    const { isDark, colors } = useTheme();

    if (!isOpen) return null;

    const tablesArray = Array.isArray(tables) ? tables : (typeof tables === 'string' ? tables.split(',').map(s => s.trim()) : []);

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${colors.card} rounded-xl ${colors.shadow} w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`${colors.secondary} border-b ${colors.border} px-6 py-4 flex items-center justify-between rounded-t-xl`}>
                    <h3 className={`text-lg font-bold ${colors.textPrimary}`}>Tables Visited</h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${colors.hover} transition-colors`}
                        aria-label="Close modal"
                    >
                        <IoClose size={20} className={colors.textPrimary} />
                    </button>
                </div>

                {/* Guest Info */}
                <div className={`${isDark ? 'bg-slate-700/30' : 'bg-gray-100'} px-6 py-3 border-b ${colors.border}`}>
                    <p className={`text-sm ${colors.textSecondary}`}>Guest</p>
                    <p className={`text-lg font-semibold ${colors.textPrimary}`}>{guestName || 'Guest'}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {tablesArray.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {tablesArray.map((table, idx) => (
                                <span
                                    key={idx}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {table}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className={`text-center ${colors.textMuted} py-8`}>No tables visited</p>
                    )}
                </div>

                {/* Footer */}
                <div className={`border-t ${colors.border} px-6 py-4 flex gap-3`}>
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestsTablesVisitedModal;
