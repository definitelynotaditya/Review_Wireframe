import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiAlertTriangle, FiAward } from "react-icons/fi";
import { loyaltyClubSettingsApi } from "../../store/loyaltyClubSettingsStore";

const LoyaltyClubDeleteConfirmationModal = ({ isOpen, onClose, loyaltyClub, restaurantId }) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	// Mutation for deleting loyalty club
	const deleteLoyaltyClubMutation = useMutation({
		mutationFn: (loyaltyClubId) => loyaltyClubSettingsApi.deleteLoyaltyClub(loyaltyClubId),
		onSuccess: () => {
			toast.success(`Loyalty Club "${loyaltyClub?.loyalty_club_name}" deleted successfully!`);
			// Invalidate queries to refresh loyalty club list
			queryClient.invalidateQueries(["loyalty-clubs", restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error("Error deleting loyalty club:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to delete loyalty club. Please try again."
			);
		},
		onSettled: () => {
			setIsDeleting(false);
		},
	});

	const handleDelete = async () => {
		if (!loyaltyClub?.loyalty_club_id) return;

		setIsDeleting(true);
		deleteLoyaltyClubMutation.mutate(loyaltyClub.loyalty_club_id);
	};

	const handleClose = () => {
		if (!isDeleting) {
			onClose();
		}
	};

	if (!isOpen || !loyaltyClub) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-red-100 rounded-full">
							<FiAlertTriangle size={24} className="text-red-600" />
						</div>
						<h2 className="text-xl font-bold text-white">Delete Loyalty Club</h2>
					</div>
					<button
						onClick={handleClose}
						disabled={isDeleting}
						className="p-2 hover:bg-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50"
					>
						<FiX size={20} className="text-gray-300" />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-300 mb-4">
						Are you sure you want to delete this loyalty club?
						<br />
						This action cannot be undone.
					</p>

					<div className="bg-gray-700 rounded-xl p-4">
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
								<FiAward size={20} className="text-gray-300" />
							</div>
							<div className="flex-1">
								<p className="font-medium text-white text-lg">
									{loyaltyClub.loyalty_club_name}
								</p>
								{loyaltyClub.description && (
									<p className="text-sm text-gray-400 mt-1 line-clamp-2">
										{loyaltyClub.description}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						type="button"
						onClick={handleClose}
						disabled={isDeleting}
						className="px-6 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						Cancel
					</button>
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isDeleting ? "Deleting..." : "Delete Loyalty Club"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default LoyaltyClubDeleteConfirmationModal;
