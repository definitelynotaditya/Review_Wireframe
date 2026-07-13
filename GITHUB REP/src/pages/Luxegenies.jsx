import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import UnassignLuxegenieModal from "../components/modals/UnassignLuxegenieModal";
import UnassignAllConfirmationModal from "../components/modals/UnassignAllConfirmationModal";
import ShutdownConfirmationModal from "../components/modals/ShutdownConfirmationModal";
import ShutdownAllConfirmationModal from "../components/modals/ShutdownAllConfirmationModal";
import RebootConfirmationModal from "../components/modals/RebootConfirmationModal";
import RebootAllConfirmationModal from "../components/modals/RebootAllConfirmationModal";
import Loader from "../components/common/Loader.jsx";
import { useAuthStore } from "../store/authStore";
import { luxegenieApi } from "../store/luxegenieStore";
import { sessionApi } from "../store/sessionStore.js";
import { useTheme } from "../context/ThemeContext.jsx";
import luxegenie2 from "/luxegenie2.png";

const Luxegenies = () => {
	const { user } = useAuthStore();
	const { colors, isDark } = useTheme();
	const restaurantId = user?.restaurant_id;
	const queryClient = useQueryClient();

	// Modal state
	const [showUnassignModal, setShowUnassignModal] = useState(false);
	const [showUnassignAllModal, setShowUnassignAllModal] = useState(false);
	const [showShutdownModal, setShowShutdownModal] = useState(false);
	const [showShutdownAllModal, setShowShutdownAllModal] = useState(false);
	const [showRebootModal, setShowRebootModal] = useState(false);
	const [showRebootAllModal, setShowRebootAllModal] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState(null);
	const [selectedAssignmentTab, setSelectedAssignmentTab] = useState("All"); // All by default
	const [searchTerm, setSearchTerm] = useState("");
	const [shuttingDownDeviceId, setShuttingDownDeviceId] = useState(null);
	const [rebootingDeviceId, setRebootingDeviceId] = useState(null);
	const [openDropdownId, setOpenDropdownId] = useState(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (openDropdownId !== null && !event.target.closest('.dropdown-container')) {
				setOpenDropdownId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [openDropdownId]);

	const capitalizeWords = (str) => {
		if (!str) return "";
		return str
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Fetch luxegenie devices for this restaurant
	const {
		data: deviceResponse = { devices: [] },
		isLoading,
		error,
	} = useQuery({
		queryKey: ["luxegenie-devices", restaurantId],
		queryFn: () => luxegenieApi.getAllDevices(restaurantId),
		enabled: !!restaurantId,
		// refetchInterval: 10000, // Refetch every 30 seconds for live updates
	});

	// Listen for luxegenie assignment/unassignment events
	useEffect(() => {
		// Note: Pusher events are now handled globally in PusherProvider
		// No need for component-level subscriptions anymore
		// Global subscriptions will invalidate queries automatically
		console.log(
			"Luxegenies component mounted - relying on global Pusher events",
		);
	}, [restaurantId]);

	// Unassign device mutation
	const unassignMutation = useMutation({
		mutationFn: (assignmentData) =>
			luxegenieApi.unassignFromTable(assignmentData),
		onSuccess: () => {
			toast.success("Device unassigned successfully!");
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			handleCloseModal(); // Close modal on success
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to unassign device",
			);
		},
	});

	// Shutdown specific device mutation
	const shutdownDeviceMutation = useMutation({
		mutationFn: (shutdownData) =>
			luxegenieApi.shutdownSpecificDevice(shutdownData),
		onSuccess: () => {
			toast.success(
				"Shutdown command sent to the luxegenie successfully!",
			);
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			setShuttingDownDeviceId(null);
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to shutdown device",
			);
			setShuttingDownDeviceId(null);
		},
	});

	// Shutdown all mutation — terminates all sessions, unassigns all devices, powers off all LUXEGENIEs
	const shutdownAllMutation = useMutation({
		mutationFn: () => sessionApi.shutdownAll(restaurantId),
		onSuccess: (response) => {
			const { terminated_sessions = 0, unassigned_devices = 0 } = response;
			toast.success(
				`Shutdown All complete — ${terminated_sessions} session(s) terminated, ${unassigned_devices} device(s) unassigned.`,
			);
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to shutdown all devices",
			);
		},
	});

	// Reboot specific device mutation
	const rebootDeviceMutation = useMutation({
		mutationFn: (rebootData) =>
			luxegenieApi.rebootSpecificDevice(rebootData),
		onSuccess: () => {
			toast.success("Device reboot command sent successfully!");
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			setRebootingDeviceId(null);
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to reboot device",
			);
			setRebootingDeviceId(null);
		},
	});

	// Reboot all devices mutation
	const rebootAllMutation = useMutation({
		mutationFn: (rebootData) => luxegenieApi.rebootAllDevices(rebootData),
		onSuccess: () => {
			toast.success("All devices reboot command sent successfully!");
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to reboot all devices",
			);
		},
	});

	// Unassign all devices mutation
	const unassignAllMutation = useMutation({
		mutationFn: (unassignData) =>
			luxegenieApi.unassignAllDevices(unassignData),
		onSuccess: () => {
			toast.success(
				"Unassign command sent to all luxegenie devices successfully!",
			);
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message ||
					"Failed to unassign all devices",
			);
		},
	});

	const devices = deviceResponse.devices || [];

	// Filter devices based on assignment status
	const filteredDevices = devices
		.filter((device) => {
			const isAssigned =
				device.assigned_to_sitting_area !== null &&
				device.assigned_to_table_no !== null;
			const search = searchTerm.trim().toLowerCase();
			const matchesSearch =
				search.length === 0 ||
				String(device.device_id || "")
					.toLowerCase()
					.includes(search) ||
				String(device.serial_number || "")
					.toLowerCase()
					.includes(search) ||
				String(device.assigned_to_table_no || "")
					.toLowerCase()
					.includes(search) ||
				String(device.assigned_to_sitting_area || "")
					.toLowerCase()
					.includes(search);

			if (!matchesSearch) return false;

			if (selectedAssignmentTab === "All") return true;
			if (selectedAssignmentTab === "Assigned") return isAssigned;
			if (selectedAssignmentTab === "Unassigned") return !isAssigned;

			return true;
		})
		.sort((a, b) => {
			// In "All" tab, show assigned devices at the top
			if (selectedAssignmentTab === "All") {
				const aIsAssigned =
					a.assigned_to_sitting_area !== null &&
					a.assigned_to_table_no !== null;
				const bIsAssigned =
					b.assigned_to_sitting_area !== null &&
					b.assigned_to_table_no !== null;

				// If one is assigned and the other isn't, assigned comes first
				if (aIsAssigned && !bIsAssigned) return -1;
				if (!aIsAssigned && bIsAssigned) return 1;
			}
			return 0; // Keep original order for same status or other tabs
		});

	// Handle unassign device - open confirmation modal
	const handleUnassignDevice = (device) => {
		if (!device.table_id || !device.assigned_to_table_no) {
			toast.error("Device is not assigned to any table");
			return;
		}
		setSelectedDevice(device);
		setShowUnassignModal(true);
	};

	// Confirm unassign device
	const handleConfirmUnassign = () => {
		if (!selectedDevice) return;

		const assignmentData = {
			restaurant_id: restaurantId.toString(),
			table_id: selectedDevice.table_id.toString(),
			device_id: selectedDevice.device_id.toString(),
		};

		unassignMutation.mutate(assignmentData);
	};

	// Handle modal close
	const handleCloseModal = () => {
		setShowUnassignModal(false);
		setShowUnassignAllModal(false);
		setShowShutdownModal(false);
		setShowShutdownAllModal(false);
		setShowRebootModal(false);
		setShowRebootAllModal(false);
		setSelectedDevice(null);
	};

	const shutdownSpecificDevice = (device) => {
		if (!device || !device.device_id) {
			toast.error("Invalid device selected");
			return;
		}
		setSelectedDevice(device);
		setShowShutdownModal(true);
	};

	const handleConfirmShutdown = () => {
		if (!selectedDevice) return;

		setShuttingDownDeviceId(selectedDevice.device_id);
		const shutdownData = {
			restaurantId: restaurantId.toString(),
			deviceId: selectedDevice.device_id.toString(),
		};

		shutdownDeviceMutation.mutate(shutdownData);
		handleCloseModal();
	};

	const shutdownAllDevices = () => {
		if (devices.length === 0) {
			toast.error("No devices available to shutdown");
			return;
		}
		setShowShutdownAllModal(true);
	};

	const handleConfirmShutdownAll = () => {
		shutdownAllMutation.mutate();
		handleCloseModal();
	};

	const rebootSpecificDevice = (device) => {
		if (!device || !device.device_id) {
			toast.error("Invalid device selected");
			return;
		}
		setSelectedDevice(device);
		setShowRebootModal(true);
	};

	const handleConfirmReboot = () => {
		if (!selectedDevice) return;

		setRebootingDeviceId(selectedDevice.device_id);
		const rebootData = {
			restaurantId: restaurantId.toString(),
			deviceId: selectedDevice.device_id.toString(),
		};

		rebootDeviceMutation.mutate(rebootData);
		handleCloseModal();
	};

	const rebootAllDevices = () => {
		if (devices.length === 0) {
			toast.error("No devices available to reboot");
			return;
		}
		setShowRebootAllModal(true);
	};

	const handleConfirmRebootAll = () => {
		const rebootData = {
			restaurantId: restaurantId.toString(),
		};

		rebootAllMutation.mutate(rebootData);
		handleCloseModal();
	};

	const unassignAllDevices = () => {
		if (devices.length === 0) {
			toast.error("No devices available to unassign");
			return;
		}
		setShowUnassignAllModal(true);
	};

	const handleConfirmUnassignAll = () => {
		const unassignData = {
			restaurantId: restaurantId.toString(),
		};

		unassignAllMutation.mutate(unassignData);
		handleCloseModal();
	};

	// Loading state
	if (isLoading) {
		return (
			<Layout
				title="LUXEGENIE"
				subtitle="Manage your restaurant LUXEGENIE and preferences"
			>
				<Loader />
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout
				title="LUXEGENIE"
				subtitle="Manage your restaurant LUXEGENIE and preferences"
			>
				<div className="flex justify-center items-center h-64">
					<div className="text-red-600">
						Error loading devices: {error.message}
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="LUXEGENIE"
			subtitle="Manage your restaurant LUXEGENIE and preferences"
		>
			<div className="space-y-6">
				{/* Search */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
						<div className="relative">
							<FiSearch
								className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.textMuted}`}
								size={18}
							/>
							<input
								type="text"
								placeholder="Search devices..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`pl-10 pr-4 py-3 w-full sm:w-80 ${isDark ? "bg-slate-600 text-white" : "bg-gray-50 text-gray-900"} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
							/>
						</div>
					</div>
				</div>

				{/* Assigned/Unassigned Status Tabs */}
				<div
					className={`${colors.card} rounded-xl border ${colors.border} p-1`}
				>
					<div className="flex flex-wrap gap-2 p-1">
						{["All", "Assigned", "Unassigned"].map((tab) => {
							const assignedCount = devices.filter(
								(d) =>
									d.assigned_to_sitting_area !== null &&
									d.assigned_to_table_no !== null,
							).length;
							const unassignedCount = devices.filter(
								(d) =>
									d.assigned_to_sitting_area === null ||
									d.assigned_to_table_no === null,
							).length;

							const count =
								tab === "All"
									? devices.length
									: tab === "Assigned"
										? assignedCount
										: unassignedCount;

							return (
								<button
									key={tab}
									onClick={() => setSelectedAssignmentTab(tab)}
									className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
										selectedAssignmentTab === tab
											? "bg-[#B69549] text-white shadow-lg"
											: "bg-gray-200 text-gray-700 hover:cursor-pointer"
									}`}
								>
									{tab} ({count})
								</button>
							);
						})}
					</div>
				</div>

				{/* Device List */}
				<div className="space-y-4">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<h3
							className={`text-xl font-semibold ${colors.textPrimary}`}
						>
							Devices ({filteredDevices.length})
						</h3>
						{devices.length > 0 && (
							<div className="flex flex-wrap gap-2 md:gap-3">
								{/* <button
									className={`px-3 md:px-4 py-1.5 rounded-lg bg-pink-800 hover:bg-pink-700 text-white text-xs md:text-sm font-medium transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
									onClick={unassignAllDevices}
									disabled={unassignAllMutation.isPending}
								>
									{unassignAllMutation.isPending
										? "Unassigning..."
										: "Unassign All"}
								</button> */}
								<button
									className={`px-3 md:px-4 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs md:text-sm font-medium transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
									onClick={shutdownAllDevices}
									disabled={shutdownAllMutation.isPending}
								>
									{shutdownAllMutation.isPending
										? "Shutting down..."
										: "Shutdown All"}
								</button>
								<button
									className={`px-3 md:px-4 py-1.5 rounded-lg bg-green-700 hover:bg-green-700 text-white text-xs md:text-sm font-medium transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
									onClick={rebootAllDevices}
									disabled={rebootAllMutation.isPending}
								>
									{rebootAllMutation.isPending
										? "Rebooting..."
										: "Reboot All"}
								</button>
							</div>
						)}
					</div>

					{/* <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
						<FiCpu className="w-6 h-6 text-white" />
						</div> */}
					{filteredDevices.length > 0 ? (
						<div className="grid gap-4">
							{filteredDevices.map((device) => (
								<div
									key={device.device_id}
									className={`${colors.card} border ${colors.border} rounded-2xl px-5 py-3 md:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 hover:shadow-lg transition-all duration-300 relative`}
								>
									{/* Left Section – Device Info */}
									<div className="flex flex-col gap-1 min-w-0">
										<h4
											className={`text-lg font-semibold truncate ${colors.textPrimary}`}
										>
											<span className={`text-gray-500`}>Device ID - </span>
											<span className="font-bold">{device.device_id}</span>

											<div className="text-gray-500 flex gap-2">
												<span>Battery: </span>
												<div
													className={`${device.battery_percentage > 20 ? "text-green-600" : "text-red-500"}`}
												>
													{device.battery_percentage}%
												</div>
											</div>
											{/* #{device.device_id} */}
										</h4>
										{/* <div
											className={`flex items-center gap-2 ${colors.textMuted}`}
										>
											<FiHash size={13} />
											<span className="text-sm truncate">
												{device.serial_number}
											</span>
										</div> */}
									</div>

									{/* Middle Section – Assignment Info */}
									<div className="flex sm:flex-row sm:items-center gap-5 sm:gap-10 text-sm text-center sm:text-left flex-wrap">
										{device.assigned_to_table_no ? (
											<>
												<p
													className={` ${colors.textPrimary}`}
												>
													Table{" "}
													{
														device.assigned_to_table_no
													}
												</p>
												{device.assigned_to_sitting_area && (
													<p
														className={
															colors.textPrimary
														}
													>
														{
															capitalizeWords(device.assigned_to_sitting_area)
														}
													</p>
												)}
												{/* {device.table_id && (
													<p
														className={
															colors.textPrimary
														}
													>
														Table ID:{" "}
														{device.table_id}
													</p>
												)} */}
											</>
										) : (
											<p className={colors.textMuted}>
												Not assigned
											</p>
										)}
									</div>

									{/* Right Section – Status + Action */}
									<div className="flex items-center gap-3 sm:justify-end">
									{/* Three-dots menu for all actions */}
									<div className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto dropdown-container">
											<button
												onClick={() =>
													setOpenDropdownId(
														openDropdownId === device.device_id
															? null
															: device.device_id
													)
												}
												className={`p-2 rounded-lg ${colors.secondary} ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}  transition-all hover:cursor-pointer`}
											>
												<BsThreeDotsVertical className={`w-5 h-5 ${colors.textPrimary}`} />
											</button>

											{/* Dropdown menu */}
											{openDropdownId === device.device_id && (
												<div 
													className={`absolute right-0 mt-2 w-40 ${colors.card} rounded-lg shadow-lg border ${colors.border} z-10 overflow-hidden`}
												>
													{/* Unassign button - only show if device is assigned */}
													{device.assigned_to_table_no && (
														<button
															className={`w-full px-4 py-2.5 text-sm font-medium text-left ${colors.textPrimary} hover:bg-pink-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b ${colors.border}`}
															onClick={() => {
																handleUnassignDevice(device);
																setOpenDropdownId(null);
															}}
															disabled={
																unassignMutation.isPending
															}
														>
															{unassignMutation.isPending
																? "Unassigning..."
																: "Unassign"}
														</button>
													)}
													<button
														className={`w-full px-4 py-2.5 text-sm font-medium text-left ${colors.textPrimary} hover:bg-blue-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b ${colors.border}`}
														onClick={() => {
															shutdownSpecificDevice(device);
															setOpenDropdownId(null);
														}}
														disabled={
															shuttingDownDeviceId ===
															device.device_id
														}
													>
														{shuttingDownDeviceId ===
														device.device_id
															? "Shutting down..."
															: "Shutdown"}
													</button>
													<button
														className={`w-full px-4 py-2.5 text-sm font-medium text-left ${colors.textPrimary} hover:bg-green-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
														onClick={() => {
															rebootSpecificDevice(device);
															setOpenDropdownId(null);
														}}
														disabled={
															rebootingDeviceId ===
															device.device_id
														}
													>
														{rebootingDeviceId ===
														device.device_id
															? "Rebooting..."
															: "Reboot"}
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div
							className={`${colors.card} rounded-xl p-12 border ${colors.border} text-center`}
						>
							<div
								className={`w-16 h-16 ${colors.secondary} rounded-full flex items-center justify-center mx-auto mb-4`}
							>
								<img src={luxegenie2} className="w-12" />
							</div>
							<h3
								className={`text-xl font-semibold ${colors.textPrimary} mb-2`}
							>
								No LUXEGENIE found
							</h3>
							{/* <p className={colors.textSecondary}>
								No LuxeGenie devices are assigned to table.
							</p> */}
						</div>
					)}
				</div>
			</div>

			{/* Unassign Confirmation Modal */}
			<UnassignLuxegenieModal
				isOpen={showUnassignModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmUnassign}
				device={selectedDevice}
				isLoading={unassignMutation.isPending}
			/>

			{/* Unassign All Confirmation Modal */}
			<UnassignAllConfirmationModal
				isOpen={showUnassignAllModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmUnassignAll}
				deviceCount={devices.length}
				isLoading={unassignAllMutation.isPending}
			/>

			{/* Shutdown Confirmation Modal */}
			<ShutdownConfirmationModal
				isOpen={showShutdownModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmShutdown}
				device={selectedDevice}
				isLoading={shuttingDownDeviceId === selectedDevice?.device_id}
			/>

			{/* Shutdown All Confirmation Modal */}
			<ShutdownAllConfirmationModal
				isOpen={showShutdownAllModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmShutdownAll}
				deviceCount={devices.length}
				isLoading={shutdownAllMutation.isPending}
			/>

			{/* Reboot Confirmation Modal */}
			<RebootConfirmationModal
				isOpen={showRebootModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmReboot}
				device={selectedDevice}
				isLoading={rebootingDeviceId === selectedDevice?.device_id}
			/>

			{/* Reboot All Confirmation Modal */}
			<RebootAllConfirmationModal
				isOpen={showRebootAllModal}
				onClose={handleCloseModal}
				onConfirm={handleConfirmRebootAll}
				deviceCount={devices.length}
				isLoading={rebootAllMutation.isPending}
			/>
		</Layout>
	);
};

export default Luxegenies;
