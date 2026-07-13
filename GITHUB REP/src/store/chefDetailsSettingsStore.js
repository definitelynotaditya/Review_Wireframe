import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useChefDetailsSettingsStore = create((set) => ({
    // State
    chefsData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setChefsData: (data) => set({ chefsData: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        chefsData: null, 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for Chef Settings
export const chefSettingsApi = {
    // Get all chefs for a restaurant
    getChefs: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/chef/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No chefs exist yet
                return { success: true, data: [] };
            }
            throw error;
        }
    },

    // Create new chef
    createChef: async (chefData) => {
        const response = await apiClient.post('/admin/chef/create/new', chefData);
        return response.data;
    },

    // Update existing chef
    updateChef: async (chefId, chefData) => {
        const response = await apiClient.put(`/admin/chef/update/${chefId}`, chefData);
        return response.data;
    },

    // Delete chef
    deleteChef: async (chefId) => {
        const response = await apiClient.delete(`/admin/chef/delete/${chefId}`);
        return response.data;
    },

    // Toggle Chef section visibility
    toggleChefs: async (chefItemId, active) => {
        const response = await apiClient.patch(`/admin/about-us-items/toggle/${chefItemId}`, {
            active: active
        });
        return response.data;
    },

    // Save chef (create or update based on existence)
    saveChef: async (restaurantId, chefData, isUpdate = false, chefId = null) => {
        try {
            // Image is already uploaded via awsApi.uploadImage() in the component
            // Use the img_name (S3 filename) from chefData
            const chefPayload = {
                restaurant_id: restaurantId,
                img_name: chefData.img_name, // S3 filename
                name: chefData.name,
                designation: chefData.designation,
                information: chefData.information
            };

            let result;
            if (isUpdate && chefId) {
                // Update existing chef
                result = await chefSettingsApi.updateChef(chefId, chefPayload);
            } else {
                // Create new chef
                result = await chefSettingsApi.createChef(chefPayload);
            }

            return result;
        } catch (error) {
            console.error("Save Chef failed:", error);
            throw error;
        }
    }
};

export default useChefDetailsSettingsStore;
