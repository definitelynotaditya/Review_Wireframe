import {create} from "zustand";
import { apiClient } from "../utils/apiClient";

export const useManageSessionStore = create((set) => ({
    // Only UI state - no data caching
    selectedTable: null,
    targetTable: null,
    
    // UI actions
    setSelectedTable: (table) => set({ selectedTable: table }),
    setTargetTable: (table) => set({ targetTable: table }),
    clearSelection: () => set({ selectedTable: null, targetTable: null }),
}));

// API functions for React Query
export const sessionApi = {
    // Transfer session between tables
    transferSession: async ({ selectedTable, targetTable }) => {
        const response = await apiClient.post('/admin/session-management/transfer', {
            selectedTable,
            targetTable
        });
        return response.data;
    },
};
