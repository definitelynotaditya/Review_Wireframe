import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiUser, FiPhone, FiMail, FiRepeat, FiUsers } from "react-icons/fi";
import Layout from "../components/Layout/Layout";
import StatCard from "../components/common/StatCard";
import Loader from "../components/common/Loader.jsx";
import { useAuthStore } from "../store/authStore.js";
import { reservationApi } from "../store/reservationStore.js";
import { useTheme } from "../context/ThemeContext.jsx";

const GuestList = () => {
	const { user } = useAuthStore();
	const { colors, isDark } = useTheme();
	const restaurantId = user?.restaurant_id;
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch guest list for this restaurant
	const {
		data: guestResponse = { data: [] },
		isLoading,
		error,
	} = useQuery({
		queryKey: ["guest-list", restaurantId],
		queryFn: () => reservationApi.getGuestList(restaurantId),
		enabled: !!restaurantId,
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
		cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
	});

	const guests = guestResponse.data || [];

	// Filter guests based on search term
	const filteredGuests = guests.filter((guest) => {
		const matchesSearch = 
			guest.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			guest.contact?.toString().includes(searchTerm) ||
			guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
	});

	// Get guest stats
	const getGuestStats = () => {
		const totalGuests = guests.length;
		const returningGuests = guests.filter(guest => guest.revisit_count > 0).length;
		const guestsWithEmail = guests.filter(guest => guest.email).length;
		const totalRevisits = guests.reduce((sum, guest) => sum + (guest.revisit_count || 0), 0);

		return {
			totalGuests,
			returningGuests,
			guestsWithEmail,
			totalRevisits
		};
	};

	const stats = getGuestStats();

	// Loading state
	if (isLoading) {
		return (
			<Layout
				title="Guest List"
				subtitle="View restaurant's guest list"
			>
				<Loader />
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout
				title="Guest List"
				subtitle="View restaurant's guest list"
			>
				<div className="flex justify-center items-center h-64">
					<div className={colors.textPrimary}>
						Error loading guest list: {error.message}
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="Guest List"
			subtitle="View restaurant's guest list"
		>
			<div className="space-y-6">
				{/* Stats Cards */}
				{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<StatCard
						title="Total Guests"
						value={stats.totalGuests}
						icon={FiUsers}
					/>
					<StatCard
						title="Returning Guests"
						value={stats.returningGuests}
						icon={FiRepeat}
					/>
					<StatCard
						title="With Email"
						value={stats.guestsWithEmail}
						icon={FiMail}
					/>
					<StatCard
						title="Total Revisits"
						value={stats.totalRevisits}
						icon={FiRepeat}
					/>
				</div> */}

				{/* Search Bar */}
				<div className={`${colors.card} rounded-xl border ${colors.border}`}>
					<div className="relative">
						<FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.textMuted}`} size={20} />
						<input
							type="text"
							placeholder="Search guests by name, phone, or email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={`w-full pl-10 pr-4 py-3 ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-lg focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
						/>
					</div>
				</div>

				{/* Guest List Table */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
							Guests ({filteredGuests.length})
						</h3>
					</div>

					{filteredGuests.length > 0 ? (
						<>
							{/* Desktop Table View */}
							<div className={`hidden lg:block ${colors.card} rounded-xl border ${colors.border} overflow-hidden`}>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className={`${colors.secondary} border-b ${colors.border}`}>
											<tr>
												<th className={`px-6 py-4 text-left text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>Guest</th>
												<th className={`px-6 py-4 text-left text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>Contact Details</th>
												<th className={`px-6 py-4 text-center text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>Visit History</th>
												<th className={`px-6 py-4 text-center text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>Status</th>
											</tr>
										</thead>
										<tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-300'} ${colors.border}`}>
											{filteredGuests.map((guest, index) => (
												<tr key={`${guest.contact}-${index}`} className={`${colors.hover} transition-colors duration-200`}>
													<td className="px-6 py-4">
														<div className="flex items-center space-x-3">
															<div>
																<p className={`font-medium truncate max-w-[250px] ${colors.textPrimary}`}>{guest.guest_name}</p>
															</div>
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="space-y-1">
															<div className={`flex items-center space-x-2 ${colors.textSecondary}`}>
																<FiPhone size={14} />
																<span className="text-sm">{guest.contact}</span>
															</div>
															{guest.email ? (
																<div className={`flex items-center space-x-2 ${colors.textSecondary}`}>
																	<FiMail size={14} />
																	<span className="text-sm truncate">{guest.email}</span>
																</div>
															) : (
																<div className={`flex items-center space-x-2 ${colors.textMuted}`}>
																	<FiMail size={14} />
																	<span className="text-sm italic">No email provided</span>
																</div>
															)}
														</div>
													</td>
													<td className="px-6 py-4 text-center">
														<div className="flex items-center justify-center space-x-2">
															<FiRepeat className="w-4 h-4 text-orange-500" />
															<span className={`font-semibold ${colors.textPrimary}`}>
																{guest.revisit_count + 1} visits
															</span>
														</div>
														<p className={`text-xs ${colors.textMuted} mt-1`}>
															{guest.revisit_count === 0 ? "First visit" : `${guest.revisit_count} returns`}
														</p>
													</td>
													<td className="px-6 py-4 text-center">
														{guest.revisit_count > 0 ? (
															<span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-600'} `}>
																<FiRepeat className="w-3 h-3 mr-1" />
																Returning Guest
															</span>
														) : (
															<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
																<FiUser className="w-3 h-3 mr-1" />
																New Guest
															</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Mobile Card View */}
							<div className="lg:hidden space-y-4">
								{filteredGuests.map((guest, index) => (
									<div
										key={`${guest.contact}-${index}`}
										className={`${colors.card} rounded-xl p-4 border ${colors.border} hover:shadow-lg transition-all duration-200`}
									>
										{/* Mobile-optimized card layout */}
										<div className="space-y-3">
											{/* Header Row */}
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className={`font-semibold ${colors.textPrimary} text-lg truncate max-w-[200px]`}>
														{guest.guest_name}
													</h3>
													<div className="mt-1">
														{guest.revisit_count > 0 ? (
															<span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-600'} `}>
																<FiRepeat className="w-3 h-3 mr-1" />
																Returning Guest
															</span>
														) : (
															<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
																<FiUser className="w-3 h-3 mr-1" />
																New Guest
															</span>
														)}
													</div>
												</div>
												<div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
													<FiRepeat className="w-4 h-4 text-orange-600 dark:text-orange-400" />
													<span className={`font-semibold text-sm ${colors.textPrimary}`}>
														{guest.revisit_count + 1} visits
													</span>
												</div>
											</div>

											{/* Visit Details */}
											<div className={`text-xs ${colors.textMuted}`}>
												{guest.revisit_count === 0 ? "First visit" : `${guest.revisit_count} return visits`}
											</div>

											{/* Contact Info Row */}
											<div className="grid grid-cols-1 gap-2 text-sm">
												<div className="flex items-center space-x-2">
													<FiPhone size={14} className={colors.textMuted} />
													<span className={colors.textPrimary}>
														{guest.contact}
													</span>
												</div>
												{guest.email ? (
													<div className="flex items-center space-x-2">
														<FiMail size={14} className={colors.textMuted} />
														<span className={`${colors.textPrimary} truncate`}>
															{guest.email}
														</span>
													</div>
												) : (
													<div className="flex items-center space-x-2">
														<FiMail size={14} className={colors.textMuted} />
														<span className={`${colors.textMuted} italic text-sm`}>
															No email provided
														</span>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className={`${colors.card} rounded-xl p-12 border ${colors.border} text-center`}>
							<div className={`w-16 h-16 ${colors.secondary} rounded-full flex items-center justify-center mx-auto mb-4`}>
								<FiUsers className={`w-8 h-8 ${colors.textMuted}`} />
							</div>
							<h3 className={`text-xl font-semibold ${colors.textPrimary} mb-2`}>
								{searchTerm ? "No guests found" : "No guests yet"}
							</h3>
							<p className={colors.textSecondary}>
								{searchTerm 
									? "Try adjusting your search terms." 
									: "Guest information will appear here once customers make reservations."}
							</p>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default GuestList;
