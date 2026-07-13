import {create} from "zustand";
import { apiClient } from "../utils/apiClient";

export const useManageTablesStore = create((set) => ({
    // Only UI state - no data caching
    selectedTable: null,
    
    // UI actions
    setSelectedTable: (table) => set({ selectedTable: table }),
    clearSelection: () => set({ selectedTable: null }),
}));

// API functions for React Query
export const tableApi = {
    // Add new table to restaurant
    addTable: async (tableData) => {
        const response = await apiClient.post('/admin/table/create/new', tableData);
        return response.data;
    },

    // Fetch tables for a specific restaurant
    fetchRestaurantTables: async (restaurantId) => {
        const response = await apiClient.get(`/admin/table/restaurant/${restaurantId}`);
        // Keep both grouped and flattened data
        const groupedTables = response.data.data || {};
        const allTables = [];
        
        Object.values(groupedTables).forEach(areaArray => {
            if (Array.isArray(areaArray)) {
                allTables.push(...areaArray);
            }
        });
        
        return {
            tables: allTables,
            groupedBySittingArea: groupedTables
        };
    },

    // Update table
    updateTable: async ({ restaurantId, table_id, ...tableData }) => {
        const response = await apiClient.put(`/admin/table/update/${restaurantId}/${table_id}`, tableData);
        return response.data;
    },

    // Delete table
    deleteTable: async (restaurantId, table_id) => {
        const response = await apiClient.delete(`/admin/table/delete/${restaurantId}/${table_id}`);
        return response.data;
    },

    // Merge tables
    mergeTables: async (tables) => {
        const response = await apiClient.post('/admin/table/merge', { tables });
        return response.data;
    },

    // Unmerge table
    unmergeTable: async (restaurant_id, merged_table_id) => {
        const response = await apiClient.post('/admin/table/unmerge', {
            restaurant_id: restaurant_id.toString(),
            merged_table_id: merged_table_id.toString()
        });
        return response.data;
    },

    // Fetch sitting areas for a restaurant
    fetchSittingAreas: async (restaurantId) => {
        const response = await apiClient.get(`/admin/sitting-areas/restaurant/${restaurantId}`);
        return response.data;
    },
};