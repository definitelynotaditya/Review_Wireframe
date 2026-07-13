import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout/Layout";
import { useTheme } from "../context/ThemeContext";
import AddTableModal from "../components/modals/managetables/AddTableModal";
import TableUpdateModal from "../components/modals/managetables/TableUpdateModal";
import TableDeleteConfirmationModal from "../components/modals/managetables/TableDeleteConfirmationModal";
import StatCard from "../components/common/StatCard";
import Loader from "../components/common/Loader.jsx";
import { tableApi } from "../store/manageTablesStore";
import {
	FiPlus,
	FiSearch,
	FiEdit2,
	FiTrash2,
	FiHome,
	FiUsers,
	FiMapPin,
} from "react-icons/fi";
import { MdEventAvailable } from "react-icons/md";
import { CgUnavailable } from "react-icons/cg";

const ManageTables = () => {
	const { colors, isDark } = useTheme();
	const authUser = JSON.parse(localStorage.getItem("auth_user"));
	const restaurantId = authUser?.restaurant_id;

	const [showAddModal, setShowAddModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedArea, setSelectedArea] = useState("All");
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedTable, setSelectedTable] = useState(null);

	// Utility function to capitalize first letter of each word
	const capitalizeWords = (str) => {
		if (!str) return '';
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	// Fetch tables for this restaurant
	const {
		data: tablesData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["restaurant-tables", restaurantId],
		queryFn: () => tableApi.fetchRestaurantTables(restaurantId),
		enabled: !!restaurantId,
	});

	// Extract tables from the new data structure
	const tables = tablesData?.tables || [];

	const filteredTables = tables.filter((table) => {
		const matchesSearch =
			table.table_number
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			table.sitting_area
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());
		const matchesArea =
			selectedArea === "All" || table.sitting_area === selectedArea;
		return matchesSearch && matchesArea;
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "vacant":
				return "text-green-500 bg-green-500/10";
			case "occupied":
				return "text-red-500 bg-red-500/10";
			case "reserved":
				return "text-yellow-500 bg-yellow-500/10";
			case "maintenance":
				return "text-gray-500 bg-gray-500/10";
			default:
				return "text-gray-500 bg-gray-500/10";
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case "vacant":
				return "Vacant";
			case "occupied":
				return "Occupied";
			case "reserved":
				return "Reserved";
			case "maintenance":
				return "Maintenance";
			default:
				return status || "Unknown";
		}
	};

	const getAreaStats = () => {
		const areas = {};
		tables.forEach((table) => {
			if (!areas[table.sitting_area]) {
				areas[table.sitting_area] = {
					total: 0,
					vacant: 0,
					occupied: 0,
					reserved: 0,
				};
			}
			areas[table.sitting_area].total++;
			areas[table.sitting_area][table.table_status]++;
		});
		return areas;
	};

	// Get area tab color similar to Tables.jsx status tabs
	const getAreaTabColor = (isSelected) => {
		if (isSelected) {
			return "bg-[#B69549] text-white shadow-lg";
		}
		
		// Default styling for unselected tabs
		return `bg-gray-200 text-gray-700 hover:cursor-pointer `;
	};

	const handleEditTable = (table) => {
		setSelectedTable(table);
		setShowUpdateModal(true);
	};

	const handleDeleteTable = (table) => {
		setSelectedTable(table);
		setShowDeleteModal(true);
	};

	const handleCloseUpdateModal = () => {
		setShowUpdateModal(false);
		setSelectedTable(null);
	};

	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setSelectedTable(null);
	};

	if (isLoading) {
		return (
			<Layout
				title="Manage Tables"
				subtitle="Manage your restaurant tables here"
			>
				<Loader />
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout
				title="Manage Tables"
				subtitle="Manage your restaurant tables and seating arrangements"
			>
				<div className="text-center py-8">
					<p className="text-red-400">Error loading tables</p>
				</div>
			</Layout>
		);
	}

	const areaStats = getAreaStats();

	return (
		<Layout
			title="Manage Tables"
			subtitle="Manage your restaurant tables and seating arrangements"
		>
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
						<div className="relative">
							<FiSearch
								className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.textMuted}`}
								size={18}
							/>
							<input
								type="text"
								placeholder="Search tables..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`pl-10 pr-4 py-3 w-full sm:w-80 ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
							/>
						</div>
					</div>

					<button
						onClick={() => setShowAddModal(true)}
						className={`flex items-center justify-center space-x-2 px-6 py-3 text-white bg-[#B69549] rounded-xl transition-all duration-200 ${colors.shadow} hover:shadow-lg hover:cursor-pointer`}
					>
						<FiPlus size={18} />
						<span>Add Table</span>
					</button>
				</div>

				{/* Area Filter Tabs */}
				{Object.keys(areaStats).length > 0 && (
					<div
						className={`${colors.card} rounded-xl p-2 border ${colors.border}`}
					>
						{/* <h3
							className={`text-xl font-semibold ${colors.textPrimary} mb-4`}
						>
							Filter by Sitting Area
						</h3> */}
						{/* Desktop version */}
						<div className="hidden sm:flex flex-wrap gap-3">
							<button
								onClick={() => setSelectedArea("All")}
								className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${getAreaTabColor(selectedArea === "All")}`}
							>
								All ({tables.length})
							</button>
							

							{Object.entries(areaStats).map(([area, stats]) => (
								<button
									key={area}
									onClick={() => setSelectedArea(area)}
									className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${getAreaTabColor(selectedArea === area)}`}
								>
									{capitalizeWords(area)} ({stats.total})
								</button>
							))}
						</div>

						{/* Mobile version with horizontal scroll */}
						<div className="sm:hidden overflow-x-auto scrollbar-none">
							<div className="flex space-x-2 min-w-max py-2">
								<button
									onClick={() => setSelectedArea("All")}
									className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${getAreaTabColor(selectedArea === "All")}`}
								>
									All ({tables.length})
								</button>
								

								{Object.entries(areaStats).map(([area, stats]) => (
									<button
										key={area}
										onClick={() => setSelectedArea(area)}
										className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${getAreaTabColor(selectedArea === area)}`}
									>
										{capitalizeWords(area)} ({stats.total})
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Tables Cards */}
				<div className={`space-y-6`}>
					<div className="flex items-center justify-between">
						<h3
							className={`text-xl font-semibold ${colors.textPrimary}`}
						>
							Tables ({filteredTables.length})
						</h3>
					</div>

					{filteredTables.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredTables.map((table) => (
								<div
									key={table.table_id}
									className={`${colors.card} rounded-2xl p-5 border ${colors.border} transition-all duration-200 hover:shadow-lg`}
								>
									{/* Table Header */}
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center space-x-3">
											{/* <div className={`w-12 h-12 ${colors.buttonSecondary} rounded-xl flex items-center justify-center`}>
												<FiHome size={20} className={colors.textMuted} />
											</div> */}
											<div>
												<h4
													className={`font-bold text-lg ${colors.textPrimary}`}
												>
													{table.table_number}
												</h4>
												<p
													className={`text-sm ${colors.textMuted}`}
												>
													{table.sitting_area}
												</p>
											</div>
										</div>
										<span
											className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(
												table.table_status
											)}`}
										>
											{/* <FiCircle size={8} className="mr-1" /> */}
											{getStatusText(table.table_status)}
										</span>
									</div>

									{/* Table Details */}
									<div className="space-y-3 mb-4">
										<div
											className={`flex items-center justify-between ${colors.textSecondary}`}
										>
											<div className="flex items-center space-x-2">
												<FiUsers size={16} />
												<span>Capacity</span>
											</div>
											<span
												className={`font-medium ${colors.textPrimary}`}
											>
												{table.capacity} guests
											</span>
										</div>
										<div
											className={`flex items-center justify-between ${colors.textSecondary}`}
										>
											<div className="flex items-center space-x-2">
												<FiMapPin size={16} />
												<span>Area</span>
											</div>
											<span
												className={`font-medium ${colors.textPrimary}`}
											>
											{capitalizeWords(table.sitting_area)}
											</span>
										</div>
										{/* {table.type && (
											<div
												className={`flex items-center justify-between ${colors.textSecondary}`}
											>
												<div className="flex items-center space-x-2">
													<FiHome size={16} />
													<span>Type</span>
												</div>
												<span
													className={`font-medium ${colors.textPrimary} capitalize`}
												>
													{table.type}
												</span>
											</div>
										)} */}
									</div>

									{/* Action Buttons */}
									<div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
										<div
											className={`text-sm ${colors.textSecondary}`}
										>
											{/* {table.created_at ? (
												<span>
													Added:{" "}
													{new Date(
														table.created_at
													).toLocaleDateString()}
												</span>
											) : (
												<span>Recently added</span>
											)} */}
										</div>
										<div className="flex items-center space-x-2">
											<button
												onClick={() => handleEditTable(table)}
												className={`p-2  rounded-lg transition-colors duration-200 hover:bg-gray-300/10 hover:cursor-pointer`}
											>
												<FiEdit2
													size={16}
													className={colors.textMuted}
												/>
											</button>
											<button 
												onClick={() => handleDeleteTable(table)}
												className="p-2  text-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500/10 hover:cursor-pointer">
												<FiTrash2 size={16} />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div
							className={`${colors.card} rounded-2xl p-12 border ${colors.border} text-center`}
						>
							<div
								className={`w-16 h-16 ${colors.buttonSecondary} rounded-full flex items-center justify-center mx-auto mb-4`}
							>
								<FiHome
									size={32}
									className={colors.textMuted}
								/>
							</div>
							<h3
								className={`text-xl font-semibold ${colors.textPrimary} mb-2`}
							>
								No tables found
							</h3>
							<p className={`${colors.textSecondary} mb-6`}>
								{searchTerm
									? "No tables match your search criteria."
									: "Get started by adding your first table."}
							</p>
							{!searchTerm && (
								<button
									onClick={() => setShowAddModal(true)}
									className={`inline-flex items-center space-x-2 px-6 py-3 ${colors.button} rounded-xl transition-all duration-200`}
								>
									<FiPlus size={18} />
									<span>Add First Table</span>
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<AddTableModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				restaurantId={restaurantId}
			/>

			<TableUpdateModal
				isOpen={showUpdateModal}
				onClose={handleCloseUpdateModal}
				table={selectedTable}
				restaurantId={restaurantId}
			/>

			<TableDeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				table={selectedTable}
				restaurantId={restaurantId}
			/>
		</Layout>
	);
};

export default ManageTables;
