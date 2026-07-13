import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { PiChefHatFill } from "react-icons/pi";
import ChefSpecialsDetailModal from "../modals/ChefSpecialsDetailModal.jsx";

const ChefSpecialsRevenueCard = ({ chefSpecials }) => {
	const { isDark } = useTheme();
	const { restaurant } = useAuthStore();
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("All");

	const data = chefSpecials || [];
	const totalRevenue = data.reduce(
		(sum, item) => sum + Number(item.total_revenue || 0),
		0,
	);

	// Extract all dishes from all categories
	const allDishes = data.flatMap((category) =>
		(category.dishes_requested || []).map((dish) => ({
			...dish,
			category: category.menu_category_name,
		})),
	);

	// Get unique categories for filter tabs
	const categories = ["All", ...data.map((c) => c.menu_category_name)];

	// Filter dishes based on selected category
	const filteredDishes =
		selectedCategory === "All"
			? allDishes
			: allDishes.filter((dish) => dish.category === selectedCategory);
	
	return (
		<>
			<div
				className={`px-6 py-2 rounded-xl flex flex-col h-72 ${
					isDark
						? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
						: "bg-white border border-gray-200 shadow-sm"
				}`}
			>
				{/* Header with Title and Button */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<PiChefHatFill className={"text-[#B69549]"} size={24} />
						<h2
							className={`text-md font-medium uppercase tracking-wide ${
								isDark ? "text-gray-200" : "text-gray-500"
							}`}
						>
							Chef's Specials
						</h2>
					</div>

					<button
						onClick={() => setShowDetailModal(true)}
						className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
							isDark
								? "bg-[#B69549] hover:bg-[#a0854a] text-white"
								: "bg-[#B69549] hover:bg-[#a0854a] text-white"
						}`}
					>
						All Stats
					</button>
				</div>

				{data.length > 0 ? (
					<div className="flex-1 overflow-hidden flex flex-col min-h-0">
						{/* Category Filter Tabs */}
						<div className="mb-3 overflow-x-auto scrollbar-hide">
							<div className="flex gap-2">
								{categories.map((category) => (
									<button
										key={category}
										onClick={() =>
											setSelectedCategory(category)
										}
										className={`px-4 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
											selectedCategory === category
												? "bg-[#B69549] text-white"
												: isDark
													? "bg-gray-700 text-gray-300 hover:bg-gray-600"
													: "bg-gray-200 text-gray-700 hover:bg-gray-300"
										}`}
									>
										{category}
									</button>
								))}
							</div>
						</div>
                        <hr className={isDark ? "text-gray-600 mb-2" : "text-gray-300 mb-2"} />

						{/* Dishes List */}
						<div className="flex-1 overflow-y-auto space-y-3 scrollbar-none mt-1">
							{filteredDishes.length > 0 ? (
								filteredDishes.map((dish, index) => (
									<div
										key={index}
										className={`flex gap-4 pb-3 ${
											index < filteredDishes.length - 1
												? isDark
													? "border-b border-gray-700"
													: "border-b border-gray-200"
												: ""
										}`}
									>
										{/* Dish Image */}
										<div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-300">
											{dish.dish_image_url ? (
												<img
													src={dish.dish_image_url}
													alt={dish.dish_name}
													className="w-full h-full object-cover"
												/>
											) : (
												<div
													className={`w-full h-full flex items-center justify-center ${
														isDark
															? "bg-gray-700"
															: "bg-gray-200"
													}`}
												>
													<span className="text-xs text-gray-500">
														No img
													</span>
												</div>
											)}
										</div>

										{/* Dish Info */}
										<div className="flex-1 min-w-0">
											<h4
												className={`font-semibold text-sm mb-1 line-clamp-1 ${
													isDark
														? "text-gray-100"
														: "text-gray-900"
												}`}
											>
												{dish.dish_name}
											</h4>
											<div className="flex items-center gap-2">
												<p
													className={`text-sm font-semibold ${
														isDark
															? "luxegenie-gradient"
															: "text-[#9F7A24]"
													}`}
												>
													{restaurant?.currency_notation ||
														"$"}
													{Number(
														dish.avg_price_per_order,
													).toLocaleString("en-IN", {
														minimumFractionDigits: 0,
														maximumFractionDigits: 0,
													})}
												</p>
												<span className="text-gray-400">
													•
												</span>
												<div className="flex items-center gap-1">
													<span
														className={`text-xs font-medium uppercase ${
															dish.veg_nonveg?.toLowerCase() ===
															"veg"
																? "text-green-500"
																: "text-red-500"
														}`}
													>
														{dish.veg_nonveg}
													</span>
												</div>
											</div>
										</div>

										{/* Request Count */}
										<div className="flex flex-col items-end justify-center">
											<p
												className={`text-lg font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
											>
												{dish.dish_order_count}
											</p>
											<p
												className={`text-xs uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
											>
												{dish.dish_order_count === 1 ? "Request" : "Requests"}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="flex items-center justify-center h-32">
									<p
										className={
											isDark
												? "text-gray-500"
												: "text-gray-400"
										}
									>
										No dishes available
									</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center h-32">
						<p
							className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
						>
							No data available
						</p>
					</div>
				)}
			</div>

			{/* Chef Specials Detail Modal */}
			<ChefSpecialsDetailModal
				isOpen={showDetailModal}
				onClose={() => setShowDetailModal(false)}
				chefSpecials={data}
			/>
		</>
	);
};

export default ChefSpecialsRevenueCard;
