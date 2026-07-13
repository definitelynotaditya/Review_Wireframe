import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useSessionStore = create((set) => ({
    // Only UI state - no data caching
    selectedSession: null,
    
    // UI actions
    setSelectedSession: (session) => set({ selectedSession: session }),
    clearSelection: () => set({ selectedSession: null }),
}));

// API functions for React Query
export const sessionApi = {
    // Get session activities
    getSessionActivities: async (restaurantId, sessionId) => {
        const response = await apiClient.get(`/luxegenie/session/activities/for/session/${restaurantId}/${sessionId}`);
        return response.data; // Return the full response object with session and activities
    },

    // Enter bill amount
    enterBillAmount: async (restaurantId, sessionId, billAmount) => {
        const response = await apiClient.post(`/luxegenie/session/enter-bill-amount/${restaurantId}/${sessionId}`, {
            bill_amount: billAmount.toString()
        });
        return response.data;
    },

    // Edit bill amount
    editBillAmount: async (restaurantId, sessionId, billAmount) => {
        const response = await apiClient.post(`/luxegenie/session/edit-bill-amount/${restaurantId}/${sessionId}`, {
            bill_amount: billAmount.toString()
        });
        return response.data;
    },

    // Confirm bill payment
    confirmBillPayment: async (restaurantId, sessionId) => {
        const response = await apiClient.post(`/luxegenie/session/confirm-bill-payment/${restaurantId}/${sessionId}`, {
            payment_status: "paid"
        });
        return response.data;
    },

    // Issue powerbank
    issuePowerbank: async (restaurantId, tableId, sessionId, status) => {
		const response = await apiClient.put(
			`/luxegenie/session/issue-powerbank/${restaurantId}/${tableId}/${sessionId}/${status}`,
			{}
		);
		return response.data;
	},

    // Terminate session
    terminateSession: async (sessionId, restaurantId) => {
        const response = await apiClient.post(`/admin/session-termination/terminate/${sessionId}/${restaurantId}`);
        return response.data;
    },

    // Shutdown all — terminates all active sessions, unassigns all devices, powers off all LUXEGENIEs
    shutdownAll: async (restaurantId) => {
        const response = await apiClient.post(`/admin/session-termination/shutdown-all/${restaurantId}`, {});
        return response.data;
    },
    
};