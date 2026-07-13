import { useState } from "react";
import Layout from "../components/Layout/Layout.jsx";
import { useTheme } from "../context/ThemeContext";
import {
	FiInfo,
	FiCalendar,
	FiBookOpen,
	FiWifi,
	FiAward,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";

// Import all settings components
import AboutUsSettings from "./settings/AboutUsSettings";
import EventDetailsSettings from "./settings/EventDetailsSettings";
import ChefDetailsSettings from "./settings/ChefDetailsSettings";
import LoyaltyClubSettings from "./settings/LoyaltyClubSettings";
import MenuSettings from "./settings/MenuSettings";
import WiFiSettings from "./settings/WiFiSettings";
import UpdatesSettings from "./settings/UpdatesSettings";

const Settings = () => {
	const [activeTab, setActiveTab] = useState("aboutus");
	const { colors } = useTheme();

	const tabs = [
		{ id: "aboutus", label: "History", icon: FiInfo },
		{ id: "eventdetails", label: "Event Details", icon: FiCalendar },
		{ id: "chefdetails", label: "Chef Details", icon: LuChefHat },
		{ id: "loyaltyclub", label: "Loyalty Club", icon: FiAward },
		{ id: "menu", label: "Menu", icon: FiBookOpen },
		{ id: "wifi", label: "WiFi", icon: FiWifi },
		// { id: "updates", label: "Updates", icon: FiDownload },
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case "aboutus":
				return <AboutUsSettings />;
			case "eventdetails":
				return <EventDetailsSettings />;
			case "chefdetails":
				return <ChefDetailsSettings />;
			case "loyaltyclub":
				return <LoyaltyClubSettings />;
			case "menu":
				return <MenuSettings />;
			case "wifi":
				return <WiFiSettings />;
			case "updates":
				return <UpdatesSettings />;
			default:
				return null;
		}
	};

	return (
		<Layout
			title="Settings"
			subtitle="Manage your restaurant settings and preferences"
		>
			<div className="space-y-6">
				{/* Tabs Navigation */}
				<div
					className={`${colors.card} rounded-xl border ${colors.border} p-1 relative`}
				>
					{/* Desktop & Tablet Tabs */}
					<div className="hidden sm:flex flex-wrap gap-2 p-1">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:cursor-pointer ${
										isActive
											? "bg-[#B69549]"
											: `bg-gray-200`
									}`}
								>
									<Icon
										size={16}
										className={isActive ? "text-white" : ""}
									/>
									<span
										className={isActive ? "text-white" : ""}
									>
										{tab.label}
									</span>
								</button>
							);
						})}
					</div>

					{/* Mobile Tabs - Horizontal Scrollable with improved spacing */}
					<div className="sm:hidden relative">
						{/* Scroll indicator gradients */}
						{/* <div className="absolute left-0 top-8 bottom-4 w-8 bg-gradient-to-r from-white to-transparent dark:from-slate-800 dark:to-transparent z-10 pointer-events-none"></div>
						<div className="absolute right-0 top-8 bottom-4 w-8 bg-gradient-to-l from-white to-transparent dark:from-slate-800 dark:to-transparent z-10 pointer-events-none"></div> */}

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
								<span>Swipe to see more options</span>
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
							<div className="flex space-x-4 min-w-max px-8 py-2">
								{tabs.map((tab) => {
									const Icon = tab.icon;
									const isActive = activeTab === tab.id;
									return (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-200 min-w-max ${
												isActive
													? "bg-[#B69549]"
													: `bg-gray-200`
											}`}
										>
											<Icon
												size={14}
												className={
													isActive ? "text-white" : ""
												}
											/>
											<span
												className={
													isActive ? "text-white" : ""
												}
											>
												{tab.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">{renderTabContent()}</div>
			</div>
		</Layout>
	);
};

export default Settings;
