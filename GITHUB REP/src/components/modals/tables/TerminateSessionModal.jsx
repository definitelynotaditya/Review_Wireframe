import { FiX, FiAlertTriangle } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext.jsx";

const TerminateSessionModal = ({ isOpen, onClose, onConfirm, table, session, isLoading }) => {
	const { colors } = useTheme();
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className={`${colors.card} rounded-xl max-w-md w-full p-6 shadow-xl`}>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
							<FiAlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
						</div>
						<h2 className={`text-xl font-semibold ${colors.textPrimary}`}>
							Terminate Session
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
						Are you sure you want to terminate this session? This action will end the session without requiring bill payment.
					</p>
					
					<div className={`${colors.secondary} rounded-lg p-4 space-y-2`}>
						<div className="flex justify-between">
							<span className={`text-sm font-medium ${colors.textSecondary}`}>Table Number:</span>
							<span className={`text-sm ${colors.textPrimary}`}>{table?.table_number || 'N/A'}</span>
						</div>
						<div className="flex justify-between">
							<span className={`text-sm font-medium ${colors.textSecondary}`}>Session ID:</span>
							<span className={`text-sm ${colors.textPrimary}`}>{session?.session_id || table?.session_id || 'N/A'}</span>
						</div>
						{session?.guest_name && session.guest_name !== "Walk-in Guest" && (
							<div className="flex justify-between">
								<span className={`text-sm font-medium ${colors.textSecondary}`}>Guest Name:</span>
								<span className={`text-sm ${colors.textPrimary}`}>{session.guest_name}</span>
							</div>
						)}
					</div>
					
					<div className={`mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20`}>
						<p className={`text-orange-700 dark:text-orange-400 text-sm font-medium`}>
							⚠️ Warning: This will terminate the session immediately
						</p>
						<p className={`text-orange-600 dark:text-orange-300 text-xs mt-1`}>
							The table will be marked as vacant and no bill payment will be required.
						</p>
					</div>
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
						className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isLoading ? "Terminating..." : "Yes, Terminate"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default TerminateSessionModal;
