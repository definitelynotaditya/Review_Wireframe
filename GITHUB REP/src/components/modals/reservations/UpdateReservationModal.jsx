import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	FiX,
	FiCalendar,
	FiClock,
	FiUser,
	FiMail,
	FiPhone,
	FiUsers,
} from "react-icons/fi";
import { reservationApi } from "../../../store/reservationStore";
import { useTheme } from "../../../context/ThemeContext.jsx";
import { useAuthStore } from "../../../store/authStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
registerLocale("en-GB", enGB);

const UpdateReservationModal = ({ isOpen, onClose, reservation, onSuccess }) => {
	const { colors } = useTheme();
	const { restaurant } = useAuthStore();
	const activeOutTime = restaurant?.active_out_time ?? true; // Default to true if not set
	const [formData, setFormData] = useState({
		restaurantId: "",
		contact: "",
		email: "",
		guest_name: "",
		number_of_pax: "",
		reservation_date: "",
		in_time: "",
		out_time: "",
		reservation_type: "walk-in",
		guest_honorifics: "None",
		room_number: ""
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState("");
	const [contactError, setContactError] = useState("");

	// Fetch time slots from API
	const { data: timeSlotsData, isLoading: isLoadingSlots } = useQuery({
		queryKey: ["time-slots", reservation?.restaurant_id],
		queryFn: () => reservationApi.getTimeSlots(reservation?.restaurant_id),
		enabled: !!reservation?.restaurant_id && isOpen,
		select: (data) => (data?.success ? data.data : null),
	});

	// Extract available periods and time slots
	const availablePeriods = useMemo(() => {
		return timeSlotsData?.time_slots
			? Object.keys(timeSlotsData.time_slots).filter(
					(period) =>
						timeSlotsData.time_slots[period] &&
						timeSlotsData.time_slots[period].length > 0,
				)
			: [];
	}, [timeSlotsData]);

	const timeSlots = useMemo(
		() => timeSlotsData?.time_slots || {},
		[timeSlotsData],
	);

	const queryClient = useQueryClient();

	// Populate form data when reservation changes
	useEffect(() => {
		if (reservation && isOpen) {
			// Format date from ISO to YYYY-MM-DD for DatePicker
			const formatDateForInput = (dateString) => {
				if (!dateString) return "";
				const date = new Date(dateString);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const day = String(date.getDate()).padStart(2, "0");
				return `${year}-${month}-${day}`;
			};

			setFormData({
				restaurantId: reservation.restaurant_id?.toString() || "",
				contact: reservation.contact || "",
				email: reservation.email || "",
				guest_name: reservation.guest_name || "",
				number_of_pax: reservation.number_of_pax?.toString() || "",
				reservation_date: formatDateForInput(
					reservation.reservation_date,
				),
				in_time: reservation.in_time || "",
				out_time: reservation.out_time || "",
				reservation_type: reservation.reservation_type || "walk-in",
				guest_honorifics: reservation.guest_honorifics || "None",
				room_number: reservation.room_number || ""
			});
			// Reset selected period so auto-selection can work
			setSelectedPeriod("");
		}
	}, [reservation, isOpen]);

	// Auto-select period when time slots are loaded and in_time is set
	useEffect(() => {
		if (availablePeriods.length > 0 && formData.in_time) {
			// Find which period contains the in_time
			const periodWithInTime = availablePeriods.find(
				(period) =>
					timeSlots[period] &&
					timeSlots[period].includes(formData.in_time),
			);
			if (periodWithInTime && selectedPeriod !== periodWithInTime) {
				setSelectedPeriod(periodWithInTime);
			} else if (!periodWithInTime && !selectedPeriod) {
				// If in_time not found in any period, select first period
				setSelectedPeriod(availablePeriods[0]);
			}
		} else if (
			availablePeriods.length > 0 &&
			!formData.in_time &&
			!selectedPeriod
		) {
			// If no in_time, check reservation type
			if (formData.reservation_type === "walk-in") {
				setSelectedPeriod("now");
			} else {
				setSelectedPeriod(availablePeriods[0]);
			}
		}
	}, [
		availablePeriods,
		selectedPeriod,
		formData.in_time,
		timeSlots,
		formData.reservation_type,
	]);

	// Mutation for updating reservation
	const updateReservationMutation = useMutation({
		mutationFn: (reservationData) =>
			reservationApi.updateReservation(
				reservation.reservation_id,
				reservationData,
			),
		onSuccess: () => {
			toast.success("Reservation updated successfully!");
			// Invalidate queries to refresh reservations list
			queryClient.invalidateQueries([
				"reservations",
				reservation.restaurant_id,
			]);
			onClose();
			onSuccess?.();
		},
		onError: (error) => {
			console.error("Update reservation failed:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to update reservation";
			toast.error(errorMessage);
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Handle checkbox for member status
		if (type === "checkbox") {
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
			return;
		}

		// Strip non-numeric characters from contact
		const sanitizedValue =
			name === "contact" ? value.replace(/\D/g, "") : value;

		setFormData((prev) => ({
			...prev,
			[name]: sanitizedValue,
		}));

		// Clear contact error when user starts typing
		if (name === "contact" && contactError) {
			setContactError("");
		}

		// Auto-fill reservation_date_to when reservation_date_from changes
		if (name === "reservation_date_from") {
			setFormData((prev) => ({
				...prev,
				reservation_date_to: value,
			}));
		}
	};

	const handleContactBlur = () => {
		if (
			formData.contact &&
			formData.contact.length > 0 &&
			formData.contact.length < 10
		) {
			setContactError("Contact number must be 10 digits");
		} else {
			setContactError("");
		}
	};

	const validateForm = () => {
		// Common validation for all reservation types
		if (!formData.number_of_pax || parseInt(formData.number_of_pax) < 1) {
			toast.error("Number of guests is required and must be at least 1");
			return false;
		}

		if (!formData.reservation_type) {
			toast.error("Reservation type is required");
			return false;
		}

		// Validation for walk-in guests (only pax and reservation_type are mandatory)
		if (formData.reservation_type === "walk-in") {
			// Optional field validations for walk-in (when provided)
			if (
				formData.contact &&
				formData.contact.length > 0 &&
				formData.contact.length !== 10
			) {
				toast.error("Contact number must be exactly 10 digits");
				return false;
			}
			if (formData.contact && !/^\d+$/.test(formData.contact)) {
				toast.error("Contact number must contain only numbers");
				return false;
			}
			if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
				toast.error("Please enter a valid email address");
				return false;
			}
			return true;
		}

		// Validation for online, phone, other reservation types
		if (["online", "phone", "other"].includes(formData.reservation_type)) {
			// At least one contact method is required
			if (!formData.contact && !formData.email) {
				toast.error(
					"Either contact number or email is required for " +
						formData.reservation_type +
						" reservations",
				);
				return false;
			}

			// Guest name is required for non-walk-ins
			if (!formData.guest_name || formData.guest_name.trim() === "") {
				toast.error(
					"Guest name is required for " +
						formData.reservation_type +
						" reservations",
				);
				return false;
			}

			// Reservation date is required
			if (!formData.reservation_date) {
				toast.error(
					"Reservation date is required for " +
						formData.reservation_type +
						" reservations",
				);
				return false;
			}

			// In time is required only when not selecting "now"
			if (selectedPeriod !== "now" && !formData.in_time) {
				toast.error(
					"Reservation time is required for " +
						formData.reservation_type +
						" reservations",
				);
				return false;
			}

			// Validate contact if provided
			if (formData.contact && formData.contact.length !== 10) {
				toast.error("Contact number must be exactly 10 digits");
				return false;
			}

			if (formData.contact && !/^\d+$/.test(formData.contact)) {
				toast.error("Contact number must contain only numbers");
				return false;
			}

			// Validate email if provided
			if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
				toast.error("Please enter a valid email address");
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Get current time in HH:MM AM/PM format
			const getCurrentTime = () => {
				const now = new Date();
				let hours = now.getHours();
				const minutes = now.getMinutes();
				const period = hours >= 12 ? "PM" : "AM";

				if (hours === 0) {
					hours = 12;
				} else if (hours > 12) {
					hours = hours - 12;
				}

				const minuteStr = minutes.toString().padStart(2, "0");
				return `${hours}:${minuteStr} ${period}`;
			};

			// Format the date properly for API
			const formatDateForAPI = (date) => {
				if (!date) return null;
				// Handle both string and Date objects
				if (typeof date === "string") {
					// If it's already in YYYY-MM-DD format
					if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
						return date;
					}
					// Otherwise convert
					const dateObj = new Date(date + "T12:00:00");
					const year = dateObj.getFullYear();
					const month = String(dateObj.getMonth() + 1).padStart(
						2,
						"0",
					);
					const day = String(dateObj.getDate()).padStart(2, "0");
					return `${year}-${month}-${day}`;
				}
				// If it's a Date object
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const day = String(date.getDate()).padStart(2, "0");
				return `${year}-${month}-${day}`;
			};

			const reservationData = {
				restaurant_id: parseInt(reservation.restaurant_id),
				guest_name: formData.guest_name?.trim() || "",
				contact: formData.contact || "",
				email: formData.email || "",
				number_of_pax: parseInt(formData.number_of_pax),
				reservation_date: formatDateForAPI(formData.reservation_date),
				in_time:
					selectedPeriod === "now"
						? getCurrentTime()
						: formData.in_time || null,
				out_time: activeOutTime
					? selectedPeriod === "now"
						? null
						: formData.out_time || null
					: null,
				reservation_type: formData.reservation_type,
				guest_honorifics: formData.guest_honorifics,
				room_number: formData.room_number,
				// reservation_status:
				// 	reservation.reservation_status || "confirmed",
			};

			await updateReservationMutation.mutateAsync(reservationData);
		} catch (error) {
			console.error("Error updating reservation:", error);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			onClose();
		}
	};

	// Helper function to parse and compare times
	const parseTime = (timeStr) => {
		const [time, period] = timeStr.split(" ");
		let [hours, minutes] = time.split(":").map(Number);
		if (period === "PM" && hours !== 12) hours += 12;
		if (period === "AM" && hours === 12) hours = 0;
		return hours * 60 + minutes;
	};

	// Function to add 30 minutes to a time string
	const addThirtyMinutes = (timeStr) => {
		const totalMinutes = parseTime(timeStr);
		const newTotalMinutes = totalMinutes + 30;
		const hours24 = Math.floor(newTotalMinutes / 60);
		const minutes = newTotalMinutes % 60;

		// Convert back to 12-hour format
		let hours12 = hours24;
		let period = "AM";

		if (hours24 === 0) {
			hours12 = 12;
		} else if (hours24 === 12) {
			hours12 = 12;
			period = "PM";
		} else if (hours24 > 12) {
			hours12 = hours24 - 12;
			period = "PM";
		}

		const minuteStr = minutes.toString().padStart(2, "0");
		return `${hours12}:${minuteStr} ${period}`;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
			<div
				className={`${colors.card} rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col`}
			>
				{/* Fixed Header */}
				<div
					className={`flex items-center justify-between p-6 border-b ${colors.border}`}
				>
					<h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
						Update Reservation
					</h2>
					<button
						onClick={handleClose}
						className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 hover:cursor-pointer`}
						disabled={isSubmitting}
					>
						<FiX size={20} className={colors.textMuted} />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto flex-1 p-6 scrollbar-none">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Guest Information Section */}
						<div className="space-y-4">
							<h3
								className={`text-lg font-semibold ${colors.textPrimary} border-b ${colors.border} pb-2`}
							>
								Guest Information
							</h3>

							{/* Guest Honorifics and Name Row */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								{/* Honorifics */}
								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										Title
									</label>
									<select
										name="guest_honorifics"
										value={formData.guest_honorifics}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										disabled={isSubmitting}
									>
										<option value="">None</option>
										<option value="Mr">Mr</option>
										<option value="Ms">Ms</option>
										<option value="Mrs">Mrs</option>
										<option value="Dr">Dr</option>
										<option value="Prof">Prof</option>
									</select>
								</div>

								{/* Guest Name */}
								<div className="md:col-span-3">
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										<FiUser className="inline mr-2" />
										Guest Name{" "}
										{["online", "phone", "other"].includes(
											formData.reservation_type,
										) && "*"}
									</label>
									<input
										type="text"
										name="guest_name"
										value={formData.guest_name}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										placeholder="Enter guest name"
										disabled={isSubmitting}
										required={[
											"online",
											"phone",
											"other",
										].includes(formData.reservation_type)}
									/>
								</div>
							</div>

							{/* Contact and Email Row */}
							<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										<FiPhone className="inline mr-2" />
										Contact Number{" "}
										{["online", "phone", "other"].includes(
											formData.reservation_type,
										) &&
											!formData.email &&
											"*"}
									</label>
									<input
										type="tel"
										name="contact"
										value={formData.contact}
										onChange={handleInputChange}
										onKeyPress={(e) => {
											if (!/[0-9]/.test(e.key))
												e.preventDefault();
										}}
										onBlur={handleContactBlur}
										className={`w-full px-4 py-3 ${
											colors.input
										} border ${
											contactError
												? "border-red-500"
												: colors.border
										} rounded-xl focus:outline-none focus:ring-2 ${
											contactError
												? "focus:ring-red-500"
												: colors.inputFocus
										} focus:border-transparent`}
										placeholder="10-digit number"
										maxLength="10"
										disabled={isSubmitting}
									/>
									{contactError && (
										<p className="text-red-500 text-sm mt-1">
											{contactError}
										</p>
									)}
								</div>

								{/* <div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										<FiMail className="inline mr-2" />
										Email{" "}
										{["online", "phone", "other"].includes(
											formData.reservation_type,
										) &&
											!formData.contact &&
											"*"}
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										placeholder="guest@example.com"
										disabled={isSubmitting}
									/>
								</div> */}
							</div>

							{/* Number of Guests - Priority field */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										Room Number
									</label>
									<input
										type="text"
										name="room_number"
										value={formData.room_number}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										placeholder="Enter room number"
										disabled={isSubmitting}
									/>
								</div>

								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										<FiUsers className="inline mr-2" />
										Number of Guests *
									</label>
									<input
										type="number"
										name="number_of_pax"
										value={formData.number_of_pax}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent text-lg`}
										placeholder="How many guests?"
										min="1"
										max="20"
										required
										disabled={isSubmitting}
									/>
								</div>
							</div>
						</div>

						{/* Reservation Details Section */}
						<div className="space-y-4">
							<h3
								className={`text-lg font-semibold ${colors.textPrimary} border-b ${colors.border} pb-2`}
							>
								Reservation Details
							</h3>

							{/* Type and Date Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										Reservation Type *
									</label>
									<select
										name="reservation_type"
										value={formData.reservation_type}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										disabled={isSubmitting}
										required
									>
										<option value="walk-in">Walk-in</option>
										<option value="online">Online</option>
										<option value="phone">Phone</option>
										<option value="zomato">Zomato</option>
										<option value="swiggy">Swiggy</option>
										<option value="eazydine">
											EazyDine
										</option>
										<option value="dineout">Dineout</option>
										<option value="other">Other</option>
									</select>
								</div>

								<div>
									<label
										className={`block text-sm font-medium ${colors.textSecondary} mb-2`}
									>
										<FiCalendar className="inline mr-2" />
										Reservation Date{" "}
										{["online", "phone", "other"].includes(
											formData.reservation_type,
										) && "*"}
									</label>
									<DatePicker
										selected={
											formData.reservation_date
												? new Date(
														formData.reservation_date +
															"T12:00:00",
													)
												: null
										}
										onChangeRaw={(e) => e.preventDefault()}
										onChange={(date) => {
											if (date) {
												const year = date.getFullYear();
												const month = String(
													date.getMonth() + 1,
												).padStart(2, "0");
												const day = String(
													date.getDate(),
												).padStart(2, "0");
												const iso = `${year}-${month}-${day}`;
												const todayStr = (() => {
													const t = new Date();
													return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
												})();
												if (
													iso !== todayStr &&
													selectedPeriod === "now" &&
													availablePeriods.length > 0
												) {
													// Future date selected — leave NOW, go to first period
													setSelectedPeriod(
														availablePeriods[0],
													);
													setFormData((prev) => ({
														...prev,
														reservation_date: iso,
														in_time: "",
														out_time: "",
													}));
												} else if (
													iso === todayStr &&
													selectedPeriod !== "now"
												) {
													// Today re-selected — snap back to NOW
													setSelectedPeriod("now");
													setFormData((prev) => ({
														...prev,
														reservation_date: iso,
														in_time: "",
														out_time: "",
													}));
												} else {
													setFormData((prev) => ({
														...prev,
														reservation_date: iso,
													}));
												}
											}
										}}
										dateFormat="dd/MM/yyyy"
										locale="en-GB"
										minDate={new Date()}
										placeholderText="Select reservation date"
										className={`w-full lg:w-88 px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
										disabled={isSubmitting}
										required={[
											"online",
											"phone",
											"other",
										].includes(formData.reservation_type)}
									/>
								</div>
							</div>

							{/* Time Selection */}
							<div className="space-y-4">
								{/* Horizontal Line */}
								<hr className={`border-t ${colors.border}`} />

								{/* Period Selection Buttons */}
								{isLoadingSlots ? (
									<div className="text-center py-4">
										<p className={colors.textMuted}>
											Loading time slots...
										</p>
									</div>
								) : availablePeriods.length > 0 ? (
									<>
										<div className="flex gap-2 flex-wrap">
											{/* Now Button - Only show when selected date is today */}
											{(() => {
												const t = new Date();
												const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
												return (
													!formData.reservation_date ||
													formData.reservation_date ===
														todayStr
												);
											})() && (
												<button
													type="button"
													onClick={() => {
														setSelectedPeriod(
															"now",
														);
														// Clear time selections when selecting Now
														setFormData((prev) => ({
															...prev,
															in_time: "",
															out_time: "",
														}));
													}}
													disabled={isSubmitting}
													className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
														selectedPeriod === "now"
															? "bg-[#B69549] text-white"
															: `${colors.input} border ${colors.border} hover:${colors.hover} ${colors.textPrimary}`
													} disabled:opacity-50 disabled:cursor-not-allowed`}
												>
													NOW
												</button>
											)}
											{availablePeriods.map((period) => (
												<button
													key={period}
													type="button"
													onClick={() => {
														// Only clear times if user is changing to a different period
														if (
															selectedPeriod !==
															period
														) {
															setSelectedPeriod(
																period,
															);
															// Clear time selections when period changes manually
															setFormData(
																(prev) => ({
																	...prev,
																	in_time: "",
																	out_time:
																		"",
																}),
															);
														}
													}}
													disabled={isSubmitting}
													className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
														selectedPeriod ===
														period
															? "bg-[#B69549] text-white"
															: `${colors.input} border ${colors.border} hover:${colors.hover} ${colors.textPrimary}`
													} disabled:opacity-50 disabled:cursor-not-allowed`}
												>
													{period
														.replace(/_/g, " ")
														.toUpperCase()}
												</button>
											))}
										</div>

										{/* Time Fields - Only show if not "now" */}
										{selectedPeriod &&
											selectedPeriod !== "now" &&
											timeSlots[selectedPeriod] && (
												<div
													className={`grid grid-cols-1 ${activeOutTime ? "md:grid-cols-2" : ""} gap-6`}
												>
													{/* In Time */}
													<div
														className={`${colors.card2} p-4 rounded-lg border ${colors.border}`}
													>
														<label
															className={`block text-sm font-medium ${colors.textSecondary} mb-3`}
														>
															<FiClock className="inline mr-2" />
															In Time{" "}
															{[
																"online",
																"phone",
																"other",
															].includes(
																formData.reservation_type,
															) && "*"}
														</label>
														<div className="grid grid-cols-3 gap-2">
															{timeSlots[
																selectedPeriod
															].map(
																(timeSlot) => (
																	<button
																		key={
																			timeSlot
																		}
																		type="button"
																		onClick={() => {
																			setFormData(
																				(
																					prev,
																				) => ({
																					...prev,
																					in_time:
																						timeSlot,
																					// Clear out time if it's earlier than new in time
																					out_time:
																						prev.out_time &&
																						parseTime(
																							prev.out_time,
																						) <=
																							parseTime(
																								timeSlot,
																							)
																							? ""
																							: prev.out_time,
																				}),
																			);
																		}}
																		disabled={
																			isSubmitting
																		}
																		className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
																			formData.in_time ===
																			timeSlot
																				? "bg-[#B69549] text-white font-medium"
																				: `${colors.input} border ${colors.border} hover:${colors.hover} ${colors.textPrimary}`
																		} disabled:opacity-50 disabled:cursor-not-allowed`}
																	>
																		{
																			timeSlot
																		}
																	</button>
																),
															)}
														</div>
													</div>

													{/* Out Time - Conditionally render based on activeOutTime */}
													{activeOutTime && (
														<div
															className={`${colors.card2} p-4 rounded-lg border ${colors.border}`}
														>
															<label
																className={`block text-sm font-medium ${colors.textSecondary} mb-3`}
															>
																<FiClock className="inline mr-2" />
																Out Time
																(Optional)
															</label>
															<div className="grid grid-cols-3 gap-2">
																{/* Regular time slots that are later than in_time */}
																{timeSlots[
																	selectedPeriod
																]
																	.filter(
																		(
																			timeSlot,
																		) => {
																			if (
																				!formData.in_time
																			)
																				return false;
																			return (
																				parseTime(
																					timeSlot,
																				) >
																				parseTime(
																					formData.in_time,
																				)
																			);
																		},
																	)
																	.map(
																		(
																			timeSlot,
																		) => (
																			<button
																				key={
																					timeSlot
																				}
																				type="button"
																				onClick={() => {
																					setFormData(
																						(
																							prev,
																						) => ({
																							...prev,
																							out_time:
																								timeSlot,
																						}),
																					);
																				}}
																				disabled={
																					isSubmitting ||
																					!formData.in_time
																				}
																				className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
																					formData.out_time ===
																					timeSlot
																						? "bg-[#B69549] text-white font-medium"
																						: `${colors.input} border ${colors.border} hover:${colors.hover} ${colors.textPrimary}`
																				} disabled:opacity-50 disabled:cursor-not-allowed`}
																			>
																				{
																					timeSlot
																				}
																			</button>
																		),
																	)}

																{/* Add 30-minute buffer if user selected the last available time slot */}
																{formData.in_time &&
																	timeSlots[
																		selectedPeriod
																	].filter(
																		(
																			timeSlot,
																		) =>
																			parseTime(
																				timeSlot,
																			) >
																			parseTime(
																				formData.in_time,
																			),
																	).length ===
																		0 && (
																		<button
																			type="button"
																			onClick={() => {
																				setFormData(
																					(
																						prev,
																					) => ({
																						...prev,
																						out_time:
																							addThirtyMinutes(
																								formData.in_time,
																							),
																					}),
																				);
																			}}
																			disabled={
																				isSubmitting
																			}
																			className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
																				formData.out_time ===
																				addThirtyMinutes(
																					formData.in_time,
																				)
																					? "bg-[#B69549] text-white font-medium"
																					: `${colors.input} border ${colors.border} hover:${colors.hover} ${colors.textPrimary}`
																			} disabled:opacity-50 disabled:cursor-not-allowed`}
																		>
																			{addThirtyMinutes(
																				formData.in_time,
																			)}
																		</button>
																	)}
															</div>
															{!formData.in_time && (
																<p
																	className={`text-xs ${colors.textMuted} mt-2`}
																>
																	Please
																	select an in
																	time first
																</p>
															)}
														</div>
													)}
												</div>
											)}
									</>
								) : (
									<div className="text-center py-4">
										<p className={`${colors.textMuted}`}>
											No time slots available. Please
											contact admin.
										</p>
									</div>
								)}
							</div>
						</div>
					</form>
				</div>

				{/* Fixed Footer */}
				<div
					className={`flex justify-end space-x-4 p-6 border-t ${colors.border}`}
				>
					<button
						type="button"
						onClick={handleClose}
						disabled={isSubmitting}
						className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
					>
						Cancel
					</button>
					<button
						type="submit"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="px-6 py-3 bg-[#B69549] text-white font-bold rounded-xl  transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isSubmitting ? "Updating..." : "Update"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default UpdateReservationModal;
