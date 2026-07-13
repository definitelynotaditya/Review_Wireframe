import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiImage } from "react-icons/fi";
import { chefSpecialsApi } from "../../../store/chefSpecialsStore.js";
import { useTheme } from "../../../context/ThemeContext.jsx";
import { useAuthStore } from "../../../store/authStore";

const ToggleChefSpecialConfirmationModal = ({ isOpen, onClose, chefSpecial, restaurantId }) => {
	const { colors } = useTheme();
	const [isToggling, setIsToggling] = useState(false);
	const queryClient = useQueryClient();
	const { restaurant } = useAuthStore();

	// Mutation for toggling chef special active status
	const toggleChefSpecialMutation = useMutation({
		mutationFn: ({ chefSpecialId, isActive }) => 
			chefSpecialsApi.toggleChefSpecial(chefSpecialId, isActive),
		onSuccess: (data) => {
			const newStatus = data.data.active;
			toast.success(
				`Chef special "${chefSpecial?.dish_name}" ${newStatus ? 'activated' : 'deactivated'} successfully!`
			);
			// Invalidate queries to refresh chef specials list
			queryClient.invalidateQueries(["chef-specials", restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error("Error toggling chef special:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to toggle chef special status. Please try again."
			);
		},
		onSettled: () => {
			setIsToggling(false);
		},
	});

	const handleToggle = async () => {
		if (!chefSpecial?.chef_special_id) return;

		setIsToggling(true);
		// Toggle to opposite of current state
		toggleChefSpecialMutation.mutate({
			chefSpecialId: chefSpecial.chef_special_id,
			isActive: !chefSpecial.active
		});
	};

	const handleClose = () => {
		if (!isToggling) {
			onClose();
		}
	};

	// Format price for display
	const formatPrice = (price) => {
		return parseFloat(price).toFixed(2);
	};

	if (!isOpen || !chefSpecial) return null;

	const isCurrentlyActive = chefSpecial.active;
	const actionWord = isCurrentlyActive ? "Deactivate" : "Activate";
	const actionColor = isCurrentlyActive ? "bg-gray-500 hover:bg-gray-600" : "bg-green-600 hover:bg-green-700";

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className={`${colors.card} rounded-2xl p-8 w-full max-w-md mx-4`}>
				<div className="flex items-center justify-between mb-6">
					<h2 className={`text-xl font-bold ${colors.textPrimary}`}>
						{actionWord} Chef Special
					</h2>
					<button
						onClick={handleClose}
						disabled={isToggling}
						className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 disabled:opacity-50 hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textMuted} />
					</button>
				</div>

				<div className="mb-6">
					<p className={`${colors.textSecondary} mb-4`}>
						{isCurrentlyActive ? (
							<>
								Are you sure you want to <strong>deactivate</strong> this chef special?
								<br />
								It will no longer be visible to customers in the Luxegenie app.
							</>
						) : (
							<>
								Are you sure you want to <strong>activate</strong> this chef special?
								<br />
								It will become visible to customers in the Luxegenie app.
							</>
						)}
					</p>

					<div className={`${colors.secondary} rounded-xl p-4`}>
						<div className="flex items-start space-x-3">
							{chefSpecial.dish_img ? (
								<img
									src={chefSpecial.dish_img}
									alt={chefSpecial.dish_name}
									className="w-20 h-16 rounded-lg object-cover"
								/>
							) : (
								<div className={`w-20 h-16 ${colors.background} rounded-lg flex items-center justify-center`}>
									<FiImage size={20} className={colors.textMuted} />
								</div>
							)}
							<div className="flex-1">
								<div className="flex items-start justify-between mb-2">
									<p className={`font-semibold ${colors.textPrimary} text-lg`}>
										{chefSpecial.dish_name}
									</p>
								</div>
								<div className="flex items-center justify-between">
									<span className={`text-sm ${colors.textSecondary}`}>
										{chefSpecial.menu_category_name}
									</span>
									<span className={`text-lg font-bold ${colors.textPrimary}`}>
										{restaurant?.currency_notation}{formatPrice(chefSpecial.dish_price)}
									</span>
								</div>
								<div className="mt-2">
									<span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
										chefSpecial.veg_nonveg === 'veg' 
											? 'bg-green-200 text-green-800' 
											: 'bg-red-200 text-red-800'
									}`}>
										{chefSpecial.veg_nonveg === 'veg' ? 'Veg' : 'Non-Veg'}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						type="button"
						onClick={handleClose}
						disabled={isToggling}
						className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						Cancel
					</button>
					<button
						onClick={handleToggle}
						disabled={isToggling}
						className={`px-6 py-3 ${actionColor} text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						{isToggling ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
								<span>Processing...</span>
							</>
						) : (
							<span>{actionWord}</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ToggleChefSpecialConfirmationModal;