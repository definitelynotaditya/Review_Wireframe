import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiPlus, FiTrash2, FiClock, FiImage, FiCalendar, FiVideo, FiLoader } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { eventSettingsApi } from "../../store/eventSettingsStore";
import { awsApi } from "../../store/awsStore";
import EventDeleteConfirmationModal from "../../components/modals/EventDeleteConfirmationModal";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";

const EventDetailsSettings = () => {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [events, setEvents] = useState([]);
    const [previewFiles, setPreviewFiles] = useState({}); // Stores { url, type } for each event
    const [uploadingEvents, setUploadingEvents] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [isActive, setIsActive] = useState(false); // Toggle state
    const [aboutUsItemId, setAboutUsItemId] = useState(null); // Store about_us_item_id (convention for all sections)
    const [isCreated, setIsCreated] = useState(false); // Check if Events section is created

    // React Query to fetch existing events with caching
    const {
        data: eventsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["events", user?.restaurant_id],
        queryFn: () => eventSettingsApi.getEvents(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update events when query data changes
    useEffect(() => {
        console.log("EventsData changed:", eventsData); // Debug log
        if (eventsData && eventsData.success) {
            const existingEvents = eventsData.data || [];
            
            // Set toggle state and about_us_item_id from response
            if (eventsData.about_us_item_id) {
                setAboutUsItemId(eventsData.about_us_item_id);
                setIsCreated(true);
                setIsActive(eventsData.active !== undefined ? eventsData.active : true);
            } else {
                setIsCreated(false);
                setIsActive(false);
                setAboutUsItemId(null);
            }
            
            if (existingEvents.length > 0) {
                // Convert API data to component format
                const formattedEvents = existingEvents.map(event => ({
                    event_id: event.event_id,
                    restaurant_id: event.restaurant_id,
                    img_name: event.img_name || "", // S3 filename for image or video
                    img_url: event.img_url || "", // CloudFront URL for image or video
                    event_name: event.event_name || "",
                    event_date: event.event_date ? event.event_date.split('T')[0] : "", // Convert to YYYY-MM-DD format
                    start_time: event.start_time ? event.start_time.slice(0, 5) : "", // Convert to HH:MM format
                    end_time: event.end_time ? event.end_time.slice(0, 5) : "" // Convert to HH:MM format
                }));

                setEvents(formattedEvents);

                // Set preview files for existing events with type detection
                const previewFilesObj = {};
                formattedEvents.forEach(event => {
                    if (event.img_url) {
                        // Detect file type from URL
                        const isVideo = event.img_url.includes('.mp4') || 
                                       event.img_url.includes('.webm') || 
                                       event.img_url.includes('.ogg') ||
                                       event.img_url.includes('.mov') ||
                                       event.img_url.includes('.avi');
                        
                        previewFilesObj[event.event_id] = {
                            url: event.img_url,
                            type: isVideo ? 'video' : 'image'
                        };
                    }
                });
                setPreviewFiles(previewFilesObj);
            } else {
                // Initialize with one empty event template
                setEvents([{
                    id: 'new-' + Date.now(),
                    restaurant_id: user?.restaurant_id || null,
                    img_name: "",
                    img_url: "",
                    event_name: "",
                    event_date: "",
                    start_time: "",
                    end_time: ""
                }]);
            }
        } else {
            // Initialize with one empty event template for new restaurants
            setEvents([{
                id: 'new-' + Date.now(),
                restaurant_id: user?.restaurant_id || null,
                img_name: "",
                img_url: "",
                event_name: "",
                event_date: "",
                start_time: "",
                end_time: ""
            }]);
            setIsCreated(false);
            setIsActive(false);
            setAboutUsItemId(null);
        }
    }, [eventsData, user?.restaurant_id]);

    // Mutation for saving individual events
    const saveEventMutation = useMutation({
        mutationFn: ({ eventData, isUpdate, eventId }) => 
            eventSettingsApi.saveEvent(user.restaurant_id, eventData, isUpdate, eventId),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message || "Event saved successfully!");
                
                // Update toggle state if about_us_item_id is returned
                if (result.about_us_item_id) {
                    setAboutUsItemId(result.about_us_item_id);
                    setIsCreated(true);
                    setIsActive(result.active !== undefined ? result.active : true);
                }
                
                // Refresh events data
                queryClient.invalidateQueries(["events", user.restaurant_id]);
                
                // Clear the new image file for this event
                // No need to track separate new image files since we track them in event objects
            }
        },
        onError: (error) => {
            console.error("Save Event failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save event";
            toast.error(errorMessage);
        },
    });

    // Mutation for toggling Events visibility
    const toggleEventsMutation = useMutation({
        mutationFn: ({ eventItemId, active }) => eventSettingsApi.toggleEvents(eventItemId, active),
        onSuccess: (result) => {
            if (result.success) {
                setIsActive(result.about_us_item.active);
                // Invalidate and refetch the events query to get updated data
                queryClient.invalidateQueries(["events", user.restaurant_id]);
                toast.success(`Events section ${result.about_us_item.active ? 'enabled' : 'disabled'} successfully!`);
            }
        },
        onError: (error) => {
            console.error("Toggle Events failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to toggle Events visibility";
            toast.error(errorMessage);
        },
    });

    // Add new event
    const addEvent = () => {
        const newEvent = {
            id: 'new-' + Date.now(),
            restaurant_id: user?.restaurant_id || null,
            img_name: "",
            img_url: "",
            video_name: "",
            video_url: "",
            event_name: "",
            event_date: "",
            start_time: "",
            end_time: ""
        };
        setEvents(prev => [newEvent, ...prev]); // Add to top instead of bottom
    };

    // Handle input changes for events
    const handleInputChange = (eventIdentifier, field, value) => {
        setEvents(prev => prev.map(event => {
            const identifier = event.event_id || event.id;
            return identifier === eventIdentifier ? { ...event, [field]: value } : event;
        }));
    };

    // Handle file upload with S3 (supports both images and videos)
    const handleFileChange = async (eventIdentifier, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        // Validate file type
        if (!isImage && !isVideo) {
            toast.error('Please select a valid image or video file');
            return;
        }

        // Validate file size (10MB for images, 50MB for videos)
        const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        const fileType = isImage ? 'Image' : 'Video';
        const maxSizeLabel = isImage ? '10MB' : '50MB';

        if (file.size > maxSize) {
            toast.error(`${fileType} size must be less than ${maxSizeLabel}`);
            return;
        }

        try {
            // Set uploading state for this specific event
            setUploadingEvents(prev => ({ ...prev, [eventIdentifier]: true }));

            // Upload to S3 and get the S3 filename
            const s3Filename = await awsApi.uploadImage(file, user?.restaurant_id);

            // Update event with the S3 filename
            setEvents(prevEvents =>
                prevEvents.map(event => {
                    const identifier = event.event_id || event.id;
                    return identifier === eventIdentifier
                        ? { ...event, img_name: s3Filename, img_url: "" }
                        : event;
                })
            );

            // Set local preview with file type information
            const localPreviewUrl = URL.createObjectURL(file);
            setPreviewFiles(prev => ({ 
                ...prev, 
                [eventIdentifier]: {
                    url: localPreviewUrl,
                    type: isImage ? 'image' : 'video'
                }
            }));

            toast.success(`${fileType} uploaded successfully`);
        } catch (error) {
            console.error(`${fileType} upload failed:`, error);
            toast.error(`Failed to upload ${fileType.toLowerCase()}`);
        } finally {
            setUploadingEvents(prev => ({ ...prev, [eventIdentifier]: false }));
        }
    };

    // Remove event file (image or video)
    const removeEventFile = (eventIdentifier) => {
        setEvents(prevEvents =>
            prevEvents.map(event => {
                const identifier = event.event_id || event.id;
                return identifier === eventIdentifier
                    ? { ...event, img_name: "", img_url: "" }
                    : event;
            })
        );
        setPreviewFiles(prev => {
            const updated = { ...prev };
            delete updated[eventIdentifier];
            return updated;
        });
    };

    // Save individual event
    const handleSaveEvent = async (event) => {
        if (!user?.restaurant_id) {
            toast.error("Restaurant ID is required");
            return;
        }

        // Validate required fields
        if (!event.event_name || !event.event_date) {
            toast.error("Event name and date are required");
            return;
        }

        try {
            const eventData = {
                restaurant_id: user.restaurant_id,
                img_name: event.img_name, // S3 filename for image or video
                event_name: event.event_name,
                event_date: event.event_date,
                start_time: event.start_time,
                end_time: event.end_time
            };

            const isUpdate = !!event.event_id;
            const eventId = event.event_id;

            console.log("Saving event:", { eventData, isUpdate, eventId });
            saveEventMutation.mutate({ eventData, isUpdate, eventId });
        } catch (error) {
            console.error("Error in handleSaveEvent:", error);
            toast.error(error.message || "Failed to save event");
        }
    };

    // Delete event confirmation
    const handleDeleteEvent = (event) => {
        setEventToDelete(event);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setEventToDelete(null);
    };

    // Remove event from local state (for new events that haven't been saved)
    const removeLocalEvent = (eventId) => {
        if (events.length > 1) {
            setEvents(prev => prev.filter(event => (event.event_id || event.id) !== eventId));
        }
    };

    const handleToggle = () => {
        if (!aboutUsItemId) {
            toast.error("Please save at least one event first before toggling");
            return;
        }
        
        const newActiveState = !isActive;
        toggleEventsMutation.mutate({ eventItemId: aboutUsItemId, active: newActiveState });
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading events: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-4 sm:p-6 border ${colors.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                        Event Details Settings
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Toggle Switch - Only show if Events section is created */}
                        {isCreated && (
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${colors.textSecondary}`}>
                                    {isActive ? 'Visible in LUXEGENIE' : 'Hidden in LUXEGENIE'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    disabled={toggleEventsMutation.isPending}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                        isActive ? 'bg-yellow-600' : 'bg-gray-300'
                                    } ${toggleEventsMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                            isActive ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        )}
                        
                        <button
                            onClick={addEvent}
                            disabled={isCreated && !isActive}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 ${isDark ? 'bg-slate-500 text-white' : 'bg-[#B69549] text-white'}  hover:cursor-pointer rounded-lg transition-colors duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <FiPlus size={16} />
                            <span>Add Event</span>
                        </button>
                    </div>
                </div>
                
                {/* Show events only if not created OR if created and active */}
                {(!isCreated || isActive) && (
                    <div className="space-y-8">
                    {events.map((event, index) => {
                        const eventIdentifier = event.event_id || event.id;
                        const isExistingEvent = !!event.event_id;
                    
                    // Get preview info
                    const previewInfo = previewFiles[eventIdentifier];
                    const filePreview = previewInfo?.url || event.img_url;
                    const isUploading = uploadingEvents[eventIdentifier];
                    
                    // Use stored file type
                    const isVideo = previewInfo?.type === 'video';
                        return (
                            <div key={eventIdentifier} className={`p-4 sm:p-6 ${isDark ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-gray-300'} rounded-xl border ${colors.borderMuted}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                    <h4 className={`text-lg font-medium ${colors.textPrimary}`}>
                                        {isExistingEvent ? event.event_name || `Event ${index + 1}` : `New Event ${index + 1}`}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                                        {/* Save/Create Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEvent(event)}
                                            disabled={saveEventMutation.isPending}
                                            className={`flex items-center justify-center space-x-2 px-4 py-2 bg-[#B69549] text-white rounded-lg transition-colors hover:cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <FiSave size={14} />
                                            <span>
                                                {saveEventMutation.isPending 
                                                    ? "Saving..." 
                                                    : isExistingEvent 
                                                        ? "Save Event" 
                                                        : "Create Event"
                                                }
                                            </span>
                                        </button>
                                        
                                        {/* Delete Button (only for existing events) */}
                                        {isExistingEvent && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event)}
                                                className="flex items-center justify-center p-2 text-red-400 bg-red-500/30 hover:cursor-pointer hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        )}
                                        
                                        {/* Remove Button (only for new events and if more than 1) */}
                                        {!isExistingEvent && events.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLocalEvent(eventIdentifier)}
                                                className="flex items-center justify-center p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Event Media Upload (Image or Video) */}
                                <div className="mb-6">
                                    <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                                        Event Media
                                        {/* <span className={`text-xs ${colors.textMuted} ml-2`}>(Image: Max 10MB | Video: Max 50MB)</span> */}
                                    </label>
                                    <div className="space-y-4">
                                        {!filePreview ? (
                                            <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-6 text-center hover:border-purple-400 transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="file"
                                                    id={`event-file-${eventIdentifier}`}
                                                    accept="image/*,video/*"
                                                    onChange={(e) => handleFileChange(eventIdentifier, e)}
                                                    className="hidden"
                                                    disabled={isUploading}
                                                />
                                                <label
                                                    htmlFor={`event-file-${eventIdentifier}`}
                                                    className="cursor-pointer flex flex-col items-center space-y-3"
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <FiLoader size={32} className={`${colors.textMuted} animate-spin`} />
                                                            <p className={`text-sm ${colors.textSecondary}`}>
                                                                Uploading...
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center space-x-3">
                                                                <FiImage size={28} className={colors.textMuted} />
                                                                {/* <span className={`text-sm ${colors.textMuted}`}>or</span>
                                                                <FiVideo size={28} className={colors.textMuted} /> */}
                                                            </div>
                                                            <p className={`text-sm ${colors.textSecondary}`}>
                                                                Upload event image
                                                            </p>
                                                            <p className={`text-xs ${colors.textMuted}`}>
                                                                Click to browse files
                                                            </p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex justify-center">
                                                    <div className={`relative w-full h-48 sm:h-56 rounded-xl overflow-hidden ${isVideo ? 'bg-black' : 'bg-white p-3'}`}>
                                                        {isVideo ? (
                                                            <video
                                                                src={filePreview}
                                                                controls
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={filePreview}
                                                                alt="Event preview"
                                                                className="w-full h-full object-contain rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                                                    <label
                                                        htmlFor={`event-file-${eventIdentifier}`}
                                                        className={`cursor-pointer px-4 py-2 ${colors.buttonSecondary} rounded-lg transition-colors duration-200 hover:opacity-80 flex items-center justify-center space-x-2 text-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                    >
                                                        {isVideo ? <FiVideo size={16} /> : <FiImage size={16} />}
                                                        <span>Change {isVideo ? 'video' : 'image'}</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEventFile(eventIdentifier)}
                                                        disabled={isUploading}
                                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500/30 flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                                                    >
                                                        <FiTrash2 size={16} />
                                                        <span>Remove</span>
                                                    </button>
                                                    <input
                                                        type="file"
                                                        id={`event-file-${eventIdentifier}`}
                                                        accept="image/*,video/*"
                                                        onChange={(e) => handleFileChange(eventIdentifier, e)}
                                                        className="hidden"
                                                        disabled={isUploading}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Event Details Section */}
                                <div className="space-y-4 mt-6">
                                    {/* Event Name */}
                                    <div>
                                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                            Event Name
                                        </label>
                                        <input
                                            type="text"
                                            value={event.event_name}
                                            onChange={(e) => handleInputChange(eventIdentifier, 'event_name', e.target.value)}
                                            placeholder="Enter event name"
                                            className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                        />
                                    </div>

                                    {/* Event Date and Time Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Event Date */}
                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                <FiCalendar size={16} className="inline mr-2" />
                                                Event Date
                                            </label>
                                            <input
                                                type="date"
                                                value={event.event_date}
                                                onChange={(e) => handleInputChange(eventIdentifier, 'event_date', e.target.value)}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                            />
                                        </div>

                                        {/* Start Time */}
                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                <FiClock size={16} className="inline mr-2" />
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={event.start_time}
                                                onChange={(e) => handleInputChange(eventIdentifier, 'start_time', e.target.value)}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                <FiClock size={16} className="inline mr-2" />
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={event.end_time}
                                                onChange={(e) => handleInputChange(eventIdentifier, 'end_time', e.target.value)}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* Message when section is hidden */}
                {isCreated && !isActive && (
                    <div className={`text-center py-12 ${colors.textMuted}`}>
                        <p className="text-lg">Events section is currently hidden in LuxeGenie.</p>
                        <p className="text-sm mt-2">Enable the toggle above to show and manage events.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <EventDeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                event={eventToDelete}
                restaurantId={user?.restaurant_id}
            />
        </div>
    );
};

export default EventDetailsSettings;