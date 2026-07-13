import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthStore } from "../../../store/authStore";
import { sessionApi } from "../../../store/sessionStore";
import { luxegenieApi } from "../../../store/luxegenieStore";
import { reservationApi } from "../../../store/reservationStore";
import {
	FiX,
	FiActivity,
	FiDollarSign,
	FiCheck,
	FiClock,
	FiBookOpen,
	FiHelpCircle,
	FiUser,
	FiEdit2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Loader from "../../common/Loader";
import TerminateSessionModal from "./TerminateSessionModal";
import UnassignLuxegenieModal from "../UnassignLuxegenieModal";
import MakeVacantConfirmationModal from "./MakeVacantConfirmationModal";
import UpdateReservationModal from "../reservations/UpdateReservationModal";
import { formatDistanceToNow } from "date-fns";
import { IoBatteryCharging, IoRestaurant } from "react-icons/io5";
import { BsEmojiSmileFill, BsPersonRaisedHand } from "react-icons/bs";
import { BiSolidDish } from "react-icons/bi";
import {
	TbAlertTriangleFilled,
	TbCreditCard,
	TbReceiptDollar,
	TbReceipt,
} from "react-icons/tb";
import { AiFillStar } from "react-icons/ai";
import { PiSmileySadBold } from "react-icons/pi";
import { BiTransfer } from "react-icons/bi";

const BillRequestAndSessionDetailsModal = ({
	isOpen,
	onClose,
	table,
	restaurantId,
}) => {
	const { colors, isDark } = useTheme();
	const [billAmount, setBillAmount] = useState("");
	const [isEnteringBill, setIsEnteringBill] = useState(false);
	const [isEditingBill, setIsEditingBill] = useState(false);
	const [isInEditMode, setIsInEditMode] = useState(false);
	const [editBillAmount, setEditBillAmount] = useState("");
	const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
	const [isUnassigning, setIsUnassigning] = useState(false);
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [showUnassignModal, setShowUnassignModal] = useState(false);
	const [showMakeVacantModal, setShowMakeVacantModal] = useState(false);
	const [showPowerbankCollectModal, setShowPowerbankCollectModal] =
		useState(false);
	const [isTerminating, setIsTerminating] = useState(false);
	const [isIssuingPowerbank, setIsIssuingPowerbank] = useState(false);
	const [localPowerbankIssued, setLocalPowerbankIssued] = useState(
		table?.is_powerbank_issued || false,
	);
	const [roomNumberInput, setRoomNumberInput] = useState("");
	const [localRoomNumber, setLocalRoomNumber] = useState(
		table?.room_number || "",
	);
	const [showEditReservationModal, setShowEditReservationModal] =
		useState(false);

	const queryClient = useQueryClient();

	const { theme } = useTheme();

	useEffect(() => {
		setLocalPowerbankIssued(table?.is_powerbank_issued || false);
	}, [table?.is_powerbank_issued]);
	const { restaurant } = useAuthStore();

	console.log(table);
	console.log(table?.session_id);

	// Fetch session activities
	const {
		data: sessionData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["sessionActivities", restaurantId, table?.session_id],
		queryFn: () =>
			sessionApi.getSessionActivities(restaurantId, table?.session_id),
		enabled: isOpen && !!table?.session_id && !!restaurantId,
		// refetchInterval: 10000, // Refresh every 30 seconds
	});

	// Extract session and activities from the response
	const session = sessionData?.session;
	const activities = sessionData?.activities || [];

	// Fetch reservation details for the edit modal
	const { data: reservationDetails } = useQuery({
		queryKey: ["reservationDetails", table?.reservation_id],
		queryFn: () =>
			reservationApi.getReservationDetails(table?.reservation_id),
		enabled: isOpen && !!table?.reservation_id,
		select: (data) => data?.data || data,
	});

	// Update room number mutation
	const updateRoomNumberMutation = useMutation({
		mutationFn: ({ reservationId, roomNumber }) =>
			reservationApi.updateRoomNumber(reservationId, roomNumber),
		onSuccess: () => {
			toast.success("Room number saved");
			setLocalRoomNumber(roomNumberInput.trim());
			setRoomNumberInput("");
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			queryClient.invalidateQueries({
				queryKey: ["restaurant-tables", restaurantId],
			});
		},
		onError: () => {
			toast.error("Failed to save room number");
		},
	});

	const handleSaveRoomNumber = () => {
		if (!roomNumberInput.trim()) {
			toast.error("Please enter a room number");
			return;
		}
		updateRoomNumberMutation.mutate({
			reservationId: table?.reservation_id,
			roomNumber: roomNumberInput.trim(),
		});
	};

	// Enter bill amount mutation
	const enterBillMutation = useMutation({
		mutationFn: ({ restaurantId, sessionId, amount }) =>
			sessionApi.enterBillAmount(restaurantId, sessionId, amount),
		onMutate: () => {
			setIsEnteringBill(true);
		},
		onSuccess: (response) => {
			toast.success(
				response.message || "Bill amount entered successfully!",
			);
			setBillAmount("");
			// Invalidate tables query to refresh the data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			refetch(); // Refresh activities
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to enter bill amount",
			);
		},
		onSettled: () => {
			setIsEnteringBill(false);
		},
	});

	// Edit bill amount mutation
	const editBillMutation = useMutation({
		mutationFn: ({ restaurantId, sessionId, amount }) =>
			sessionApi.editBillAmount(restaurantId, sessionId, amount),
		onMutate: () => {
			setIsEditingBill(true);
		},
		onSuccess: (response) => {
			toast.success(
				response.message || "Bill amount updated successfully!",
			);
			setEditBillAmount("");
			setIsInEditMode(false);
			// Invalidate tables query to refresh the data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			refetch(); // Refresh activities
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to update bill amount",
			);
		},
		onSettled: () => {
			setIsEditingBill(false);
		},
	});

	// Confirm payment mutation
	const confirmPaymentMutation = useMutation({
		mutationFn: ({ restaurantId, sessionId }) =>
			sessionApi.confirmBillPayment(restaurantId, sessionId),
		onMutate: () => {
			setIsConfirmingPayment(true);
		},
		onSuccess: (response) => {
			toast.success(
				response.message || "Payment confirmed successfully!",
			);
			// Invalidate tables query to refresh the data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			refetch(); // Refresh activities
			onClose(); // Close modal after confirming payment
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to confirm payment",
			);
		},
		onSettled: () => {
			setIsConfirmingPayment(false);
		},
	});

	// Unassign luxegenie mutation
	const unassignMutation = useMutation({
		mutationFn: (assignmentData) =>
			luxegenieApi.unassignFromTable(assignmentData),
		onMutate: () => {
			setIsUnassigning(true);
		},
		onSuccess: () => {
			toast.success("LUXEGENIE unassigned successfully!");
			// Invalidate queries to refresh the data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			onClose(); // Close modal after unassigning
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to unassign LuxeGenie",
			);
		},
		onSettled: () => {
			setIsUnassigning(false);
		},
	});

	// Terminate session mutation
	const terminateSessionMutation = useMutation({
		mutationFn: ({ sessionId, restaurantId }) =>
			sessionApi.terminateSession(sessionId, restaurantId),
		onMutate: () => {
			setIsTerminating(true);
		},
		onSuccess: (response) => {
			toast.success(
				response.message || "Session terminated successfully!",
			);
			// Invalidate tables query to refresh the data
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			setShowTerminateModal(false);
			onClose(); // Close the main modal
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to terminate session",
			);
		},
		onSettled: () => {
			setIsTerminating(false);
		},
	});

	// Issue / collect powerbank mutation
	const issuePowerbankMutation = useMutation({
		mutationFn: ({ restaurantId, tableId, sessionId, status }) =>
			sessionApi.issuePowerbank(restaurantId, tableId, sessionId, status),
		onMutate: () => {
			setIsIssuingPowerbank(true);
		},
		onSuccess: (response) => {
			toast.success(response.message || "Powerbank status updated!");
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			refetch();
			const isCollectingPowerbank =
				table?.bill_request && table?.is_powerbank_issued;
			if (isCollectingPowerbank) {
				setLocalPowerbankIssued(false);
			} else {
				onClose();
			}
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to update powerbank status",
			);
		},
		onSettled: () => {
			setIsIssuingPowerbank(false);
		},
	});

	const handleIssuePowerbank = () => {
		const newStatus = !table.is_powerbank_issued;
		issuePowerbankMutation.mutate({
			restaurantId,
			tableId: table.table_id,
			sessionId: table.session_id,
			status: newStatus,
		});
	};

	const billEntryBlocked = table?.bill_request && localPowerbankIssued;

	const roomNumberRequired =
		session?.payment_method?.toLowerCase().includes("room") &&
		!localRoomNumber;

	const handleOpenPowerbankCollectModal = () => {
		setShowPowerbankCollectModal(true);
	};

	const handleClosePowerbankCollectModal = () => {
		setShowPowerbankCollectModal(false);
	};

	// Handle enter bill amount
	const handleEnterBillAmount = () => {
		if (billEntryBlocked) {
			handleOpenPowerbankCollectModal();
			return;
		}

		if (roomNumberRequired) {
			toast.error("Please add the room number first.");
			return;
		}

		if (!billAmount || parseFloat(billAmount) <= 0) {
			toast.error("Please enter a valid bill amount");
			return;
		}

		enterBillMutation.mutate({
			restaurantId,
			sessionId: table.session_id,
			amount: billAmount,
		});
	};

	// Handle edit bill amount
	const handleEditBillAmount = () => {
		if (billEntryBlocked) {
			handleOpenPowerbankCollectModal();
			return;
		}

		if (roomNumberRequired) {
			toast.error("Please add the room number first.");
			return;
		}

		if (!editBillAmount || parseFloat(editBillAmount) <= 0) {
			toast.error("Please enter a valid bill amount");
			return;
		}

		editBillMutation.mutate({
			restaurantId,
			sessionId: table.session_id,
			amount: editBillAmount,
		});
	};

	// Handle start editing
	const handleStartEdit = () => {
		setEditBillAmount(session?.bill_amount || "");
		setIsInEditMode(true);
	};

	// Handle cancel edit
	const handleCancelEdit = () => {
		setEditBillAmount("");
		setIsInEditMode(false);
	};

	// Handle confirm payment
	const handleConfirmPayment = () => {
		confirmPaymentMutation.mutate({
			restaurantId,
			sessionId: table.session_id,
		});
	};

	// Handle unassign luxegenie - show confirmation modal
	const handleUnassignLuxegenie = () => {
		if (!table?.table_id || !table?.luxegenie_device_id) {
			toast.error("Missing table or device information");
			return;
		}
		setShowUnassignModal(true);
	};

	// Confirm unassign luxegenie
	const handleConfirmUnassignLuxegenie = () => {
		const assignmentData = {
			restaurant_id: restaurantId.toString(),
			table_id: table.table_id.toString(),
			device_id: table.luxegenie_device_id.toString(),
		};

		unassignMutation.mutate(assignmentData);
		setShowUnassignModal(false);
	};

	// Close unassign modal
	const handleCloseUnassignModal = () => {
		setShowUnassignModal(false);
	};

	// Handle terminate session
	const handleTerminateSession = () => {
		setShowTerminateModal(true);
	};

	const handleOpenMakeVacantModal = () => {
		if (!table?.reservation_id) {
			toast.error("No reservation found for this table");
			return;
		}
		setShowMakeVacantModal(true);
	};

	const handleCloseMakeVacantModal = () => {
		setShowMakeVacantModal(false);
	};

	// Confirm terminate session
	const handleConfirmTerminate = () => {
		if (!table?.session_id) {
			toast.error("Invalid session information");
			return;
		}

		terminateSessionMutation.mutate({
			sessionId: table.session_id,
			restaurantId: restaurantId,
		});
	};

	// Close terminate modal
	const handleCloseTerminateModal = () => {
		setShowTerminateModal(false);
	};

	// Get activity icon and details
	const getActivityDetails = (activityType) => {
		switch (activityType) {
			case "physical_menu_request":
				return {
					icon: IoRestaurant,
					color: "text-blue-500",
					bgColor: "bg-blue-500/10",
					borderColor: "border-blue-500/20",
				};
			case "tap_for_service":
				return {
					icon: BsPersonRaisedHand,
					color: "text-orange-500",
					bgColor: "bg-orange-500/10",
					borderColor: "border-orange-500/20",
				};
			case "chef_special_request":
				return {
					icon: BiSolidDish,
					color: isDark ? "text-yellow-300" : "text-yellow-700",
					bgColor: "bg-yellow-500/10",
					borderColor: "border-yellow-500/20",
				};
			case "managers_attention":
				return {
					icon: TbAlertTriangleFilled,
					color: isDark ? "text-red-500" : "text-red-700",
					bgColor: "bg-red-500/10",
					borderColor: "border-red-500/20",
				};
			case "power_bank_request":
				return {
					icon: IoBatteryCharging,
					color: isDark ? "text-indigo-400" : "text-indigo-700",
					bgColor: "bg-indigo-500/10",
					borderColor: "border-indigo-500/20",
				};
			case "happy_feedback":
				return {
					icon: BsEmojiSmileFill,
					color: isDark ? "text-lime-400" : "text-lime-700",
					bgColor: "bg-lime-500/10",
					borderColor: "border-lime-500/20",
				};
			case "unhappy_feedback":
				return {
					icon: PiSmileySadBold,
					color: isDark ? "text-pink-400" : "text-pink-600",
					bgColor: "bg-pink-500/10",
					borderColor: "border-pink-500/20",
				};
			case "session_transfer":
				return {
					icon: BiTransfer,
					color: isDark ? "text-cyan-400" : "text-cyan-600",
					bgColor: "bg-cyan-500/10",
					borderColor: "border-cyan-500/20",
				};
			case "rating_submitted":
				return {
					icon: AiFillStar,
					color: isDark ? "text-amber-400" : "text-amber-600",
					bgColor: "bg-amber-500/10",
					borderColor: "border-amber-500/20",
				};
			case "bill_request":
				return {
					icon: TbReceipt,
					color: isDark ? "text-green-500" : "text-green-700",
					bgColor: "bg-green-500/10",
					borderColor: "border-green-500/20",
				};
			case "payment_status_update":
				return {
					icon: TbCreditCard,
					color: isDark ? "text-emerald-400" : "text-emerald-700",
					bgColor: "bg-emerald-500/10",
					borderColor: "border-emerald-500/20",
				};
			case "bill_amount_update":
				return {
					icon: TbReceiptDollar,
					color: isDark ? "text-green-500" : "text-green-700",
					bgColor: "bg-green-500/10",
					borderColor: "border-green-500/20",
				};
			default:
				return {
					icon: FiActivity,
					color: "text-gray-500",
					bgColor: "bg-gray-500/10",
					borderColor: "border-gray-500/20",
				};
		}
	};

	// Check if bill amount is already entered from session data
	const billAmountEntered =
		session?.bill_amount && parseFloat(session.bill_amount) > 0;

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className={`${colors.card} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-none ${colors.shadow}`}
			>
				{/* Header */}
				<div
					className={`flex items-center justify-between p-6 border-b ${colors.border}`}
				>
					<div>
						<h2
							className={`text-xl font-bold ${colors.textPrimary}`}
						>
							Session Details
						</h2>
						<p className={`text-sm ${colors.textSecondary} mt-1`}>
							Table {table?.table_number || "Unknown"} • Session{" "}
							{table?.session_id}
						</p>
					</div>
					<button
						onClick={onClose}
						className={`p-2 rounded-lg ${colors.hover} transition-colors hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textSecondary} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Action Buttons */}
					<div className="mb-6 flex flex-col lg:flex-row gap-3">
						{/* Unassign Luxegenie Button */}
						{table?.is_luxegenie_assigned && (
							<button
								onClick={handleUnassignLuxegenie}
								disabled={isUnassigning}
								className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center justify-center space-x-2"
							>
								{isUnassigning ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Unassigning...</span>
									</>
								) : (
									<span>
										Unassign LUXEGENIE from{" "}
										{table?.table_number}
									</span>
								)}
							</button>
						)}

						{table?.table_status?.toLowerCase() === "occupied" &&
							table?.reservation_id &&
							!table.session_id && (
								<button
									onClick={handleOpenMakeVacantModal}
									className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl hover:cursor-pointer transition-colors flex items-center justify-center space-x-2"
								>
									<span>Make Vacant</span>
								</button>
							)}

						{/* Terminate Session Button */}
						{table.session_id && (
							<button
								onClick={handleTerminateSession}
								disabled={isTerminating}
								className="px-6 py-2 bg-yellow-600  disabled:bg-orange-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center justify-center space-x-2"
							>
								{isTerminating ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Terminating...</span>
									</>
								) : (
									<span>Terminate Session</span>
								)}
							</button>
						)}

						{/* Issue Powerbank — customer has requested, not yet issued */}
						{table.session_id &&
							table.power_bank_request &&
							!localPowerbankIssued && (
								<button
									onClick={handleIssuePowerbank}
									disabled={isIssuingPowerbank}
									className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center justify-center space-x-2"
								>
									{isIssuingPowerbank ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Issuing...</span>
										</>
									) : (
										<>
											<IoBatteryCharging size={18} />
											<span>Issue Powerbank</span>
										</>
									)}
								</button>
							)}

						{/* Collect Powerbank — powerbank was issued, need to collect it back */}
						{table.session_id && localPowerbankIssued && (
							<div className="flex flex-col gap-1">
								{table?.bill_request &&
									roomNumberRequired &&
									!isLoading && (
										<p className="text-xs text-yellow-400">
											Add room number first (see Bill
											Management below)
										</p>
									)}
								<button
									onClick={handleIssuePowerbank}
									disabled={
										isIssuingPowerbank ||
										(table?.bill_request &&
											(isLoading || roomNumberRequired))
									}
									className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl hover:cursor-pointer transition-colors flex items-center justify-center space-x-2"
								>
									{isIssuingPowerbank ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Collecting...</span>
										</>
									) : table?.bill_request && isLoading ? (
										<span>Loading...</span>
									) : (
										<>
											<IoBatteryCharging size={18} />
											<span>Collect Powerbank</span>
										</>
									)}
								</button>
							</div>
						)}
					</div>

					{/* Guest Name */}
					<h3
						className={`text-lg  font-semibold ${colors.textPrimary} mb-2 flex items-center gap-4`}
					>
						<span>
							Guest:{" "}
							<span
								className={
									theme === "dark"
										? "luxegenie-gradient"
										: "text-yellow-700"
								}
							>
								{session?.guest_name}
							</span>
						</span>
						{/* Edit Reservation Button */}
						{table?.reservation_id && (
							<button
								onClick={() =>
									setShowEditReservationModal(true)
								}
								disabled={!reservationDetails}
								className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 hover:cursor-pointer"
								title="Edit reservation"
							>
								<FiEdit2 size={16} /> 
							</button>
						)}
					</h3>

					{/* Bill Management Section - Only show if bill is requested */}
					{table?.bill_request && (
						<div
							className={`${colors.cardBg} rounded-xl py-4 mb-6`}
						>
							<h3
								className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}
							>
								<FiDollarSign
									size={20}
									className="mr-2 text-green-500"
								/>
								Bill Management
							</h3>

							{session?.payment_method
								?.toLowerCase()
								.includes("room") &&
								!localRoomNumber && (
									<div className="mb-4 p-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10">
										<p
											className={`text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-3`}
										>
											Guest selected{" "}
											<strong>
												{session.payment_method}
											</strong>{" "}
											but no room number is on record.
											Please add the room number before
											entering the bill.
										</p>
										<div className="flex flex-col md:flex-row gap-2">
											<input
												type="text"
												placeholder="Enter room number"
												value={roomNumberInput}
												onChange={(e) =>
													setRoomNumberInput(
														e.target.value,
													)
												}
												className={`flex-1 px-4 py-2 rounded-xl border ${colors.border} ${colors.input} focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`}
											/>
											<button
												onClick={handleSaveRoomNumber}
												disabled={
													updateRoomNumberMutation.isPending ||
													!roomNumberInput.trim()
												}
												className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
											>
												{updateRoomNumberMutation.isPending
													? "Saving..."
													: "Save"}
											</button>
										</div>
									</div>
								)}

							{!billAmountEntered ? (
								/* Enter Bill Amount */
								<div className="space-y-4">
									<div>
										<label
											className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
										>
											Enter Bill Amount
										</label>
										<div className="space-y-3">
											<input
												type="number"
												min="0"
												step="0.01"
												placeholder={
													billEntryBlocked
														? "Collect powerbank before entering bill"
														: roomNumberRequired
															? "Add room number first"
															: "Enter amount"
												}
												value={billAmount}
												onChange={(e) =>
													setBillAmount(
														e.target.value,
													)
												}
												disabled={roomNumberRequired}
												className={`w-full px-4 py-2 rounded-xl border ${colors.border} ${colors.input} focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${roomNumberRequired ? "cursor-not-allowed opacity-70" : ""}`}
											/>
											<button
												onClick={handleEnterBillAmount}
												disabled={
													isEnteringBill ||
													!billAmount ||
													roomNumberRequired
												}
												className="w-full px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
											>
												{isEnteringBill ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>
															Submitting...
														</span>
													</>
												) : (
													<>
														<FiCheck size={16} />
														<span>Submit</span>
													</>
												)}
											</button>
										</div>
									</div>
								</div>
							) : (
								/* Confirm Payment or Edit Bill */
								<div className="space-y-4">
									{!isInEditMode ? (
										/* Display Bill Amount with Edit Option */
										<>
											<div
												className={`p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20`}
											>
												<div className="flex items-center justify-between">
													<div>
														<p
															className={`text-green-700 dark:text-green-400 text-sm font-medium`}
														>
															✓ Bill amount:{" "}
															{
																restaurant?.currency_notation
															}
															{
																session?.bill_amount
															}{" "}
															has been entered.
														</p>
														<p
															className={`text-green-600 dark:text-green-300 text-xs mt-1`}
														>
															Ready for payment
															confirmation.
														</p>
													</div>
													{!session?.is_bill_paid && (
														<button
															onClick={
																handleStartEdit
															}
															className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
															title="Edit bill amount"
														>
															<FiEdit2
																size={18}
															/>
														</button>
													)}
												</div>
											</div>
											<button
												onClick={handleConfirmPayment}
												disabled={
													isConfirmingPayment ||
													session?.is_bill_paid
												}
												className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2"
											>
												{isConfirmingPayment ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>
															Confirming...
														</span>
													</>
												) : session?.is_bill_paid ? (
													<>
														<FiCheck size={16} />
														<span>
															Payment Confirmed
														</span>
													</>
												) : (
													<>
														<FiCheck size={16} />
														<span>
															Payment Received
														</span>
													</>
												)}
											</button>
										</>
									) : (
										/* Edit Bill Amount Form */
										<div className="space-y-4">
											<div>
												<label
													className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
												>
													Edit Bill Amount
												</label>
												<div className="space-y-3">
													<input
														type="number"
														min="0"
														step="0.01"
														placeholder="Enter new amount"
														value={editBillAmount}
														onChange={(e) =>
															setEditBillAmount(
																e.target.value,
															)
														}
														className={`w-full px-4 py-2 rounded-xl border ${colors.border} ${colors.input} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
													/>
													<div className="flex flex-col sm:flex-row gap-3">
														<button
															onClick={
																handleEditBillAmount
															}
															disabled={
																isEditingBill ||
																!editBillAmount
															}
															className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
														>
															{isEditingBill ? (
																<>
																	<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
																	<span>
																		Updating...
																	</span>
																</>
															) : (
																<>
																	<FiCheck
																		size={
																			16
																		}
																	/>
																	<span>
																		Update
																	</span>
																</>
															)}
														</button>
														<button
															onClick={
																handleCancelEdit
															}
															disabled={
																isEditingBill
															}
															className={`flex-1 px-6 py-2.5 rounded-xl ${colors.button} ${colors.textSecondary} hover:${colors.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Session Activities */}
					<div className={`${colors.cardBg} rounded-xl `}>
						<h3
							className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}
						>
							<FiActivity size={20} className="mr-2" />
							Session Activities
						</h3>

						{isLoading ? (
							<Loader />
						) : error ? (
							<div className="text-center py-8">
								<div className="text-red-500 mb-2">
									<FiX size={48} className="mx-auto" />
								</div>
								<p className="text-red-600 font-medium">
									Failed to load session activities
								</p>
								<p
									className={`text-sm ${colors.textMuted} mt-1`}
								>
									{error.message}
								</p>
							</div>
						) : activities.length > 0 ? (
							<div className="space-y-3 max-h-96 overflow-y-auto scrollbar-none">
								{activities.map((activity) => {
									const details = getActivityDetails(
										activity.activity_type,
									);
									const IconComponent = details.icon;
									const timeAgo = formatDistanceToNow(
										new Date(
											activity.activity_data.timestamp,
										),
										{ addSuffix: true },
									);
									const exactTime = new Date(
										activity.activity_data.timestamp,
									).toLocaleString(undefined, {
										hour: "2-digit",
										minute: "2-digit",
										hour12: true,
									});

									return (
										<div
											key={activity.activity_id}
											className={`${colors.cardBg} rounded-xl px-2 py-3 border ${isDark ? "border-gray-700" : "border-gray-300"} hover:shadow-lg transition-all duration-200`}
										>
											<div className="flex items-start space-x-3">
												{/* Activity Icon (Colored Background Like RecentActivities) */}
												<div
													className={`p-2.5 rounded-xl ${details.bgColor} border ${details.borderColor} flex-shrink-0`}
												>
													<IconComponent
														className={`w-4 h-4 ${details.color}`}
													/>
												</div>

												{/* Activity Content */}
												<div className="flex-1 min-w-0">
													<p
														className={`${colors.textPrimary} text-sm font-medium leading-snug`}
													>
														{activity.activity_data
															?.activity ||
															"No activity description"}
													</p>

													<div className="flex items-center space-x-2 mt-1">
														<FiClock
															size={12}
															className={
																colors.textMuted
															}
														/>
														<div className="flex items-center space-x-2">
															<span
																className={`text-xs ${colors.textMuted}`}
															>
																{exactTime}
															</span>
															<p
																className={`text-xs ${colors.textMuted}`}
															>
																•
															</p>
															<p
																className={`text-xs ${colors.textMuted}`}
															>
																{timeAgo}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center py-8">
								<FiActivity
									size={48}
									className={`${colors.textMuted} mx-auto mb-2`}
								/>
								<p className={`text-sm ${colors.textMuted}`}>
									No session activities yet
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div
					className={`flex items-center justify-end space-x-3 p-6 border-t ${colors.border}`}
				>
					<button
						onClick={onClose}
						className={`px-6 py-2 rounded-xl ${colors.button} ${colors.textSecondary} hover:${colors.buttonHover} transition-colors hover:cursor-pointer`}
					>
						Close
					</button>
				</div>
			</div>

			{showPowerbankCollectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
					<div
						className={`${colors.card} rounded-2xl w-full max-w-md p-6 ${colors.shadow}`}
						role="dialog"
						aria-modal="true"
						aria-labelledby="powerbank-collect-title"
					>
						<h3
							id="powerbank-collect-title"
							className={`text-xl font-semibold ${colors.textPrimary} mb-3`}
						>
							Collect Powerbank First
						</h3>
						<p className={`text-sm ${colors.textSecondary} mb-6`}>
							The customer has an issued powerbank. Please collect
							the powerbank before entering the bill amount.
						</p>
						<button
							onClick={handleClosePowerbankCollectModal}
							className={`px-6 py-2 rounded-xl ${colors.button} ${colors.textSecondary} hover:${colors.buttonHover} transition-colors`}
						>
							OK
						</button>
					</div>
				</div>
			)}

			{/* Terminate Session Confirmation Modal */}
			<TerminateSessionModal
				isOpen={showTerminateModal}
				onClose={handleCloseTerminateModal}
				onConfirm={handleConfirmTerminate}
				table={table}
				session={session}
				isLoading={isTerminating}
			/>

			{/* Unassign LuxeGenie Confirmation Modal */}
			<UnassignLuxegenieModal
				isOpen={showUnassignModal}
				onClose={handleCloseUnassignModal}
				onConfirm={handleConfirmUnassignLuxegenie}
				device={{
					device_id: table?.luxegenie_device_id,
					serial_number: table?.luxegenie_serial_number || "Unknown",
					assigned_to_table_no: table?.table_number,
					assigned_to_sitting_area: table?.sitting_area,
					table_id: table?.table_id,
				}}
				isLoading={isUnassigning}
			/>

			<MakeVacantConfirmationModal
				isOpen={showMakeVacantModal}
				onClose={handleCloseMakeVacantModal}
				table={table}
				restaurantId={restaurantId}
				onMadeVacant={onClose}
			/>

			<UpdateReservationModal
				isOpen={showEditReservationModal}
				onClose={() => setShowEditReservationModal(false)}
				reservation={reservationDetails}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["restaurant-tables", restaurantId] });
					onClose();
				}}
			/>
		</div>
	);
};

export default BillRequestAndSessionDetailsModal;
