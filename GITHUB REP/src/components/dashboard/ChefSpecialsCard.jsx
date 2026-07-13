import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { LuChefHat } from 'react-icons/lu';
import { useState } from 'react';

const ChefSpecialsCard = ({ chefSpecials }) => {
    const { isDark } = useTheme();
    const { restaurant } = useAuthStore();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Drinks', 'Starters', 'Mains', 'Desserts'];
    const topSpecials = chefSpecials?.slice(0, 3) || [];

    return (
        <div
            className={`p-6 rounded-xl ${
                isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <LuChefHat className={isDark ? 'text-yellow-500' : 'text-yellow-600'} size={20} />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Chef Specials Requested
                </h2>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            activeTab === tab
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                                : isDark
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Specials List */}
            <div className="space-y-3">
                {topSpecials.length > 0 ? (
                    topSpecials.map((special, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-102 ${
                                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🍽️</div>
                                <div>
                                    <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {special.menu_category_name || 'Category'}
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {restaurant?.currency_notation || '$'}{special.avg_dish_price || '0'} avg
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className={`text-lg font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
                                    {special.order_count || 0}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    orders
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        No data available
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChefSpecialsCard;