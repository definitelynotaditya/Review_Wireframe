import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../context/ThemeContext";
import { recentActivitiesApi } from "../../store/recentActivitiesStore";
import { formatDistanceToNow } from "date-fns";
import {
	FiBell,
	FiSearch,
	FiUser,
	FiSettings,
	FiLogOut,
	FiGlobe,
	FiMenu,
	FiSun,
	FiMoon,
	FiActivity,
	FiHelpCircle,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import LogoutConfirmationModal from "../modals/LogoutConfirmationModal";
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

const Header = ({ title, subtitle, isMobile, onMenuToggle }) => {
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [lastViewedTimestamp, setLastViewedTimestamp] = useState(() => {
		// Initialize from localStorage
		return localStorage.getItem("notifications_last_viewed") || null;
	});
	const notificationRef = useRef(null);
	const profileRef = useRef(null);

	const navigate = useNavigate();
	const location = useLocation();
	const { logout, user } = useAuthStore();
	const { theme, toggleTheme, colors, isDark } = useTheme();

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target)
			) {
				setShowNotifications(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(event.target)
			) {
				setShowProfile(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Fetch recent activities for notifications
	const [selectedSessionId] = useState(17); // Default session ID - you can make this dynamic
	const { data: activities = [], isLoading: activitiesLoading } = useQuery({
		queryKey: ["headerActivities", user?.restaurant_id, selectedSessionId],
		queryFn: () =>
			recentActivitiesApi.fetchActivities(
				user?.restaurant_id,
				selectedSessionId,
			),
		enabled: !!user?.restaurant_id && !!selectedSessionId,
		refetchInterval: 60000, // Refresh every minute
		select: (data) => data.slice(0, 3), // Show only latest 3 activities
	});

	// Reset notifications viewed state when new activities arrive
	useEffect(() => {
		// No need to reset anything here with timestamp approach
	}, [activities]);

	// Helper function to check if there are unread notifications
	const hasUnreadNotifications = () => {
		if (!activities || activities.length === 0 || !lastViewedTimestamp) {
			return activities && activities.length > 0;
		}

		// Check if any activity is newer than the last viewed timestamp
		return activities.some(
			(activity) =>
				new Date(activity.activity_data.timestamp) > new Date(lastViewedTimestamp),
		);
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

	// Format activity message for notifications
	const formatActivityMessage = (activity) => {
		const activityText = activity.activity_data?.activity || "";
		// Extract table number from the activity text
		const tableMatch = activityText.match(/Table (\d+)/);
		const tableNumber = tableMatch ? tableMatch[1] : activity.table_id;

		if (activity.activity_type === "tap_for_service") {
			return `Table ${tableNumber} requested service`;
		} else if (activity.activity_type === "physical_menu_request") {
			return `Table ${tableNumber} requested physical menu`;
		}
		return activityText;
	}; // Helper function to get user initials
	const getUserInitials = (username) => {
		if (!username) return "U";
		const words = username.split(" ");
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return username.slice(0, 2).toUpperCase();
	};

	// Helper function to map role to display name
	const mapRoleToDisplay = (role) => {
		switch (role?.toLowerCase()) {
			case "admin":
				return "Manager";
			default:
				return role
					? role.charAt(0).toUpperCase() + role.slice(1)
					: "User";
		}
	};

	const handleLogout = () => {
		setShowProfile(false);
		setShowLogoutModal(true);
	};

	const handleConfirmLogout = () => {
		setIsLoggingOut(true);
		setTimeout(() => {
			logout();
			navigate("/login");
		}, 500);
	};

	const handleCloseLogoutModal = () => {
		setShowLogoutModal(false);
		setIsLoggingOut(false);
	};

	return (
		<header
			className={`${colors.header} backdrop-blur-xl border-b ${colors.borderMuted} px-3 sm:px-4 lg:px-6 py-4.5 ${colors.shadow} relative z-30`}
		>
			<div className="flex items-center justify-between">
				{/* Left Section with Mobile Menu */}
				<div className="flex items-center space-x-3 min-w-0 flex-1">
					{/* Mobile Menu Button */}
					{isMobile && (
						<button
							onClick={onMenuToggle}
							className={`p-2 rounded-lg ${colors.hover} transition-colors duration-200 lg:hidden`}
						>
							<FiMenu size={20} className={colors.textPrimary} />
						</button>
					)}

					{/* Page Title */}
					<div className="min-w-0 flex-1">
						<h1
							className={`${theme === "dark" ? "luxegenie-gradient" : "text-[#9F7A24]"} text-xl sm:text-xl lg:text-2xl font-bold tracking-tight truncate`}
						>
							{title}
						</h1>
						{subtitle && (
							<p
								className={`${colors.textSecondary} text-xs sm:text-sm lg:text-md mt-1 truncate hidden sm:block`}
							>
								{subtitle}
							</p>
						)}
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
					{/* Search - Hidden on mobile */}
					{/* <div className="relative hidden md:block">
						<FiSearch
							className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.textMuted}`}
							size={18}
						/>
						<input
							type="text"
							placeholder="Search reservations, users, devices..."
							className={`pl-10 pr-4 py-2 w-64 lg:w-80 ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
						/>
					</div> */}

					{/* Theme Toggle Button */}
					<button
						onClick={toggleTheme}
						className={`p-2 rounded-xl ${colors.button} transition-colors duration-200 group hover:cursor-pointer`}
						title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
					>
						{theme === "dark" ? (
							<FiSun size={20} className={colors.textSecondary} />
						) : (
							<FiMoon
								size={20}
								className={colors.textSecondary}
							/>
						)}
					</button>

					{/* Notifications */}
					<div className="relative" ref={notificationRef}>
						<button
							onClick={() => {
								setShowNotifications(!showNotifications);
								if (!showNotifications) {
									// Mark notifications as viewed by storing current timestamp
									const currentTimestamp =
										new Date().toISOString();
									setLastViewedTimestamp(currentTimestamp);
									localStorage.setItem(
										"notifications_last_viewed",
										currentTimestamp,
									);
								}
							}}
							className={`relative p-2 rounded-xl ${colors.button} hover:cursor-pointer transition-colors duration-200 group`}
						>
							<FiBell
								size={20}
								className={colors.textSecondary}
							/>
							{!activitiesLoading && hasUnreadNotifications() && (
								<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
									{activities.length > 9
										? "9+"
										: activities.length}
								</span>
							)}
						</button>

						{/* Notifications Dropdown */}
						{showNotifications && (
							<div
								className={`absolute -right-10 md:right-0 top-full mt-2 w-80 z-50 ${colors.card} rounded-xl ${colors.shadowLg} border ${colors.border} z-[10000]`}
							>
								<div
									className={`p-4 border-b ${colors.borderMuted}`}
								>
									<h3
										className={`font-semibold ${colors.textPrimary}`}
									>
										Notifications
									</h3>
								</div>
								<div>
									{activitiesLoading ? (
										<div className="p-6 text-center">
											<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
											<p
												className={`mt-2 text-sm ${colors.textMuted}`}
											>
												Loading activities...
											</p>
										</div>
									) : activities && activities.length > 0 ? (
										activities.map((activity) => {
											const details = getActivityDetails(
												activity.activity_type,
											);
											const IconComponent = details.icon;
											const message =
												formatActivityMessage(activity);
											const timeAgo = formatDistanceToNow(
												new Date(activity.activity_data.timestamp),
												{ addSuffix: true },
											);

											return (
												<div
													key={activity.activity_id}
													className={`p-4 border-b ${colors.borderMuted} ${colors.hover} transition-colors duration-200 cursor-pointer last:border-b-0`}
													onClick={() => {
														setShowNotifications(
															false,
														);
														navigate(
															"/restaurant/recent-activities",
														);
													}}
												>
													<div className="flex items-start space-x-3">
														<div
															className={`flex-shrink-0 w-10 h-10 rounded-full ${details.bgColor} border ${details.borderColor} flex items-center justify-center`}
														>
															<IconComponent
																size={16}
																className={
																	details.color
																}
															/>
														</div>
														<div className="flex-1 min-w-0">
															<p
																className={`text-sm ${colors.textPrimary} font-medium overflow-hidden`}
																style={{
																	display:
																		"-webkit-box",
																	WebkitLineClamp: 2,
																	WebkitBoxOrient:
																		"vertical",
																}}
															>
																{/* {message} */}
																{activity.activity_data.activity || message}
															</p>
															<p
																className={`text-xs ${colors.textMuted} mt-1`}
															>
																{timeAgo}
															</p>
														</div>
													</div>
												</div>
											);
										})
									) : (
										<div className="p-6 text-center">
											<FiBell
												size={24}
												className={`${colors.textMuted} mx-auto mb-2`}
											/>
											<p
												className={`text-sm ${colors.textMuted}`}
											>
												No recent activities
											</p>
										</div>
									)}
								</div>
								<div
									className={`p-3 border-t ${colors.borderMuted}`}
								>
									<button
										className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:cursor-pointer transition-colors duration-200"
										onClick={() => {
											setShowNotifications(false);
											navigate(
												"/restaurant/recent-activities",
											);
										}}
									>
										View all activities
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Profile Dropdown */}
					<div className="relative" ref={profileRef}>
						<button
							onClick={() => setShowProfile(!showProfile)}
							className="flex items-center space-x-3 rounded-xl hover:cursor-pointer transition-colors duration-200 group"
						>
							<div
								className={`w-8 h-8 ${colors.button} rounded-full flex items-center justify-center ${colors.shadow}`}
							>
								{/* <span className={`${colors.textPrimary} font-semibold text-sm`}>
									{getUserInitials(user?.username)}
								</span> */}
								<FaUserCircle size={40} />
							</div>
							<div className="text-left hidden sm:block">
								<p
									className={`text-sm font-medium ${colors.textPrimary}`}
								>
									{mapRoleToDisplay(user?.role)}
								</p>
								<p
									className={`text-xs ${colors.textSecondary}`}
								>
									{user?.username || "user"}
								</p>
							</div>
						</button>

						{/* Profile Dropdown */}
						{showProfile && (
							<div
								className={`absolute right-0 top-full mt-2 w-48 ${colors.card} rounded-xl ${colors.shadowLg} border ${colors.border} z-[9999]`}
							>
								<div className="p-2">
									{/* <button className={`w-full flex items-center space-x-3 p-3 rounded-lg ${colors.hover} transition-colors duration-200 text-left`}>
										<FiUser
											size={16}
											className={colors.textMuted}
										/>
										<span className={`text-sm ${colors.textPrimary}`}>
											Profile
										</span>
									</button>
									<button className={`w-full flex items-center space-x-3 p-3 rounded-lg ${colors.hover} transition-colors duration-200 text-left`}>
										<FiSettings
											size={16}
											className={colors.textMuted}
										/>
										<span className={`text-sm ${colors.textPrimary}`}>
											Settings
										</span>
									</button>
									<button className={`w-full flex items-center space-x-3 p-3 rounded-lg ${colors.hover} transition-colors duration-200 text-left`}>
										<FiGlobe
											size={16}
											className={colors.textMuted}
										/>
										<span className={`text-sm ${colors.textPrimary}`}>
											Language
										</span>
									</button>
									<div className={`border-t ${colors.borderMuted} my-1`}></div> */}
									<button
										onClick={handleLogout}
										className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 text-left text-red-600 hover:cursor-pointer"
									>
										<FiLogOut size={16} />
										<span className="text-sm">
											Sign Out
										</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<LogoutConfirmationModal
				isOpen={showLogoutModal}
				onClose={handleCloseLogoutModal}
				onConfirm={handleConfirmLogout}
				isLoading={isLoggingOut}
			/>
		</header>
	);
};

export default Header;
