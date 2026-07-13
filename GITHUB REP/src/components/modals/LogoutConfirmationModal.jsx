import { FiX, FiLogOut } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext.jsx";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
	const { colors } = useTheme();
	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
			<div className={`${colors.card} rounded-xl max-w-md w-full p-6 shadow-xl`}>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
							<FiLogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
						</div>
						<h2 className={`text-xl font-semibold ${colors.textPrimary}`}>
							Confirm Logout
						</h2>
					</div>
					<button
						onClick={onClose}
						className={`${colors.textMuted} ${colors.hover} p-2 rounded-xl transition-colors duration-200 hover:cursor-pointer`}
						disabled={isLoading}
					>
						<FiX size={24} className={colors.textMuted} />
					</button>
				</div>

				{/* Content */}
				<div className="mb-6">
					<p className={`${colors.textSecondary}`}>
						Are you sure you want to logout from the manager dashboard?
					</p>
				</div>

				{/* Actions */}
				<div className="flex space-x-3">
					<button
						onClick={onClose}
						disabled={isLoading}
						className={`flex-1 px-4 py-2 border ${colors.border} ${colors.textSecondary} rounded-lg ${colors.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isLoading ? "Logging out..." : "Yes, Logout"}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default LogoutConfirmationModal;
