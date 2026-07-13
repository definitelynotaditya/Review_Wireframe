import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiPlus, FiTrash2, FiImage, FiLoader, FiUpload } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { loyaltyClubSettingsApi } from "../../store/loyaltyClubSettingsStore";
import { awsApi } from "../../store/awsStore";
import Loader from "../../components/common/Loader.jsx";
import LoyaltyClubDeleteConfirmationModal from "../../components/modals/LoyaltyClubDeleteConfirmationModal";
import toast from "react-hot-toast";

const LoyaltyClubSettings = () => {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [loyaltyClubs, setLoyaltyClubs] = useState([]);
    const [previewImages, setPreviewImages] = useState({});
    const [uploadingClubs, setUploadingClubs] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clubToDelete, setClubToDelete] = useState(null);
    const [isActive, setIsActive] = useState(false); // Toggle state
    const [aboutUsItemId, setAboutUsItemId] = useState(null); // Store about_us_item_id (convention for all sections)
    const [isCreated, setIsCreated] = useState(false); // Check if Loyalty Club section is created

    // React Query to fetch existing loyalty clubs with caching
    const {
        data: loyaltyClubsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["loyalty-clubs", user?.restaurant_id],
        queryFn: () => loyaltyClubSettingsApi.getLoyaltyClubs(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update loyalty clubs when query data changes
    useEffect(() => {
        console.log("LoyaltyClubsData changed:", loyaltyClubsData);
        if (loyaltyClubsData && loyaltyClubsData.success) {
            // Set toggle state and about_us_item_id from response
            if (loyaltyClubsData.about_us_item_id) {
                setAboutUsItemId(loyaltyClubsData.about_us_item_id);
                setIsCreated(true);
                setIsActive(loyaltyClubsData.active !== undefined ? loyaltyClubsData.active : true);
            } else {
                setIsCreated(false);
                setIsActive(false);
                setAboutUsItemId(null);
            }
            
            if (loyaltyClubsData.data && loyaltyClubsData.data.length > 0) {
                // Transform API data to match local state structure
                const transformedClubs = loyaltyClubsData.data.map(club => {
                    // Extract filename from qr_url if present
                    let qrName = "";
                    if (club.qr_url) {
                        const urlParts = club.qr_url.split('/');
                        qrName = urlParts[urlParts.length - 1] || "";
                    }
                    
                    return {
                        loyalty_club_id: club.loyalty_club_id,
                        restaurant_id: club.restaurant_id,
                        loyalty_club_name: club.loyalty_club_name,
                        description: club.description,
                        qr_name: qrName, // Store S3 filename
                        qr_url: club.qr_url, // Keep full URL for display
                    };
                });
                setLoyaltyClubs(transformedClubs);

                // Set preview images for existing clubs
                const previewImagesObj = {};
                transformedClubs.forEach(club => {
                    if (club.qr_url) {
                        previewImagesObj[club.loyalty_club_id] = club.qr_url;
                    }
                });
                setPreviewImages(previewImagesObj);
            } else {
                // No loyalty clubs exist, add an empty one for creation
                const newClub = {
                    id: 'new-' + Date.now(),
                    restaurant_id: user?.restaurant_id || null,
                    loyalty_club_name: "",
                    description: "",
                    qr_name: "",
                    qr_url: "",
                };
                setLoyaltyClubs([newClub]);
            }
        } else {
            // Error or no data, add an empty loyalty club for creation
            const newClub = {
                id: 'new-' + Date.now(),
                restaurant_id: user?.restaurant_id || null,
                loyalty_club_name: "",
                description: "",
                qr_name: "",
                qr_url: "",
            };
            setLoyaltyClubs([newClub]);
            setIsCreated(false);
            setIsActive(false);
            setAboutUsItemId(null);
        }
    }, [loyaltyClubsData, user?.restaurant_id]);

    // Mutation for saving individual loyalty clubs
    const saveLoyaltyClubMutation = useMutation({
        mutationFn: ({ loyaltyClubData, isUpdate, loyaltyClubId }) => 
            loyaltyClubSettingsApi.saveLoyaltyClub(user.restaurant_id, loyaltyClubData, isUpdate, loyaltyClubId),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Loyalty club saved successfully!");
                
                // Update toggle state if about_us_item_id is returned
                if (result.about_us_item_id) {
                    setAboutUsItemId(result.about_us_item_id);
                    setIsCreated(true);
                    setIsActive(result.active !== undefined ? result.active : true);
                }
                
                // Invalidate and refetch loyalty clubs data
                queryClient.invalidateQueries(["loyalty-clubs", user.restaurant_id]);
            }
        },
        onError: (error) => {
            console.error("Save Loyalty Club failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save loyalty club";
            toast.error(errorMessage);
        },
    });

    // Mutation for deleting loyalty club
    const deleteLoyaltyClubMutation = useMutation({
        mutationFn: (loyaltyClubId) => loyaltyClubSettingsApi.deleteLoyaltyClub(loyaltyClubId),
        onSuccess: () => {
            toast.success("Loyalty club deleted successfully!");
            queryClient.invalidateQueries(["loyalty-clubs", user.restaurant_id]);
        },
        onError: (error) => {
            console.error("Delete Loyalty Club failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete loyalty club";
            toast.error(errorMessage);
        },
    });

    // Mutation for toggling Loyalty Clubs visibility
    const toggleLoyaltyClubsMutation = useMutation({
        mutationFn: ({ aboutUsItemId, active }) => loyaltyClubSettingsApi.toggleLoyaltyClubs(aboutUsItemId, active),
        onSuccess: (result) => {
            if (result.success) {
                setIsActive(result.about_us_item.active);
                // Invalidate and refetch the loyalty clubs query to get updated data
                queryClient.invalidateQueries(["loyalty-clubs", user.restaurant_id]);
                toast.success(`Loyalty Clubs section ${result.about_us_item.active ? 'enabled' : 'disabled'} successfully!`);
            }
        },
        onError: (error) => {
            console.error("Toggle Loyalty Clubs failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to toggle Loyalty Clubs visibility";
            toast.error(errorMessage);
        },
    });

    // Add new loyalty club
    const addLoyaltyClub = () => {
        const newClub = {
            id: 'new-' + Date.now(),
            restaurant_id: user?.restaurant_id || null,
            loyalty_club_name: "",
            description: "",
            qr_name: "",
            qr_url: "",
        };
        setLoyaltyClubs(prev => [newClub, ...prev]); // Add to top
    };

    // Handle input changes for loyalty clubs
    const handleInputChange = (clubIdentifier, field, value) => {
        setLoyaltyClubs(prev => prev.map(club => 
            (club.loyalty_club_id || club.id) === clubIdentifier ? { ...club, [field]: value } : club
        ));
    };

    // Handle QR image selection with S3 upload
    const handleImageChange = async (clubIdentifier, e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size must be less than 10MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            try {
                setUploadingClubs(prev => ({ ...prev, [clubIdentifier]: true }));
                
                // Upload image to S3 using awsApi
                const uploadedFileName = await awsApi.uploadImage(file, user.restaurant_id);
                
                // Update loyalty club data with S3 filename
                setLoyaltyClubs(prev => prev.map(club => 
                    (club.loyalty_club_id || club.id) === clubIdentifier 
                        ? { ...club, qr_name: uploadedFileName }
                        : club
                ));
                
                // Set preview with local file
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImages(prev => ({
                        ...prev,
                        [clubIdentifier]: reader.result
                    }));
                };
                reader.readAsDataURL(file);
                
                toast.success("QR image uploaded successfully!");
            } catch (error) {
                console.error("Image upload failed:", error);
                toast.error("Failed to upload QR image. Please try again.");
            } finally {
                setUploadingClubs(prev => ({ ...prev, [clubIdentifier]: false }));
            }
        }
    };

    // Remove QR image from loyalty club
    const removeClubImage = (clubIdentifier) => {
        setPreviewImages(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[clubIdentifier];
            return newPreviews;
        });
        
        setLoyaltyClubs(prev => prev.map(club => 
            (club.loyalty_club_id || club.id) === clubIdentifier 
                ? { ...club, qr_name: "", qr_url: "" }
                : club
        ));
    };

    // Save individual loyalty club
    const handleSaveLoyaltyClub = async (club) => {
        if (!user?.restaurant_id) {
            toast.error("Restaurant ID is required");
            return;
        }

        // Validate required fields
        if (!club.loyalty_club_name || !club.description) {
            toast.error("Loyalty club name and description are required");
            return;
        }

        try {
            const isExistingClub = !!club.loyalty_club_id;
            const loyaltyClubData = {
                loyalty_club_name: club.loyalty_club_name,
                description: club.description,
                qr_name: club.qr_name || "", // S3 filename (already uploaded)
            };

            await saveLoyaltyClubMutation.mutateAsync({
                loyaltyClubData,
                isUpdate: isExistingClub,
                loyaltyClubId: club.loyalty_club_id
            });
        } catch (error) {
            // Error is already handled in the mutation
        }
    };

    // Delete loyalty club
    const handleDeleteLoyaltyClub = async (club) => {
        if (!club.loyalty_club_id) {
            toast.error("Cannot delete unsaved loyalty club");
            return;
        }

        setClubToDelete(club);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setClubToDelete(null);
    };

    // Remove loyalty club from local state (for new clubs that haven't been saved)
    const removeLocalLoyaltyClub = (clubId) => {
        if (loyaltyClubs.length > 1) {
            setLoyaltyClubs(prev => prev.filter(club => (club.loyalty_club_id || club.id) !== clubId));
        }
    };

    const handleToggle = () => {
        if (!aboutUsItemId) {
            toast.error("Please save at least one loyalty club first before toggling");
            return;
        }
        
        const newActiveState = !isActive;
        toggleLoyaltyClubsMutation.mutate({ aboutUsItemId, active: newActiveState });
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading loyalty clubs: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-4 sm:p-6 border ${colors.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                        Loyalty Club Settings
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Toggle Switch - Only show if Loyalty Clubs section is created */}
                        {isCreated && (
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${colors.textSecondary}`}>
                                    {isActive ? 'Visible in LUXEGENIE' : 'Hidden in LUXEGENIE'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    disabled={toggleLoyaltyClubsMutation.isPending}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                        isActive ? 'bg-yellow-600' : 'bg-gray-300'
                                    } ${toggleLoyaltyClubsMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                            onClick={addLoyaltyClub}
                            disabled={isCreated && !isActive}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 ${isDark ? 'bg-slate-500 text-white' : 'bg-[#B69549] text-white'} rounded-lg hover:cursor-pointer
                            transition-colors duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <FiPlus size={16} />
                            <span>Add Loyalty Club</span>
                        </button>
                    </div>
                </div>
                
                {/* Show loyalty clubs only if not created OR if created and active */}
                {(!isCreated || isActive) && (
                    <div className="space-y-8">
                        {loyaltyClubs.map((club, index) => {
                            const clubIdentifier = club.loyalty_club_id || club.id;
                            const isExistingClub = !!club.loyalty_club_id;
                            const clubPreview = previewImages[clubIdentifier] || club.qr_url;
                            const isUploading = uploadingClubs[clubIdentifier];
                            
                            return (
                                <div key={clubIdentifier} className={`p-4 sm:p-6 ${isDark ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-gray-300'} rounded-xl border ${colors.borderMuted}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                        <h4 className={`text-lg font-medium ${colors.textPrimary}`}>
                                            {isExistingClub ? club.loyalty_club_name || `Loyalty Club ${index + 1}` : `New Loyalty Club ${index + 1}`}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                                            {/* Save/Create Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleSaveLoyaltyClub(club)}
                                                disabled={saveLoyaltyClubMutation.isPending}
                                                className={`flex items-center justify-center space-x-2 px-4 py-2 bg-[#B69549] text-white rounded-lg transition-colors hover:cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <FiSave size={14} />
                                                <span>
                                                    {saveLoyaltyClubMutation.isPending 
                                                        ? "Saving..." 
                                                        : isExistingClub 
                                                            ? "Save Loyalty Club" 
                                                            : "Create Loyalty Club"
                                                    }
                                                </span>
                                            </button>
                                            
                                            {/* Delete Button - Only for existing clubs */}
                                            {isExistingClub && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteLoyaltyClub(club)}
                                                    disabled={deleteLoyaltyClubMutation.isPending}
                                                    className="flex items-center justify-center p-2 text-red-400 bg-red-500/30 hover:cursor-pointer hover:bg-red-500/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            )}
                                            
                                            {/* Remove Button - Only for new clubs when multiple exist */}
                                            {!isExistingClub && loyaltyClubs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocalLoyaltyClub(clubIdentifier)}
                                                    className="flex items-center justify-center p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Left Column - QR Image */}
                                        <div className="space-y-4">
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                <FiImage size={16} className="inline mr-2" />
                                                QR Code Image
                                            </label>
                                            
                                            {!clubPreview ? (
                                                <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <input
                                                        type="file"
                                                        id={`qr-image-${clubIdentifier}`}
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(clubIdentifier, e)}
                                                        className="hidden"
                                                        disabled={isUploading}
                                                    />
                                                    <label
                                                        htmlFor={`qr-image-${clubIdentifier}`}
                                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                                    >
                                                        {isUploading ? (
                                                            <>
                                                                <FiLoader size={32} className={`${colors.textMuted} animate-spin`} />
                                                                <p className={`text-sm ${colors.textSecondary}`}>
                                                                    Uploading QR image...
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload size={32} className={colors.textMuted} />
                                                                <p className={`text-sm ${colors.textSecondary}`}>
                                                                    Click to upload QR code
                                                                </p>
                                                                {/* <p className={`text-xs ${colors.textMuted}`}>
                                                                    PNG, JPG up to 10MB
                                                                </p> */}
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white p-4">
                                                        <img
                                                            src={clubPreview}
                                                            alt="QR Code preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <label
                                                            htmlFor={`qr-image-${clubIdentifier}`}
                                                            className={`flex-1 cursor-pointer px-3 py-2 ${colors.buttonSecondary} rounded-lg text-sm text-center hover:opacity-80 transition-colors duration-200`}
                                                        >
                                                            Change Image
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeClubImage(clubIdentifier)}
                                                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors duration-200"
                                                        >
                                                            Remove
                                                        </button>
                                                        <input
                                                            type="file"
                                                            id={`qr-image-${clubIdentifier}`}
                                                            accept="image/*"
                                                            onChange={(e) => handleImageChange(clubIdentifier, e)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column - Details */}
                                        <div className="space-y-4">
                                            {/* Loyalty Club Name */}
                                            <div>
                                                <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                    Loyalty Club Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={club.loyalty_club_name}
                                                    onChange={(e) => handleInputChange(clubIdentifier, 'loyalty_club_name', e.target.value)}
                                                    className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                                    placeholder="Enter loyalty club name..."
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                    Description
                                                </label>
                                                <textarea
                                                    value={club.description}
                                                    onChange={(e) => handleInputChange(clubIdentifier, 'description', e.target.value)}
                                                    rows={4}
                                                    className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200 resize-none`}
                                                    placeholder="Enter loyalty club description..."
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
                        <p className="text-lg">Loyalty Clubs section is currently hidden in LuxeGenie.</p>
                        <p className="text-sm mt-2">Enable the toggle above to show and manage loyalty clubs.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <LoyaltyClubDeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                loyaltyClub={clubToDelete}
                restaurantId={user?.restaurant_id}
            />
        </div>
    );
};

export default LoyaltyClubSettings;
