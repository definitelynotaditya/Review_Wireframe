import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MdClose } from 'react-icons/md';

const ChefSpecialsDetailModal = ({ isOpen, onClose, chefSpecials }) => {
    const { isDark, colors } = useTheme();
    const { restaurant } = useAuthStore();

    if (!isOpen) return null;

    const data = chefSpecials || [];
    const totalRevenue = data.reduce((sum, category) => sum + Number(category.total_revenue || 0), 0);
    const totalOrders = data.reduce((sum, category) => sum + Number(category.total_orders || 0), 0);
    const totalDishes = data.reduce((sum, category) => sum + (category.dishes_requested?.length || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
                className={`w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col ${
                    isDark
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                        : 'bg-white border border-gray-200 shadow-xl'
                }`}
            >
                {/* Header */}
                <div
                    className={`p-6 border-b ${
                        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                    } flex justify-between items-start`}
                >
                    <div>
                        <h2 className={`text-lg font-bold uppercase mb-2 ${
                            isDark ? 'text-gray-100' : 'text-gray-600'
                        }`}>
                            Chef's Specials - All Stats
                        </h2>
                        <div className="flex gap-6">
                            <div>
                                <p className={`text-xs uppercase tracking-wide ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Estimated Total Revenue
                                </p>
                                <p className={`text-lg font-bold ${
                                    isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'
                                }`}>
                                    {restaurant?.currency_notation || '$'}{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div>
                                <p className={`text-xs uppercase tracking-wide ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Total Orders
                                </p>
                                <p className={`text-lg font-bold ${
                                    isDark ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                    {totalOrders}
                                </p>
                            </div>
                            <div>
                                <p className={`text-xs uppercase tracking-wide ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Total Dishes
                                </p>
                                <p className={`text-lg font-bold ${
                                    isDark ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                    {totalDishes}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                : 'hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto scrollbar-none p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    {data.length > 0 ? (
                        <div className="space-y-6">
                            {data.map((category, categoryIndex) => (
                                <div key={categoryIndex} className={`rounded-lg p-4 ${
                                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                                }`}>
                                    {/* Category Header */}
                                    <div className={`flex justify-between items-start mb-4 pb-4 border-b border-opacity-30 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div>
                                            <h3 className={`text-lg font-bold mb-2 ${
                                                isDark ? 'text-gray-100' : 'text-gray-900'
                                            }`}>
                                                {category.menu_category_name}
                                            </h3>
                                            <div className="flex gap-6">
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wide ${
                                                        isDark ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        Estimated Revenue
                                                    </p>
                                                    <p className={`text-sm font-semibold ${
                                                        isDark ? 'text-gray-200' : 'text-gray-800'
                                                    }`}>
                                                        {restaurant?.currency_notation || '$'}{Number(category.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wide ${
                                                        isDark ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        Total Orders
                                                    </p>
                                                    <p className={`text-sm font-semibold ${
                                                        isDark ? 'text-gray-200' : 'text-gray-800'
                                                    }`}>
                                                        {category.total_orders}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wide ${
                                                        isDark ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        Avg Price/Order
                                                    </p>
                                                    <p className={`text-sm font-semibold ${
                                                        isDark ? 'text-gray-200' : 'text-gray-800'
                                                    }`}>
                                                        {restaurant?.currency_notation || '$'}{Number(category.avg_price_per_order).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dishes Grid */}
                                    {category.dishes_requested && category.dishes_requested.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {category.dishes_requested.map((dish, dishIndex) => (
                                                <div
                                                    key={dishIndex}
                                                    className={`rounded-lg overflow-hidden transition-transform ${
                                                        isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200 shadow-sm'
                                                    }`}
                                                >
                                                    {/* Dish Image */}
                                                    <div className="relative h-40 bg-gray-300 overflow-hidden">
                                                        {dish.dish_image_url ? (
                                                            <img
                                                                src={dish.dish_image_url}
                                                                alt={dish.dish_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center ${
                                                                isDark ? 'bg-gray-700' : 'bg-gray-200'
                                                            }`}>
                                                                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                                                    No Image
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* Veg/Non-Veg Badge */}
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
                                                            <span className={`text-xs font-semibold uppercase ${
                                                                dish.veg_nonveg?.toLowerCase() === 'veg' ? 'text-green-400' : 'text-red-400'
                                                            }`}>
                                                                {dish.veg_nonveg}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Dish Info */}
                                                    <div className="p-3">
                                                        <h4 className={`text-sm font-bold mb-2 line-clamp-2 ${
                                                            isDark ? 'text-gray-100' : 'text-gray-900'
                                                        }`}>
                                                            {dish.dish_name}
                                                        </h4>

                                                        <div className="space-y-1.5 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                                    Estimated Revenue:
                                                                </span>
                                                                <span className={`font-semibold ${
                                                                    isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'
                                                                }`}>
                                                                    {restaurant?.currency_notation || '$'}{Number(dish.dish_revenue).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                                    Orders:
                                                                </span>
                                                                <span className={`font-semibold ${
                                                                    isDark ? 'text-gray-200' : 'text-gray-800'
                                                                }`}>
                                                                    {dish.dish_order_count}
                                                                </span>
                                                            </div>
                                                            {/* <div className="flex justify-between">
                                                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                                    Avg Price:
                                                                </span>
                                                                <span className={`font-semibold ${
                                                                    isDark ? 'text-gray-200' : 'text-gray-800'
                                                                }`}>
                                                                    {restaurant?.currency_notation || '$'}{Number(dish.avg_price_per_order).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                </span>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            No dishes data available
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                No data available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChefSpecialsDetailModal;
