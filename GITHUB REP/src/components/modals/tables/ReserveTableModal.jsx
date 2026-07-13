import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiUsers, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";
import { tablesApi } from "../../../store/tablesStore.js";
import { luxegenieApi } from "../../../store/luxegenieStore.js";
import { useAuthStore } from "../../../store/authStore.js";
import { useTheme } from "../../../context/ThemeContext.jsx";
import UnassignLuxegenieModal from "../UnassignLuxegenieModal";
import { useState } from "react";

const ReserveTableModal = ({ isOpen, onClose, table }) => {
	const { user } = useAuthStore();
	const { colors } = useTheme();
	const restaurantId = user?.restaurant_id;
	const queryClient = useQueryClient();
	const [showUnassignModal, setShowUnassignModal] = useState(false);

	// Mutation for reserving table
	const reserveTableMutation = useMutation({
		mutationFn: () => tablesApi.reserveTable(table?.table_id, restaurantId),
		onSuccess: () => {
			// Invalidate and refetch tables data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			toast.success(`Table ${table?.table_number} reserved successfully!`);
			onClose();
		},
		onError: (error) => {
			console.error("Failed to reserve table:", error);
			toast.error("Failed to reserve table. Please try again.");
		},
	});

	// Mutation for unreserving table
	const unreserveTableMutation = useMutation({
		mutationFn: () => tablesApi.unreserveTable(table?.table_id, restaurantId),
		onSuccess: () => {
			// Invalidate and refetch tables data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			toast.success(`Table ${table?.table_number} unreserved successfully!`);
			onClose();
		},
		onError: (error) => {
			console.error("Failed to unreserve table:", error);
			toast.error("Failed to unreserve table. Please try again.");
		},
	});

	// Mutation for unassigning luxegenie from table
	const unassignMutation = useMutation({
		mutationFn: (assignmentData) => luxegenieApi.unassignFromTable(assignmentData),
		onSuccess: () => {
			toast.success("LUXEGENIE unassigned successfully!");
			// Invalidate queries to refresh the data
			queryClient.invalidateQueries(['restaurant-tables', restaurantId]);
			queryClient.invalidateQueries(['luxegenie-devices', restaurantId]);
			onClose(); // Close modal after unassigning
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to unassign LuxeGenie");
		},
	});

	const handleReserve = () => {
		if (table && restaurantId) {
			reserveTableMutation.mutate();
		}
	};

	const handleUnreserve = () => {
		if (table && restaurantId) {
			unreserveTableMutation.mutate();
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

	// Separate loading states for better UX
	const isReserveUnreserveLoading = reserveTableMutation.isPending || unreserveTableMutation.isPending;
	const isUnassignLoading = unassignMutation.isPending;
	const hasError = reserveTableMutation.isError || unreserveTableMutation.isError || unassignMutation.isError;

	// Determine modal title and action based on table status
	const isReserved = table?.table_status === "reserved";
	const modalTitle = isReserved ? "Unreserve Table" : "Reserve Table";
	const confirmationMessage = isReserved 
		? "Are you sure you want to unreserve this table?"
		: "Are you sure you want to reserve this table?";
	const actionButtonText = isReserved ? "Yes, Unreserve" : "Yes, Reserve";
	const actionHandler = isReserved ? handleUnreserve : handleReserve;
	const canPerformAction = isReserved || table?.table_status === "vacant";

	if (!isOpen || !table) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className={`${colors.card} rounded-xl max-w-md w-full mx-auto shadow-2xl`}>
			{/* Header */}
			<div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
				<h2 className={`text-xl font-semibold ${colors.textPrimary}`}>
					{modalTitle}
				</h2>
				<button
					onClick={onClose}
					className={`p-2 ${colors.hover} rounded-lg transition-colors duration-200 hover:cursor-pointer`}
					disabled={isReserveUnreserveLoading || isUnassignLoading}
				>
					<FiX size={20} className={colors.textMuted} />
				</button>
			</div>				{/* Content */}
				<div className="p-6">
					{/* Unassign Luxegenie Button */}
					{table?.is_luxegenie_assigned && (
						<div className="mb-6">
							<button 
								onClick={handleUnassignLuxegenie}
								disabled={isUnassignLoading}
								className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center space-x-2"
							>
								{isUnassignLoading ? (
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

					{/* Table Info */}
					<div className={`${colors.cardBg} rounded-lg p-4 mb-6`}>
						<div className="flex items-center justify-between mb-3">
							<h3 className={`text-lg font-bold ${colors.textPrimary}`}>
								{table.table_number}
							</h3>
							<span className={`px-3 py-1 rounded text-xs font-bold ${
								table.table_status === "vacant" 
									? "bg-green-100 text-green-800"
									: table.table_status === "reserved"
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-800"
							}`}>
								{table.table_status?.toUpperCase()}
							</span>
						</div>
						
						<div className={`space-y-2 text-sm ${colors.textSecondary}`}>
							<div className="flex items-center space-x-2">
								<FiUsers size={16} />
								<span>{table.capacity} seats</span>
							</div>
							<div className="flex items-center space-x-2">
								<FiMapPin size={16} />
								<span>{table.sitting_area}</span>
							</div>
						</div>
					</div>

					{/* Confirmation Message */}
					<div className="text-center mb-6">
						<p className={colors.textSecondary}>
							{confirmationMessage}
						</p>
					</div>

					{/* Error Message */}
					{hasError && (
						<div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-red-700 dark:text-red-300 text-sm">
								Failed to {isReserved ? 'unreserve' : 'reserve'} table. Please try again.
							</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-3">
						<button
							onClick={onClose}
							disabled={isReserveUnreserveLoading || isUnassignLoading}
							className={`flex-1 px-4 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
						>
							Cancel
						</button>
						<button
							onClick={actionHandler}
							disabled={isReserveUnreserveLoading || !canPerformAction}
							className={`flex-1 px-4 py-3 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer flex items-center justify-center ${
								isReserved 
									? "bg-[#B69549] text-white" 
									: "bg-[#B69549] text-white"
							}`}
						>
							{isReserveUnreserveLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							) : (
								actionButtonText
							)}
						</button>
					</div>

					{/* Note */}
					{!canPerformAction && (
						<div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
							<p className="text-yellow-700 dark:text-yellow-300 text-sm text-center">
								This table is currently {table.table_status} and cannot be {isReserved ? 'unreserved' : 'reserved'}.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Unassign LuxeGenie Confirmation Modal */}
			<UnassignLuxegenieModal
				isOpen={showUnassignModal}
				onClose={handleCloseUnassignModal}
				onConfirm={handleConfirmUnassignLuxegenie}
				device={{
					device_id: table?.luxegenie_device_id,
					serial_number: table?.luxegenie_serial_number || 'Unknown',
					assigned_to_table_no: table?.table_number,
					assigned_to_sitting_area: table?.sitting_area,
					table_id: table?.table_id
				}}
				isLoading={isUnassignLoading}
			/>
		</div>
	);
};

export default ReserveTableModal;