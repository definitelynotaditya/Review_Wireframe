import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useAboutSettingsStore = create((set) => ({
    // State
    aboutData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setAboutData: (data) => set({ aboutData: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        aboutData: null, 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for About Us
export const aboutSettingsApi = {
    // Get About Us data for a restaurant
    getAboutUs: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/history/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // About Us doesn't exist yet
                return { success: false, error: "About Us not found" };
            }
            throw error;
        }
    },

    // Create new About Us
    createAboutUs: async (aboutData) => {
        const response = await apiClient.post('/admin/history/create', aboutData);
        return response.data;
    },

    // Update existing About Us
    updateAboutUs: async (aboutId, aboutData) => {
        const response = await apiClient.put(`/admin/history/update/${aboutId}`, aboutData);
        return response.data;
    },

    // Toggle About Us section visibility
    toggleAboutUs: async (aboutUsItemId, active) => {
        const response = await apiClient.patch(`/admin/about-us-items/toggle/${aboutUsItemId}`, {
            active: active
        });
        return response.data;
    },

    // Main function to handle create or update based on existing data
    saveAboutUs: async (restaurantId, formData) => {
        try {
            // First check if About Us exists
            const existingData = await aboutSettingsApi.getAboutUs(restaurantId);
            
            // Image is already uploaded via awsApi.uploadImage() in the component
            // Use the img_name (S3 filename) from formData
            const aboutPayload = {
                restaurant_id: restaurantId,
                img_name: formData.img_name, // S3 filename
                history: formData.history,
                restaurant_name: formData.restaurant_name
            };

            let result;
            if (existingData.success && existingData.data) {
                // Update existing About Us
                result = await aboutSettingsApi.updateAboutUs(existingData.data.history_id, aboutPayload);
            } else {
                // Create new About Us
                result = await aboutSettingsApi.createAboutUs(aboutPayload);
            }

            return result;
        } catch (error) {
            console.error("Save About Us failed:", error);
            throw error;
        }
    }
};