import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useMenuSettingsStore = create((set) => ({
    // State
    menuData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setMenuData: (data) => set({ menuData: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        menuData: null, 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for Menu Settings
export const menuSettingsApi = {
    // Get Menu data for a restaurant
    getMenu: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/menu/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // Menu doesn't exist yet
                return { success: false, error: "Menu not found" };
            }
            throw error;
        }
    },

    // Create new Menu
    createMenu: async (menuData) => {
        const response = await apiClient.post('/admin/menu/create/new', menuData);
        return response.data;
    },

    // Update existing Menu
    updateMenu: async (menuId, menuData) => {
        const response = await apiClient.put(`/admin/menu/update/${menuId}`, menuData);
        return response.data;
    },

    // Main function to handle create or update based on existing data
    saveMenu: async (restaurantId, formData) => {
        try {
            // First check if Menu exists
            const existingData = await menuSettingsApi.getMenu(restaurantId);
            
            // Image is already uploaded via awsApi.uploadImage() in the component
            // Backend expects qr_url field with S3 filename
            const menuPayload = {
                restaurant_id: restaurantId,
                qr_url: formData.qr_url // S3 filename sent as qr_url
            };

            let result;
            if (existingData.success && existingData.data && existingData.data.length > 0) {
                // Update existing Menu (use first menu item)
                const existingMenu = existingData.data[0];
                result = await menuSettingsApi.updateMenu(existingMenu.menu_id, menuPayload);
            } else {
                // Create new Menu
                result = await menuSettingsApi.createMenu(menuPayload);
            }

            return result;
        } catch (error) {
            console.error("Save Menu failed:", error);
            throw error;
        }
    }
};
