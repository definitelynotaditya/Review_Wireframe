
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../context/ThemeContext";
import { reservationApi } from "../../../store/reservationStore";
import { luxegenieApi } from "../../../store/luxegenieStore";
import { FiX, FiUser, FiPhone, FiMail, FiCalendar, FiClock, FiUsers, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";
import Loader from "../../common/Loader";
import UnassignLuxegenieModal from "../UnassignLuxegenieModal";

const TableReservationDetailsAndDeallotModal = ({ isOpen, onClose, table, restaurantId }) => {
    const { colors } = useTheme();
    const [isDealloting, setIsDealloting] = useState(false);
    const [isUnassigning, setIsUnassigning] = useState(false);
    const [showUnassignModal, setShowUnassignModal] = useState(false);
    const queryClient = useQueryClient();

    // Fetch reservation details
    const {
        data: reservationData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['reservationDetails', table?.reservation_id],
        queryFn: () => reservationApi.getReservationDetails(table?.reservation_id),
        enabled: isOpen && !!table?.reservation_id,
    });

    // Deallot table mutation
    const deallotMutation = useMutation({
        mutationFn: (reservationId) => reservationApi.deallotTable(reservationId),
        onMutate: () => {
            setIsDealloting(true);
        },
        onSuccess: (response) => {
            toast.success("Table unalloted successfully");
            // Invalidate tables query to refresh the data
            queryClient.invalidateQueries(['restaurant-tables', restaurantId]);
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to unallot table");
        },
        onSettled: () => {
            setIsDealloting(false);
        },
    });

    // Unassign luxegenie mutation
    const unassignMutation = useMutation({
        mutationFn: (assignmentData) => luxegenieApi.unassignFromTable(assignmentData),
        onMutate: () => {
            setIsUnassigning(true);
        },
        onSuccess: () => {
            toast.success("LUXEGENIE unassigned successfully!");
            queryClient.invalidateQueries(['restaurant-tables', restaurantId]);
            queryClient.invalidateQueries(['luxegenie-devices', restaurantId]);
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to unassign LuxeGenie");
        },
        onSettled: () => {
            setIsUnassigning(false);
        },
    });

    const handleDeallot = () => {
        if (table?.reservation_id) {
            deallotMutation.mutate(table.reservation_id);
        }
    };

    // Handle unassign luxegenie - show confirmation modal
    const handleUnassignLuxegenie = () => {
        if (!table?.table_id || !table?.luxegenie_device_id) {
            toast.error("Missing table or device information");
            return;
        }
        setShowUnassignModal(true);
    };

    // Confirm unassign luxegenie
    const handleConfirmUnassignLuxegenie = () => {
        const assignmentData = {
            restaurant_id: restaurantId.toString(),
            table_id: table.table_id.toString(),
            device_id: table.luxegenie_device_id.toString(),
        };

        unassignMutation.mutate(assignmentData);
        setShowUnassignModal(false);
    };

    // Close unassign modal
    const handleCloseUnassignModal = () => {
        setShowUnassignModal(false);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString;
    };

    if (!isOpen) return null;

    const reservation = reservationData?.data;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${colors.card} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${colors.shadow} scrollbar-none`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${colors.textPrimary}`}>
                            Reservation Details
                        </h2>
                        <p className={`text-sm ${colors.textSecondary} mt-1`}>
                            Table {table?.table_number || 'Unknown'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${colors.hover} transition-colors hover:cursor-pointer`}
                    >
                        <FiX size={20} className={colors.textSecondary} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Unassign Luxegenie Button */}
                    {table?.is_luxegenie_assigned && (
                        <div className="mb-6">
                            <button
                                onClick={handleUnassignLuxegenie}
                                disabled={isUnassigning}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center space-x-2"
                            >
                                {isUnassigning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Unassigning...</span>
                                    </>
                                ) : (
                                    <span>Unassign LUXEGENIE from {table?.table_number}</span>
                                )}
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <Loader />
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-500 mb-2">
                                <FiX size={48} className="mx-auto" />
                            </div>
                            <p className="text-red-600 font-medium">Failed to load reservation details</p>
                            <p className={`text-sm ${colors.textMuted} mt-1`}>
                                {error.message}
                            </p>
                        </div>
                    ) : reservation ? (
                        <div className="space-y-6">
                            {/* Guest Information */}
                            <div className={`${colors.cardBg} rounded-xl p-4`}>
                                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
                                    <FiUser size={20} className="mr-2" />
                                    Guest Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Guest Name
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} font-medium`}>
                                            {reservation.guest_name || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Contact
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} flex items-center`}>
                                            <FiPhone size={14} className="mr-2" />
                                            {reservation.contact || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Email
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} flex items-center`}>
                                            <FiMail size={14} className="mr-2" />
                                            {reservation.email || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Number of Guests
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} flex items-center`}>
                                            <FiUsers size={14} className="mr-2" />
                                            {reservation.number_of_pax || "N/A"} guests
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reservation Details */}
                            <div className={`${colors.cardBg} rounded-xl p-4`}>
                                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
                                    <FiCalendar size={20} className="mr-2" />
                                    Reservation Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Reservation Date
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary}`}>
                                            {formatDate(reservation.reservation_date_from)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Time From
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} flex items-center`}>
                                            <FiClock size={14} className="mr-2" />
                                            {formatTime(reservation.reservation_time_from)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Time To
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} flex items-center`}>
                                            <FiClock size={14} className="mr-2" />
                                            {formatTime(reservation.reservation_time_to)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Duration
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary}`}>
                                            {reservation.reservation_duration || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Reservation Type
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} capitalize`}>
                                            {reservation.reservation_type || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Status
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} capitalize`}>
                                            {reservation.reservation_status || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Table Information */}
                            <div className={`${colors.cardBg} rounded-xl p-4`}>
                                <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}>
                                    <FiMapPin size={20} className="mr-2" />
                                    Table Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Alloted Table
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} font-medium`}>
                                            {reservation.alloted_table_number || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${colors.textSecondary}`}>
                                            Guest Type
                                        </label>
                                        <p className={`mt-1 ${colors.textPrimary} capitalize`}>
                                            {reservation.guest_type || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className={colors.textMuted}>No reservation details available</p>
                        </div>
                    )}
                </div>

                {/* Footer with Actions */}
                <div className={`flex items-center justify-end space-x-3 p-6 border-t ${colors.border}`}>
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-xl ${colors.button} ${colors.textSecondary} hover:${colors.buttonHover} transition-colors hover:cursor-pointer`}
                    >
                        Close
                    </button>
                    {reservation && (
                        <button
                            onClick={handleDeallot}
                            disabled={isDealloting || deallotMutation.isPending}
                            className="px-6 py-2 bg-[#B69549] hover:bg-yellow-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:cursor-pointer"
                        >
                            {isDealloting || deallotMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Unalloting...</span>
                                </>
                            ) : (
                                <span>Unallot Table</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <UnassignLuxegenieModal
                isOpen={showUnassignModal}
                onClose={handleCloseUnassignModal}
                onConfirm={handleConfirmUnassignLuxegenie}
                device={{
                    device_id: table?.luxegenie_device_id,
                    serial_number: table?.luxegenie_serial_number || 'Unknown',
                    assigned_to_table_no: table?.table_number,
                    assigned_to_sitting_area: table?.sitting_area,
                    table_id: table?.table_id,
                }}
                isLoading={isUnassigning}
            />
        </div>
    );
};

export default TableReservationDetailsAndDeallotModal;