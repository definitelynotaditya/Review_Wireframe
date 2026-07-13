import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeContext";
import { reservationApi } from "../../../store/reservationStore";

const MakeVacantConfirmationModal = ({
	isOpen,
	onClose,
	table,
	restaurantId,
	onMadeVacant,
}) => {
	const { colors } = useTheme();
	const queryClient = useQueryClient();

	const makeVacantMutation = useMutation({
		mutationFn: () => reservationApi.cancelReservation(table?.reservation_id),
		onSuccess: () => {
			toast.success(`Table ${table?.table_number} is now vacant`);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["reservations"]);
			onClose();
			onMadeVacant?.();
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to make table vacant",
			);
		},
	});

	const handleConfirm = () => {
		if (!table?.reservation_id) {
			toast.error("Missing reservation information");
			return;
		}
		makeVacantMutation.mutate();
	};

	const handleClose = () => {
		if (!makeVacantMutation.isPending) {
			onClose();
		}
	};

	if (!isOpen || !table) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className={`${colors.card} rounded-2xl p-6 w-full max-w-md`}>
				<div className="flex items-center justify-between mb-6">
					<h2 className={`text-xl font-bold flex items-center ${colors.textPrimary}`}>
						<FiAlertTriangle className="text-red-500 mr-2" size={22} />
						Make Table Vacant
					</h2>
					<button
						onClick={handleClose}
						disabled={makeVacantMutation.isPending}
						className={`p-2 rounded-xl ${colors.hover} transition-colors duration-200 hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textSecondary} />
					</button>
				</div>

				<div className="mb-6">
					<p className={`${colors.textPrimary} mb-2`}>
						Are you sure you want to make table {table?.table_number} vacant ?
						<br />
						The reservation will be marked as cancelled.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row justify-end gap-3">
					<button
						type="button"
						onClick={handleClose}
						disabled={makeVacantMutation.isPending}
						className={`px-6 py-3 rounded-xl border ${colors.border} ${colors.textSecondary} ${colors.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={makeVacantMutation.isPending}
						className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{makeVacantMutation.isPending ? "Making Vacant..." : "Yes, Make Vacant"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MakeVacantConfirmationModal;
