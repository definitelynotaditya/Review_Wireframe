import { FiX, FiAlertCircle } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext.jsx";
import toast from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";

const RebootConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	device,
	isLoading,
}) => {
	const { colors } = useTheme();
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div
				className={`${colors.card} rounded-xl max-w-md w-full p-6 shadow-xl`}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
							<FiAlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<h2
							className={`text-xl font-semibold ${colors.textPrimary}`}
						>
							Reboot Device
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
						Are you sure you want to reboot this LUXEGENIE device?
					</p>

					{device && (
						<div
							className={`${colors.secondary} rounded-lg p-4 space-y-2`}
						>
							<div className="flex justify-between">
								<span
									className={`text-sm font-medium ${colors.textSecondary}`}
								>
									Device ID :
								</span>
								<span
									className={`text-sm ${colors.textPrimary}`}
								>
									{device.device_id}
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={`text-sm font-medium ${colors.textSecondary}`}
								>
									Serial Number:
								</span>
								<span
									className={`text-sm ${colors.textPrimary}`}
								>
									{device.serial_number}
								</span>
							</div>
							{device.assigned_to_table_no && (
								<div className="flex justify-between">
									<span
										className={`text-sm font-medium ${colors.textSecondary}`}
									>
										Assigned To:
									</span>
									<span
										className={`text-sm ${colors.textPrimary}`}
									>
										Table {device.assigned_to_table_no} (
										{device.assigned_to_sitting_area})
									</span>
								</div>
							)}
						</div>
					)}

					<p className={`text-sm ${colors.textMuted} mt-3`}>
						The device will restart and may be temporarily
						unavailable.
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
						onClick={
							device.assigned_to_table_no
								? () =>
										toast(
											"Cannot reboot device assigned to a table",
											{
												icon: (
													<FaInfoCircle size={20} />
												),
												style: {
													color: "#008236", // blue-600
													border: "1px solid #008236",
												},
											},
										)
								: onConfirm
						}
						disabled={isLoading}
						className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isLoading ? "Rebooting..." : "Yes, Reboot"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default RebootConfirmationModal;
