import { useTheme } from "../../context/ThemeContext";

const Loader = () => {
	const { colors, theme } = useTheme();
	return (
		<div className={`flex items-center justify-center min-h-[80vh] ${colors.primary}`}>
			<div className="relative w-20 h-20">
				{/* Outer glowing ring */}
				<div
					className={`absolute inset-0 rounded-full border-2 border-transparent
                    animate-spin ${
						theme === 'light' 
							? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-700' 
							: 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500'
					}
                    [mask-image:linear-gradient(white,transparent)]`}
				></div>

				{/* Inner circle */}
				<div className={`absolute inset-1 rounded-full ${colors.primary}`}></div>
			</div>
		</div>
	);
};

export default Loader;
