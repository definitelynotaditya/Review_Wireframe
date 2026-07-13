import { create } from "zustand";
import { apiClient } from "../utils/apiClient";

export const useReservationStore = create((set) => ({
    // State
    reservations: [],
    isLoading: false,
    error: null,
    selectedReservation: null,
    
    // Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setReservations: (data) => set({ reservations: data }),
    setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),
    clearError: () => set({ error: null }),
    clearSelection: () => set({ selectedReservation: null }),

    // Reset state
    reset: () => set({ 
        reservations: [], 
        isLoading: false, 
        error: null,
        selectedReservation: null
    }),
}));

// API functions for Reservations
export const reservationApi = {
    // Get all reservations for a restaurant
    getAllReservations: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/reservations/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No reservations exist yet
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Get today's reservations for a restaurant
    getTodayReservations: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/reservations/restaurant/${restaurantId}?filter_type=today`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Get upcoming reservations for a restaurant
    getUpcomingReservations: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/reservations/restaurant/${restaurantId}?filter_type=upcoming`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Get past reservations for a restaurant
    getPastReservations: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/reservations/restaurant/${restaurantId}?filter_type=past`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Get reservations by specific date for a restaurant
    getReservationsByDate: async (restaurantId, date) => {
        try {
            const response = await apiClient.get(`/admin/reservations/restaurant/${restaurantId}?date=${date}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                return { success: true, data: [], count: 0 };
            }
            throw error;
        }
    },

    // Get specific reservation details by reservation ID
    getReservationDetails: async (reservationId) => {
        const response = await apiClient.get(`/admin/reservations/${reservationId}`);
        return response.data;
    },

    // Create new reservation
    createReservation: async (reservationData) => {
        const response = await apiClient.post('/admin/reservations/create/new', reservationData);
        return response.data;
    },

    // Update reservation
    updateReservation: async (reservationId, reservationData) => {
        const response = await apiClient.put(`/admin/reservations/update/${reservationId}`, reservationData);
        return response.data;
    },

    // Delete reservation
    deleteReservation: async (reservationId) => {
        const response = await apiClient.delete(`/admin/reservations/delete/${reservationId}`);
        return response.data;
    },

    // Cancel reservation (keeps reservation record, makes table vacant)
    cancelReservation: async (reservationId) => {
        const response = await apiClient.put(`/admin/reservations/cancel/${reservationId}`);
        return response.data;
    },

    // Update room number on a reservation
    updateRoomNumber: async (reservationId, roomNumber) => {
        const response = await apiClient.put(`/admin/reservations/update-room-number/${reservationId}`, { room_number: roomNumber });
        return response.data;
    },

    // Get guest list for a restaurant
    getGuestList: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/guest/list/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No guests exist yet
                return { success: true, data: [] };
            }
            throw error;
        }
    },

    // Get all vacant tables for a restaurant (for table allotment)
    getVacantTables: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/table-allotment/get/available/${restaurantId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.success === false) {
                // No vacant tables available
                return { success: true, tables: {} };
            }
            throw error;
        }
    },

    // Allot table to reservation
    allotTable: async (reservationId, tableId) => {
        const response = await apiClient.post('/admin/table-allotment/alloted', {
            reservation_id: reservationId,
            table_id: tableId,
        });
        return response.data;
    },

    // Seat guests at table
    seatTable: async (reservationId, tableId) => {
        const response = await apiClient.post('/admin/table-allotment/seated', {
            reservation_id: reservationId,
            table_id: tableId,
        });
        return response.data;
    },

    // Allot and seat guests at table (for walk-ins)
    allotAndSeatTable: async (reservationId, tableId) => {
        const response = await apiClient.post('/admin/table-allotment/alloted_and_seated', {
            reservation_id: reservationId,
            table_id: tableId,
        });
        return response.data;
    },

    // Deallot table from reservation
    deallotTable: async (reservationId) => {
        const response = await apiClient.post('/admin/table-allotment/deallot', {
            reservation_id: reservationId,
        });
        return response.data;
    },

    // Get time slots for a restaurant
    getTimeSlots: async (restaurantId) => {
        try {
            const response = await apiClient.get(`/admin/reservations/time-slots/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch time slots:", error);
            throw error;
        }
    },

    // Helper function to format reservation data for API
    formatReservationData: (formData, restaurantId) => {
        // Calculate duration in minutes from time strings
        const calculateDuration = (timeFrom, timeTo) => {
            if (!timeFrom || !timeTo) return 0;
            
            const [fromHour, fromMin] = timeFrom.split(':').map(Number);
            const [toHour, toMin] = timeTo.split(':').map(Number);
            
            const fromMinutes = fromHour * 60 + fromMin;
            const toMinutes = toHour * 60 + toMin;
            
            return toMinutes - fromMinutes;
        };

        // Format duration as "Xh Ym"
        const formatDuration = (minutes) => {
            if (minutes <= 0) return "0m";
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            
            if (hours > 0 && mins > 0) {
                return `${hours}h ${mins}m`;
            } else if (hours > 0) {
                return `${hours}h`;
            } else {
                return `${mins}m`;
            }
        };

        const duration = calculateDuration(formData.reservation_time_from, formData.reservation_time_to);

        return {
            restaurant_id: restaurantId.toString(),
            reservation_at: new Date().toISOString(), // Current timestamp
            reservation_time_from: formData.reservation_time_from || "",
            reservation_time_to: formData.reservation_time_to || "",
            reservation_date_from: formData.reservation_date_from || "",
            reservation_date_to: formData.reservation_date_to || formData.reservation_date_from || "",
            reservation_duration: formatDuration(duration),
            guest_name: formData.guest_name || "",
            contact: formData.contact ? formData.contact.toString() : "",
            email: formData.email || "",
            number_of_pax: parseInt(formData.number_of_pax),
            revisit_count: parseInt(formData.revisit_count) || 0,
            reservation_guest_type: formData.reservation_guest_type || "first",
            reservation_type: formData.reservation_type || "online",
            reservation_status: formData.reservation_status || "confirmed"
        };
    },

    // Helper function to format reservation data for update API
    formatUpdateReservationData: (formData, existingReservation) => {
        // Parse dates properly for API
        const formatDateForAPI = (dateString) => {
            if (!dateString) return null;
            const date = new Date(dateString + 'T00:00:00.000Z');
            return date.toISOString();
        };

        // Format time for API (add seconds if missing)
        const formatTimeForAPI = (timeString) => {
            if (!timeString) return null;
            return timeString.includes(':') && timeString.split(':').length === 2 
                ? `${timeString}:00` 
                : timeString;
        };

        return {
            reservation_id: existingReservation.reservation_id,
            restaurant_id: parseInt(existingReservation.restaurant_id),
            reservation_at: existingReservation.reservation_at || new Date().toISOString(),
            reservation_time_from: formatTimeForAPI(formData.reservation_time_from),
            reservation_time_to: formatTimeForAPI(formData.reservation_time_to),
            reservation_date_from: formatDateForAPI(formData.reservation_date_from),
            reservation_date_to: formatDateForAPI(formData.reservation_date_to || formData.reservation_date_from),
            reservation_duration: existingReservation.reservation_duration,
            guest_name: formData.guest_name || "",
            contact: formData.contact ? formData.contact.toString() : null,
            email: formData.email || null,
            number_of_pax: parseInt(formData.number_of_pax),
            revisit_count: parseInt(formData.revisit_count) || 0,
            guest_type: formData.is_member ? "member" : "first",
            reservation_type: formData.reservation_type || "online",
            reservation_status: formData.reservation_status || "confirmed",
            alloted_table_number: existingReservation.alloted_table_number,
            is_deleted: false,
            created_at: existingReservation.created_at
        };
    }
};