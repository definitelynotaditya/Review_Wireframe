import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout/Layout.jsx";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { recentActivitiesApi } from "../store/recentActivitiesStore";
import Loader from "../components/common/Loader";
import {
	FiActivity,
	FiClock,
	FiMapPin,
	FiUser,
	FiRefreshCw,
	FiAlertCircle,
} from "react-icons/fi";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { IoBatteryCharging, IoRestaurant } from "react-icons/io5";
import { BsEmojiSmileFill, BsPersonRaisedHand } from "react-icons/bs";
import { BiSolidDish } from "react-icons/bi";
import {
	TbAlertTriangleFilled,
	TbCreditCard,
	TbReceiptDollar,
} from "react-icons/tb";
import { TbReceipt } from "react-icons/tb";
import { AiFillStar } from "react-icons/ai";
import { PiSmileySadBold } from "react-icons/pi";
import { BiTransfer } from "react-icons/bi";

const RecentActivities = () => {
	const { colors, isDark } = useTheme();
	const { user } = useAuthStore();
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Fetch activities
	const {
		data: activities = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["recentActivities", user?.restaurant_id],
		queryFn: () => recentActivitiesApi.fetchActivities(user?.restaurant_id),
		enabled: !!user?.restaurant_id,
		// refetchInterval: 30000, // Refetch every 30 seconds
	});

	// Handle refresh with loading indicator
	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

	// Get activity icon and color based on activity type
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
					bgColor: isDark ? "bg-yellow-500/10" : "bg-yellow-500/10",
					borderColor: "border-yellow-500/20",
				};
			case "managers_attention":
				return {
					icon: TbAlertTriangleFilled,
					color: isDark ? "text-red-500" : "text-red-700",
					bgColor: isDark ? "bg-red-500/10" : "bg-red-500/10",
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
					bgColor: isDark ? "bg-green-500/10" : "bg-green-500/10",
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
					bgColor: isDark ? "bg-green-500/10" : "bg-green-500/10",
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

	const formatTime = (utcTime) => {
		return new Date(utcTime).toLocaleString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatTimeAgo = (utcTime) => {
		return formatDistanceToNow(new Date(utcTime), { addSuffix: true });
	};

	// Format date for grouping
	const formatDateGroup = (date) => {
		if (isToday(date)) return "Today";
		if (isYesterday(date)) return "Yesterday";
		return format(date, "MMM dd, yyyy");
	};

	// Group activities by date
	const groupedActivities = activities.reduce((groups, activity) => {
		const date = new Date(activity.activity_data.timestamp);
		const dateKey = formatDateGroup(date);

		if (!groups[dateKey]) {
			groups[dateKey] = [];
		}
		groups[dateKey].push(activity);
		return groups;
	}, {});

	if (isLoading) {
		return (
			<Layout
				title="All Recent Activities"
				subtitle="Monitor all restaurant activities"
			>
				<Loader />
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout
				title="All Recent Activities"
				subtitle="Monitor all restaurant activities"
			>
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<FiAlertCircle
						className={`w-12 h-12 ${colors.textMuted}`}
					/>
					<div className="text-center">
						<h3
							className={`text-lg font-semibold ${colors.textPrimary} mb-2`}
						>
							Failed to Load Activities
						</h3>
						<p className={`${colors.textSecondary} mb-4`}>
							{error.message ||
								"Something went wrong while fetching activities"}
						</p>
						<button
							onClick={handleRefresh}
							disabled={isRefreshing}
							className={`flex items-center space-x-2 px-4 py-2 ${colors.button} rounded-xl transition-colors ${isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}`}
						>
							<FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
							<span>{isRefreshing ? "Trying Again..." : "Try Again"}</span>
						</button>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="All Recent Activities"
			subtitle="Monitor all restaurant activities"
		>
			<div className="space-y-6">
				{/* Header with refresh button */}
				<div className="flex justify-between items-center">
					<div>
						<h2
							className={`text-lg sm:text-xl font-semibold ${colors.textPrimary}`}
						>
							Recent Activities
						</h2>
						<p className={`${colors.textSecondary} mt-1 text-sm`}>
							{activities.length} activities found
						</p>
					</div>
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className={`flex items-center space-x-2 px-2 sm:px-4 py-2 ${colors.button} rounded-xl transition-colors text-sm ${isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}`}
					>
						<FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
						<span className="inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
					</button>
				</div>

				{/* Activities List */}
				{activities.length === 0 ? (
					<div
						className={`${colors.cardBg} rounded-2xl p-8 border ${colors.border} text-center`}
					>
						<FiActivity
							className={`w-12 h-12 mx-auto ${colors.textMuted} mb-4`}
						/>
						<h3
							className={`text-lg font-semibold ${colors.textPrimary} mb-2`}
						>
							No Activities Found
						</h3>
						<p className={`${colors.textSecondary}`}>
							No recent activities to display for this session.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{Object.entries(groupedActivities).map(
							([dateGroup, dateActivities]) => (
								<div key={dateGroup}>
									{/* Date Group Header */}
									<h3
										className={`text-lg font-semibold ${colors.textPrimary} mb-4 flex items-center`}
									>
										<FiClock className="w-5 h-5 mr-2" />
										<div className="flex gap-2">
											{dateGroup}
											<span
												className={`text-md ${colors.textMuted} ${colors.cardBg} rounded-full`}
											>
												({dateActivities.length})
											</span>
										</div>
									</h3>

									{/* Activities for this date */}
									<div className="space-y-3">
										{dateActivities.map((activity) => {
											const {
												icon: IconComponent,
												color,
												bgColor,
												borderColor,
											} = getActivityDetails(
												activity.activity_type,
											);

											return (
												<div
													key={activity.activity_id}
													className={`${colors.cardBg} rounded-xl p-3 sm:p-4 border ${isDark ? "border-gray-700" : "border-gray-300"} hover:shadow-lg transition-all duration-200`}
												>
													<div className="flex items-start space-x-3">
														{/* Activity Icon */}
														<div
															className={`p-2.5 sm:p-3 rounded-xl ${bgColor} border ${borderColor} flex-shrink-0`}
														>
															<IconComponent
																className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`}
															/>
														</div>

														{/* Activity Details */}
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between gap-2">
																<p
																	className={`${colors.textPrimary} font-medium mb-1.5 text-sm sm:text-base leading-snug`}
																>
																	{activity
																		.activity_data
																		?.activity ||
																		"Unknown Activity"}
																</p>
																{/* Time Ago */}
																<div
																	className={`text-xs ${colors.textMuted} whitespace-nowrap flex-shrink-0`}
																>
																	{formatTimeAgo(activity.activity_data.timestamp)}
																</div>
															</div>

															{/* Activity Metadata */}
															<div
																className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm ${colors.textSecondary}`}
															>
																{/* <span className="flex items-center">
                                                                <FiMapPin className="w-3.5 h-3.5 mr-1" />
                                                                Table {activity.table_id}
                                                            </span> */}
																<span className="flex items-center">
																	<FiClock className="w-3.5 h-3.5 mr-1" />
																	{formatTime(activity.activity_data.timestamp)}
																</span>
																<span
																	className={`px-2 py-0.5 rounded-full text-xs ${bgColor} ${color}`}
																>
																	{activity.activity_type
																		.replace(
																			/_/g,
																			" ",
																		)
																		.toUpperCase()}
																</span>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							),
						)}
					</div>
				)}
			</div>
		</Layout>
	);
};

export default RecentActivities;
