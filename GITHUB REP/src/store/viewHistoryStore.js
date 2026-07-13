import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useViewHistoryStore = create((set, get) => ({
    // State
    viewHistoryData: {
        tables: null,
        servers: null,
        guests: null,
        chefSpecials: null,
        ratings: null,
        feedbacks: null,
    },
    activeTab: 'tables', // Track the active tab
    filters: {
        period: 'today',
        dateFrom: null,
        dateTo: null,
        tableId: null,
        tableIds: null,
        serverCode: null,
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

    setActiveTab: (tab) => set({ activeTab: tab }),

    resetFilters: () => set({
        filters: {
            period: 'today',
            dateFrom: null,
            dateTo: null,
            tableId: null,
            tableIds: null,
            serverCode: null,
        }
    }),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    setViewHistoryData: (key, data) => set((state) => ({
        viewHistoryData: { ...state.viewHistoryData, [key]: data }
    })),

    reset: () => set({
        viewHistoryData: {
            tables: null,
            servers: null,
            guests: null,
            chefSpecials: null,
            ratings: null,
            feedbacks: null,
        },
        activeTab: 'tables',
        filters: {
            period: 'today',
            dateFrom: null,
            dateTo: null,
            tableId: null,
            tableIds: null,
            serverCode: null,
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

// API functions for View History
export const viewHistoryApi = {
    // 1. Tables History
    getTablesHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/tables/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 2. Servers History
    getServersHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/servers/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 3. Guests History
    getGuestsHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/guests/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 4. Chef Specials History
    getChefSpecialsHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/chef-specials/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 5. Ratings History
    getRatingsHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/ratings/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 6. Happy Feedbacks History
    getHappyFeedbacksHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/happy-feedbacks/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },

    // 7. Unhappy Feedbacks History
    getUnhappyFeedbacksHistory: async (restaurantId, filters = {}) => {
        const queryParams = buildQueryParams(filters);
        const response = await apiClient.get(
            `/admin/dashboard/view-history/unhappy-feedbacks/${restaurantId}${queryParams ? `?${queryParams}` : ''}`
        );
        return response.data;
    },
};
