import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout/Layout";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/common/Loader";
import StatCard from "../components/common/StatCard";
import AddUserModal from "../components/modals/users/AddUserModal";
import UserUpdateModal from "../components/modals/users/UserUpdateModal";
import UserToggleConfirmationModal from "../components/modals/users/UserToggleConfirmationModal";
import { userApi } from "../store/userStore";
import { FiPlus, FiSearch, FiEdit2, FiUser, FiPhone } from "react-icons/fi";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline } from "react-icons/io";

const RestaurantUsersPage = () => {
	const { colors, isDark } = useTheme();
	const authUser = JSON.parse(localStorage.getItem("auth_user"));
	const restaurantId = authUser?.restaurant_id;

	const [showAddModal, setShowAddModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showToggleModal, setShowToggleModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedActiveTab, setSelectedActiveTab] = useState("Active"); // Active by default

	// Fetch only users for this restaurant
	const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
		queryKey: ["restaurant-users", restaurantId],
		queryFn: () => userApi.fetchRestaurantUsers(restaurantId),
		enabled: !!restaurantId,
	});

	const isLoading = usersLoading;
	const error = usersError;

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.contact?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesActiveStatus =
			selectedActiveTab === "All" ||
			(selectedActiveTab === "Active" && user.active === true) ||
			(selectedActiveTab === "Inactive" && user.active === false);

		return matchesSearch && matchesActiveStatus;
	});

	const getRoleDisplayName = (role) => {
		switch (role) {
			case "admin":
				return "Manager";
			case "host":
				return "Host";
			case "server":
				return "Server";
			default:
				return role || "Unknown";
		}
	};

	const handleEditUser = (user) => {
		setSelectedUser(user);
		setShowUpdateModal(true);
	};

	const handleCloseUpdateModal = () => {
		setShowUpdateModal(false);
		setSelectedUser(null);
	};

	const handleToggleUser = (user) => {
		setSelectedUser(user);
		setShowToggleModal(true);
	};

	const handleCloseToggleModal = () => {
		setShowToggleModal(false);
		setSelectedUser(null);
	};

	if (isLoading) {
		return (
			<Layout title="Users" subtitle="Manage restaurant users and their permissions">
				<Loader />
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout title="Users" subtitle="Manage restaurant users and their permissions">
				<div className="text-center py-8">
					<p className="text-red-400">Error loading users</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout title="Users" subtitle="Manage restaurant users and their permissions">
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
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`pl-10 pr-4 py-3 w-full sm:w-80 ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
							/>
						</div>
					</div>

					<button
						onClick={() => setShowAddModal(true)}
						className={`flex items-center justify-center space-x-2 px-6 py-3 text-white bg-[#B69549] rounded-xl transition-all duration-200 ${colors.shadow}  hover:cursor-pointer`}
					>
						<FiPlus size={18} />
						<span>Add User</span>
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
										? users.length 
										: tab === "Active"
										? users.filter(u => u.active === true).length
										: users.filter(u => u.active === false).length
								})
							</button>
						))}
					</div>
				</div>

				{/* Stats Cards */}
				{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<StatCard
						title="Total Users"
						value={users.length}
						icon={FiUser}
					/>
					<StatCard
						title="Managers"
						value={users.filter((u) => u.role === "admin").length}
						icon={FiUser}
					/>
					<StatCard
						title="Staff Members"
						value={users.filter((u) => u.role !== "admin").length}
						icon={FiUser}
					/>
				</div> */}

				{/* Users Table - Desktop */}
				<div className={`hidden md:block ${colors.card} rounded-2xl border ${colors.border} overflow-hidden`}>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className={`${colors.secondary} border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
								<tr>
									<th className={`px-6 py-4 text-left text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>User</th>
									<th className={`px-6 py-4 text-left text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>User Details</th>
									<th className={`px-6 py-4 text-right text-sm font-medium ${colors.textPrimary} uppercase tracking-wider`}>Actions</th>
								</tr>
							</thead>
							<tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
								{filteredUsers.map((user) => (
									<tr key={user.id} className="transition-colors duration-200">
										<td className="px-6 py-4">
											<div className="flex items-center space-x-3">
												<img
													src={
														user.img_url ||
														`https://ui-avatars.com/api/?name=${encodeURIComponent(
															user.username || "User"
														)}&background=6b7280&color=ffffff`
													}
													alt={user.username}
													className="w-10 h-10 rounded-full object-cover"
												/>
												<div>
													<p className={`font-medium ${colors.textPrimary} truncate max-w-[250px]`}>{user.name}</p>
													<p className={`text-sm ${colors.textMuted}`}>{getRoleDisplayName(user.role)}</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="space-y-1">
												<div className={`flex items-center space-x-2 ${colors.textSecondary}`}>
													<FiUser size={14} />
													<span className="text-sm">{user.server_code}</span>
												</div>
												<div className={`flex items-center space-x-2 ${colors.textSecondary}`}>
													<FiPhone size={14} />
													<span className="text-sm">{user.contact}</span>
												</div>
											</div>
										</td>
									<td className="px-6 py-4 text-right">
										<div className="flex items-center justify-end space-x-2">
											<button
												onClick={() => handleToggleUser(user)}
												className={`p-3 rounded-xl transition-all duration-200 hover:cursor-pointer hover:scale-105 ${
													user.active 
														? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30" 
														: "text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30"
												}`}
												title={user.active ? "Deactivate" : "Activate"}
											>
												{user.active ? (
													<IoIosCheckmarkCircleOutline size={24} />
												) : (
													<IoIosCloseCircleOutline size={24} />
												)}
											</button>
											<button
												onClick={() => handleEditUser(user)}
												className={`p-2 ${colors.hover} rounded-lg transition-colors duration-200 hover:cursor-pointer ${colors.textSecondary}`}
											>
												<FiEdit2 size={16} />
											</button>
										</div>
									</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Users Cards - Mobile */}
				<div className="md:hidden space-y-4">
					{filteredUsers.length === 0 ? (
						<div className={`${colors.card} rounded-xl p-8 text-center border ${colors.border}`}>
							<div className={`w-16 h-16 mx-auto mb-4 ${colors.secondary} rounded-full flex items-center justify-center`}>
								<FiUser size={24} className={colors.textMuted} />
							</div>
							<h3 className={`text-lg font-medium ${colors.textPrimary} mb-2`}>
								{searchTerm ? "No users found" : "No users yet"}
							</h3>
							<p className={`${colors.textMuted} mb-4`}>
								{searchTerm 
									? "Try adjusting your search criteria"
									: "Start by adding your first user"}
							</p>
							{!searchTerm && (
								<button
									onClick={() => setShowAddModal(true)}
									className={`px-6 py-3 ${colors.button} rounded-xl transition-all duration-200 hover:shadow-lg`}
								>
									Add First User
								</button>
							)}
						</div>
					) : (
						<div className="grid gap-4">
							{filteredUsers.map((user) => (
								<div
									key={user.id}
									className={`${colors.card} rounded-xl p-4 border ${colors.border} hover:shadow-lg transition-all duration-200`}
								>
									{/* Mobile-optimized card layout */}
									<div className="space-y-3">
										{/* Header Row */}
										<div className="flex justify-between items-start">
											<div className="flex items-center space-x-3 flex-1">
												<img
													src={
														user.img_url ||
														`https://ui-avatars.com/api/?name=${encodeURIComponent(
															user.username || "User"
														)}&background=6b7280&color=ffffff`
													}
													alt={user.username}
													className="w-10 h-10 rounded-full object-cover"
												/>
												<div className="flex-1 min-w-0">
													<h3 className={`font-semibold ${colors.textPrimary} text-lg truncate max-w-[170px]`}>
														{user.username}
													</h3>
													<p className={`text-sm ${colors.textMuted}`}>
														{getRoleDisplayName(user.role)}
													</p>
												</div>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleToggleUser(user)}
												className={`p-3 rounded-xl transition-all duration-200 hover:cursor-pointer hover:scale-105 ${
													user.active 
														? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30" 
														: "text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30"
												}`}
												title={user.active ? "Deactivate" : "Activate"}
											>
												{user.active ? (
													<IoIosCheckmarkCircleOutline size={20} />
												) : (
													<IoIosCloseCircleOutline size={20} />
												)}
											</button>
											<button
												onClick={() => handleEditUser(user)}
												className={`p-2 ${colors.hover} rounded-lg transition-colors duration-200 hover:cursor-pointer ${colors.textSecondary}`}
												title="Edit user"
											>
												<FiEdit2 size={16} />
											</button>
										</div>
										</div>

										{/* User Details Row */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
											<div className="flex items-center space-x-2">
												<FiUser size={14} className={colors.textMuted} />
												<span className={colors.textPrimary}>
													Code: {user.server_code}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<FiPhone size={14} className={colors.textMuted} />
												<span className={colors.textPrimary}>
													{user.contact}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<AddUserModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				restaurantId={restaurantId}
			/>

			<UserUpdateModal
				isOpen={showUpdateModal}
				onClose={handleCloseUpdateModal}
				user={selectedUser}
				restaurantId={restaurantId}
			/>

			<UserToggleConfirmationModal
				isOpen={showToggleModal}
				onClose={handleCloseToggleModal}
				user={selectedUser}
				restaurantId={restaurantId}
			/>
		</Layout>
	);
};

export default RestaurantUsersPage;
