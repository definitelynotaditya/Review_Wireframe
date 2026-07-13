import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiAlertTriangle, FiHome } from "react-icons/fi";
import { tableApi } from "../../../store/manageTablesStore";
import { useTheme } from "../../../context/ThemeContext.jsx";

const TableDeleteConfirmationModal = ({ isOpen, onClose, table, restaurantId }) => {
	const { colors } = useTheme();
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	// Mutation for deleting table
	const deleteTableMutation = useMutation({
		mutationFn: (data) => tableApi.deleteTable(data.restaurantId, data.table_id),
		onSuccess: () => {
			toast.success(`Table ${table?.table_number} deleted successfully!`);
			// Invalidate queries to refresh table list
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["restaurant", restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error("Error deleting table:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to delete table. Please try again."
			);
		},
		onSettled: () => {
			setIsDeleting(false);
		},
	});

	const handleDelete = async () => {
		if (!table?.table_id) return;

		setIsDeleting(true);
		deleteTableMutation.mutate({
			restaurantId: restaurantId,
			table_id: table.table_id,
		});
	};

	const handleClose = () => {
		if (!isDeleting) {
			onClose();
		}
	};

	if (!isOpen || !table) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className={`${colors.card} rounded-2xl p-8 w-full max-w-md mx-4`}>
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-red-100 rounded-full">
							<FiAlertTriangle size={24} className="text-red-600" />
						</div>
						<h2 className={`text-xl font-bold ${colors.textPrimary}`}>Delete Table</h2>
					</div>
					<button
						onClick={handleClose}
						disabled={isDeleting}
						className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 disabled:opacity-50 hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textMuted} />
					</button>
				</div>

				<div className="mb-6">
					<p className={`${colors.textSecondary} mb-4`}>
						Are you sure you want to delete this table?
						<br />
						This action cannot be undone.
					</p>

					<div className={`${colors.secondary} rounded-xl p-4`}>
						<div className="flex items-center space-x-3">
							<div className={`w-12 h-12 ${colors.button} rounded-full flex items-center justify-center`}>
								<FiHome size={20} className={colors.textMuted} />
							</div>
							<div>
								<p className={`font-medium ${colors.textPrimary} text-lg`}>
									{table.table_number}
								</p>
								<p className={`text-sm ${colors.textSecondary}`}>
									{table.sitting_area} • Capacity: {table.capacity} guests
									{table.type && ` • Type: ${table.type}`}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						type="button"
						onClick={handleClose}
						disabled={isDeleting}
						className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						No
					</button>
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isDeleting ? "Deleting..." : "Yes"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default TableDeleteConfirmationModal;