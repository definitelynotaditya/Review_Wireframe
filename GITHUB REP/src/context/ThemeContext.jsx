import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Centralized theme configuration
const themeConfig = {
	light: {
		// Background colors
		primary: "bg-gray-200",
		secondary: "bg-gray-50",
		tertiary: "bg-gray-100",
		sidebar: "bg-gray-200",
		header: "bg-gray-200",
		card: "bg-white",
		card2:"bg-gray-100",
		
		// Text colors
		textPrimary: "text-gray-900",
		textSecondary: "text-gray-600",
		textMuted: "text-gray-400",
		
		// Border colors
		border: "border-gray-200",
		borderMuted: "border-gray-100",
		
		// Hover states
		hover: "hover:bg-gray-50",
		hoverSecondary: "hover:bg-gray-1'00",
		
		// Input styles
		input: "bg-gray-200 border-gray-200 text-gray-900 placeholder-gray-400",
		inputFocus: "focus:ring-gray-300 focus:border-gray-400",
		
		// Button styles
		button: "bg-gray-100 text-gray-700 hover:bg-gray-200",
		buttonDark: "bg-gray-300 text-gray-700 hover:bg-gray-200",
		buttonSecondary: "bg-gray-200 text-gray-600 hover:bg-gray-100",
		
		// Shadow
		shadow: "shadow-sm",
		shadowLg: "shadow-lg",
	},
	dark: {
		// Background colors
		primary: "bg-slate-900",
		secondary: "bg-slate-800",
		tertiary: "bg-slate-700",
		sidebar: "bg-slate-900",
		header: "bg-slate-900",
		card: "bg-slate-800",
		card2:"bg-slate-700",
		// Text colors
		textPrimary: "text-white",
		textSecondary: "text-slate-300",
		textMuted: "text-slate-400",
		
		// Border colors
		border: "border-slate-700",
		borderMuted: "border-slate-700/50",
		
		// Hover states
		hover: "hover:bg-slate-800",
		hoverSecondary: "hover:bg-slate-700",
		
		// Input styles
		input: "bg-slate-600 border-slate-500 text-white placeholder-white",
		inputFocus: "focus:ring-slate-100 focus:border-transparent",
		
		// Button styles
		button: "bg-slate-600 text-white hover:bg-slate-500",
		buttonSecondary: "bg-slate-700 text-slate-300 hover:bg-slate-600",
		
		// Shadow
		shadow: "shadow-sm",
		shadowLg: "shadow-2xl",
	}
	
};

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => {
		// Check localStorage for saved theme preference
		const savedTheme = localStorage.getItem("woobly-theme");
		return savedTheme || "dark"; // Default to dark theme
	});

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	// Save theme preference to localStorage
	useEffect(() => {
		localStorage.setItem("woobly-theme", theme);
	}, [theme]);

	// Get current theme colors
	const colors = themeConfig[theme];

	const value = {
		theme,
		toggleTheme,
		colors,
		isDark: theme === "dark",
		isLight: theme === "light",
	};

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
