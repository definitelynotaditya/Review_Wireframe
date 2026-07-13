import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	// FiUsers,
	FiLink,
	//  FiUnlink,
	FiCheck,
	FiX,
	FiChevronDown,
	FiChevronUp,
} from "react-icons/fi";
import { IoMdBatteryCharging } from "react-icons/io";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout.jsx";
import { tableApi } from "../store/manageTablesStore.js";
import { tablesApi } from "../store/tablesStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useTheme } from "../context/ThemeContext.jsx";
import ReserveTableModal from "../components/modals/tables/ReserveTableModal.jsx";
import MergeTablesModal from "../components/modals/tables/MergeTablesModal.jsx";
import TableReservationDetailsAndDeallotModal from "../components/modals/tables/TableReservationDetailsAndDeallotModal.jsx";
import BillRequestAndSessionDetailsModal from "../components/modals/tables/BillRequestAndSessionDetailsModal.jsx";
import Loader from "../components/common/Loader.jsx";
import luxegenie2 from "/luxegenie2.png";

const Tables = () => {
	const { user } = useAuthStore();
	const { colors, isDark } = useTheme();
	const restaurantId = user?.restaurant_id;
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedSittingArea, setSelectedSittingArea] = useState("All");
	const [showReserveModal, setShowReserveModal] = useState(false);
	const [selectedTable, setSelectedTable] = useState(null);
	const [showReservationDetailsModal, setShowReservationDetailsModal] =
		useState(false);
	const [showBillSessionModal, setShowBillSessionModal] = useState(false);

	// Collapsible sections state
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	// Table selection and merge states
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedTables, setSelectedTables] = useState([]);
	const [showMergeModal, setShowMergeModal] = useState(false);
	const [mergeActionType, setMergeActionType] = useState("merge");

	const capitalizeWords = (str) => {
		if (!str) return "";
		return str
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const queryClient = useQueryClient();

	// Fetch tables for this restaurant
	const {
		data: tablesData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["restaurant-tables", restaurantId],
		queryFn: () => tableApi.fetchRestaurantTables(restaurantId),
		enabled: !!restaurantId,
		// refetchInterval: 50000, // Refetch every 10 seconds for live updates
	});

	// Reserve All Tables
	const reserveAllMutation = useMutation({
		mutationFn: () => tablesApi.reserveAll(restaurantId),
		onSuccess: (data) => {
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			toast.success(`${data?.reserved_count ?? "All"} tables reserved successfully!`);
		},
		onError: () => {
			toast.error("Failed to reserve all tables. Please try again.");
		},
	});

	// Unreserve All Tables
	const unreserveAllMutation = useMutation({
		mutationFn: () => tablesApi.unreserveAll(restaurantId),
		onSuccess: (data) => {
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			toast.success(`${data?.unreserved_count ?? "All"} tables unreserved successfully!`);
		},
		onError: () => {
			toast.error("Failed to unreserve all tables. Please try again.");
		},
	});

	// Extract tables and grouped data
	const tables = tablesData?.tables || [];
	const groupedBySittingArea = tablesData?.groupedBySittingArea || {};

	// Handle table click
	const handleTableClick = (table) => {
		if (isSelectionMode) {
			// In selection mode, toggle table selection
			toggleTableSelection(table);
		} else {
			// Check table status to determine which modal to open
			const tableStatus = table.table_status?.toLowerCase();

			if (tableStatus === "vacant" || tableStatus === "reserved") {
				// For vacant and reserved tables, open reserve modal
				setSelectedTable(table);
				setShowReserveModal(true);
			} else if (tableStatus === "alloted") {
				// For alloted tables, open reservation details modal
				setSelectedTable(table);
				setShowReservationDetailsModal(true);
			} else if (tableStatus === "occupied") {
				// For occupied tables, open bill request and session details modal
				setSelectedTable(table);
				setShowBillSessionModal(true);
			}
		}
	};

	// Toggle table selection
	const toggleTableSelection = (table) => {
		setSelectedTables((prev) => {
			const isSelected = prev.some((t) => t.table_id === table.table_id);
			if (isSelected) {
				return prev.filter((t) => t.table_id !== table.table_id);
			} else {
				return [...prev, table];
			}
		});
	};

	// Start merge mode
	const startMergeMode = () => {
		setIsSelectionMode(true);
		setSelectedTables([]);
	};

	// Cancel merge mode
	const cancelMergeMode = () => {
		setIsSelectionMode(false);
		setSelectedTables([]);
	};

	// Open merge modal
	const openMergeModal = (actionType = "merge") => {
		setMergeActionType(actionType);
		setShowMergeModal(true);
	};

	// Close merge modal
	const closeMergeModal = () => {
		setShowMergeModal(false);
		setIsSelectionMode(false);
		setSelectedTables([]);
	};

	// Check if table is selected
	const isTableSelected = (table) => {
		return selectedTables.some((t) => t.table_id === table.table_id);
	};

	// Handle modal close
	const handleCloseModal = () => {
		setShowReserveModal(false);
		setSelectedTable(null);
	};

	// Handle reservation details modal close
	const handleCloseReservationDetailsModal = () => {
		setShowReservationDetailsModal(false);
		setSelectedTable(null);
	};

	// Handle bill session modal close
	const handleCloseBillSessionModal = () => {
		setShowBillSessionModal(false);
		setSelectedTable(null);
	};

	// Filter tables based on selected status and sitting area (excluding merged tables)
	const regularTables = tables.filter((table) => !table.is_merged);
	const mergedTables = tables.filter((table) => table.is_merged);

	const filteredTables = regularTables.filter((table) => {
		const isActiveTable = !!table.session_id;
		const isOccupiedWithoutSession =
			table.table_status === "occupied" && !isActiveTable;

		// Filter by status
		const statusMatch =
			selectedStatus === "All" ||
			(selectedStatus === "Active"
				? isActiveTable
				: selectedStatus === "Occupied"
					? isOccupiedWithoutSession
				: selectedStatus === "Available"
					? table.table_status === "vacant"
					: table.table_status === selectedStatus.toLowerCase());

		// Filter by sitting area
		const areaMatch =
			selectedSittingArea === "All" ||
			table.sitting_area === selectedSittingArea;

		return statusMatch && areaMatch;
	});

	// Sort tables by priority
	// Priority Order: occupied(critical_requests) > occupied(other_requests) > occupied > alloted > reserved > vacant
	const sortedFilteredTables = [...filteredTables].sort((a, b) => {
		// Helper function to determine priority level
		const getPriority = (table) => {
			const status = table.table_status?.toLowerCase();

			// Case 4 (Highest Priority): Occupied with critical requests
			// bill_request, managers_attention, chef_special_request
			if (status === "occupied") {
				const hasCriticalRequest =
					table.bill_request ||
					table.managers_attention ||
					table.chef_special_request;

				if (hasCriticalRequest) {
					// Sub-priority within critical requests
					if (table.bill_request) return 1; // Bill request is most critical
					if (table.managers_attention) return 2; // Manager attention is second
					if (table.chef_special_request) return 3; // Chef special is third
				}

				// Case 3 (Second Priority): Occupied with other service requests
				// physical_menu_request, powerbank_request, tap_for_service
				const hasOtherRequest =
					table.physical_menu_request ||
					table.powerbank_request ||
					table.tap_for_service;

				if (hasOtherRequest) return 4;

				// Case 2 (Third Priority): Occupied tables with luxegenie assigned
				if (table.is_luxegenie_assigned) return 5;

				// Regular occupied tables
				return 6;
			}

			// Case 5: Alloted tables
			if (status === "alloted") {
				// Alloted tables with luxegenie get higher priority
				if (table.is_luxegenie_assigned) return 7;
				return 8;
			}

			// Case 6: Reserved tables
			if (status === "reserved") {
				// Reserved tables with luxegenie get higher priority
				if (table.is_luxegenie_assigned) return 9;
				return 10;
			}

			// Case 1: Vacant tables
			if (status === "vacant") {
				// Vacant tables with luxegenie assigned get higher priority
				if (table.is_luxegenie_assigned) return 11;
				return 12;
			}

			// Default (lowest priority)
			return 999;
		};

		const priorityA = getPriority(a);
		const priorityB = getPriority(b);

		// Lower priority number = higher importance (shown first)
		return priorityA - priorityB;
	});

	// Get available sitting areas
	const getSittingAreas = () => {
		const areas = Object.keys(groupedBySittingArea).filter(
			(area) => area !== "All",
		);
		// Sort areas by non-merged table count descending
		areas.sort((a, b) => {
			const countA = (groupedBySittingArea[a] || []).filter(
				(t) => !t.is_merged,
			).length;
			const countB = (groupedBySittingArea[b] || []).filter(
				(t) => !t.is_merged,
			).length;
			return countB - countA;
		});
		return ["All", ...areas];
	};

	// Get sitting area counts
	const getSittingAreaCounts = () => {
		const counts = { All: regularTables.length };
		Object.entries(groupedBySittingArea).forEach(([area, areaTables]) => {
			// Only count non-merged tables
			const nonMergedTables = areaTables.filter(
				(table) => !table.is_merged,
			);
			counts[area] = nonMergedTables.length;
		});
		return counts;
	};

	// Get status counts for tabs (excluding merged tables, filtered by sitting area)
	const getStatusCounts = () => {
		// Filter regular tables by selected sitting area first
		const areaFilteredTables =
			selectedSittingArea === "All"
				? regularTables
				: regularTables.filter(
						(table) => table.sitting_area === selectedSittingArea,
					);

		const activeTables = areaFilteredTables.filter((t) => !!t.session_id);
		const occupiedWithoutSessionTables = areaFilteredTables.filter(
			(t) => t.table_status === "occupied" && !t.session_id,
		);

		const counts = {
			All: areaFilteredTables.length,
			Active: activeTables.length,
			Occupied: occupiedWithoutSessionTables.length,
			Alloted: areaFilteredTables.filter(
				(t) => t.table_status === "alloted",
			).length,
			Reserved: areaFilteredTables.filter(
				(t) => t.table_status === "reserved",
			).length,
			Vacant: areaFilteredTables.filter(
				(t) => t.table_status === "vacant",
			).length,
		};
		return counts;
	};

	// Get status color for cards
	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "vacant":
				return "bg-yellow-600 text-white";
			case "reserved":
				return "bg-purple-700 text-white";
			case "occupied":
				return "bg-blue-500 text-white";
			case "active":
				return "bg-green-500 text-white";
			case "alloted":
				return "bg-red-500 text-white";
			default:
				return "bg-gray-500 text-white";
		}
	};

	// Format status text for display
	const getStatusTabColor = (status, isSelected) => {
		if (isSelected) {
			return "bg-[#B69549] text-white shadow-lg";
		}

		// Status-specific background colors for unselected tabs
		return "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300";
	};

	const formatStatusText = (status) => {
		switch (status?.toLowerCase()) {
			case "vacant":
				return "VACANT";
			case "reserved":
				return "RESERVED";
			case "occupied":
				return "OCCUPIED";
			case "active":
				return "ACTIVE";
			case "alloted":
				return "ALLOTED";
			default:
				return status?.toUpperCase() || "UNKNOWN";
		}
	};

	const statusCounts = getStatusCounts();
	const sittingAreas = getSittingAreas();
	const sittingAreaCounts = getSittingAreaCounts();

	// Loading state
	if (isLoading) {
		return (
			<Layout
				title="Tables"
				subtitle="Allot tables and manage seating arrangements"
			>
				<Loader />
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout
				title="Tables"
				subtitle="Allot tables and manage seating arrangements"
			>
				<div className="flex justify-center items-center h-64">
					<div className={`${colors.textPrimary}`}>
						Error loading tables: {error.message}
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout title="Tables" subtitle="See luxegenie assignments">
			<div className="space-y-6 z-0">
				{/* Collapsible Filters Section */}
				<div
					className={`${colors.card} rounded-xl border ${colors.border} overflow-hidden`}
				>
					{/* Header - Always Visible */}
					<button
						onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
						className={`w-full px-4 py-3 flex items-center justify-between ${colors.hover} transition-colors hover:cursor-pointer`}
					>
						<div className="flex items-center space-x-3">
							<h3
								className={`text-lg font-semibold ${colors.textPrimary}`}
							>
								Filters & Management
							</h3>
							<span className={`text-sm ${colors.textMuted}`}>
								{isFiltersExpanded
									? "Click to collapse"
									: "Click to expand"}
							</span>
						</div>
						{isFiltersExpanded ? (
							<FiChevronUp
								size={20}
								className={colors.textPrimary}
							/>
						) : (
							<FiChevronDown
								size={20}
								className={colors.textPrimary}
							/>
						)}
					</button>

					{/* Collapsible Content */}
					{isFiltersExpanded && (
						<div
							className={`px-4 pb-4 space-y-4 border-t ${isDark ? "border-gray-700" : "border-gray-300"} pt-4`}
						>
							{/* Table Management Controls */}
							<div>
								{/* Desktop Layout */}
								<div className="hidden md:flex items-center justify-between gap-4">
									<h4
										className={`text-base font-medium ${colors.textSecondary}`}
									>
										Table Management
									</h4>
									<div className="flex items-center space-x-3">
										{!isSelectionMode ? (
											<button
												onClick={startMergeMode}
												className={`px-4 py-2 bg-[#B69549] text-white hover:cursor-pointer rounded-lg transition-colors flex items-center space-x-2`}
											>
												<FiLink size={16} />
												<span>Merge Tables</span>
											</button>
										) : (
											<>
												<span
													className={`${colors.textPrimary} font-medium`}
												>
													Selection Mode (
													{selectedTables.length}{" "}
													selected)
												</span>
												<button
													onClick={() =>
														openMergeModal("merge")
													}
													disabled={
														selectedTables.length <
														2
													}
													className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
												>
													<FiLink size={16} />
													<span>
														Merge (
														{selectedTables.length})
													</span>
												</button>
												<button
													onClick={() =>
														openMergeModal(
															"unmerge",
														)
													}
													disabled={
														selectedTables.length !==
															1 ||
														!selectedTables[0]
															?.is_merged
													}
													className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
												>
													<span>Unmerge</span>
												</button>
												<button
													onClick={cancelMergeMode}
													className={`px-4 py-2 ${colors.buttonSecondary} rounded-lg transition-colors flex items-center space-x-2`}
												>
													<FiX size={16} />
													<span>Cancel</span>
												</button>
											</>
										)}
									</div>
								</div>

								{/* Mobile Layout */}
								<div className="md:hidden space-y-3">
									{!isSelectionMode ? (
										<div className="flex justify-center">
											<button
												onClick={startMergeMode}
												className={`px-6 py-3 ${colors.button} rounded-lg transition-colors flex items-center space-x-2 w-full max-w-xs`}
											>
												<FiLink size={16} />
												<span>Merge Tables</span>
											</button>
										</div>
									) : (
										<div className="space-y-3">
											<div className="text-center">
												<span
													className={`${colors.textPrimary} font-medium text-sm`}
												>
													Selection Mode (
													{selectedTables.length}{" "}
													selected)
												</span>
											</div>

											<div className="grid grid-cols-1 gap-2">
												<button
													onClick={() =>
														openMergeModal("merge")
													}
													disabled={
														selectedTables.length <
														2
													}
													className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
												>
													<FiLink size={16} />
													<span>
														Merge (
														{selectedTables.length})
													</span>
												</button>

												<div className="grid grid-cols-2 gap-2">
													<button
														onClick={() =>
															openMergeModal(
																"unmerge",
															)
														}
														disabled={
															selectedTables.length !==
																1 ||
															!selectedTables[0]
																?.is_merged
														}
														className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
													>
														<span>Unmerge</span>
													</button>
													<button
														onClick={
															cancelMergeMode
														}
														className={`px-3 py-2 ${colors.buttonSecondary} rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm`}
													>
														<FiX size={16} />
														<span>Cancel</span>
													</button>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Sitting Area Tabs */}
							<div>
								<h4
									className={`text-sm font-medium ${colors.textSecondary} mb-2`}
								>
									Sitting Area
								</h4>
								{/* Desktop & Tablet Tabs */}
								<div className="hidden sm:flex flex-wrap gap-2">
									{sittingAreas.map((area) => {
										const areaCount =
											sittingAreaCounts[area] || 0;
										return (
											<button
												key={area}
												onClick={() => {
													setSelectedSittingArea(
														area,
													);
													setSelectedStatus("All");
												}}
												className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${getStatusTabColor(
													area,
													selectedSittingArea ===
														area,
												)}`}
											>
												{capitalizeWords(area)} (
												{areaCount})
											</button>
										);
									})}
								</div>

								{/* Mobile Tabs */}
								<div className="sm:hidden overflow-x-auto scrollbar-none">
									<div className="flex space-x-2 min-w-max py-2">
										{sittingAreas.map((area) => {
											const areaCount =
												sittingAreaCounts[area] || 0;
											return (
												<button
													key={area}
													onClick={() => {
														setSelectedSittingArea(
															area,
														);
														setSelectedStatus(
															"All",
														);
													}}
													className={`px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${getStatusTabColor(
														area,
														selectedSittingArea ===
															area,
													)}`}
												>
													{capitalizeWords(area)} (
													{areaCount})
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* Status Tabs */}
							<div>
								<h4
									className={`text-sm font-medium ${colors.textSecondary} mb-2`}
								>
									Table Status
								</h4>
								{/* Desktop & Tablet Tabs */}
								<div className="hidden sm:flex flex-wrap gap-2">
									{Object.entries(statusCounts).map(
										([status, count]) => (
											<button
												key={status}
												onClick={() =>
													setSelectedStatus(status)
												}
												className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${getStatusTabColor(
													status,
													selectedStatus === status,
												)}`}
											>
												{status} ({count})
											</button>
										),
									)}
								</div>

								{/* Mobile Tabs */}
								<div className="sm:hidden overflow-x-auto scrollbar-none">
									<div className="flex space-x-2 min-w-max py-2">
										{Object.entries(statusCounts).map(
											([status, count]) => (
												<button
													key={status}
													onClick={() =>
														setSelectedStatus(
															status,
														)
													}
													className={`px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${getStatusTabColor(
														status,
														selectedStatus ===
															status,
													)}`}
												>
													{status} ({count})
												</button>
											),
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Tables Grid */}
				<div className="space-y-4 z-[-1]">
					<div className="flex items-center justify-between">
						<h3
							className={`text-lg md:text-xl font-semibold ${colors.textPrimary}`}
						>
							{selectedSittingArea === "All" &&
							selectedStatus === "All"
								? "All Tables"
								: selectedSittingArea === "All"
									? `${capitalizeWords(selectedStatus)} Tables`
									: selectedStatus === "All"
										? `${capitalizeWords(selectedSittingArea)} Tables`
										: `${capitalizeWords(selectedSittingArea)} - ${capitalizeWords(selectedStatus)} Tables`}{" "}
							({sortedFilteredTables.length})
						</h3>
						<div className="flex items-center gap-2">
							<button
								onClick={() => reserveAllMutation.mutate()}
								disabled={reserveAllMutation.isPending || unreserveAllMutation.isPending}
								className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#B69549] hover:bg-[#9e7e38] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
							>
								{reserveAllMutation.isPending ? "Reserving..." : "Reserve All"}
							</button>
							<button
								onClick={() => unreserveAllMutation.mutate()}
								disabled={reserveAllMutation.isPending || unreserveAllMutation.isPending}
								className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#B69549] hover:bg-[#9e7e38] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer`}
							>
								{unreserveAllMutation.isPending ? "Unreserving..." : "Unreserve All"}
							</button>
						</div>
					</div>

					{sortedFilteredTables.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{sortedFilteredTables.map((table) => {
								const isSelected = isTableSelected(table);
								const isMerged = table.is_merged;

								return (
									<div
										key={table.table_id}
										onClick={() => handleTableClick(table)}
										className={`relative ${
											colors.card
										} rounded-lg border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer z-0 ${
											isSelectionMode
												? isSelected
													? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
													: `${colors.border} hover:border-blue-300`
												: colors.border
										} ${
											isMerged
												? "ring-2 ring-purple-500 ring-opacity-50"
												: ""
										}`}
										style={{ minHeight: "165px" }}
									>
										{/* Selection Indicator */}
										{isSelectionMode && (
											<div className="absolute top-2 right-2">
												{isSelected ? (
													<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
														<FiCheck
															size={14}
															className="text-white"
														/>
													</div>
												) : (
													<div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
												)}
											</div>
										)}

										{/* Merged Indicator */}
										{/* {isMerged && (
											<div className="absolute top-2 left-2">
												<div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
													<FiLink size={12} />
													<span>MERGED</span>
												</div>
											</div>
										)} */}

										{/* Table Number and Capacity */}
										<div className="space-y-1 absolute top-1">
											<h4
												className={`text-lg font-bold ${colors.textPrimary}`}
											>
												{table.table_number}
											</h4>
											<p
												className={`text-sm ${colors.textSecondary}`}
											>
												{table.capacity} seats
											</p>
											{(table.session_id || table.table_status === "allotted" || table.table_status === "occupied") && table.guest_name && (
												<p className={`text-xs font-medium ${colors.textPrimary} truncate max-w-[100px]`}>
													{table.guest_name}
												</p>
											)}
											{/* {isMerged && table.merged_from && (
												<p className="text-xs text-purple-600 dark:text-purple-400">
													From{" "}
													{table.merged_from.length}{" "}
													tables
												</p>
											)} */}
										</div>

										{/* show luxegenie image if assigned to it */}
										{table.is_luxegenie_assigned && (
											<div
												className={`absolute top-[-25px] ${
													isSelectionMode
														? "right-10"
														: "right-0"
												}`}
											>
												<img
													src={luxegenie2}
													alt="Luxegenie"
													className="w-12"
												/>
											</div>
										)}

										{/* Powerbank Issued Indicator */}
										{table.is_powerbank_issued && (
											<div className="absolute bottom-10 right-2">
												<IoMdBatteryCharging
													size={30}
													className="text-green-400"
												/>
											</div>
										)}

										{/* Request Indicator */}
										<div className="absolute top-22 left-2 max-h-20 overflow-y-auto max-w-48 md:max-w-50 scrollbar-none">
											<div className="flex flex-col gap-1">
												{table.power_bank_request && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold bg-gray-900">
														<p className="luxegenie-gradient md:whitespace-nowrap flex flex-col md:flex-row">
															<span>
																Power Bank
															</span>
															<span className="md:ml-1">
																Requested
															</span>
														</p>
													</div>
												)}

												{table.chefs_special_request && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold bg-gray-900">
														<p className="luxegenie-gradient md:whitespace-nowrap flex flex-col md:flex-row">
															<span>
																Chef&apos;s
																Specials
															</span>
															<span className="md:ml-1">
																Ordered
															</span>
														</p>
													</div>
												)}

												{table.chefs_special_customization_request && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold bg-gray-900">
														<p className="luxegenie-gradient md:whitespace-nowrap flex flex-col md:flex-row">
															<span>
																Chef&apos;s
																Specials 
															</span>
															<span className="md:ml-1">
																Requested
															</span>
														</p>
													</div>
												)}

												{table.physical_menu_request && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold bg-gray-900">
														<p className="luxegenie-gradient md:whitespace-nowrap flex flex-col md:flex-row">
															<span>
																Physical Menu
															</span>
															<span className="md:ml-1">
																Requested
															</span>
														</p>
													</div>
												)}

												{table.bill_request && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold flex items-center bg-gray-900 whitespace-nowrap">
														<p className="luxegenie-gradient">
															Bill Requested{" "}
														</p>
													</div>
												)}

												{table.tap_for_service && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold flex items-center bg-gray-900 whitespace-nowrap">
														<p className="luxegenie-gradient">
															Service
															Requested{" "}
														</p>
													</div>
												)}

												{table.managers_attention && (
													<div className="pl-2 pr-4 py-2 rounded-md text-xs font-bold bg-gray-900">
														<p className="luxegenie-gradient md:whitespace-nowrap flex flex-col md:flex-row">
															<span>
																Manager&apos;s
																Attention
															</span>
															<span className="md:ml-1">
																Requested
															</span>
														</p>
													</div>
												)}
											</div>
										</div>

										{/* Status Badge - Bottom Right */}
										<div className="absolute bottom-0 right-0">
											<span
												className={`px-3 py-1 rounded-tl-lg text-xs font-bold ${
													table.session_id
														? getStatusColor(
																"active",
															)
														: getStatusColor(
																table.table_status,
															)
												}`}
											>
												{table.session_id
													? formatStatusText("active")
													: formatStatusText(
															table.table_status,
														)}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div
							className={`${colors.card} rounded-xl p-12 border ${colors.border} text-center`}
						>
							{/* <div className={`w-16 h-16 ${colors.secondary} rounded-full flex items-center justify-center mx-auto mb-4`}>
								<span className="text-2xl">🪑</span>
							</div> */}
							<h3
								className={`text-xl font-semibold ${colors.textPrimary} mb-2`}
							>
								No tables found
							</h3>
							<p className={colors.textSecondary}>
								{selectedSittingArea === "All" &&
								selectedStatus === "All"
									? "No tables available in this restaurant."
									: selectedSittingArea === "All"
										? `No tables with ${selectedStatus.toLowerCase()} status.`
										: selectedStatus === "All"
											? `No tables in ${selectedSittingArea} area.`
											: `No ${selectedStatus.toLowerCase()} tables in ${selectedSittingArea} area.`}
							</p>
						</div>
					)}
				</div>

				{/* Merged Tables */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h4
							className={`text-xl font-semibold ${colors.textPrimary}`}
						>
							Merged Tables ({mergedTables.length})
						</h4>
					</div>

					{mergedTables.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{mergedTables.map((table) => {
								const isSelected = isTableSelected(table);

								return (
									<div
										key={table.table_id}
										onClick={() => handleTableClick(table)}
										className={`relative ${
											colors.card
										} rounded-lg border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ring-opacity-50 ${
											isSelectionMode
												? isSelected
													? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
													: `${colors.border} hover:border-blue-300`
												: colors.border
										}`}
										style={{ minHeight: "165px" }}
									>
										{/* Selection Indicator */}
										{isSelectionMode && (
											<div className="absolute top-2 right-2">
												{isSelected ? (
													<div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
														<FiCheck
															size={14}
															className="text-white"
														/>
													</div>
												) : (
													<div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
												)}
											</div>
										)}

										{/* Table Number and Capacity */}
										<div className="space-y-1 absolute top-1">
											<h4
												className={`text-lg font-bold ${colors.textPrimary}`}
											>
												{table.table_number}
											</h4>
											<p
												className={`text-sm ${colors.textSecondary}`}
											>
												{table.capacity} seats
											</p>
											{/* {table.merged_from && (
												<p className="text-sm text-purple-600 dark:text-purple-400">
													From{" "}
													{table.merged_from.length}{" "}
													tables
												</p>
											)} */}
											{/* <p className="text-xs text-gray-500 dark:text-gray-400">
												{table.sitting_area}
											</p> */}
										</div>

										{/* show luxegenie image if assigned to it */}
										{table.is_luxegenie_assigned && (
											<div className="absolute top-[-25px] right-0">
												<img
													src={luxegenie2}
													alt="Luxegenie"
													className="w-12"
												/>
											</div>
										)}

										{/* Powerbank Issued Indicator */}
										{table.is_powerbank_issued && (
											<div className="absolute bottom-7 left-2">
												<IoMdBatteryCharging
													size={20}
													className="text-green-400"
												/>
											</div>
										)}

										{/* Luxegenie Indicator Demo */}
										{/* <div className="absolute bottom-5 right-0">
											<img
												src={luxegenie2}
												alt="Luxegenie"
												className="w-12"
											/>
										</div> */}

										{/* Merged Indicator */}
										{/* <div className="absolute top-2 left-2">
											<div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
												<FiLink size={12} />
												<span>MERGED</span>
											</div>
										</div> */}
										{/* Status Badge - Bottom Right */}
										{/* <div className="absolute bottom-0 right-0">
											<span
												className={`px-3 py-1 rounded-tl-lg text-xs font-bold ${getStatusColor(
													table.table_status
												)}`}
											>
												{formatStatusText(
													table.table_status
												)}
											</span>
										</div> */}
										{/* Status + Merged Badge - Bottom Right */}
										<div className="absolute bottom-0 right-0 flex">
											<span
												className={`px-3 py-1 text-xs rounded-tl-lg font-bold ${getStatusColor(
													table.table_status,
												)}`}
											>
												{formatStatusText(
													table.table_status,
												)}
											</span>
											<span className="px-3 py-1 text-xs font-bold bg-purple-600 text-white flex items-center space-x-1">
												<FiLink size={12} />
												<span>MERGED</span>
											</span>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div
							className={`${colors.card} rounded-xl p-8 border ${colors.border} text-center`}
						>
							<div
								className={`w-12 h-12 ${colors.secondary} rounded-full flex items-center justify-center mx-auto mb-3`}
							>
								<FiLink
									className={`text-2xl ${colors.textMuted}`}
								/>
							</div>
							<h3
								className={`text-lg font-semibold ${colors.textPrimary} mb-2`}
							>
								No Merged Tables
							</h3>
							<p className={`${colors.textSecondary} text-sm`}>
								Use the &quot;Merge Tables&quot; feature to
								combine multiple tables into one.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Reserve Table Modal */}
			<ReserveTableModal
				isOpen={showReserveModal}
				onClose={handleCloseModal}
				table={selectedTable}
			/>

			{/* Reservation Details and Deallot Modal */}
			<TableReservationDetailsAndDeallotModal
				isOpen={showReservationDetailsModal}
				onClose={handleCloseReservationDetailsModal}
				table={selectedTable}
				restaurantId={restaurantId}
			/>

			{/* Bill Request and Session Details Modal */}
			<BillRequestAndSessionDetailsModal
				isOpen={showBillSessionModal}
				onClose={handleCloseBillSessionModal}
				table={selectedTable}
				restaurantId={restaurantId}
			/>

			{/* Merge Tables Modal */}
			<MergeTablesModal
				isOpen={showMergeModal}
				onClose={closeMergeModal}
				selectedTables={selectedTables}
				restaurantId={restaurantId}
				actionType={mergeActionType}
			/>
		</Layout>
	);
};

export default Tables;
