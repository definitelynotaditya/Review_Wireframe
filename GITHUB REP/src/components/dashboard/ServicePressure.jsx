import { useTheme } from '../../context/ThemeContext';
import { FaBell, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ServicePressure = ({ serviceData }) => {
    const { isDark } = useTheme();

    const total = serviceData?.total || 0;
    const attended = serviceData?.attended || 0;
    const missed = serviceData?.missed || 0;
    const attendedPercent = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

    return (
        <div
            className={`p-6 rounded-xl ${
                isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <FaBell className={isDark ? 'text-yellow-500' : 'text-yellow-600'} size={20} />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Service Pressure
                </h2>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Service Calls
                    </span>
                    <span className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                        {total}
                    </span>
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                        style={{ width: `${attendedPercent}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${
                        isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <FaCheckCircle className="text-green-500" size={14} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Attended
                            </span>
                        </div>
                        <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            {attended}
                        </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                        isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <FaExclamationCircle className="text-red-500" size={14} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Missed
                            </span>
                        </div>
                        <p className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            {missed}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicePressure;