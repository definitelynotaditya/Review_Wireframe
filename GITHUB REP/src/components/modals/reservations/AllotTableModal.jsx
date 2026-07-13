import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiUsers, FiMapPin } from 'react-icons/fi';
import { reservationApi } from '../../../store/reservationStore';
import { useAuthStore } from '../../../store/authStore';
import { useTheme } from '../../../context/ThemeContext.jsx';
import toast from 'react-hot-toast';
import luxegenie2 from '/luxegenie2.png';

const AllotTableModal = ({ isOpen, onClose, reservation, defaultAction = 'allot' }) => {
	const { colors, isDark } = useTheme();
	const { user } = useAuthStore();
	const restaurantId = user?.restaurant_id;
	const queryClient = useQueryClient();

    // console.log(reservation);
    

	const [selectedSittingArea, setSelectedSittingArea] = useState(null);
	const [selectedTable, setSelectedTable] = useState(null);
	const [actionType, setActionType] = useState(defaultAction); // 'allot', 'seat', 'allot_and_seat'
	const [showTableSelection, setShowTableSelection] = useState(false); // For when table is already allotted
	const [isTableDeallotted, setIsTableDeallotted] = useState(false); // Track if table was deallotted

	// Check if table is already allotted (but not if we just deallotted it)
	const isTableAllotted = (reservation?.alloted_table_id && reservation.alloted_table_id !== '' && !isTableDeallotted);
    
	const currentTableId = reservation?.alloted_table_id;

    // Alloted table number
    const allotedTableNumber = reservation?.alloted_table_number || '';
    console.log(allotedTableNumber);
    
	
	// Get current table number from table ID (we'll need to find it in the tables data or use status)
	const getCurrentTableDisplay = () => {
		if (reservation?.reservation_status === 'alloted' && currentTableId) {
			// Try to find the table number from the tables data
			for (const area of Object.keys(tables)) {
				const table = tables[area]?.find(t => t.table_id.toString() === currentTableId.toString());
				if (table) {
					return table.table_number;
				}
			}
			// Fallback to showing table ID if we can't find the number
			return `Table ID: ${currentTableId}`;
		}
		return '';
	};

	// Action type options - conditionally filter based on table allotment status
	const actionTypes = [
		{
			id: 'allot',
			label: 'Allot'
		},
		{
			id: 'seat',
			label: 'Seated'
		},
		// Only show "Alloted & Seated" option if table is not already allotted
		...(!isTableAllotted ? [{
			id: 'allot_and_seat',
			label: 'Allotted & Seated'
		}] : [])
	];

	// Auto-switch action type if current selection becomes invalid
	React.useEffect(() => {
		if (isTableAllotted && actionType === 'allot_and_seat') {
			setActionType('seat');
		}
	}, [isTableAllotted, actionType]);

	const getCurrentActionType = () => actionTypes.find(type => type.id === actionType);

	// Get modal title based on action type
	const getModalTitle = () => {
		const current = getCurrentActionType();
		return `${current?.label} Table`;
	};

	// Get button text based on action type
	const getButtonText = () => {
		if (!selectedTable) return 'Select Table';
		const current = getCurrentActionType();
		return `${current?.label} ${selectedTable.table_number}`;
	};

	// Fetch vacant tables
	const {
		data: tablesResponse = { tables: {} },
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vacant-tables", restaurantId],
		queryFn: () => reservationApi.getVacantTables(restaurantId),
		enabled: !!restaurantId && isOpen,
		select: (data) => data.success ? data : { tables: {} },
	});

	const tables = tablesResponse.tables || {};
	const sittingAreas = Object.keys(tables);

	// Auto-select first sitting area when data loads
	React.useEffect(() => {
		if (sittingAreas.length > 0 && !selectedSittingArea) {
			setSelectedSittingArea(sittingAreas[0]);
		}
	}, [sittingAreas, selectedSittingArea]);

	// Reset selections when modal closes
	React.useEffect(() => {
		if (!isOpen) {
			setSelectedTable(null);
			setSelectedSittingArea(null);
			setActionType(defaultAction); // Reset to defaultAction
			setIsTableDeallotted(false); // Reset deallotted state
		}
	}, [isOpen, defaultAction]);

	// Table action mutation (handles all three action types)
	const tableActionMutation = useMutation({
		mutationFn: ({ reservationId, tableId, action }) => {
			switch (action) {
				case 'allot':
					return reservationApi.allotTable(reservationId, tableId);
				case 'seat':
					return reservationApi.seatTable(reservationId, tableId);
				case 'allot_and_seat':
					return reservationApi.allotAndSeatTable(reservationId, tableId);
				default:
					throw new Error('Invalid action type');
			}
		},
		onSuccess: (data) => {
			const current = getCurrentActionType();
			toast.success(data.message || `Table ${selectedTable?.table_number} ${current.label.toLowerCase()}ed successfully!`);
			queryClient.invalidateQueries(["reservations"]);
			queryClient.invalidateQueries(["vacant-tables"]);
			queryClient.invalidateQueries(["restaurant-tables"]);
			onClose();
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.error || error.message || 'Failed to process table action';
			toast.error(errorMessage);
		},
	});

	// Deallotment mutation
	const deallotMutation = useMutation({
		mutationFn: (reservationId) => {
			return reservationApi.deallotTable(reservationId);
		},
		onSuccess: (data) => {
			toast.success('Table unalloted successfully');
			queryClient.invalidateQueries(["reservations"]);
			queryClient.invalidateQueries(["vacant-tables"]);
			queryClient.invalidateQueries(["restaurant-tables"]);
			setIsTableDeallotted(true); // Mark as deallotted
			setShowTableSelection(true); // Show table selection after deallotment
			// Reset selected table since we're now in selection mode
			setSelectedTable(null);
			setSelectedSittingArea(null);
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.error || error.message || 'Failed to deallot table';
			toast.error(errorMessage);
		},
	});

	const handleTableSelect = (table) => {
		setSelectedTable(table);
	};

	const handleTableAction = () => {
		if (!selectedTable || !reservation) return;
		
		// Normal table action - deallotment is handled separately by "Allot Another Table" button
		tableActionMutation.mutate({
			reservationId: reservation.reservation_id,
			tableId: selectedTable.table_id,
			action: actionType,
		});
	};

	const handleAllotAnotherTable = () => {
		if (!reservation) return;
		// Trigger deallotment which will automatically show table selection on success
		deallotMutation.mutate(reservation.reservation_id);
	};

	// Reset table selection mode when modal closes or action type changes
	React.useEffect(() => {
		if (!isOpen) {
			setShowTableSelection(false);
		}
	}, [isOpen]);

	// Show table selection immediately for non-allot actions when table is not allotted
	// For allot action, only show table selection if table is not allotted or if we're in selection mode
	React.useEffect(() => {
		if (isOpen) {
			if (!isTableAllotted) {
				// If no table is allotted, show table selection for all actions except seat
				if (actionType === 'seat') {
					setShowTableSelection(false); // Seat requires table to be allotted first
				} else {
					setShowTableSelection(true);
				}
			} else {
				// If table is already allotted, don't show table selection initially
				// It will be shown only when "Allot Another Table" is clicked
				setShowTableSelection(false);
			}
		}
	}, [isOpen, isTableAllotted, actionType]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div 
				className={`rounded-xl shadow-2xl w-full max-w-4xl h-[550px] sm:h-[550px] md:h-[600px] flex flex-col overflow-hidden ${colors.card} ${colors.textPrimary}`}
				
			>
				{/* Header */}
				<div 
					className="flex items-center justify-between p-4 flex-shrink-0"
					style={{
						borderBottom: `1px solid ${colors.border}`,
					}}
				>
					<div>
						<h2 
							className="text-xl font-bold"
							style={{ color: colors.textPrimary }}
						>
							{getModalTitle()}
						</h2>
						<p 
							className="text-sm mt-1"
							style={{ color: colors.textSecondary }}
						>
							Select action and table for {reservation?.guest_name || 'Guest'}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg transition-colors hover:cursor-pointer"
						style={{
							backgroundColor: colors.background,
						}}
						onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
						onMouseLeave={(e) => e.target.style.backgroundColor = colors.background}
					>
						<FiX size={20} style={{ color: colors.textSecondary }} />
					</button>
				</div>

				{/* Action Type Selection */}
				<div 
					className={`px-4 py-3 flex-shrink-0 ${isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'} ${colors.background}`}
					// style={{
					// 	borderBottom: `1px solid ${colors.border}`,
					// 	backgroundColor: colors.background,
					// }}
				>
					<div className="flex items-center space-x-6">
						{/* <h3 className="text-sm font-medium text-gray-900">Action:</h3> */}
						<div className="flex items-center space-x-4">
							{actionTypes.map((type) => (
								<label
									key={type.id}
									className="flex items-center space-x-2 cursor-pointer"
								>
									<input
										type="radio"
										name="actionType"
										value={type.id}
										checked={actionType === type.id}
										onChange={(e) => setActionType(e.target.value)}
										className="w-4 h-4 text-orange-500 focus:ring-orange-500"
										style={{
											borderColor: colors.border,
											backgroundColor: colors.input,
										}}
									/>
									<span 
										className="text-sm font-medium"
										style={{ color: colors.textPrimary }}
									>
										{type.label}
									</span>
								</label>
							))}
						</div>
					</div>
				</div>

				{/* Content - Fixed Height for Better UX */}
				<div className="flex-1 overflow-hidden flex flex-col min-h-0">
					{/* Show current table info when table is already allotted and we're not in table selection mode */}
					{isTableAllotted && !showTableSelection ? (
						<div className="flex-1 flex items-center justify-center p-6">
							<div className="text-center max-w-md">
								<div 
									className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
									style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
								>
									<FiMapPin size={32} className="text-[#B69549]" />
								</div>
								<h3 
									className="text-lg font-semibold mb-2"
									style={{ color: colors.textPrimary }}
								>
									Current Table
								</h3>
								<div 
									className="rounded-lg p-4 mb-4"
									style={{
										backgroundColor: 'rgba(249, 115, 22, 0.1)',
										border: '1px solid rgba(249, 115, 22, 0.3)',
									}}
								>
									<div className={`text-2xl font-bold ${isDark ? 'luxegenie-gradient' : 'text-[#B69549]'} mb-1`}>
										Table Number : {allotedTableNumber}
									</div>
									<div 
										className="text-sm"
										style={{ color: colors.textSecondary }}
									>
										Currently allotted to {reservation?.guest_name}
									</div>
								</div>
								
								{/* Show different options based on action type */}
								{actionType === 'allot' && (
									<button
										onClick={handleAllotAnotherTable}
										className={`px-6 py-3 rounded-lg transition-colors font-medium bg-[#B69549] text-white`}
										onMouseEnter={(e) => e.target.style.backgroundColor = '#B69549'}
										onMouseLeave={(e) => e.target.style.backgroundColor = '#B69549'}
									>
										Allot Another Table
									</button>
								)}
								
								{actionType === 'seat' && (
									<div className="text-center">
										{/* <p 
											className="mb-4"
											style={{ color: colors.textSecondary }}
										>
											Guest is currently allotted to {getCurrentTableDisplay()}
										</p> */}
										<p className={`text-sm md:text-lg ${isDark ? 'luxegenie-gradient' : 'text-[#B69549]'} font-medium`}>Ready to seat the guest at their allotted table</p>
									</div>
								)}
								
								{actionType === 'allot_and_seat' && (
									<div className="text-center">
										<p 
											className="mb-4"
											style={{ color: colors.textSecondary }}
										>
											Guest is currently allotted to {getCurrentTableDisplay()}
										</p>
										<p className="text-sm text-orange-600 font-medium">Ready to mark guest as allotted and seated</p>
									</div>
								)}
							</div>
						</div>
					) : actionType === 'seat' && !isTableAllotted ? (
						/* Show message when trying to seat but no table is allotted */
						<div className="flex-1 flex items-center justify-center p-6">
							<div className="text-center max-w-md">
								<div 
									className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
									style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
								>
									<FiMapPin size={32} className="text-[#B69549]" />
								</div>
								<h3 
									className="text-lg font-semibold mb-2"
									style={{ color: colors.textPrimary }}
								>
									No Table Allotted
								</h3>
								<p 
									className="mb-4"
									style={{ color: colors.textSecondary }}
								>
									Guest must be allotted a table before they can be seated.
								</p>
								<button
									onClick={() => setActionType('allot')}
									className={`px-6 py-3 bg-[#B69549] text-white rounded-lg transition-colors font-medium`}
								>
									Allot Table First
								</button>
							</div>
						</div>
					) : isLoading ? (
						/* Loading state */
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
								<p className="mt-4 text-gray-600">Loading vacant tables...</p>
							</div>
						</div>
					) : error ? (
						/* Error state */
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<p className="text-red-600 mb-4">Failed to load vacant tables</p>
								<button
									onClick={() => queryClient.invalidateQueries(["vacant-tables"])}
									className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
								>
									Retry
								</button>
							</div>
						</div>
					) : sittingAreas.length === 0 ? (
						/* No tables available */
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<FiMapPin size={48} className="text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">No vacant tables available</p>
							</div>
						</div>
					) : (
						/* Table selection interface */
						<>
							{/* Show deallotment button when we're selecting another table */}
							{/* {isTableAllotted && showTableSelection && actionType === 'allot' && (
								<div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
									<div className="flex items-center justify-between">
										<div className="text-sm text-gray-600">
											Current table <strong>{getCurrentTableDisplay()}</strong> will be deallotted when you select a new table
										</div>
										<button
											onClick={() => setShowTableSelection(false)}
											className="text-sm text-gray-500 hover:text-gray-700 underline"
										>
											Cancel
										</button>
									</div>
								</div>
							)} */}

							{/* Sitting Area Tabs */}
							<div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
								<div className="flex flex-wrap gap-2">
									{sittingAreas.map((area) => (
										<button
											key={area}
											onClick={() => {
												setSelectedSittingArea(area);
												setSelectedTable(null); // Reset table selection when changing area
											}}
											className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
												selectedSittingArea === area
													? 'bg-[#B69549] text-white shadow-md'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{area[0].toUpperCase() + area.slice(1)}
											<span className="ml-1 text-xs opacity-75">
												({tables[area]?.length || 0})
											</span>
										</button>
									))}
								</div>
							</div>

							{/* Tables Grid - Scrollable */}
							<div className="flex-1 overflow-y-auto p-4">
								{selectedSittingArea && tables[selectedSittingArea] && (
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
										{tables[selectedSittingArea].map((table) => (
											<div
												key={table.table_id}
												onClick={() => handleTableSelect(table)}
												className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
													selectedTable?.table_id === table.table_id
														? isDark 
															? 'border-[#B69549] bg-slate-800 shadow-md' 
															: 'border-[#B69549] bg-yellow-50 shadow-md'
														: isDark 
															? 'bg-slate-700 border-slate-600 hover:border-slate-500' 
															: 'bg-gray-100 border-gray-300 hover:border-gray-400'
												}`}
											>
												{/* Luxegenie Icon */}
												{table.is_luxegenie_assigned && (
													<div className="absolute top-[-15px] right-0">
														<img
															src={luxegenie2}
															alt="Luxegenie"
															className="w-8"
														/>
													</div>
												)}

												{/* Table Number */}
												<div className="text-center">
													<div className={`text-lg font-bold ${
														selectedTable?.table_id === table.table_id
															? 'text-[#B69549]'
															: isDark 
																? 'text-white' 
																: 'text-gray-900'
													}`}>
														{table.table_number}
													</div>
													
													{/* Table Info */}
													<div className="mt-1">
														<div className={`flex items-center justify-center text-xs ${
															selectedTable?.table_id === table.table_id
																? 'text-[#B69549]'
																: isDark 
																	? 'text-gray-400' 
																	: 'text-gray-600'
														}`}>
															<FiUsers size={12} className="mr-1" />
															{table.capacity}
														</div>
													</div>
												</div>
												
											</div>
										))}
									</div>
								)}

								{selectedSittingArea && (!tables[selectedSittingArea] || tables[selectedSittingArea].length === 0) && (
									<div className="text-center py-12">
										<FiMapPin size={48} className="text-gray-400 mx-auto mb-4" />
										<p className="text-gray-600">No vacant tables in {selectedSittingArea}</p>
									</div>
								)}
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				<div 
					className="flex-shrink-0 flex items-center justify-between p-4"
					style={{
						borderTop: `1px solid ${colors.border}`,
						backgroundColor: colors.card,
					}}
				>
					<div 
						className="text-sm"
						style={{ color: colors.textSecondary }}
					>
						{showTableSelection && selectedTable ? (
							<span>
								{/* Selected: <strong>{selectedSittingArea} {selectedTable.table_number}</strong>
								<span 
									className="ml-2"
									style={{ color: colors.textSecondary }}
								>
									(Capacity: {selectedTable.capacity})
								</span> */}
							</span>
						) : showTableSelection && !selectedTable ? (
							''
						) : isTableAllotted && !showTableSelection ? (
							``
						) : (
							''
						)}
					</div>
					
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="px-4 py-2 rounded-lg transition-colors text-sm"
							style={{
								backgroundColor: colors.background,
								color: colors.textPrimary,
								border: `1px solid gray`,
							}}
							onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
							onMouseLeave={(e) => e.target.style.backgroundColor = colors.background}
						>
							Cancel
						</button>
						
						{/* Show different buttons based on state */}
						{isTableAllotted && !showTableSelection && actionType === 'seat' ? (
							/* Seat button for already allotted table */
							<button
								onClick={() => {
									// For seat action on already allotted table
									tableActionMutation.mutate({
										reservationId: reservation.reservation_id,
										tableId: currentTableId,
										action: actionType,
									});
								}}
								disabled={tableActionMutation.isPending}
								className="px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-[#B69549] text-white"
								style={{
									cursor: !tableActionMutation.isPending ? 'pointer' : 'not-allowed',
								}}
								onMouseEnter={(e) => {
									if (!tableActionMutation.isPending) {
										e.target.style.backgroundColor = '#B69549';
									}
								}}
								onMouseLeave={(e) => {
									if (!tableActionMutation.isPending) {
										e.target.style.backgroundColor = '#B69549';
									}
								}}
							>
								{tableActionMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
										Seating...
									</>
								) : (
									`Seat ${allotedTableNumber}`
								)}
							</button>
						) : isTableAllotted && !showTableSelection && actionType === 'allot_and_seat' ? (
							/* Allot & Seat button */
							<button
								onClick={() => {
									// For allot_and_seat action on already allotted table
									tableActionMutation.mutate({
										reservationId: reservation.reservation_id,
										tableId: currentTableId,
										action: actionType,
									});
								}}
								disabled={tableActionMutation.isPending}
								className="px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-[#B69549] text-white"
								style={{
									cursor: !tableActionMutation.isPending ? 'pointer' : 'not-allowed',
								}}
								onMouseEnter={(e) => {
									if (!tableActionMutation.isPending) {
										e.target.style.backgroundColor = '#B69549';
									}
								}}
								onMouseLeave={(e) => {
									if (!tableActionMutation.isPending) {
										e.target.style.backgroundColor = '#B69549';
									}
								}}
							>
								{tableActionMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
										Alloting & Seating...
									</>
								) : (
									`Allot & Seat ${allotedTableNumber}`
								)}
							</button>
						) : showTableSelection ? (
							/* Regular table selection button */
							<button
								onClick={handleTableAction}
								disabled={!selectedTable || tableActionMutation.isPending || deallotMutation.isPending}
								className="px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-[#B69549] text-white"
								style={{
									cursor: (selectedTable && !tableActionMutation.isPending && !deallotMutation.isPending) ? 'pointer' : 'not-allowed',
								}}
								onMouseEnter={(e) => {
									if (selectedTable && !tableActionMutation.isPending && !deallotMutation.isPending) {
										e.target.style.backgroundColor = '#B69549';
									}
								}}
								onMouseLeave={(e) => {
									if (selectedTable && !tableActionMutation.isPending && !deallotMutation.isPending) {
										e.target.style.backgroundColor = '#f97316';
									}
								}}
							>
								{tableActionMutation.isPending || deallotMutation.isPending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
										Alloting...
									</>
								) : (
									getButtonText()
								)}
							</button>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllotTableModal;