import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { tableApi } from "../../../store/manageTablesStore";
import { useTheme } from "../../../context/ThemeContext.jsx";

const TableUpdateModal = ({ isOpen, onClose, table, restaurantId }) => {
	const { colors } = useTheme();
	const [formData, setFormData] = useState({
		table_number: "",
		sitting_area: "",
		capacity: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const queryClient = useQueryClient();

	// Utility function to capitalize first letter of each word
	const capitalizeWords = (str) => {
		if (!str) return '';
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	// Fetch sitting areas
	const { data: sittingAreasData, isLoading: isLoadingSittingAreas } = useQuery({
		queryKey: ["sitting-areas", restaurantId],
		queryFn: () => tableApi.fetchSittingAreas(restaurantId),
		enabled: isOpen && !!restaurantId,
	});

	const sittingAreas = sittingAreasData?.sittingAreas || [];

	// Populate form data when table prop changes
	useEffect(() => {
		if (table) {
			setFormData({
				table_number: table.table_number || "",
				sitting_area: table.sitting_area || "",
				capacity: table.capacity || "",
			});
		}
	}, [table]);

	// Mutation for updating table
	const updateTableMutation = useMutation({
		mutationFn: tableApi.updateTable,
		onSuccess: (data) => {
			toast.success(`Table ${data.data.table_number} updated successfully!`);
			// Invalidate queries to refresh table list
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["restaurant", restaurantId]);
			onClose();
			resetForm();
		},
		onError: (error) => {
			console.error("Error updating table:", error);
			if (error.response?.data?.error === "Table number already exists") {
				toast.error("Table number already exists. Please use a different table number.");
			} else {
				toast.error(
					error.response?.data?.message ||
						"Failed to update table. Please try again."
				);
			}
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const resetForm = () => {
		setFormData({
			table_number: "",
			sitting_area: "",
			capacity: "",
		});
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateForm = () => {
		if (!formData.table_number.trim()) {
			toast.error("Table number is required!");
			return false;
		}
		if (!formData.sitting_area.trim()) {
			toast.error("Sitting area is required!");
			return false;
		}
		if (!formData.capacity || parseInt(formData.capacity) < 1) {
			toast.error("Capacity must be at least 1!");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		// Prepare data according to API specification
		const tableData = {
			restaurantId: restaurantId,
			table_id: table.table_id,
			restaurant_id: restaurantId,
			table_number: formData.table_number.trim(),
			sitting_area: formData.sitting_area.trim(),
			capacity: parseInt(formData.capacity),
		};

		updateTableMutation.mutate(tableData);
	};

	const handleClose = () => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className={`${colors.card} rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
				<div className="flex items-center justify-between mb-6">
					<h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
						Update Table
					</h2>
					<button
						onClick={handleClose}
						className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textMuted} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Table Number
							</label>
							<input
								type="text"
								name="table_number"
								value={formData.table_number}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="e.g., T01, A-5, etc."
								required
								disabled={isSubmitting}
							/>
						</div>
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Sitting Area
							</label>
							<select
								name="sitting_area"
								value={formData.sitting_area}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								required
							disabled={isSubmitting || isLoadingSittingAreas}
						>
							<option value="">
								{isLoadingSittingAreas ? "Loading..." : "Select sitting area"}
							</option>
							{sittingAreas.map((area) => (
								<option key={area.sitting_area_id} value={area.area_name}>
									{capitalizeWords(area.area_name)}
								</option>
							))}
							</select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6">
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Capacity
							</label>
							<input
								type="number"
								name="capacity"
								value={formData.capacity}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Number of guests"
								min="1"
								max="20"
								required
								disabled={isSubmitting}
							/>
						</div>
					</div>

					<div className={`flex justify-end space-x-4 pt-6 border-t ${colors.border}`}>
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-3 bg-[#B69549] text-white font-bold rounded-xl hover:cursor-pointer transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Updating Table..." : "Update Table"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TableUpdateModal;