import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	FiSearch,
	FiPlus,
	FiEdit2,
	FiTrash2,
	// FiUser,
	FiCalendar,
	FiClock,
	FiUsers,
	FiPhone,
	FiMail,
	FiMapPin,
} from "react-icons/fi";
import Layout from "../components/Layout/Layout.jsx";
import { useAuthStore } from "../store/authStore.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { reservationApi } from "../store/reservationStore.js";
import AddReservationModal from "../components/modals/reservations/AddReservationModal.jsx";
import UpdateReservationModal from "../components/modals/reservations/UpdateReservationModal.jsx";
import ReservationDeleteConfirmationModal from "../components/modals/reservations/ReservationDeleteConfirmationModal.jsx";
import AllotTableModal from "../components/modals/reservations/AllotTableModal.jsx";
import Loader from "../components/common/Loader.jsx";

const Reservations = () => {
	const { user } = useAuthStore();
	const { colors, isDark } = useTheme();
	const restaurantId = user?.restaurant_id;

	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showAllotModal, setShowAllotModal] = useState(false);
	const [selectedReservation, setSelectedReservation] = useState(null);
	const [defaultActionType, setDefaultActionType] = useState("allot");
	const [searchTerm, setSearchTerm] = useState("");

	// New filter states
	const [selectedTab, setSelectedTab] = useState("Upcoming");
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedType, setSelectedType] = useState("All");

	// Query function based on selected tab
	const getReservationQuery = () => {
		switch (selectedTab) {
			case "Upcoming":
				return () =>
					reservationApi.getUpcomingReservations(restaurantId);
			case "Today":
				return () => reservationApi.getTodayReservations(restaurantId);
			case "Past":
				return () => reservationApi.getPastReservations(restaurantId);
			case "All":
				return () => reservationApi.getAllReservations(restaurantId);
			case "ByDate":
				return () =>
					reservationApi.getReservationsByDate(
						restaurantId,
						selectedDate,
					);
			default:
				return () => reservationApi.getTodayReservations(restaurantId);
		}
	};

	// Fetch reservations based on selected tab
	const {
		data: reservationsResponse = { data: [], count: 0 },
		isLoading,
		error,
	} = useQuery({
		queryKey: ["reservations", restaurantId, selectedTab, selectedDate],
		queryFn: getReservationQuery(),
		enabled: !!restaurantId && (selectedTab !== "ByDate" || !!selectedDate),
		select: (data) => (data.success ? data : { data: [], count: 0 }),
	});

	const reservations = reservationsResponse.data || [];

	// Filter reservations based on search and frontend filters (status and type only)
	const filteredReservations = reservations.filter((reservation) => {
		const matchesSearch =
			reservation.guest_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			reservation.contact?.toString().includes(searchTerm) ||
			reservation.email
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			reservation.alloted_table_number
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesStatus =
			selectedStatus === "All" ||
			reservation.reservation_status === selectedStatus;

		const matchesType =
			selectedType === "All" ||
			reservation.reservation_type === selectedType;

		return matchesSearch && matchesStatus && matchesType;
	});

	// Get unique statuses and types for filter options
	const statuses = [
		"All",
		...new Set(reservations.map((res) => res.reservation_status)),
	];
	const types = [
		"All",
		...new Set(reservations.map((res) => res.reservation_type)),
	];

	// Format date for display
	const formatDate = (dateString) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Format time for display with AM/PM
	const formatTime = (timeString) => {
		if (!timeString) return "-";

		// Handle different time formats
		let time = timeString.trim();

		// If already has AM/PM, return as is
		if (time.includes("AM") || time.includes("PM")) {
			return time;
		}

		// If it's in HH:MM:SS or HH:MM format, convert to 12-hour with AM/PM
		const timeParts = time.split(":");
		if (timeParts.length >= 2) {
			let hours = parseInt(timeParts[0]);
			const minutes = timeParts[1];
			const period = hours >= 12 ? "PM" : "AM";

			// Convert 24-hour to 12-hour format
			hours = hours % 12 || 12;

			return `${hours}:${minutes} ${period}`;
		}

		return time;
	};

	// Get tab color styling
	const getTabColor = (tab, isSelected) => {
		if (isSelected) {
			return "bg-[#B69549] text-white shadow-lg";
		}
		return "bg-gray-200 text-gray-700 hover:cursor-pointer hover:bg-gray-300";
	};

	// Handle tab change
	const handleTabChange = (tab) => {
		setSelectedTab(tab);
		// Reset date filter when changing away from ByDate tab
		if (tab !== "ByDate") {
			setSelectedDate("");
		}
	};

	// Handle date selection for ByDate tab
	const handleDateSelect = (date) => {
		setSelectedDate(date);
		setSelectedTab("ByDate");
	};

	// Get status badge color
	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "confirmed":
				return "bg-purple-100 text-purple-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800 strike-through";
			case "completed":
				return "bg-green-100 text-green-800";
			case "alloted":
				return "bg-red-100 text-red-800";
			case "seated":
				return "bg-blue-100 text-blue-800";
			case "alloted_and_seated":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800 border border-gray-300";
		}
	};

	// Get guest type badge color
	// const getGuestTypeColor = (type) => {
	// 	switch (type?.toLowerCase()) {
	// 		case "vip":
	// 			return "bg-purple-100 text-purple-800";
	// 		case "member":
	// 			return "bg-orange-100 text-orange-800";
	// 		case "first":
	// 			return "bg-blue-100 text-blue-800";
	// 		default:
	// 			return "bg-gray-100 text-gray-800";
	// 	}
	// };

	// Handlers for reservation actions
	const handleEditReservation = (reservation) => {
		setSelectedReservation(reservation);
		setShowEditModal(true);
	};

	const handleDeleteReservation = (reservation) => {
		setSelectedReservation(reservation);
		setShowDeleteModal(true);
	};

	const handleAllotTable = (reservation, actionType = "allot") => {
		setSelectedReservation(reservation);
		setDefaultActionType(actionType);
		setShowAllotModal(true);
	};

	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setSelectedReservation(null);
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setSelectedReservation(null);
	};

	const handleCloseAllotModal = () => {
		setShowAllotModal(false);
		setSelectedReservation(null);
	};

	// Loading state
	if (isLoading) {
		return (
			<Layout
				title="Reservations"
				subtitle="Manage and monitor all reservations in your restaurant"
			>
				<Loader />
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout
				title="Reservations"
				subtitle="Manage and monitor all reservations in your restaurant"
			>
				<div className="flex justify-center items-center h-64">
					<div className={`${colors.textPrimary}`}>
						Error loading reservations: {error.message}
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="Reservations"
			subtitle="Manage and monitor all reservations in your restaurant"
		>
			<div className="space-y-4 lg:space-y-6">
				{/* Mobile-First Header with Search and Add Button */}
				<div className="flex flex-col space-y-4">
					{/* Search and Add Button Row */}
					<div className="flex flex-col sm:flex-row gap-3">
						{/* Search Bar */}
						<div className="relative flex-1 z-0">
							<FiSearch
								className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${colors.textMuted}`}
								size={20}
							/>
							<input
								type="text"
								placeholder="Search by name, contact, email, or table..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`w-full pl-12 pr-4 py-3 ${isDark ? "bg-slate-600 text-white" : "bg-gray-50 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
							/>
						</div>

						{/* Add Reservation Button */}
						<button
							onClick={() => setShowAddModal(true)}
							className={`flex items-center justify-center   space-x-2 px-4 py-3 text-white bg-[#B69549] rounded-xl transition-all duration-200 hover:shadow-lg whitespace-nowrap min-w-fit hover:cursor-pointer`}
						>
							<FiPlus size={18} />
							<span>New Reservation</span>
						</button>
					</div>

					{/* Mobile Filters - Keep search but remove old filters */}
				</div>

				{/* Date Tabs */}
				<div
					className={`${colors.card} rounded-xl border ${colors.border} p-1 relative`}
				>
					{/* Desktop & Tablet Tabs */}
					<div className="hidden sm:flex flex-wrap gap-2 p-1 items-center">
						{["Upcoming", "Today", "Past", "All"].map((tab) => (
							<button
								key={tab}
								onClick={() => handleTabChange(tab)}
								className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${getTabColor(
									tab,
									selectedTab === tab,
								)}`}
							>
								{tab}{" "}
								{selectedTab === tab &&
									`(${filteredReservations.length})`}
							</button>
						))}
						{/* Filter by Date Tab with Direct Calendar */}
						<div className="flex items-center space-x-2">
							<input
								type="date"
								value={selectedDate}
								onChange={(e) =>
									handleDateSelect(e.target.value)
								}
								className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm`}
							/>
						</div>

						{/* Status and Type Filters - Inline */}
						<select
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
							className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm`}
							style={{
								colorScheme: isDark ? "dark" : "light",
							}}
						>
							{statuses.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>

						<select
							value={selectedType}
							onChange={(e) => setSelectedType(e.target.value)}
							className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm`}
							style={{
								colorScheme: isDark ? "dark" : "light",
							}}
						>
							{types.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					{/* Mobile Tabs - Horizontal Scrollable */}
					<div className="sm:hidden relative">
						{/* Scroll hint text */}
						<div className="text-center my-4">
							<span
								className={`text-xs ${colors.textMuted} flex items-center justify-center space-x-1`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16l4-4-4-4m6 8l4-4-4-4"
									/>
								</svg>
								<span>Swipe to see more date filters</span>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16l4-4-4-4m6 8l4-4-4-4"
									/>
								</svg>
							</span>
						</div>

						<div className="overflow-x-auto scrollbar-none pb-3">
							<div className="flex space-x-3 min-w-max px-4 py-2">
								{["Today", "Upcoming", "Past", "All"].map(
									(tab) => (
										<button
											key={tab}
											onClick={() => handleTabChange(tab)}
											className={`px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-max ${getTabColor(
												tab,
												selectedTab === tab,
											)}`}
										>
											{tab}{" "}
											{selectedTab === tab &&
												`(${filteredReservations.length})`}
										</button>
									),
								)}
								{/* Direct Calendar for Mobile */}
								<input
									type="date"
									value={selectedDate}
									onChange={(e) =>
										handleDateSelect(e.target.value)
									}
									className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm min-w-max`}
								/>

								{/* Status Filter for Mobile */}
								<select
									value={selectedStatus}
									onChange={(e) =>
										setSelectedStatus(e.target.value)
									}
									className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm min-w-max`}
									style={{
										colorScheme: isDark ? "dark" : "light",
									}}
								>
									{statuses.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>

								{/* Type Filter for Mobile */}
								<select
									value={selectedType}
									onChange={(e) =>
										setSelectedType(e.target.value)
									}
									className={`px-3 py-2 ${colors.input} border ${colors.border} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-sm min-w-max`}
									style={{
										colorScheme: isDark ? "dark" : "light",
									}}
								>
									{types.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Reservations Count */}
				{/* <div
					className={`${colors.card} rounded-xl p-4 border ${colors.border}`}
				>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<div className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-yellow-700'}`}>
								{filteredReservations.length}
							</div>
							<div className={`text-sm ${colors.textMuted}`}>
								{searchTerm ||
								selectedStatus !== "All" ||
								selectedType !== "All"
									? "Filtered"
									: selectedTab}
							</div>
						</div>
						<div>
							<div className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-yellow-700'}`}>
								{
									filteredReservations.filter(
										(r) =>
											r.reservation_status === "confirmed"
									).length
								}
							</div>
							<div className={`text-sm ${colors.textMuted}`}>
								Confirmed
							</div>
						</div>
						<div>
							<div className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-yellow-700'}`}>
								{
									filteredReservations.filter(
										(r) =>
											r.reservation_status === "pending"
									).length
								}
							</div>
							<div className={`text-sm ${colors.textMuted}`}>
								Pending
							</div>
						</div>
						<div>
							<div className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-yellow-700'}`}>
								{
									filteredReservations.filter(
										(r) =>
											r.reservation_status === "completed"
									).length
								}
							</div>
							<div className={`text-sm ${colors.textMuted}`}>
								Completed
							</div>
						</div>
					</div>
				</div> */}

				{/* Reservations List */}
				<div className="space-y-4">
					{filteredReservations.length === 0 ? (
						<div
							className={`${colors.card} rounded-xl p-8 text-center border ${colors.border}`}
						>
							<div
								className={`w-16 h-16 mx-auto mb-4 ${colors.background} rounded-full flex items-center justify-center`}
							>
								<FiCalendar
									size={24}
									className={colors.textMuted}
								/>
							</div>
							<h3
								className={`text-lg font-medium ${colors.textPrimary} mb-2`}
							>
								{searchTerm ||
								selectedStatus !== "All" ||
								selectedType !== "All"
									? "No reservations found"
									: `No reservations for ${selectedTab.toLowerCase()}`}
							</h3>
							<p className={`${colors.textMuted} mb-4`}>
								{searchTerm ||
								selectedStatus !== "All" ||
								selectedType !== "All"
									? "Try adjusting your search or filter criteria"
									: `Try selecting a different time period or create your first reservation`}
							</p>
							{!searchTerm &&
								selectedStatus === "All" &&
								selectedType === "All" &&
								selectedTab === "All" && (
									<button
										onClick={() => setShowAddModal(true)}
										className={`px-6 py-3 ${colors.button} rounded-xl transition-all duration-200 ${colors.buttonHover} hover:shadow-lg`}
									>
										Create First Reservation
									</button>
								)}
						</div>
					) : (
						<div className="grid gap-4">
							{filteredReservations.map((reservation) => (
								<div
									key={reservation.reservation_id}
									className={`${reservation.reservation_status === "completed" ? (isDark ? "bg-red-500/10" : "bg-red-50") : isDark ? "bg-green-500/10" : "bg-green-50"} rounded-xl p-4 border ${colors.border} hover:shadow-lg transition-all duration-200`}
								>
									{/* Mobile-optimized card layout */}
									<div className="space-y-3">
										{/* Header Row */}
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<h3
														className={`font-semibold ${colors.textPrimary} text-lg truncate max-w-[150px] sm:max-w-[200px] md:max-w-md lg:max-w-lg`}
														title={
															reservation.guest_name
														}
													>
														{reservation.guest_name ||
															"Guest"}
													</h3>
												</div>
											</div>
											<div className="flex gap-2 items-center md:gap-2">
												{reservation.alloted_table_number && (
													<div className="text-sm text-yellow-800">
														Table:{" "}
														{
															reservation.alloted_table_number
														}
													</div>
												)}

												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
														reservation.reservation_status,
													)}`}
												>
													{
														reservation.reservation_status
													}
												</span>
											</div>
										</div>
										<div
											className={`flex justify-between items-center space-x-4 text-sm ${colors.textMuted}`}
										>
											<div className="flex items-center space-x-2">
												<FiUsers size={14} />
												<span>
													{reservation.number_of_pax}{" "}
													guests
												</span>
											</div>
											<div className="flex items-center">
												<span>Via: &nbsp;</span>
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
														reservation.reservation_type,
													)}`}
												>
													{
														reservation.reservation_type
													}
												</span>
											</div>
										</div>

										{/* Date and Time Row */}
										<div className="flex flex-wrap text-sm">
											<div className="flex flex-wrap gap-4">
												<div className="flex items-center space-x-2">
													<FiCalendar
														size={16}
														className={
															colors.textMuted
														}
													/>
													<span
														className={`${colors.textPrimary} font-medium`}
													>
														{formatDate(
															reservation.reservation_date,
														)}
													</span>
												</div>
												<div className="flex items-center space-x-2">
													<FiClock
														size={16}
														className="text-yellow-700"
													/>
													<span
														className={`${colors.textPrimary} text-base`}
													>
														{formatTime(
															reservation.in_time,
														)}
														{reservation.out_time && (
															<span className="">
																{" "}
																-{" "}
																{formatTime(
																	reservation.out_time,
																)}
															</span>
														)}
													</span>
												</div>
											</div>
										</div>

										{/* Contact Info Row */}
										{(reservation.contact ||
											reservation.email) && (
											<div className="flex flex-wrap gap-4 text-sm">
												{reservation.contact && (
													<div className="flex items-center space-x-2">
														<FiPhone
															size={14}
															className={
																colors.textMuted
															}
														/>
														<span
															className={
																colors.textPrimary
															}
														>
															{
																reservation.contact
															}
														</span>
													</div>
												)}
												{reservation.email && (
													<div className="flex items-center space-x-2">
														<FiMail
															size={14}
															className={
																colors.textMuted
															}
														/>
														<span
															className={`${colors.textPrimary} truncate`}
														>
															{reservation.email}
														</span>
													</div>
												)}
											</div>
										)}

										{/* Action Buttons Row */}
										<div
											className={`flex justify-between space-x-2 pt-2 border-t ${colors.border}`}
										>
											<div className="flex gap-2">
												{/* Non-allotted reservations: Show Allot and Allot & Seat buttons */}
												{!reservation.alloted_table_id &&
													reservation.reservation_status !==
														"seated" &&
													reservation.reservation_status !==
														"alloted_and_seated" &&
													reservation.reservation_status !==
														"completed" && (
														<>
															<button
																onClick={() =>
																	handleAllotTable(
																		reservation,
																		"allot",
																	)
																}
																className="px-3 py-2 text-white bg-[#B69549] hover:bg-[#a0854a] rounded-lg transition-colors duration-200 hover:cursor-pointer font-medium text-sm"
																title="Allot table"
															>
																Allot
															</button>
															<button
																onClick={() =>
																	handleAllotTable(
																		reservation,
																		"allot_and_seat",
																	)
																}
																className="px-3 py-2 text-white bg-[#B69549] hover:bg-[#a0854a] rounded-lg transition-colors duration-200 hover:cursor-pointer font-medium text-sm"
																title="Allot and seat table"
															>
																Allot & Seat
															</button>
														</>
													)}

												{/* Allotted reservations: Show Seat button */}
												{reservation.alloted_table_id &&
													reservation.reservation_status ===
														"alloted" && (
														<button
															onClick={() =>
																handleAllotTable(
																	reservation,
																	"seat",
																)
															}
															className="px-3 py-2 text-white bg-[#B69549] hover:bg-[#a0854a] rounded-lg transition-colors duration-200 hover:cursor-pointer font-medium text-sm"
															title="Seat guest"
														>
															Seat
														</button>
													)}
											</div>
											<div className="flex gap-2">
												{/* Only show edit button if reservation is not seated/completed */}
												{reservation.reservation_status !==
													"seated" &&
													reservation.reservation_status !==
														"alloted_and_seated" &&
													reservation.reservation_status !==
														"completed" && (
														<button
															onClick={() =>
																handleEditReservation(
																	reservation,
																)
															}
															className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 hover:cursor-pointer"
															title="Edit reservation"
														>
															<FiEdit2
																size={16}
															/>
														</button>
													)}
												<button
													onClick={() =>
														handleDeleteReservation(
															reservation,
														)
													}
													className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 hover:cursor-pointer"
													title="Delete reservation"
												>
													<FiTrash2 size={16} />
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Modals */}
			<AddReservationModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				restaurantId={restaurantId}
			/>

			{/* Update Reservation Modal */}
			{showEditModal && selectedReservation && (
				<UpdateReservationModal
					isOpen={showEditModal}
					reservation={selectedReservation}
					onClose={handleCloseEditModal}
				/>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && selectedReservation && (
				<ReservationDeleteConfirmationModal
					isOpen={showDeleteModal}
					reservation={selectedReservation}
					onClose={handleCloseDeleteModal}
				/>
			)}

			{/* Allot Table Modal */}
			{showAllotModal && selectedReservation && (
				<AllotTableModal
					isOpen={showAllotModal}
					reservation={selectedReservation}
					onClose={handleCloseAllotModal}
					defaultAction={defaultActionType}
				/>
			)}
		</Layout>
	);
};

export default Reservations;
