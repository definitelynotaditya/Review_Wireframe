import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiLink,
    //  FiUnlink
     } from "react-icons/fi";
import toast from "react-hot-toast";
import { tableApi } from "../../../store/manageTablesStore.js";
import { useTheme } from "../../../context/ThemeContext.jsx";

const MergeTablesModal = ({ isOpen, onClose, selectedTables, restaurantId, actionType = "merge" }) => {
	const { colors } = useTheme();
	const queryClient = useQueryClient();

	// Merge tables mutation
	const mergeTablesMutation = useMutation({
		mutationFn: () => tableApi.mergeTables(selectedTables),
		onSuccess: (data) => {
			toast.success(data.message || "Tables merged successfully!");
			queryClient.invalidateQueries(["restaurant-tables"]);
			onClose();
		},
		onError: (error) => {
			console.error("Merge tables failed:", error);
			const errorMessage =
				error.response?.data?.error ||
				error.response?.data?.message ||
				error.message ||
				"Failed to merge tables";
			toast.error(errorMessage);
		},
	});

	// Unmerge table mutation
	const unmergeTableMutation = useMutation({
		mutationFn: ({ restaurant_id, merged_table_id }) => 
			tableApi.unmergeTable(restaurant_id, merged_table_id),
		onSuccess: (data) => {
			toast.success(data.message || "Table unmerged successfully!");
			queryClient.invalidateQueries(["restaurant-tables"]);
			onClose();
		},
		onError: (error) => {
			console.error("Unmerge table failed:", error);
			const errorMessage =
				error.response?.data?.error ||
				error.response?.data?.message ||
				error.message ||
				"Failed to unmerge table";
			toast.error(errorMessage);
		},
	});

	const handleMerge = () => {
		if (selectedTables.length < 2) {
			toast.error("Please select at least 2 tables to merge");
			return;
		}
		mergeTablesMutation.mutate();
	};

	const handleUnmerge = () => {
		if (selectedTables.length !== 1 || !selectedTables[0].is_merged) {
			toast.error("Please select exactly one merged table to unmerge");
			return;
		}
		const table = selectedTables[0];
		unmergeTableMutation.mutate({
			restaurant_id: restaurantId,
			merged_table_id: table.table_id
		});
	};

	const getTotalCapacity = () => {
		return selectedTables.reduce((total, table) => total + table.capacity, 0);
	};

	const getTableNumbers = () => {
		return selectedTables.map(table => table.table_number).join(", ");
	};

	if (!isOpen) return null;

	const isLoading = mergeTablesMutation.isPending || unmergeTableMutation.isPending;

	return (
		<div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className={`${colors.card} rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className={`text-xl font-semibold ${colors.textPrimary}`}>
						{actionType === "merge" ? "Merge Tables" : "Unmerge Table"}
					</h2>
					<button
						onClick={onClose}
						className={`${colors.textMuted} ${colors.hover} transition-colors hover:cursor-pointer`}
						disabled={isLoading}
					>
						<FiX size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="space-y-4">
					{actionType === "merge" ? (
						<>
							<div className="bg-blue-50 p-4 rounded-lg">
								<h3 className="font-medium text-blue-900 mb-2">
									Selected Tables for Merge
								</h3>
								<div className="space-y-2">
									{selectedTables.map((table) => (
										<div key={table.table_id} className="flex justify-between items-center">
											<span className="text-blue-800 ">
												{table.table_number} ({table.sitting_area})
											</span>
											<span className="text-sm text-blue-600 ">
												{table.capacity} seats
											</span>
										</div>
									))}
								</div>
							</div>

							<div className="bg-green-50 p-4 rounded-lg">
								<h3 className="font-medium text-green-900 mb-2">
									Merge Result
								</h3>
								<p className="text-green-800 text-sm">
									Tables {getTableNumbers()} will be merged with total capacity of{" "}
									<strong>{getTotalCapacity()} seats</strong>
								</p>
							</div>

							{/* <div className="bg-amber-50  p-4 rounded-lg">
								<p className="text-amber-800 text-sm">
									⚠️ After merging, the selected tables will become one larger table. This action cannot be easily undone.
								</p>
							</div> */}
						</>
					) : (
						<>
							<div className="bg-orange-50 dark:bg-slate-700 p-4 rounded-lg">
								<h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
									Table to Unmerge
								</h3>
								{selectedTables.length > 0 && (
									<div className="space-y-2">
										<div className="flex justify-between items-center">
											<span className="text-orange-800 dark:text-orange-200">
												{selectedTables[0].table_number} ({selectedTables[0].sitting_area})
											</span>
											<span className="text-sm text-orange-600 dark:text-orange-200">
												{selectedTables[0].capacity} seats
											</span>
										</div>
										{selectedTables[0].merged_from && (
											<p className="text-sm text-orange-700 dark:text-orange-300">
												Originally merged from {selectedTables[0].merged_from.length} tables
											</p>
										)}
									</div>
								)}
							</div>

							{/* <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
								<p className="text-amber-800  text-sm">
									⚠️ Unmerging will restore the original individual tables that were merged.
								</p>
							</div> */}
						</>
					)}
				</div>

				{/* Actions */}
				<div className="flex space-x-3 mt-6">
					<button
						onClick={onClose}
						className={`flex-1 px-4 py-2 text-gray-900 bg-gray-300 hover:cursor-pointer rounded-lg transition-colors`}
						disabled={isLoading}
					>
						Cancel
					</button>
					<button
						onClick={actionType === "merge" ? handleMerge : handleUnmerge}
						disabled={
							isLoading || 
							selectedTables.length === 0 || 
							(actionType === "merge" && selectedTables.length < 2) ||
							(actionType === "unmerge" && (selectedTables.length !== 1 || !selectedTables[0]?.is_merged))
						}
						className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:cursor-pointer"
					>
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<>
								{actionType === "merge" ? <FiLink size={16} /> : <FiLink size={18} />}
								<span>{actionType === "merge" ? "Merge Tables" : "Unmerge Table"}</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MergeTablesModal;