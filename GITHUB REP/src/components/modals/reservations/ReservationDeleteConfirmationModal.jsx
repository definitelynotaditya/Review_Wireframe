
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiX, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { reservationApi } from "../../../store/reservationStore";
import { useTheme } from "../../../context/ThemeContext.jsx";

const ReservationDeleteConfirmationModal = ({ isOpen, onClose, reservation }) => {
	const { colors, isDark, isLight } = useTheme();
	const queryClient = useQueryClient();

	// Mutation for deleting reservation
	const deleteReservationMutation = useMutation({
		mutationFn: () => reservationApi.deleteReservation(reservation?.reservation_id),
		onSuccess: () => {
			toast.success("Reservation deleted successfully!");
			// Invalidate queries to refresh reservations list
			queryClient.invalidateQueries(["reservations"]);
			onClose();
		},
		onError: (error) => {
			console.error("Delete reservation failed:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to delete reservation";
			toast.error(errorMessage);
		},
	});

	const handleDelete = () => {
		if (reservation?.reservation_id) {
			deleteReservationMutation.mutate();
		}
	};

	const handleClose = () => {
		if (!deleteReservationMutation.isPending) {
			onClose();
		}
	};

	if (!isOpen || !reservation) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div 
				className={`rounded-2xl p-6 w-full max-w-md ${colors.card} ${colors.textPrimary}`}
				
			>
				<div className="flex items-center justify-between mb-6">
					<h2 
						className="text-xl font-bold flex items-center"
						style={{ color: colors.textPrimary }}
					>
						<FiAlertTriangle className="text-red-500 mr-2" size={24} />
						Delete Reservation
					</h2>
					<button
						onClick={handleClose}
						className="p-2 rounded-xl hover:cursor-pointer transition-colors duration-200"
						style={{
							backgroundColor: colors.background,
						}}
						onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
						onMouseLeave={(e) => e.target.style.backgroundColor = colors.background}
						disabled={deleteReservationMutation.isPending}
					>
						<FiX size={20} style={{ color: colors.textSecondary }} />
					</button>
				</div>

				{/* Reservation Details */}
				<div className={`mb-6 rounded-xl ${isDark ? 'bg-slate-700' : isLight ? 'bg-gray-200' : ''}`}>
					<div 
						className="rounded-xl p-4 mb-4"
						style={{
							backgroundColor: colors.background,
						}}
					>
						<h3 
							className="font-semibold mb-2"
							style={{ color: colors.textPrimary }}
						>
							{reservation.guest_name || "Guest"}
						</h3>
						<div 
							className="space-y-1 text-sm"
							style={{ color: colors.textSecondary }}
						>
							<p>Guests: {reservation.number_of_pax}</p>
							{reservation.contact && <p>Contact: {reservation.contact}</p>}
							{reservation.email && <p>Email: {reservation.email}</p>}
							<p>Date: {reservation.reservation_date ? new Date(reservation.reservation_date).toLocaleDateString() : "N/A"}</p>
							<p>Time: {reservation.in_time || "N/A"}{reservation.out_time ? ` - ${reservation.out_time}` : ""}</p>
							<p>Type: {reservation.reservation_type}</p>
							<p>Status: {reservation.reservation_status}</p>
						</div>
					</div>

					{/* <div 
						className="rounded-xl p-4"
						style={{
							backgroundColor: 'rgba(239, 68, 68, 0.1)',
							border: '1px solid rgba(239, 68, 68, 0.3)',
						}}
					>
						<div className="flex items-start space-x-3">
							<FiTrash2 className="text-red-400 mt-1" size={18} />
							<div>
								<h4 className="text-red-400 font-medium mb-1">
									Are you sure you want to delete this reservation?
								</h4>
								<p className="text-red-300 text-sm">
									This action cannot be undone. The reservation will be permanently removed from your system.
								</p>
							</div>
						</div>
					</div> */}
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
					<button
						type="button"
						onClick={handleClose}
						disabled={deleteReservationMutation.isPending}
						className="w-full sm:w-auto px-6 py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 hover:cursor-pointer"
						onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
						onMouseLeave={(e) => e.target.style.backgroundColor = colors.background}
					>
						No
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={deleteReservationMutation.isPending}
						className="w-full sm:w-auto px-6 py-3 font-bold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:cursor-pointer"
						style={{
							backgroundColor: '#dc2626',
							color: 'white',
						}}
						onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
						onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
					>
						{deleteReservationMutation.isPending ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Deleting...</span>
							</>
						) : (
							<>
								<FiTrash2 size={16} />
								<span>Yes</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReservationDeleteConfirmationModal;