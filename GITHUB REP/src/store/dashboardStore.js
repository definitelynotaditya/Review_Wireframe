import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useDashboardStore = create((set, get) => ({
    // State
    dashboardData: {
        ratings: null,
        feedbackCount: null,
        chefSpecialsOrders: null,
        chefSpecialsAttempted: null,
        responseTime: null,
        serviceCalls: null,
        customerRevisits: null,
        chefSpecialsByCategory: null,
        chefSpecialsRevenue: null,
        topPerformers: null,
        managerAttention: null,
        chefSpecialsByTimeSlot: null,
        tapForService: null,
        turnaroundTime: null,
        ratingsDistribution: null,
        serverEfficiency: null,
        wifiScans: null,
        powerbankRequests: null,
        contentViews: null,
        paymentModes: null,
        revenue: null,
    },
    filters: {
        period: 'today',
        dateFrom: null,
        dateTo: null,
        tableId: null,
        tableIds: null,
        serverCode: null,
        serverId: null,
    },
    isLoading: false,
    error: null,

    // Actions
    setFilter: (filterKey, value) => set((state) => ({
        filters: { ...state.filters, [filterKey]: value }
    })),

    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),

    resetFilters: () => set({
        filters: {
            period: 'today',
            dateFrom: null,
            dateTo: null,
            tableId: null,
            tableIds: null,
            serverCode: null,
            serverId: null,
        }
    }),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    setDashboardData: (key, data) => set((state) => ({
        dashboardData: { ...state.dashboardData, [key]: data }
    })),

    reset: () => set({
        dashboardData: {
            ratings: null,
            feedbackCount: null,
            chefSpecialsOrders: null,
            chefSpecialsAttempted: null,
            responseTime: null,
            serviceCalls: null,
            customerRevisits: null,
            chefSpecialsByCategory: null,
            chefSpecialsRevenue: null,
            topPerformers: null,
            managerAttention: null,
            chefSpecialsByTimeSlot: null,
            tapForService: null,
            turnaroundTime: null,
            ratingsDistribution: null,
            serverEfficiency: null,
            wifiScans: null,
            powerbankRequests: null,
            contentViews: null,
            paymentModes: null,
            revenue: null,
        },
        filters: {
            period: 'today',
            dateFrom: null,
            dateTo: null,
            tableId: null,
            tableIds: null,
            serverCode: null,
            serverId: null,
        },
        isLoading: false,
        error: null,
    }),
}));

// Helper function to build query params
const buildQueryParams = (filters) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    
    return params.toString();
};

// API functions for Dashboard
export const dashboardApi = {
    // 1. Average Ratings
    getRatings: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/ratings/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 2. Chef Specials Orders
    getChefSpecialsOrders: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/chef-specials/orders/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 3. Chef Specials Attempted
    getChefSpecialsAttempted: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/chef-specials/attempted/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 4. Response Time
    getResponseTime: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/response-time/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 5. Service Calls
    getServiceCalls: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/service-calls/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 6. Customer Revisits
    getCustomerRevisits: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/customer-revisits/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 7. Chef Specials by Category
    getChefSpecialsByCategory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/chef-specials/by-category/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 8. Chef Specials Revenue by Category
    getChefSpecialsRevenue: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/chef-specials/revenue-by-category/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 9. Top Performing Servers
    getTopPerformers: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/servers/top-performers/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 10. Manager Attention
    getManagerAttention: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/manager-attention/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 11. Chef Specials by Time Slot
    getChefSpecialsByTimeSlot: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/chef-specials/by-timeslot/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 12. Tap for Service
    getTapForService: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/tap-for-service/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 13. Turnaround Time
    getTurnaroundTime: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/turnaround-time/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 14. Ratings Distribution
    getRatingsDistribution: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/ratings/distribution/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 15. Server Efficiency
    getServerEfficiency: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/servers/efficiency/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 16. WiFi Scans
    getWifiScans: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/wifi-scans/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 17. Powerbank Requests
    getPowerbankRequests: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/powerbank-requests/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 18. Content Views
    getContentViews: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/content-views/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 19. Payment Modes
    getPaymentModes: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/payment-modes/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 20. Feedback Count (Thumbs up/down)
    getFeedbackCount: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/feedback-count/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // 21. Revenue Breakdown
    getRevenue: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(`/admin/dashboard/revenue/${restaurantId}${queryParams ? `?${queryParams}` : ''}`);
        return response.data;
    },

    // Load all essential dashboard data
    loadDashboardData: async (restaurantId, filters = {}) => {
        try {
            const [
                ratings,
                serviceCalls,
                responseTime,
                turnaroundTime,
                topPerformers,
                chefSpecialsByCategory,
                ratingsDistribution,
            ] = await Promise.all([
                dashboardApi.getRatings(restaurantId, filters),
                dashboardApi.getServiceCalls(restaurantId, filters),
                dashboardApi.getResponseTime(restaurantId, filters),
                dashboardApi.getTurnaroundTime(restaurantId, filters),
                dashboardApi.getTopPerformers(restaurantId, filters),
                dashboardApi.getChefSpecialsByCategory(restaurantId, filters),
                dashboardApi.getRatingsDistribution(restaurantId, filters),
            ]);

            return {
                ratings,
                serviceCalls,
                responseTime,
                turnaroundTime,
                topPerformers,
                chefSpecialsByCategory,
                ratingsDistribution,
            };
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            throw error;
        }
    }
};
