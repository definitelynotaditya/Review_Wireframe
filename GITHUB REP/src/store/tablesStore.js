import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useTablesStore = create((set) => ({
    // Only UI state - no data caching
    selectedTable: null,
    
    // UI actions
    setSelectedTable: (table) => set({ selectedTable: table }),
    clearSelection: () => set({ selectedTable: null }),
}));

// API functions for React Query
export const tablesApi = {
    // Reserve a table
    reserveTable: async (tableId, restaurantId) => {
        const response = await apiClient.post(`/admin/table/reserve/${tableId}`, {
            restaurant_id: restaurantId
        });
        return response.data;
    },

    // Unreserve a table
    unreserveTable: async (tableId, restaurantId) => {
        const response = await apiClient.post(`/admin/table/unreserve/${tableId}`, {
            restaurant_id: restaurantId
        });
        return response.data;
    },

    // Reserve all vacant tables in a restaurant
    reserveAll: async (restaurantId) => {
        const response = await apiClient.post(`/admin/table/reserve-all/${restaurantId}`);
        return response.data;
    },

    // Unreserve all reserved tables in a restaurant
    unreserveAll: async (restaurantId) => {
        const response = await apiClient.post(`/admin/table/unreserve-all/${restaurantId}`);
        return response.data;
    },
};
