import { FiX, FiAlertCircle } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext.jsx";

const ShutdownAllConfirmationModal = ({ isOpen, onClose, onConfirm, deviceCount, isLoading }) => {
	const { colors } = useTheme();
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className={`${colors.card} rounded-xl max-w-md w-full p-6 shadow-xl`}>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
							<FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<h2 className={`text-xl font-semibold ${colors.textPrimary}`}>
							Shutdown All Devices
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
					<p className={`${colors.textSecondary} mb-4`}>
						Are you sure you want to shutdown all LUXEGENIE's ?
					</p>
					
					{/* <div className={`${colors.secondary} rounded-lg p-4 space-y-2`}>
						<div className="flex justify-between">
							<span className={`text-sm font-medium ${colors.textSecondary}`}>Total Devices:</span>
							<span className={`text-sm ${colors.textPrimary}`}>{deviceCount}</span>
						</div>
					</div> */}
					
					<p className={`text-sm ${colors.textMuted} mt-3`}>
						All devices will be powered off and will need to be manually restarted.
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
						className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isLoading ? "Shutting down..." : "Yes, Shutdown All"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ShutdownAllConfirmationModal;
