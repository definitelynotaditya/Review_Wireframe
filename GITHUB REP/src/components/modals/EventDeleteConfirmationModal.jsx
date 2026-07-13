import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiAlertTriangle, FiCalendar } from "react-icons/fi";
import { eventSettingsApi } from "../../store/eventSettingsStore";

const EventDeleteConfirmationModal = ({ isOpen, onClose, event, restaurantId }) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	// Mutation for deleting event
	const deleteEventMutation = useMutation({
		mutationFn: (eventId) => eventSettingsApi.deleteEvent(eventId),
		onSuccess: () => {
			toast.success(`Event "${event?.event_name}" deleted successfully!`);
			// Invalidate queries to refresh event list
			queryClient.invalidateQueries(["events", restaurantId]);
			onClose();
		},
		onError: (error) => {
			console.error("Error deleting event:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to delete event. Please try again."
			);
		},
		onSettled: () => {
			setIsDeleting(false);
		},
	});

	const handleDelete = async () => {
		if (!event?.event_id) return;

		setIsDeleting(true);
		deleteEventMutation.mutate(event.event_id);
	};

	const handleClose = () => {
		if (!isDeleting) {
			onClose();
		}
	};

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Format time for display
	const formatTime = (timeString) => {
		if (!timeString) return '';
		const [hours, minutes] = timeString.split(':');
		const time = new Date();
		time.setHours(parseInt(hours), parseInt(minutes));
		return time.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	if (!isOpen || !event) return null;

	return (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-red-100 rounded-full">
							<FiAlertTriangle size={24} className="text-red-600" />
						</div>
						<h2 className="text-xl font-bold text-white">Delete Event</h2>
					</div>
					<button
						onClick={handleClose}
						disabled={isDeleting}
						className="p-2 hover:bg-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50"
					>
						<FiX size={20} className="text-gray-300" />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-300 mb-4">
						Are you sure you want to delete this event?
						<br />
						This action cannot be undone.
					</p>

					<div className="bg-gray-700 rounded-xl p-4">
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
								<FiCalendar size={20} className="text-gray-300" />
							</div>
							<div className="flex-1">
								<p className="font-medium text-white text-lg">
									{event.event_name}
								</p>
								<p className="text-sm text-gray-400">
									{formatDate(event.event_date)}
								</p>
								{(event.start_time || event.end_time) && (
									<p className="text-xs text-gray-500">
										{event.start_time && formatTime(event.start_time)}
										{event.start_time && event.end_time && ' - '}
										{event.end_time && formatTime(event.end_time)}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						type="button"
						onClick={handleClose}
						disabled={isDeleting}
						className="px-6 py-3 border border-gray-600 rounded-xl text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						Cancel
					</button>
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
					>
						{isDeleting ? "Deleting..." : "Delete Event"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EventDeleteConfirmationModal;