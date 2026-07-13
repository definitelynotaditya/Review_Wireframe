import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
	FiHome,
	FiUsers,
	FiSettings,
	FiMonitor,
	FiCalendar,
	FiLogOut,
} from "react-icons/fi";
// import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import wooblylogo from "/wooblylogo.svg";
import LogoutConfirmationModal from "../modals/LogoutConfirmationModal";

import { LuChefHat } from "react-icons/lu";
import { MdTableRestaurant } from "react-icons/md";
import { FaTableCellsLarge } from "react-icons/fa6";
import { SiSession } from "react-icons/si";
import { FaList, FaUserCircle } from "react-icons/fa";

const Sidebar = ({ isMobile, mobileMenuOpen, closeMobileMenu }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { colors, isDark } = useTheme();
	const { logout, user } = useAuthStore();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// Helper function to get user initials
	const getUserInitials = (username) => {
		if (!username) return 'U';
		const words = username.split(' ');
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return username.slice(0, 2).toUpperCase();
	};

	// Helper function to map role to display name
	const mapRoleToDisplay = (role) => {
		switch (role?.toLowerCase()) {
			case 'admin':
				return 'Manager';
			default:
				return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
		}
	};

	// Handle logout
	const handleLogoutClick = () => setShowLogoutModal(true);

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

	const menuItems = [
		{
			name: "Dashboard",
			path: "/restaurant/dashboard",
			icon: FiHome,
			color: "luxegenie-gradient",
		},
		{
			name: "Tables",
			path: "/restaurant/tables",
			icon: FaTableCellsLarge,
			color: "luxegenie-gradient",
		},
		{
			name: "Reservations",
			path: "/restaurant/reservations",
			icon: FiCalendar,
			color: "luxegenie-gradient",
		},
		{
			name: "Users",
			path: "/restaurant/users/all",
			icon: FiUsers,
			color: "luxegenie-gradient",
		},
		{
			name: "LUXEGENIE",
			path: "/restaurant/luxegenies",
			icon: FiMonitor,
			color: "luxegenie-gradient",
		},
		{
			name: "Chef's Specials",
			path: "/restaurant/chef-specials",
			icon: LuChefHat,
			color: "luxegenie-gradient",
		},
		{
			name: "Manage Tables",
			path: "/restaurant/manage-tables",
			icon: MdTableRestaurant,
			color: "luxegenie-gradient",
		},
		{
			name: "Transfer Sessions",
			path: "/restaurant/manage-sessions",
			icon: SiSession,
			color: "luxegenie-gradient",
		},
		{
			name: "Guest List",
			path: "/restaurant/guest-list",
			icon: FaList,
			color: "luxegenie-gradient",
		},
		{
			name: "Settings",
			path: "/restaurant/settings",
			icon: FiSettings,
			color: "luxegenie-gradient",
		},
	];

	return (
		// bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
		<div
			className={`w-80 lg:w-80 md:w-64 ${
				colors.sidebar
			} border-r ${colors.borderMuted} h-screen flex flex-col ${
				colors.shadowLg
			} backdrop-blur-xl overflow-hidden ${
				isMobile
					? `fixed top-0 left-0 z-50 transform transition-transform duration-300 ${
							mobileMenuOpen
								? "translate-x-0"
								: "-translate-x-full"
							} lg:relative lg:translate-x-0`
					: "flex"
			}`}
		>
			{/* Header - Reduced padding */}
			<div
				className={`py-6 px-4 ${colors.shadow} border-b ${colors.borderMuted}`}
			>
				<div className="flex items-center space-x-3">
			<img src={isDark ? wooblylogo : "/wooblysolidlogo.PNG"} alt="" className="w-10" />
					<div className="flex flex-col items-start">
						<h1
							className={`${colors.textPrimary} font-chronicle text-lg tracking-wide`}
						>
							WOOBLY
						</h1>
						<p
							className={`${colors.textSecondary} text-xs`}
						>
							Manager Dashboard
						</p>
					</div>
				</div>
			</div>

			{/* Navigation - Optimized spacing */}
			<nav className="flex-1 px-3 py-1 overflow-auto">
				<div className="space-y-1 h-full flex flex-col">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.path;

						return (
							<NavLink
								key={item.path}
								to={item.path}
								onClick={() => {
									if (isMobile && closeMobileMenu) {
										closeMobileMenu();
									}
								}}
								className={`group relative flex items-center justify-start p-2 rounded-lg transition-all duration-300 text-sm
								${
									isActive
										? isDark
											? "bg-slate-800"
											: "bg-[#B69549]/18"
										: isDark
										? "hover:bg-slate-800"
										: "hover:bg-gray-100"
								}`}
							>
								<div className="flex items-center space-x-3 w-full">
									{/* Icon */}
									<div
										className={`p-1.5 rounded-md transition-colors duration-200 ${
											isActive
												? isDark
													? "bg-white/20"
													: "bg-[#B69549]/20"
												: "bg-transparent"
										}`}
									>
										<Icon
											size={16}
											className={`transition-colors duration-200 ${
												isActive
													? isDark
														? "text-yellow-400"
														: "text-[#B69549]"
													: isDark
													? colors.textMuted
													: "text-black"
											}`}
										/>

									</div>

									{/* Text */}
									<span
										className={`font-medium text-lg transition-colors duration-200 ${
											isActive
												? isDark
													? "luxegenie-gradient"
													: "text-[#9F7A24]"
												: isDark
												? colors.textSecondary
												: "text-black"
										}`}
									>
										{item.name}
									</span>
								</div>

								{/* Active indicator */}
								{isActive && (
									<div
										className={`absolute right-0 w-1 h-6 rounded-l-full opacity-80 ${
											isDark
												? "bg-white"
												: "bg-[#B69549]"
										}`}
									></div>
								)}
							</NavLink>
						);
					})}
				</div>
			</nav>

			{/* User Profile - Reduced padding */}
			<div className={`p-3 border-t ${colors.borderMuted}`}>
				<div
					className={`flex items-center justify-between p-2 ${colors.buttonSecondary} rounded-lg ${colors.hover} transition-colors duration-200 group cursor-pointer`}
				>
					<div className="flex items-center space-x-2">
						<div
							className={`w-8 h-8 ${colors.button} rounded-full flex items-center justify-center ${colors.shadow}`}
						>
							{/* <span
								className={`${colors.textPrimary} font-semibold text-xs`}
							>
								{getUserInitials(user?.username)}
							</span> */}
							<FaUserCircle size={40} />
						</div>
						<div>
							<p
								className={`${colors.textPrimary} font-medium text-xs`}
							>
								{mapRoleToDisplay(user?.role)}
							</p>
							<p className={`${isDark ? "text-gray-300" : "text-gray-500"} text-xs`}>
								{user?.username || 'user'}
							</p>
						</div>
					</div>
					<button
						onClick={handleLogoutClick}
						className={`p-1.5 rounded-md ${colors.button} ${colors.hover} ${colors.textMuted} hover:${colors.textPrimary} transition-all duration-200`}
					>
						<FiLogOut size={14} />
					</button>
				</div>
			</div>

			<LogoutConfirmationModal
				isOpen={showLogoutModal}
				onClose={handleCloseLogoutModal}
				onConfirm={handleConfirmLogout}
				isLoading={isLoggingOut}
			/>
		</div>
	);
};

export default Sidebar;
