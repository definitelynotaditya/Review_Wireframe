import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout/Layout';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { tableApi } from '../store/manageTablesStore';
import { sessionApi } from '../store/manageSessionStore';
import Loader from '../components/common/Loader';
import { 
	FiUsers, 
	FiArrowRight, 
	FiRefreshCw,
	FiAlertCircle,
} from 'react-icons/fi';

const ManageSessions = () => {
	const { colors, isDark } = useTheme();
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const restaurantId = user?.restaurant_id;
	
	const [selectedTable, setSelectedTable] = useState(null);
	const [targetTable, setTargetTable] = useState(null);
	const [selectedArea, setSelectedArea] = useState('All');
	const [isTransferring, setIsTransferring] = useState(false);

	// Fetch tables for this restaurant
	const {
		data: tablesData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['restaurant-tables', restaurantId],
		queryFn: () => tableApi.fetchRestaurantTables(restaurantId),
		enabled: !!restaurantId,
	});

	const tables = tablesData?.tables || [];

	// Transfer session mutation
	const transferSessionMutation = useMutation({
		mutationFn: sessionApi.transferSession,
		onSuccess: () => {
			// Refetch tables to get updated session info
			queryClient.invalidateQueries(['restaurant-tables', restaurantId]);
			setSelectedTable(null);
			setTargetTable(null);
			setIsTransferring(false);
		},
		onError: (error) => {
			console.error('Session transfer failed:', error);
			setIsTransferring(false);
		}
	});

	// Filter tables by area
	const filteredTables = tables.filter(table => {
		if (selectedArea === 'All') return true;
		return table.sitting_area === selectedArea;
	});

	// Get unique sitting areas
	const sittingAreas = ['All', ...new Set(tables.map(table => table.sitting_area))];

	// Get table status color (matching Tables.jsx getStatusColor)
	// Check session_id first: if table has active session, it's Active (green)
	const getTableStatusColor = (table) => {
		if (table?.session_id) {
			return 'bg-green-500'; // Active
		}
		
		switch (table?.table_status?.toLowerCase()) {
			case 'vacant':
				return 'bg-yellow-600';
			case 'reserved':
				return 'bg-purple-700';
			case 'occupied':
				return 'bg-blue-500';
			case 'alloted':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	};

	// Handle table selection
	const handleTableSelect = (table) => {
		if (selectedTable?.table_id === table.table_id) {
			setSelectedTable(null);
		} else {
			setSelectedTable(table);
		}
		setTargetTable(null); // Reset target when changing source
	};

	// Handle target table selection
	const handleTargetSelect = (table) => {
		if (targetTable?.table_id === table.table_id) {
			setTargetTable(null);
		} else {
			setTargetTable(table);
		}
	};

	// Check if table can be selected as source
	const canSelectAsSource = (table) => {
		return table.table_status === 'occupied' && table.session_id;
	};

	// Check if table can be selected as target
	const canSelectAsTarget = (table) => {
		if (!selectedTable) return false;
		return (
			(table.table_status === 'vacant' || table.table_status === 'reserved') && 
			!table.session_id &&
			table.table_id !== selectedTable.table_id
		);
	};

	// Handle session transfer
	const handleTransferSession = () => {
		if (!selectedTable || !targetTable) return;
		
		setIsTransferring(true);
		transferSessionMutation.mutate({
			selectedTable,
			targetTable
		});
	};

	// Loading state
	if (isLoading) {
		return (
			<Layout title="Manage Sessions" subtitle="Transfer sessions between tables">
				<div className="flex justify-center items-center min-h-64">
					<Loader size="lg" />
				</div>
			</Layout>
		);
	}

	// Error state
	if (error) {
		return (
			<Layout title="Manage Sessions" subtitle="Transfer sessions between tables">
				<div className={`${colors.card} rounded-xl p-8 border ${colors.border} text-center`}>
					<div className={`w-16 h-16 ${colors.secondary} rounded-full flex items-center justify-center mx-auto mb-4`}>
						<FiAlertCircle className={`text-2xl ${colors.error}`} />
					</div>
					<h3 className={`text-xl font-semibold ${colors.textPrimary} mb-2`}>
						Failed to Load Tables
					</h3>
					<p className={`${colors.textSecondary} mb-4`}>
						{error.message || 'An error occurred while fetching tables.'}
					</p>
					<button
						onClick={() => queryClient.invalidateQueries(['restaurant-tables', restaurantId])}
						className={`px-4 py-2 ${colors.button} rounded-lg transition-colors flex items-center space-x-2 mx-auto`}
					>
						<FiRefreshCw size={16} />
						<span>Try Again</span>
					</button>
				</div>
			</Layout>
		);
	}

	return (
		<Layout 
			title="Manage Sessions" 
			subtitle="Transfer sessions between tables"
		>
			<div className="space-y-6">

				{/* Area Filter */}
				<div className={`${colors.card} rounded-xl p-2 border ${colors.border}`}>
					{/* Desktop version */}
					<div className="hidden sm:flex flex-wrap gap-3">
						{sittingAreas.map(area => (
							<button
								key={area}
								onClick={() => setSelectedArea(area)}
								className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
									selectedArea === area
										? 'bg-[#B69549] text-white shadow-lg'
										: `bg-gray-200 text-gray-700 hover:cursor-pointer `
								}`}
							>
								{area[0].toUpperCase() + area.slice(1)} {area !== 'All' && `(${tables.filter(t => t.sitting_area === area).length})`}
							</button>
						))}
					</div>

					{/* Mobile version with horizontal scroll */}
					<div className="sm:hidden overflow-x-auto scrollbar-none">
						<div className="flex space-x-2 min-w-max py-2">
							{sittingAreas.map(area => (
								<button
									key={area}
									onClick={() => setSelectedArea(area)}
									className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
										selectedArea === area
											? 'bg-[#B69549] text-white shadow-lg'
											: `bg-gray-200 text-gray-700 hover:cursor-pointer `
									}`}
								>
									{area[0].toUpperCase() + area.slice(1)} {area !== 'All' && `(${tables.filter(t => t.sitting_area === area).length})`}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Transfer Selection Panel */}
				{(selectedTable || targetTable) && (
					<div className={`${colors.card} rounded-xl p-6 border ${colors.border}`}>
						<h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>
							Session Transfer
						</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
							{/* Source Table */}
							<div className="text-center">
								<p className={`text-sm ${colors.textSecondary} mb-3`}>From Table</p>
								{selectedTable ? (
									<div className={`${colors.secondary} rounded-xl p-4 border-2 border-yellow-500`}>
										<p className={`font-bold ${colors.textPrimary} text-lg`}>
											{selectedTable.table_number}
										</p>
										<p className={`text-sm ${colors.textSecondary}`}>
											{selectedTable.capacity} seats • {selectedTable.sitting_area}
										</p>
										<p className={`text-xs ${colors.textMuted} mt-1`}>
											Session: #{selectedTable.session_id}
										</p>
									</div>
								) : (
									<div className={`${colors.secondary} rounded-xl p-4 border-2 border-dashed ${colors.border}`}>
										<p className={`${colors.textMuted}`}>Select source table</p>
									</div>
								)}
							</div>

							{/* Arrow */}
							<div className="flex justify-center">
								<div className={`w-12 h-12 ${colors.secondary} rounded-full flex items-center justify-center`}>
									<FiArrowRight className={`${colors.textPrimary} text-xl`} />
								</div>
							</div>

							{/* Target Table */}
							<div className="text-center">
								<p className={`text-sm ${colors.textSecondary} mb-3`}>To Table</p>
								{targetTable ? (
									<div className={`${colors.secondary} rounded-xl p-4 border-2 border-green-500`}>
										<p className={`font-bold ${colors.textPrimary} text-lg`}>
											{targetTable.table_number}
										</p>
										<p className={`text-sm ${colors.textSecondary}`}>
											{targetTable.capacity} seats • {targetTable.sitting_area}
										</p>
										<p className={`text-xs text-green-600 mt-1`}>
											Available
										</p>
									</div>
								) : (
									<div className={`${colors.secondary} rounded-xl p-4 border-2 border-dashed ${colors.border}`}>
										<p className={`${colors.textMuted}`}>Select target table</p>
									</div>
								)}
							</div>
						</div>

						{/* Transfer Button */}
						{selectedTable && targetTable && (
							<div className="flex justify-center mt-6">
								<button
									onClick={handleTransferSession}
									disabled={isTransferring || transferSessionMutation.isPending}
									className="px-8 py-3 bg-[#B69549] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
								>
									{(isTransferring || transferSessionMutation.isPending) ? (
										<>
											<FiRefreshCw size={16} className="animate-spin" />
											<span>Transferring...</span>
										</>
									) : (
										<>
											<FiArrowRight size={16} />
											<span>Transfer Session</span>
										</>
									)}
								</button>
							</div>
						)}

						{/* Error Message */}
						{transferSessionMutation.isError && (
							<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
								<p className="text-red-700 dark:text-red-300 text-sm">
									{transferSessionMutation.error?.response?.data?.message || 
									transferSessionMutation.error?.message ||
									'Failed to transfer session. Please try again.'}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Tables Grid */}
				<div className={`${colors.card} rounded-xl p-6 border ${colors.border}`}>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
						<h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
							{selectedArea === 'All' ? 'All Tables' : `${selectedArea} Tables`} 
							({filteredTables.length})
						</h3>
						
						{/* Legend */}
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-green-500 rounded"></div>
								<span className={colors.textSecondary}>Active</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-yellow-600 rounded"></div>
								<span className={colors.textSecondary}>Vacant</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-purple-700 rounded"></div>
								<span className={colors.textSecondary}>Reserved</span>
							</div>
						</div>
					</div>

					{filteredTables.length > 0 ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{filteredTables.map(table => {
								const isSourceSelected = selectedTable?.table_id === table.table_id;
								const isTargetSelected = targetTable?.table_id === table.table_id;
								const canBeSource = canSelectAsSource(table);
								const canBeTarget = canSelectAsTarget(table);
								
								return (
									<div
										key={table.table_id}
										onClick={() => {
											if (canBeSource) {
												handleTableSelect(table);
											} else if (canBeTarget) {
												handleTargetSelect(table);
											}
										}}
										className={`
											${colors.secondary} rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer
											${isSourceSelected ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
											isTargetSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
											canBeSource ? `${colors.border} hover:border-yellow-300` :
											canBeTarget ? `${colors.border} hover:border-green-300` :
											`${colors.border} opacity-50 cursor-not-allowed`}
										`}
									>
										<div className="flex items-center justify-between mb-2">
											<span className={`font-bold ${colors.textPrimary}`}>
												{table.table_number}
											</span>
											<div className={`w-3 h-3 rounded-full ${getTableStatusColor(table)}`}></div>
										</div>
										
										<div className="space-y-1">
											<p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-900"}`}>
												<FiUsers size={12} className="inline mr-1" />
												{table.capacity} seats
											</p>
											<p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-900"}`}>
												{table.sitting_area[0].toUpperCase() + table.sitting_area.slice(1)}
											</p>
											{/* {table.session_id && (
												<p className={`text-xs ${colors.textMuted}`}>
													Session: {table.session_id}
												</p>
											)} */}
										</div>

										{/* Selection indicators */}
										{isSourceSelected && (
											<div className={`mt-2 text-xs font-medium ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
												Source Table
											</div>
										)}
										{isTargetSelected && (
											<div className={`mt-2 text-xs ${isDark ? "text-green-300" : "text-green-700"} font-medium`}>
												Target Table
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className={`${colors.secondary} rounded-xl p-12 border ${colors.border} text-center`}>
							<div className={`w-16 h-16 ${colors.card} rounded-full flex items-center justify-center mx-auto mb-4`}>
								<span className="text-2xl">🪑</span>
							</div>
							<h3 className={`text-xl font-semibold ${colors.textPrimary} mb-2`}>
								No Tables Found
							</h3>
							<p className={colors.textSecondary}>
								No tables available in the {selectedArea === 'All' ? 'restaurant' : selectedArea + ' area'}.
							</p>
						</div>
					)}
				</div>

				{/* Instructions */}
				<div className={`${colors.card} rounded-xl p-6 border ${colors.border}`}>
					<h4 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>
						How to Transfer Sessions
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h5 className={`font-medium ${colors.textPrimary} mb-2`}>
								Step 1: Select Source Table
							</h5>
							<p className={`text-sm ${colors.textSecondary}`}>
								Click on an occupied table (red indicator) that has an active session to select it as the source.
							</p>
						</div>
						<div>
							<h5 className={`font-medium ${colors.textPrimary} mb-2`}>
								Step 2: Select Target Table
							</h5>
							<p className={`text-sm ${colors.textSecondary}`}>
								Click on an available table (green or yellow indicator) to select it as the destination for the session transfer.
							</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ManageSessions;