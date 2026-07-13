import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useRestaurantStore = create((set) => ({
    // Only UI state - no data caching
    selectedRestaurant: null,
    // UI actions
    setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
    clearSelection: () => set({ selectedRestaurant: null }),
}));

// API functions for React Query
export const restaurantApi = {

    // Fetch single restaurant by ID
    fetchRestaurantById: async (id) => {
        const response = await apiClient.get(`/superadmin/restaurant/${id}`);
        return response.data.restaurant;
    },
    
};