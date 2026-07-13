import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import {
	FaClock,
	FaSync,
	FaBell,
	FaUserTie,
	FaRupeeSign,
} from "react-icons/fa";

const MetricsRow = ({ metrics, onRevenueClick }) => {
	const { isDark } = useTheme();
	const { restaurant } = useAuthStore();

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: restaurant?.currency || "INR",
			maximumFractionDigits: 0,
		}).format(Number(value || 0));
	};

	const cards = [
		{
			title: "Total Revenue",
			value: metrics?.revenue || "0",
			format: formatCurrency,
			icon: FaRupeeSign,
			suffix: "",
		},
		{
			title: "Avg Response Time",
			value: metrics?.responseTime || "0",
			format: (val) => Math.round(val),
			icon: FaClock,
			suffix: "sec",
		},
		{
			title: "Avg Table Turnaround Time",
			value: metrics?.turnaround || "0",
			format: (val) => Math.round(val),
			icon: FaSync,
			suffix: "min",
		},
		{
			title: "Service Calls",
			value: metrics?.serviceCalls || "0",
			format: (val) => val,
			icon: FaBell,
			suffix: "",
		},
		{
			title: "Manager Calls",
			value: metrics?.managerCalls || "0",
			format: (val) => val,
			icon: FaUserTie,
			suffix: "",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
			{cards.map((card, index) => {
				const Icon = card.icon;
				const isRevenueCard = index === 0;
				return (
					<div
						key={index}
						onClick={() => isRevenueCard && onRevenueClick?.()}
						className={`px-4 py-5 rounded-xl transition-all ${
							isRevenueCard ? 'cursor-pointer' : ''
						} ${
							isDark
								? `bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 ${isRevenueCard ? 'hover:from-gray-700 hover:to-gray-800 hover:border-[#B69549]' : ''}`
								: `bg-white border border-gray-200 shadow-sm ${isRevenueCard ? 'hover:shadow-md hover:border-[#B69549]' : ''}`
						}`}
					>
						<div className="flex items-center justify-between mb-3">
							<h3
								className={`text-xs font-medium uppercase tracking-wide ${
									isDark ? "text-gray-200" : "text-gray-500"
								}`}
							>
								{card.title}
							</h3>
							<Icon
								className={
									'text-[#B69549]'
								}
								size={16}
							/>
						</div>
						<div className="flex items-baseline gap-1">
							<p className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#9F7A24]'}`}>
								{card.format(card.value)}
							</p>
							{card.suffix && (
								<span
									className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}
								>
									{card.suffix}
								</span>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MetricsRow;
