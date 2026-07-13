import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiPlus, FiEdit2, FiImage } from "react-icons/fi";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline } from "react-icons/io";
import Layout from "../components/Layout/Layout";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import { chefSpecialsApi } from "../store/chefSpecialsStore";
import Loader from "../components/common/Loader.jsx";
import AddChefSpecialModal from "../components/modals/chefspecials/AddChefSpecialModal";
import UpdateChefSpecialModal from "../components/modals/chefspecials/UpdateChefSpecialModal";
import ToggleChefSpecialConfirmationModal from "../components/modals/chefspecials/ToggleChefSpecialConfirmationModal.jsx";

const ChefSpecials = () => {
	const { colors, isDark } = useTheme();
	const { user } = useAuthStore();
	const restaurantId = user?.restaurant_id;

	const [showAddModal, setShowAddModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showToggleModal, setShowToggleModal] = useState(false);
	const [selectedChefSpecial, setSelectedChefSpecial] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedActiveTab, setSelectedActiveTab] = useState("Active"); // Active by default

	// Fetch chef specials for this restaurant
	const {
		data: chefSpecials = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["chef-specials", restaurantId],
		queryFn: () => chefSpecialsApi.getChefSpecials(restaurantId),
		enabled: !!restaurantId,
		select: (data) => (data.success ? data.data : []),
	});

	// Filter chef specials based on search, category, and active status
	const filteredChefSpecials = chefSpecials.filter((special) => {
		const matchesSearch =
			special.dish_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			special.dish_description
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			special.menu_category_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === "All" ||
			special.menu_category_name === selectedCategory;

		const matchesActiveStatus =
			selectedActiveTab === "All" ||
			(selectedActiveTab === "Active" && special.active === true) ||
			(selectedActiveTab === "Inactive" && special.active === false);

		return matchesSearch && matchesCategory && matchesActiveStatus;
	});

	// Get unique categories for filter tabs
	const categories = [
		"All",
		...new Set(chefSpecials.map((special) => special.menu_category_name)),
	];

	// Get category counts for tabs
	const getCategoryCounts = () => {
		const counts = {
			All: chefSpecials.length,
		};
		
		// Add counts for each category
		categories.slice(1).forEach(category => {
			counts[category] = chefSpecials.filter(special => 
				special.menu_category_name === category
			).length;
		});
		
		return counts;
	};

	// Get category tab color similar to Tables.jsx
	const getCategoryTabColor = (category, isSelected) => {
		if (isSelected) {
			return "bg-[#B69549] text-white shadow-lg";
		}
		
		// Default styling for unselected tabs
		return `bg-gray-200 text-gray-700 hover:cursor-pointer `;
	};

	const categoryCounts = getCategoryCounts();

	// Format price for display (remove currency symbol)
	const formatPrice = (price) => {
		return parseFloat(price).toFixed(2);
	};

	// Get image URL with CloudFront support
	const getImageUrl = (dishImg) => {
		// If dish_img is provided, use it directly (it's already a CloudFront URL)
		if (dishImg && dishImg.startsWith('http')) {
			return dishImg;
		}
		// Fallback for legacy data or missing images
		return dishImg || "";
	};

	// Get veg/non-veg indicator
	const getVegIndicator = (type) => {
		return type === "veg" ? (
			<span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-200 text-green-800">
				Veg
			</span>
		) : (
			<span className="inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-medium bg-red-200 text-red-800">
				Non-Veg
			</span>
		);
	};

	const handleEditChefSpecial = (chefSpecial) => {
		setSelectedChefSpecial(chefSpecial);
		setShowUpdateModal(true);
	};

	const handleToggleChefSpecial = (chefSpecial) => {
		setSelectedChefSpecial(chefSpecial);
		setShowToggleModal(true);
	};

	const handleCloseUpdateModal = () => {
		setShowUpdateModal(false);
		setSelectedChefSpecial(null);
	};

	const handleCloseToggleModal = () => {
		setShowToggleModal(false);
		setSelectedChefSpecial(null);
	};

	// Loading state
	if (isLoading) {
		return (
			<Layout
				title="Chef'S Specials"
				subtitle="Manage your chef specials and featured dishes"
			>
				<Loader />
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout
				title="Chef's Specials"
				subtitle="Manage your chef specials and featured dishes"
			>
				<div className="flex justify-center items-center h-64">
					<div className="text-red-600">
						Error loading chef specials: {error.message}
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="Chef's Specials"
			subtitle="Manage your chef's specials and featured dishes"
		>
			<div className="space-y-6">
				{/* Header with Search and Add Button */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					{/* Search Bar */}
					<div className="relative flex-1 max-w-md">
						<FiSearch
							className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={20}
						/>
						<input
							type="text"
							placeholder="Search chef specials..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={`w-full pl-12 pr-4 py-3 ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
						/>
					</div>

					{/* Add Chef Special Button */}
					<button
						onClick={() => setShowAddModal(true)}
						className={`flex items-center space-x-2 px-6 py-3 text-white bg-[#B69549] rounded-xl transition-all duration-200 hover:shadow-lg whitespace-nowrap hover:cursor-pointer`}
					>
						<FiPlus size={18} />
						<span>Add Chef Special</span>
					</button>
				</div>

				{/* Active/Inactive Status Tabs */}
				<div className={`${colors.card} rounded-xl border ${colors.border} p-1`}>
					<div className="flex flex-wrap gap-2 p-1">
						{["Active", "Inactive", "All"].map((tab) => (
							<button
								key={tab}
								onClick={() => setSelectedActiveTab(tab)}
								className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
									selectedActiveTab === tab
										? "bg-[#B69549] text-white shadow-lg"
										: "bg-gray-200 text-gray-700 hover:cursor-pointer"
								}`}
							>
								{tab} ({
									tab === "All" 
										? chefSpecials.length 
										: tab === "Active"
										? chefSpecials.filter(s => s.active === true).length
										: chefSpecials.filter(s => s.active === false).length
								})
							</button>
						))}
					</div>
				</div>

				{/* Category Filter Tabs */}
				<div className={`${colors.card} rounded-xl border ${colors.border} p-1 relative`}>
					{/* Desktop & Tablet Tabs */}
					<div className="hidden sm:flex flex-wrap gap-2 p-1">
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${getCategoryTabColor(
									category,
									selectedCategory === category
								)}`}
							>
								{category} ({categoryCounts[category] || 0})
							</button>
						))}
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
								<span>Swipe to see more categories</span>
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
								{categories.map((category) => (
									<button
										key={category}
										onClick={() => setSelectedCategory(category)}
										className={`px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-max ${getCategoryTabColor(
											category,
											selectedCategory === category
										)}`}
									>
										{category} ({categoryCounts[category] || 0})
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Chef Specials Grid */}
				<div
					className={`${colors.card} rounded-2xl border ${colors.border}`}
				>
					{filteredChefSpecials.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
								<FiImage size={24} className="text-gray-400" />
							</div>
							<h3
								className={`text-lg font-medium ${colors.textPrimary} mb-2`}
							>
								{searchTerm || selectedCategory !== "All"
									? "No chef specials found"
									: "No chef specials yet"}
							</h3>
							<p className={`${colors.textSecondary} mb-4`}>
								{searchTerm || selectedCategory !== "All"
									? "Try adjusting your search or filter criteria"
									: "Start by adding your first chef special dish"}
							</p>
							{!searchTerm && selectedCategory === "All" && (
								<button
									onClick={() => setShowAddModal(true)}
									className={`px-6 py-3 ${colors.button} rounded-xl transition-all duration-200 hover:shadow-lg`}
								>
									Add Chef Special
								</button>
							)}
						</div>
					) : (
						<>
							{/* Desktop Table View */}
							<div className="hidden lg:block overflow-x-auto">
								<table className="w-full">
									<thead className={`${colors.secondary} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
										<tr>
											<th className={`text-left py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Dish
											</th>
											<th className={`text-left py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Category
											</th>
											<th className={`text-left py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Type
											</th>
											<th className={`text-left py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Price
											</th>
											<th className={`text-left py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Calories
											</th>
											<th className={`text-center py-4 px-6 text-sm font-semibold ${colors.textPrimary} uppercase tracking-wider`}>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
										{filteredChefSpecials.map((chefSpecial) => (
											<tr
												key={chefSpecial.chef_special_id}
												className={`hover:${colors.secondary} transition-colors duration-200`}
											>
												{/* Dish Info */}
												<td className="py-6 px-6">
													<div className="flex items-center space-x-4">
														<div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
															{chefSpecial.dish_img ? (
																<img
																	src={getImageUrl(chefSpecial.dish_img)}
																	alt={chefSpecial.dish_name}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full bg-gray-300 flex items-center justify-center">
																	<FiImage size={24} className="text-gray-500" />
																</div>
															)}
														</div>
														<div className="min-w-0 flex-1">
															<h3 className={`font-semibold ${colors.textPrimary} text-lg truncate max-w-[250px]`}>
																{chefSpecial.dish_name}
															</h3>
															<p className={`${colors.textSecondary} text-sm mt-1 max-w-xs line-clamp-2`}>
																{chefSpecial.dish_description}
															</p>
														</div>
													</div>
												</td>

												{/* Category */}
												<td className="py-6 px-6">
													<span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium ${colors.secondary} ${colors.textSecondary} border ${colors.border}`}>
														{chefSpecial.menu_category_name}
													</span>
												</td>

												{/* Type */}
												<td className="py-6 px-6">
													{getVegIndicator(chefSpecial.veg_nonveg)}
												</td>

												{/* Price */}
												<td className="py-6 px-6">
													<div className="flex items-center">
														<span className={`text-lg font-semibold ${colors.textPrimary} ml-1`}>
															{formatPrice(chefSpecial.dish_price)}
														</span>
													</div>
												</td>

												{/* Calories */}
												<td className="py-6 px-6">
													{chefSpecial.calories ? (
														<div className="flex items-center space-x-1">
															<span className={`text-md font-medium ${colors.textPrimary}`}>
																{chefSpecial.calories}
															</span>
															<span className={`text-md ${colors.textSecondary}`}>cal</span>
														</div>
													) : (
														<span className={`text-md ${colors.textMuted}`}>-</span>
													)}
												</td>

												{/* Action Buttons */}
												<td className="py-6 px-6">
													<div className="flex items-center justify-center space-x-3">
														<button
															onClick={() => handleEditChefSpecial(chefSpecial)}
															className={`p-3 ${colors.hover} rounded-xl transition-all duration-200 hover:cursor-pointer ${colors.textSecondary} hover:scale-105`}
															title="Edit chef special"
														>
															<FiEdit2 size={18} />
														</button>
														<button
															onClick={() => handleToggleChefSpecial(chefSpecial)}
															className={`p-3 rounded-xl transition-all duration-200 hover:cursor-pointer hover:scale-105 ${
																chefSpecial.active 
																	? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30" 
																	: "text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30"
															}`}
															title={chefSpecial.active ? "Deactivate" : "Activate"}
														>
															{chefSpecial.active ? (
																<IoIosCheckmarkCircleOutline size={24} />
															) : (
																<IoIosCloseCircleOutline size={24} />
															)}
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Mobile Card View */}
							<div className="lg:hidden space-y-4">
								{filteredChefSpecials.map((chefSpecial) => (
									<div
										key={chefSpecial.chef_special_id}
										className={`${colors.secondary} rounded-xl border ${colors.borderMuted} overflow-hidden hover:shadow-lg transition-all duration-200`}
									>
										{/* Dish Image */}
										<div className="h-48 bg-gray-200 relative">
											{chefSpecial.dish_img ? (
												<img
													src={getImageUrl(chefSpecial.dish_img)}
													alt={chefSpecial.dish_name}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full bg-gray-300 flex items-center justify-center">
													<FiImage
														size={32}
														className="text-gray-500"
													/>
												</div>
											)}
											{/* Veg/Non-Veg Indicator */}
											<div className="absolute top-3 left-3">
												{getVegIndicator(
													chefSpecial.veg_nonveg
												)}
											</div>
											{/* Price */}
											<div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg">
												<span className="font-bold">
													{formatPrice(
														chefSpecial.dish_price
													)}
												</span>
											</div>
										</div>

										{/* Dish Details */}
										<div className="p-4">
											<div className="flex justify-between items-start mb-2">
												<h3
													className={`text-lg font-semibold ${colors.textPrimary} line-clamp-1`}
												>
													{chefSpecial.dish_name}
												</h3>
											</div>

											<p
												className={`${colors.textSecondary} text-sm mb-3 line-clamp-2`}
											>
												{chefSpecial.dish_description}
											</p>

											<div className="flex justify-between items-center mb-4">
												<span
													className={`text-xs px-2 py-1 ${colors.secondary} rounded-lg ${colors.textSecondary}`}
												>
													{
														chefSpecial.menu_category_name
													}
												</span>
												{chefSpecial.calories && (
													<span
														className={`text-xs ${colors.textMuted}`}
													>
														{chefSpecial.calories}{" "}
														cal
													</span>
												)}
											</div>

											{/* Action Buttons */}
											<div className="flex space-x-2">
												<button
													onClick={() =>
														handleToggleChefSpecial(
															chefSpecial
														)
													}
													className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
														chefSpecial.active
															? "bg-green-600 hover:bg-green-700 text-white"
															: "bg-red-400 hover:bg-red-500 text-white"
													}`}
												>
													{chefSpecial.active ? (
														<>
															<IoIosCheckmarkCircleOutline size={18} />
															<span className="text-sm">Active</span>
														</>
													) : (
														<>
															<IoIosCloseCircleOutline size={18} />
															<span className="text-sm">Inactive</span>
														</>
													)}
												</button>
												<button
													onClick={() =>
														handleEditChefSpecial(
															chefSpecial
														)
													}
													className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-[#B69549] text-white rounded-lg transition-colors duration-200"
												>
													<FiEdit2 size={14} />
													<span className="text-sm">
														Edit
													</span>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Modals */}
			<AddChefSpecialModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				restaurantId={restaurantId}
			/>

			<UpdateChefSpecialModal
				isOpen={showUpdateModal}
				onClose={handleCloseUpdateModal}
				chefSpecial={selectedChefSpecial}
				restaurantId={restaurantId}
			/>

			<ToggleChefSpecialConfirmationModal
				isOpen={showToggleModal}
				onClose={handleCloseToggleModal}
				chefSpecial={selectedChefSpecial}
				restaurantId={restaurantId}
			/>
		</Layout>
	);
};

export default ChefSpecials;
