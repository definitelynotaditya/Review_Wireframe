import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useWiFiSettingsStore = create((set) => ({
    // State
    wifiData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setWiFiData: (data) => set({ wifiData: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        wifiData: null, 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for WiFi Settings
export const wifiSettingsApi = {
    // Get WiFi data for a restaurant
    getWiFi: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/wifi/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // WiFi doesn't exist yet
                return { success: false, error: "Restaurant not found" };
            }
            throw error;
        }
    },

    // Create new WiFi
    createWiFi: async (wifiData) => {
        const response = await apiClient.post('/admin/wifi/create/new', wifiData);
        return response.data;
    },

    // Update existing WiFi
    updateWiFi: async (wifiId, wifiData) => {
        const response = await apiClient.put(`/admin/wifi/update/${wifiId}`, wifiData);
        return response.data;
    },

    // Toggle show_access_wifi visibility in LuxeGenie
    toggleWifi: async (restaurantId, showAccessWifi) => {
        const response = await apiClient.post('/admin/wifi/toggle-show-access-wifi', {
            restaurant_id: restaurantId.toString(),
            show_access_wifi: showAccessWifi
        });
        return response.data;
    },

    // Main function to handle create or update based on existing data
    saveWiFi: async (restaurantId, formData) => {
        try {
            // First check if WiFi exists
            const existingData = await wifiSettingsApi.getWiFi(restaurantId);
            
            // Image is already uploaded via awsApi.uploadImage() in the component
            // Backend expects qr_url field with S3 filename
            const wifiPayload = {
                restaurant_id: restaurantId,
                qr_url: formData.qr_url, // S3 filename sent as qr_url
                wifi_address: formData.wifi_address,
                wifi_password: formData.wifi_password
            };

            let result;
            if (existingData.success && existingData.data && existingData.data.length > 0) {
                // Update existing WiFi (use first wifi item)
                const existingWiFi = existingData.data[0];
                result = await wifiSettingsApi.updateWiFi(existingWiFi.wifi_id, wifiPayload);
            } else {
                // Create new WiFi
                result = await wifiSettingsApi.createWiFi(wifiPayload);
            }

            return result;
        } catch (error) {
            console.error("Save WiFi failed:", error);
            throw error;
        }
    }
};
