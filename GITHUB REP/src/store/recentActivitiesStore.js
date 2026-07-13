import {create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useRecentActivitiesStore = create((set) => ({
    // UI state
    selectedActivity: null,
    
    // UI actions
    setSelectedActivity: (activity) => set({ selectedActivity: activity }),
    clearSelection: () => set({ selectedActivity: null }),
}));

// API functions for React Query
export const recentActivitiesApi = {
    // Fetch all recent activities for restaurant and session
    fetchActivities: async (restaurantId) => {
        const response = await apiClient.get(`/luxegenie/session/activities/for/restaurant/${restaurantId}`);
        return response.data.activities || [];
    },
};