import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useChefSpecialsStore = create((set) => ({
    // State
    chefSpecials: [],
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setChefSpecials: (data) => set({ chefSpecials: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        chefSpecials: [], 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for Chef Specials
export const chefSpecialsApi = {
    // Get all chef specials for a restaurant
    getChefSpecials: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/chef-special-dish/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No chef specials exist yet
                return { success: true, data: [] };
            }
            throw error;
        }
    },

    // Create new chef special
    createChefSpecial: async (chefSpecialData) => {
        const response = await apiClient.post('/admin/chef-special-dish/create/new', chefSpecialData);
        return response.data;
    },

    // Update existing chef special
    updateChefSpecial: async (chefSpecialId, chefSpecialData) => {
        const response = await apiClient.put(`/admin/chef-special-dish/update/${chefSpecialId}`, chefSpecialData);
        return response.data;
    },

    // Toggle chef special
    toggleChefSpecial: async (chefSpecialId, isActive) => {
        const response = await apiClient.patch(`/admin/chef-special-dish/toggle/${chefSpecialId}`, { active: isActive });
        return response.data;
    },

    // Save chef special (create or update based on existence)
    saveChefSpecial: async (restaurantId, chefSpecialData, isUpdate = false, chefSpecialId = null) => {
        try {
            // Use the filename that was already uploaded to S3 via awsApi.uploadImage()
            // For updates: only use img_name if it's explicitly provided (new image uploaded)
            // Otherwise send empty string to prevent backend from concatenating URLs
            const imageFileName = chefSpecialData.img_name || "";

            const chefSpecialPayload = {
                restaurant_id: restaurantId,
                dish_name: chefSpecialData.dish_name,
                dish_description: chefSpecialData.dish_description,
                img_name: imageFileName, // Backend expects img_name field, send "" if no new image
                calories: parseInt(chefSpecialData.calories) || 0,
                veg_nonveg: chefSpecialData.veg_nonveg,
                dish_price: parseFloat(chefSpecialData.dish_price) || 0,
                menu_category_name: chefSpecialData.menu_category_name,
                menu_sub_category_name: chefSpecialData.menu_sub_category_name,
                // Keep current active state on update; default to true for new records
                active: typeof chefSpecialData.active === "boolean" ? chefSpecialData.active : true
            };

            let result;
            if (isUpdate && chefSpecialId) {
                // Update existing chef special
                result = await chefSpecialsApi.updateChefSpecial(chefSpecialId, chefSpecialPayload);
            } else {
                // Create new chef special
                result = await chefSpecialsApi.createChefSpecial(chefSpecialPayload);
            }

            return result;
        } catch (error) {
            console.error("Save Chef Special failed:", error);
            throw error;
        }
    }
};