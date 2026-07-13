import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout.jsx';
import { useDashboardStore, dashboardApi } from '../store/dashboardStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import FilterTabs from '../components/dashboard/FilterTabs.jsx';
import MetricsRow from '../components/dashboard/MetricsRow.jsx';
import RatingsCard from '../components/dashboard/RatingsCard.jsx';
import ChefSpecialsRevenueCard from '../components/dashboard/ChefSpecialsRevenueCard.jsx';
import TopPerformersTable from '../components/dashboard/TopPerformersTable.jsx';
import { PowerbankCard, TapForServiceCard } from '../components/dashboard/ServiceStatsCards.jsx';
import CustomDateRangeModal from '../components/modals/CustomDateRangeModal.jsx';
import RevenueBreakdownModal from '../components/modals/RevenueBreakdownModal.jsx';
import Loader from '../components/common/Loader.jsx';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { colors, isDark } = useTheme();
    const { filters, setFilter, dashboardData, setDashboardData, isLoading, setLoading, setError } = useDashboardStore();
    const [activeFilter, setActiveFilter] = useState('today');
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);
    const [showRevenueModal, setShowRevenueModal] = useState(false);

    // Get restaurant ID from user
    const restaurantId = user?.restaurant_id || 3;

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const filterParams = {
                ...(filters.period && { period: filters.period }),
                ...(filters.dateFrom && { date_from: filters.dateFrom }),
                ...(filters.dateTo && { date_to: filters.dateTo }),
            };

            // Fetch all data in parallel
            const [
                ratings,
                feedbackCount,
                serviceCalls,
                responseTime,
                turnaroundTime,
                topPerformers,
                chefSpecialsRevenue,
                managerAttention,
                powerbankRequests,
                tapForService,
                revenue,
            ] = await Promise.all([
                dashboardApi.getRatings(restaurantId, filterParams),
                dashboardApi.getFeedbackCount(restaurantId, filterParams),
                dashboardApi.getServiceCalls(restaurantId, filterParams),
                dashboardApi.getResponseTime(restaurantId, filterParams),
                dashboardApi.getTurnaroundTime(restaurantId, filterParams),
                dashboardApi.getTopPerformers(restaurantId, filterParams),
                dashboardApi.getChefSpecialsRevenue(restaurantId, filterParams),
                dashboardApi.getManagerAttention(restaurantId, filterParams),
                dashboardApi.getPowerbankRequests(restaurantId, filterParams),
                dashboardApi.getTapForService(restaurantId, filterParams),
                dashboardApi.getRevenue(restaurantId, filterParams),
            ]);

            // Store the data
            setDashboardData('ratings', ratings);
            setDashboardData('feedbackCount', feedbackCount);
            setDashboardData('serviceCalls', serviceCalls);
            setDashboardData('responseTime', responseTime);
            setDashboardData('turnaroundTime', turnaroundTime);
            setDashboardData('topPerformers', topPerformers);
            setDashboardData('chefSpecialsRevenue', chefSpecialsRevenue);
            setDashboardData('managerAttention', managerAttention);
            setDashboardData('powerbankRequests', powerbankRequests);
            setDashboardData('tapForService', tapForService);
            setDashboardData('revenue', revenue);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setError(error.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.period, filters.dateFrom, filters.dateTo, restaurantId]);

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

    // Process data for components
    const metricsData = {
        revenue: dashboardData.topPerformers?.data?.reduce((sum, p) => sum + (Number(p.total_revenue) || 0), 0) || 0,
        responseTime: dashboardData.responseTime?.data?.avg_response_time_seconds || 0,
        turnaround: dashboardData.turnaroundTime?.data?.avg_turnaround_minutes || 0,
        serviceCalls: dashboardData.serviceCalls?.data?.total_service_calls || 0,
        managerCalls: dashboardData.managerAttention?.data?.total_manager_calls || 0,
    };

    const ratingsCardData = {
        food: dashboardData.ratings?.data?.avg_food_rating || 0,
        service: dashboardData.ratings?.data?.avg_service_rating || 0,
        experience: dashboardData.ratings?.data?.avg_experience_rating || 0,
        sessions_with_all_ratings: dashboardData.ratings?.data?.sessions_with_all_ratings || 0,
        feedbackCount: dashboardData.feedbackCount?.data || null,
    };

    const powerbankData = {
        total: dashboardData.powerbankRequests?.data?.total_powerbank_requests || 0,
        sessions: dashboardData.powerbankRequests?.data?.sessions_with_powerbank || 0,
        avgPerSession: dashboardData.powerbankRequests?.data?.avg_per_session || '0.0',
    };

    const tapData = {
        total: dashboardData.tapForService?.data?.total_tap_for_service || 0,
        sessions: dashboardData.tapForService?.data?.sessions_with_tap_service || 0,
        uniqueTables: dashboardData.tapForService?.data?.unique_tables || 0,
    };

    return (
        <Layout
            title="Dashboard"
            subtitle="Real-time restaurant performance insights"
        >
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    {/* Filter Bar with View History Button */}
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
                            
                            {/* View History Button */}
                            <button
                                onClick={() => navigate('/restaurant/view-history')}
                                className="px-6 py-2.5 bg-[#B69549] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:cursor-pointer whitespace-nowrap"
                            >
                                View History
                            </button>
                        </div>
                    </div>

                    {/* Top Metrics Row - 5 cards */}
                    <MetricsRow 
                        metrics={metricsData} 
                        onRevenueClick={() => setShowRevenueModal(true)}
                    />

                    {/* Ratings & Chef Specials Revenue Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <RatingsCard ratings={ratingsCardData} filters={filters} />
                        <ChefSpecialsRevenueCard chefSpecials={dashboardData.chefSpecialsRevenue?.data || []} />
                    </div>

                    {/* Top Performers Table */}
                    <div className="mb-6">
                        <TopPerformersTable performers={dashboardData.topPerformers?.data || []} />
                    </div>

                    {/* Powerbank & Tap for Service Row */}
                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <PowerbankCard powerbankData={powerbankData} />
                        <TapForServiceCard tapData={tapData} />
                    </div> */}
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

            {/* Revenue Breakdown Modal */}
            <RevenueBreakdownModal
                isOpen={showRevenueModal}
                onClose={() => setShowRevenueModal(false)}
                revenueData={dashboardData.revenue?.data || null}
            />
        </Layout>
    );
};

export default Dashboard;