import { useTheme } from '../../context/ThemeContext';
import { FaBatteryFull, FaHandPointer } from 'react-icons/fa';

export const PowerbankCard = ({ powerbankData }) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`p-6 rounded-xl ${
                isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <FaBatteryFull className={'text-[#B69549]'} size={20} />
                <h2 className={`text-md font-medium uppercase tracking-wide ${
									isDark ? "text-gray-200" : "text-gray-500"
								}`}>
                    Powerbank Requests
                </h2>
            </div>
            
            <div>
                <p className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Requests
                </p>
                <p className={`text-4xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                    {powerbankData?.total || 0}
                </p>
            </div>
        </div>
    );
};

export const TapForServiceCard = ({ tapData }) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`p-6 rounded-xl ${
                isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <FaHandPointer className={'text-[#B69549]'} size={20} />
                <h2 className={`text-md font-medium uppercase tracking-wide ${
									isDark ? "text-gray-200" : "text-gray-500"
								}`}>
                    Tap for Service
                </h2>
            </div>
            
            <div>
                <p className={`text-xs uppercase tracking-wide mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Taps
                </p>
                <p className={`text-4xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                    {tapData?.total || 0}
                </p>
            </div>
        </div>
    );
};