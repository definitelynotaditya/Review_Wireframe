import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useUserStore = create((set) => ({
    // Only UI state - no data caching
    selectedUser: null,
    
    // UI actions
    setSelectedUser: (user) => set({ selectedUser: user }),
    clearSelection: () => set({ selectedUser: null }),
}));

// API functions for React Query
export const userApi = {
    // Add new user to restaurant
    addUser: async (userData) => {
        // Use the filename that was already uploaded to S3 via awsApi.uploadImage()
        const imageFileName = userData.img_name || "";

        const userPayload = {
            restaurant_id: userData.restaurant_id,
            username: userData.username,
            name: userData.name,
            contact: userData.contact,
            password: userData.password,
            role: userData.role,
            server_code: userData.server_code,
            img_name: imageFileName // Backend expects img_name field
        };

        const response = await apiClient.post('/admin/user/register/new', userPayload);
        return response.data;
    },

    // Fetch users for a specific restaurant
    fetchRestaurantUsers: async (restaurantId) => {
        const response = await apiClient.get(`/admin/user/restaurant/${restaurantId}`);
        return response.data.users || [];
    },

    // Update user
    updateUser: async ({ user_id, ...userData }) => {
        // For updates: only use img_name if it's explicitly provided (new image uploaded)
        // Otherwise send empty string to prevent backend from concatenating URLs
        const imageFileName = userData.img_name || "";

        const userPayload = {
            restaurant_id: userData.restaurant_id,
            username: userData.username,
            name: userData.name,
            contact: userData.contact,
            password: userData.password,
            role: userData.role,
            server_code: userData.server_code,
            img_name: imageFileName // Send "" if no new image
        };

        const response = await apiClient.put(`/admin/user/update/${user_id}`, userPayload);
        return response.data;
    },

    // Toggle user active status
    toggleUser: async (user_id, isActive) => {
        const response = await apiClient.patch(`/admin/user/toggle/${user_id}`, { active: isActive });
        return response.data;
    },

    // Check if server code is already taken
    checkServerCode: async (restaurantId, serverCode) => {
        const response = await apiClient.get(`/admin/user/checkServerCode/${restaurantId}/${serverCode}`);
        return response.data;
    },
};