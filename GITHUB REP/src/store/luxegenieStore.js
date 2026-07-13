import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

const useLuxegenieStore = create(() => ({
	// Store state can be added here if needed later
}));

// changed here
// API functions for React Query
export const luxegenieApi = {
	// Fetch all luxegenie devices for a restaurant
	getAllDevices: async (restaurantId) => {
		const response = await apiClient.get(`/luxegenie/devices/get/all/${restaurantId}`);
		return response.data;
	},

	// Unassign luxegenie from table
	unassignFromTable: async (assignmentData) => {
		const response = await apiClient.post('/luxegenie/assign/from/table', assignmentData);
		return response.data;
	},

	shutdownSpecificDevice: async (shutdownData) => {
		const response = await apiClient.post(`/luxegenie/shutdown-reboot/device/shutdown`, shutdownData);
		return response.data;
	},

	shutdownAllDevices: async (shutdownData) => {
		const response = await apiClient.post(`/luxegenie/shutdown-reboot/shutdown`, shutdownData);
		return response.data;
	},

	rebootSpecificDevice: async (rebootData) => {
		const response = await apiClient.post(`/luxegenie/shutdown-reboot/device/reboot`, rebootData);
		return response.data;
	},

	rebootAllDevices: async (rebootData) => {
		const response = await apiClient.post(`/luxegenie/shutdown-reboot/reboot`, rebootData);
		return response.data;
	},

	unassignAllDevices: async (unassignData) => {
		const response = await apiClient.post(`/luxegenie/shutdown-reboot/unassign`, unassignData);
		return response.data;
	}
};

export default useLuxegenieStore;
