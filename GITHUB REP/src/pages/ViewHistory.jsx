import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout.jsx';
import { useViewHistoryStore, viewHistoryApi } from '../store/viewHistoryStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import Loader from '../components/common/Loader.jsx';
import TablesHistoryTable from '../components/viewHistory/TablesHistoryTable.jsx';
import ServersHistoryTable from '../components/viewHistory/ServersHistoryTable.jsx';
import GuestsHistoryTable from '../components/viewHistory/GuestsHistoryTable.jsx';
import ChefSpecialsHistoryTable from '../components/viewHistory/ChefSpecialsHistoryTable.jsx';
import RatingsHistoryTable from '../components/viewHistory/RatingsHistoryTable.jsx';
import FeedbacksHistoryTable from '../components/viewHistory/FeedbacksHistoryTable.jsx';
import CustomDateRangeModal from '../components/modals/CustomDateRangeModal.jsx';

const ViewHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { colors, isDark } = useTheme();
    const {
        filters,
        setFilter,
        viewHistoryData,
        setViewHistoryData,
        isLoading,
        setLoading,
        setError,
        activeTab,
        setActiveTab,
    } = useViewHistoryStore();
    const [activeFilter, setActiveFilter] = useState('today');
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);

    // Get restaurant ID from user
    const restaurantId = user?.restaurant_id || 3;

    // Tab configuration
    const tabs = [
        { id: 'tables', label: 'Tables', color: 'text-blue-500' },
        { id: 'servers', label: 'Servers', color: 'text-green-500' },
        { id: 'guests', label: 'Guests', color: 'text-purple-500' },
        { id: 'chefSpecials', label: 'Chef Specials', color: 'text-yellow-500' },
        { id: 'ratings', label: 'Ratings', color: 'text-orange-500' },
        { id: 'feedbacks', label: 'Feedbacks', color: 'text-emerald-500' },
    ];

    const fetchViewHistoryData = async () => {
        try {
            setLoading(true);
            setError(null);

            const filterParams = {
                ...(filters.period && { period: filters.period }),
                ...(filters.dateFrom && { date_from: filters.dateFrom }),
                ...(filters.dateTo && { date_to: filters.dateTo }),
                ...(filters.tableId && { table_id: filters.tableId }),
                ...(filters.tableIds && { table_ids: filters.tableIds }),
                ...(filters.serverCode && { server_code: filters.serverCode }),
            };

            // Fetch only the active tab data
            let data;
            switch (activeTab) {
                case 'tables':
                    data = await viewHistoryApi.getTablesHistory(restaurantId, filterParams);
                    setViewHistoryData('tables', data);
                    break;
                case 'servers':
                    data = await viewHistoryApi.getServersHistory(restaurantId, filterParams);
                    setViewHistoryData('servers', data);
                    break;
                case 'guests':
                    data = await viewHistoryApi.getGuestsHistory(restaurantId, filterParams);
                    setViewHistoryData('guests', data);
                    break;
                case 'chefSpecials':
                    data = await viewHistoryApi.getChefSpecialsHistory(restaurantId, filterParams);
                    setViewHistoryData('chefSpecials', data);
                    break;
                case 'ratings':
                    data = await viewHistoryApi.getRatingsHistory(restaurantId, filterParams);
                    setViewHistoryData('ratings', data);
                    break;
                case 'feedbacks': {
                    const [happyFeedbacks, unhappyFeedbacks] = await Promise.all([
                        viewHistoryApi.getHappyFeedbacksHistory(restaurantId, filterParams),
                        viewHistoryApi.getUnhappyFeedbacksHistory(restaurantId, filterParams),
                    ]);
                    setViewHistoryData('feedbacks', {
                        happy: happyFeedbacks,
                        unhappy: unhappyFeedbacks,
                    });
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            console.error('Failed to fetch view history data:', error);
            setError(error.message || 'Failed to fetch view history data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when filters or active tab change
    useEffect(() => {
        fetchViewHistoryData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.period, filters.dateFrom, filters.dateTo, restaurantId, activeTab]);

    // Sync activeFilter with store state - activeFilter is just UI, store is source of truth
    useEffect(() => {
        if (filters.dateFrom && filters.dateTo) {
            setActiveFilter('custom');
        } else if (filters.period) {
            setActiveFilter(filters.period);
        } else {
            setActiveFilter('today');
        }
    }, [filters.period, filters.dateFrom, filters.dateTo]);

    const handleFilterChange = (filterId) => {
        if (filterId === 'custom') {
            // Just open the modal, don't change the store yet
            setShowCustomDateModal(true);
            return;
        }
        
        // For any regular tab (today, yesterday, week, month), update the store
        setFilter('period', filterId);
        setFilter('dateFrom', null);
        setFilter('dateTo', null);
        // activeFilter will auto-sync via the effect
    };

    const handleCustomDateApply = (dateFrom, dateTo) => {
        // Update store with custom dates
        setFilter('period', null);
        setFilter('dateFrom', dateFrom);
        setFilter('dateTo', dateTo);
        // Modal will close itself via onClose callback
        // activeFilter will auto-sync to 'custom' via the effect
    };

    const handleCloseCustomDateModal = () => {
        setShowCustomDateModal(false);
        // If no custom dates were applied, the effect will restore the previous period from store
        // If custom dates exist, the effect will set activeFilter to 'custom'
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <Layout
            title="View History"
            subtitle="Detailed historical data for tables, servers, guests, chef specials, ratings, and feedbacks"
        >
            {isLoading && activeTab && !viewHistoryData[activeTab] ? (
                <Loader />
            ) : (
                <div>
                    {/* Filter Bar with Dashboard Button */}
                    <div className={`mb-6 ${colors.card} rounded-xl border ${colors.border} p-2`}>
                        <div className="flex justify-between items-center gap-4">
                            {/* Date Filters */}
                            <div className="flex-1 min-w-0">
                                <div className="hidden sm:flex gap-4 flex-wrap">
                                    {[
                                        { id: 'today', label: 'Today' },
                                        { id: 'yesterday', label: 'Yesterday' },
                                        { id: 'last_7_days', label: 'Week' },
                                        { id: 'this_month', label: 'Month' },
                                        { id: 'custom', label: 'Custom' },
                                    ].map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => handleFilterChange(filter.id)}
                                            className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                                                activeFilter === filter.id
                                                    ? 'bg-[#B69549] text-white'
                                                    : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                                {/* Mobile swipable filters */}
                                <div className="sm:hidden overflow-x-auto scrollbar-none">
                                    <div className="flex space-x-2 min-w-max py-2">
                                        {[
                                            { id: 'today', label: 'Today' },
                                            { id: 'yesterday', label: 'Yesterday' },
                                            { id: 'last_7_days', label: 'Week' },
                                            { id: 'this_month', label: 'Month' },
                                            { id: 'custom', label: 'Custom' },
                                        ].map((filter) => (
                                            <button
                                                key={filter.id}
                                                onClick={() => handleFilterChange(filter.id)}
                                                className={`px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                                                    activeFilter === filter.id
                                                        ? 'bg-[#B69549] text-white'
                                                        : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                                                }`}
                                            >
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Dashboard Button */}
                            <button
                                onClick={() => navigate('/restaurant/dashboard')}
                                className="px-6 py-2.5 bg-[#B69549] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:cursor-pointer whitespace-nowrap"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation - Data Filter - Swipable on Mobile */}
                    <div className={`mb-6 ${colors.card} rounded-xl border ${colors.border} p-2`}>
                        {/* Desktop version */}
                        <div className="hidden sm:flex gap-2 flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                                        activeTab === tab.id
                                            ? 'bg-[#B69549] text-white'
                                            : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Mobile swipable version */}
                        <div className="sm:hidden overflow-x-auto scrollbar-none">
                            <div className="flex space-x-2 min-w-max py-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                                            activeTab === tab.id
                                                ? 'bg-[#B69549] text-white'
                                                : isDark ? "bg-slate-700 text-slate-300 hover:cursor-pointer hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fadeIn">
                        {activeTab === 'tables' && (
                            <TablesHistoryTable 
                                data={viewHistoryData.tables?.data || []}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                        {activeTab === 'servers' && (
                            <ServersHistoryTable 
                                data={viewHistoryData.servers?.data || []}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                        {activeTab === 'guests' && (
                            <GuestsHistoryTable 
                                data={viewHistoryData.guests?.data || []}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                        {activeTab === 'chefSpecials' && (
                            <ChefSpecialsHistoryTable 
                                data={viewHistoryData.chefSpecials?.data || []}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                        {activeTab === 'ratings' && (
                            <RatingsHistoryTable 
                                data={viewHistoryData.ratings?.data || []}
                                ratingsSummary={viewHistoryData.ratings}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                        {activeTab === 'feedbacks' && (
                            <FeedbacksHistoryTable
                                feedbackData={viewHistoryData.feedbacks}
                                isLoading={isLoading}
                                isDark={isDark}
                                colors={colors}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Custom Date Range Modal */}
            <CustomDateRangeModal
                isOpen={showCustomDateModal}
                onClose={handleCloseCustomDateModal}
                onApply={handleCustomDateApply}
                initialDateFrom={filters.dateFrom}
                initialDateTo={filters.dateTo}
            />
        </Layout>
    );
};

export default ViewHistory;
