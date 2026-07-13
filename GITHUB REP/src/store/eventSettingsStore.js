import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useEventSettingsStore = create((set) => ({
    // State
    eventsData: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setError: (error) => set({ error }),
    setEventsData: (data) => set({ eventsData: data }),
    clearError: () => set({ error: null }),

    // Reset state
    reset: () => set({ 
        eventsData: null, 
        isLoading: false, 
        isUploading: false, 
        error: null 
    }),
}));

// API functions for Event Settings
export const eventSettingsApi = {
    // Get all events for a restaurant
    getEvents: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/event/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No events exist yet
                return { success: true, data: [] };
            }
            throw error;
        }
    },

    // Create new event
    createEvent: async (eventData) => {
        const response = await apiClient.post('/admin/event/create/new', eventData);
        return response.data;
    },

    // Update existing event
    updateEvent: async (eventId, eventData) => {
        const response = await apiClient.put(`/admin/event/update/${eventId}`, eventData);
        return response.data;
    },

    // Delete event
    deleteEvent: async (eventId) => {
        const response = await apiClient.delete(`/admin/event/delete/${eventId}`);
        return response.data;
    },

    // Toggle Event section visibility
    toggleEvents: async (eventItemId, active) => {
        const response = await apiClient.patch(`/admin/about-us-items/toggle/${eventItemId}`, {
            active: active
        });
        return response.data;
    },

    // Save event (create or update based on existence)
    saveEvent: async (restaurantId, eventData, isUpdate = false, eventId = null) => {
        try {
            // Image or video is already uploaded via awsApi.uploadImage() in the component
            // Use the img_name (S3 filename) from eventData - works for both images and videos
            const eventPayload = {
                restaurant_id: restaurantId,
                img_name: eventData.img_name || "", // S3 filename (for image or video)
                event_name: eventData.event_name,
                event_date: eventData.event_date,
                start_time: eventData.start_time,
                end_time: eventData.end_time
            };

            let result;
            if (isUpdate && eventId) {
                // Update existing event
                result = await eventSettingsApi.updateEvent(eventId, eventPayload);
            } else {
                // Create new event
                result = await eventSettingsApi.createEvent(eventPayload);
            }

            return result;
        } catch (error) {
            console.error("Save Event failed:", error);
            throw error;
        }
    }
};
