import {create} from 'zustand';
import {apiClient} from '../utils/apiClient';

export const useLoyaltyClubSettingsStore = create((set) => ({
    // State
    loyaltyClubData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({isLoading: loading}),
    setUploading: (uploading) => set({isUploading: uploading}),
    setError: (error) => set({error}),
    setLoyaltyClubData: (data) => set({loyaltyClubData: data}),
    clearError: () => set({error: null}),

    // Reset state
    reset: () => set({
        loyaltyClubData: null,
        isLoading: false,
        isUploading: false,
        error: null
    }),
}));

// API functions for Loyalty Club Settings
export const loyaltyClubSettingsApi = {
    // Get all loyalty clubs for a restaurant
    getLoyaltyClubs: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/loyalty-club/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No loyalty clubs exist yet
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Create new loyalty club
    createLoyaltyClub: async (loyaltyClubData) => {
        const response = await apiClient.post('/admin/loyalty-club/create', loyaltyClubData);
        return response.data;
    },

    // Update existing loyalty club
    updateLoyaltyClub: async (loyaltyClubId, loyaltyClubData) => {
        const response = await apiClient.put(`/admin/loyalty-club/update/${loyaltyClubId}`, loyaltyClubData);
        return response.data;
    },

    // Delete loyalty club
    deleteLoyaltyClub: async (loyaltyClubId) => {
        const response = await apiClient.delete(`/admin/loyalty-club/delete/${loyaltyClubId}`);
        return response.data;
    },

    // Toggle Loyalty Club section visibility
    toggleLoyaltyClubs: async (aboutUsItemId, active) => {
        const response = await apiClient.patch(`/admin/about-us-items/toggle/${aboutUsItemId}`, {
            active: active
        });
        return response.data;
    },

    // Save loyalty club (create or update based on existence)
    saveLoyaltyClub: async (restaurantId, loyaltyClubData, isUpdate = false, loyaltyClubId = null) => {
        try {
            // QR image is already uploaded via awsApi.uploadImage() in the component
            // Use the qr_name (S3 filename) from loyaltyClubData
            const loyaltyClubPayload = {
                restaurant_id: restaurantId,
                loyalty_club_name: loyaltyClubData.loyalty_club_name,
                description: loyaltyClubData.description,
                qr_name: loyaltyClubData.qr_name // S3 filename
            };

            let result;
            if (isUpdate && loyaltyClubId) {
                // Update existing loyalty club
                result = await loyaltyClubSettingsApi.updateLoyaltyClub(loyaltyClubId, loyaltyClubPayload);
            } else {
                // Create new loyalty club
                result = await loyaltyClubSettingsApi.createLoyaltyClub(loyaltyClubPayload);
            }

            return result;
        } catch (error) {
            console.error("Save Loyalty Club failed:", error);
            throw error;
        }
    }
};

