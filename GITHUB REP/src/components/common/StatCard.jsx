// components/common/StatCard.jsx
import { useTheme } from "../../context/ThemeContext";

const StatCard = ({ title, value, icon: Icon }) => {
	const { colors, isDark } = useTheme();
	
	return (
		<div className={`${colors.card} rounded-2xl p-6 border ${colors.border} ${colors.shadow}`}>
			<div className="flex items-center justify-between">
				<div>
					<p className={`${colors.textSecondary} text-lg font-medium`}>{title}</p>
					<p className={`text-3xl font-bold mt-2 ${isDark ? 'luxegenie-gradient' : 'text-yellow-700'}`}>
						{value}
					</p>
				</div>
				<div className={`p-3 rounded-xl ${colors.buttonSecondary}`}>
					<Icon size={24} className={colors.textMuted} />
				</div>
			</div>
		</div>
	);
};

export default StatCard;
