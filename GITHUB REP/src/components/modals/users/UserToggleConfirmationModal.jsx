import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { userApi } from "../../../store/userStore.js";
import { useTheme } from "../../../context/ThemeContext.jsx";

const UserToggleConfirmationModal = ({ isOpen, onClose, user, restaurantId }) => {
	const { colors } = useTheme();
	const [isToggling, setIsToggling] = useState(false);
	const queryClient = useQueryClient();

	// Mutation for toggling user active status
	const toggleUserMutation = useMutation({
		mutationFn: ({ user_id, isActive }) => 
			userApi.toggleUser(user_id, isActive),
		onSuccess: (data) => {
			const newStatus = data.user.active;
			toast.success(
				`User "${user?.username}" ${newStatus ? 'activated' : 'deactivated'} successfully!`
			);
			// Invalidate queries to refresh user list
			queryClient.invalidateQueries(['restaurant-users', restaurantId]);
			queryClient.invalidateQueries(['restaurant', restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error('Error toggling user:', error);
			toast.error(error.response?.data?.message || 'Failed to toggle user status. Please try again.');
		},
		onSettled: () => {
			setIsToggling(false);
		},
	});

	const handleToggle = async () => {
		if (!user?.user_id) return;
		
		setIsToggling(true);
		// Toggle to opposite of current state
		toggleUserMutation.mutate({
			user_id: user.user_id,
			isActive: !user.active
		});
	};

	const handleClose = () => {
		if (!isToggling) {
			onClose();
		}
	};

	if (!isOpen || !user) return null;

	const isCurrentlyActive = user.active;
	const actionWord = isCurrentlyActive ? "Deactivate" : "Activate";
	const actionColor = isCurrentlyActive ? "bg-gray-500 hover:bg-gray-600" : "bg-green-600 hover:bg-green-700";

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className={`${colors.card} rounded-2xl p-8 w-full max-w-md mx-4`}>
				<div className="flex items-center justify-between mb-6">
					<h2 className={`text-xl font-bold ${colors.textPrimary}`}>
						{actionWord} User
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
								Are you sure you want to <strong>deactivate</strong> this user?
								<br />
								They will no longer be able to access the system.
							</>
						) : (
							<>
								Are you sure you want to <strong>activate</strong> this user?
								<br />
								They will regain access to the system.
							</>
						)}
					</p>
					
					<div className={`${colors.secondary} rounded-xl p-4`}>
						<div className="flex items-center space-x-3">
							<img
								src={user.img_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=6b7280&color=ffffff`}
								alt={user.username}
								className="w-12 h-12 rounded-full object-cover"
							/>
							<div>
								<p className={`font-medium ${colors.textPrimary} text-lg`}>
									{user.username}
								</p>
								<p className={`text-sm ${colors.textMuted}`}>
									{user.role === 'admin' ? 'Manager' : user.role || 'Unknown'} • Server Code: {user.server_code}
								</p>
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

export default UserToggleConfirmationModal;