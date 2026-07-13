import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiAlertTriangle, FiUser } from "react-icons/fi";
import { chefSettingsApi } from "../../store/chefDetailsSettingsStore";

const ChefDeleteConfirmationModal = ({ isOpen, onClose, chef, restaurantId }) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	// Mutation for deleting chef
	const deleteChefMutation = useMutation({
		mutationFn: (chefId) => chefSettingsApi.deleteChef(chefId),
		onSuccess: () => {
			toast.success(`Chef "${chef?.name}" deleted successfully!`);
			// Invalidate queries to refresh chef list
			queryClient.invalidateQueries(["chefs", restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error("Error deleting chef:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to delete chef. Please try again."
			);
		},
		onSettled: () => {
			setIsDeleting(false);
		},
	});

	const handleDelete = async () => {
		if (!chef?.chef_id) return;

		setIsDeleting(true);
		deleteChefMutation.mutate(chef.chef_id);
	};

	const handleClose = () => {
		if (!isDeleting) {
			onClose();
		}
	};

	if (!isOpen || !chef) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-red-100 rounded-full">
							<FiAlertTriangle size={24} className="text-red-600" />
						</div>
						<h2 className="text-xl font-bold text-white">Delete Chef</h2>
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
						Are you sure you want to delete this chef?
						<br />
						This action cannot be undone.
					</p>

					<div className="bg-gray-700 rounded-xl p-4">
						<div className="flex items-start space-x-3">
							{chef.img_url ? (
								<img
									src={chef.img_url}
									alt={chef.name}
									className="w-12 h-12 rounded-full object-cover"
								/>
							) : (
								<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
									<FiUser size={20} className="text-gray-300" />
								</div>
							)}
							<div className="flex-1">
								<p className="font-medium text-white text-lg">
									{chef.name}
								</p>
								<p className="text-sm text-gray-400">
									{chef.designation}
								</p>
								{chef.information && (
									<p className="text-xs text-gray-500 mt-1 line-clamp-2">
										{chef.information}
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
						{isDeleting ? "Deleting..." : "Delete Chef"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChefDeleteConfirmationModal;