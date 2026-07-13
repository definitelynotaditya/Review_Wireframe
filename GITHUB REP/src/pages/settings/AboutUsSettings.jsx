import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { FiUpload, FiSave, FiImage, FiTrash2, FiLoader } from "react-icons/fi";
import { aboutSettingsApi } from "../../store/aboutSettingsStore";
import { useAuthStore } from "../../store/authStore";
import { awsApi } from "../../store/awsStore";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";

const AboutUsSettings = () => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    // Form data matching API request body structure
    const [formData, setFormData] = useState({
        restaurant_id: user?.restaurant_id || null,
        img_name: "", // S3 filename (sent to API)
        history: "",
        restaurant_name: ""
    });
    const [previewImage, setPreviewImage] = useState(null); // Full URL for display
    const [isUploading, setIsUploading] = useState(false);
    const [isActive, setIsActive] = useState(false); // Toggle state
    const [aboutUsItemId, setAboutUsItemId] = useState(null); // Store about_us_item_id
    const [isCreated, setIsCreated] = useState(false); // Check if About Us is created

    // React Query to fetch existing About Us data with caching
    const {
        data: aboutData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["about-us", user?.restaurant_id],
        queryFn: () => aboutSettingsApi.getAboutUs(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update form data when query data changes
    useEffect(() => {
        console.log("AboutData changed:", aboutData); // Debug log
        if (aboutData) {
            if (aboutData.success && aboutData.data) {
                console.log("Setting form data with existing data:", aboutData.data); // Debug log
                
                // Extract filename from img_url if present
                let imgName = "";
                if (aboutData.data.img_url) {
                    // Extract filename from CloudFront URL
                    const urlParts = aboutData.data.img_url.split('/');
                    imgName = urlParts[urlParts.length - 1] || "";
                }
                
                // Update form data with existing data
                setFormData({
                    restaurant_id: aboutData.data.restaurant_id,
                    img_name: imgName, // Store filename for API
                    history: aboutData.data.history || "",
                    restaurant_name: aboutData.data.restaurant_name || ""
                });
                
                // Set preview with full URL
                if (aboutData.data.img_url) {
                    setPreviewImage(aboutData.data.img_url);
                }

                // Set toggle state and about_us_item_id from response
                if (aboutData.about_us_item_id) {
                    setAboutUsItemId(aboutData.about_us_item_id);
                    setIsCreated(true);
                    // If there's an about_us_item, check if it's active (default to true if not specified)
                    setIsActive(aboutData.active !== undefined ? aboutData.active : true);
                } else {
                    setIsCreated(false);
                    setIsActive(false);
                    setAboutUsItemId(null);
                }
            } else {
                console.log("Initializing form for new About Us"); // Debug log
                // Initialize form for new About Us
                setFormData({
                    restaurant_id: user?.restaurant_id || null,
                    img_name: "",
                    history: "",
                    restaurant_name: ""
                });
                setPreviewImage(null);
                setIsCreated(false);
                setIsActive(false);
                setAboutUsItemId(null);
            }
        }
    }, [aboutData, user?.restaurant_id]);

    // Mutation for saving About Us data
    const saveAboutUsMutation = useMutation({
        mutationFn: (formDataToSubmit) => aboutSettingsApi.saveAboutUs(user.restaurant_id, formDataToSubmit),
        onSuccess: (result) => {
            if (result.success) {
                // Update cache with new data
                queryClient.setQueryData(["about-us", user.restaurant_id], result);
                
                // Extract filename from img_url if present
                let imgName = "";
                if (result.data.img_url) {
                    const urlParts = result.data.img_url.split('/');
                    imgName = urlParts[urlParts.length - 1] || "";
                }
                
                // Update form data to reflect saved changes
                setFormData({
                    restaurant_id: result.data.restaurant_id,
                    img_name: imgName,
                    history: result.data.history || "",
                    restaurant_name: result.data.restaurant_name || ""
                });
                
                // Update preview image with full URL
                if (result.data.img_url) {
                    setPreviewImage(result.data.img_url);
                } else {
                    setPreviewImage(null);
                }

                // Update toggle state and about_us_item_id from response
                if (result.about_us_item_id) {
                    setAboutUsItemId(result.about_us_item_id);
                    setIsCreated(true);
                    setIsActive(result.active !== undefined ? result.active : true);
                } else {
                    setIsCreated(false);
                }
                
                toast.success(result.message || "About Us information saved successfully!");
            }
        },
        onError: (error) => {
            console.error("Save About Us failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save About Us information";
            toast.error(errorMessage);
        },
    });

    // Mutation for toggling About Us visibility
    const toggleAboutUsMutation = useMutation({
        mutationFn: ({ aboutUsItemId, active }) => aboutSettingsApi.toggleAboutUs(aboutUsItemId, active),
        onSuccess: (result) => {
            if (result.success) {
                setIsActive(result.about_us_item.active);
                // Invalidate and refetch the about-us query to get updated data
                queryClient.invalidateQueries(["about-us", user.restaurant_id]);
                toast.success(`About Us section ${result.about_us_item.active ? 'enabled' : 'disabled'} successfully!`);
            }
        },
        onError: (error) => {
            console.error("Toggle About Us failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to toggle About Us visibility";
            toast.error(errorMessage);
        },
    });

    const handleImageChange = async (e) => {
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
                setIsUploading(true);
                
                // Upload image to S3 using awsApi
                const uploadedFileName = await awsApi.uploadImage(file, user.restaurant_id);
                
                // Update form data with S3 filename
                setFormData(prev => ({
                    ...prev,
                    img_name: uploadedFileName
                }));
                
                // Set preview with local file
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);
                
                toast.success("Image uploaded successfully!");
            } catch (error) {
                console.error("Image upload failed:", error);
                toast.error("Failed to upload image. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user?.restaurant_id) {
            toast.error("Restaurant information not found");
            return;
        }

        if (!formData.restaurant_name.trim()) {
            toast.error("Restaurant name is required");
            return;
        }

        if (!formData.history.trim()) {
            toast.error("Restaurant description is required");
            return;
        }

        // Prepare submission data with img_name (already uploaded to S3)
        const submitData = {
            restaurant_id: user.restaurant_id,
            img_name: formData.img_name, // S3 filename
            restaurant_name: formData.restaurant_name.trim(),
            history: formData.history.trim()
        };

        saveAboutUsMutation.mutate(submitData);
    };

    const removeImage = () => {
        setFormData(prev => ({ 
            ...prev, 
            img_name: "" // Clear S3 filename
        }));
        setPreviewImage(null);
    };

    const handleToggle = () => {
        if (!aboutUsItemId) {
            toast.error("Please save the About Us section first before toggling");
            return;
        }
        
        const newActiveState = !isActive;
        toggleAboutUsMutation.mutate({ aboutUsItemId, active: newActiveState });
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading history settings: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                        History Settings
                    </h3>
                    
                    {/* Toggle Switch - Only show if About Us is created */}
                    {isCreated && (
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${colors.textSecondary}`}>
                                {isActive ? 'Visible in LUXEGENIE' : 'Hidden in LUXEGENIE'}
                            </span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                disabled={toggleAboutUsMutation.isPending}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                    isActive ? 'bg-yellow-600' : 'bg-gray-300'
                                } ${toggleAboutUsMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                        isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Show form only if not created OR if created and active */}
                {(!isCreated || isActive) && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Restaurant Name */}
                        <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                name="restaurant_name"
                                value={formData.restaurant_name}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200 disabled:opacity-50`}
                                placeholder="Enter your restaurant name..."
                            />
                        </div>

                        {/* Hotel Image Upload */}
                        <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                                Restaurant Image
                            </label>
                            <div className="space-y-4">
                                {!previewImage ? (
                                    <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <input
                                            type="file"
                                            id="hotel-image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={isUploading || isLoading}
                                        />
                                        <label
                                            htmlFor="hotel-image"
                                            className="cursor-pointer flex flex-col items-center space-y-2"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <FiLoader size={32} className={`${colors.textMuted} animate-spin`} />
                                                    <p className={`text-sm ${colors.textSecondary}`}>
                                                        Uploading image...
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUpload size={32} className={colors.textMuted} />
                                                    <p className={`text-sm ${colors.textSecondary}`}>
                                                        Click to upload hotel image
                                                    </p>
                                                    {/* <p className={`text-xs ${colors.textMuted}`}>
                                                        PNG, JPG up to 10MB
                                                    </p> */}
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <div className="relative w-full max-w-md h-64 rounded-xl overflow-hidden bg-white p-4 shadow-lg">
                                                <img
                                                    src={previewImage}
                                                    alt="Hotel preview"
                                                    className="w-full h-full object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-3">
                                            <label
                                                htmlFor="hotel-image"
                                                className={`cursor-pointer px-4 py-2 ${colors.buttonSecondary} rounded-lg transition-colors duration-200 hover:opacity-80 flex items-center justify-center space-x-2 ${isLoading || isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <FiImage size={16} />
                                                <span>Choose different image</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                disabled={isLoading || isUploading}
                                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                <FiTrash2 size={16} />
                                                <span>Remove photo</span>
                                            </button>
                                            <input
                                                type="file"
                                                id="hotel-image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={isLoading || isUploading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Information */}
                        <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                                Restaurant History and Information
                            </label>
                            <textarea
                                name="history"
                                value={formData.history}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                rows={6}
                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200 resize-none disabled:opacity-50`}
                                placeholder="Enter a detailed history and information about your restaurant..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading || saveAboutUsMutation.isPending}
                                className={`flex items-center space-x-2 px-6 py-3 bg-[#B69549] text-white hover:cursor-pointer rounded-xl transition-all duration-200 ${colors.shadow} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {(isLoading || saveAboutUsMutation.isPending) ? (
                                    <>
                                        <FiLoader size={18} className="animate-spin" />
                                        <span>{isLoading ? "Loading..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Message when section is hidden */}
                {isCreated && !isActive && (
                    <div className={`text-center py-12 ${colors.textMuted}`}>
                        <p className="text-lg">History section is currently hidden in LuxeGenie.</p>
                        <p className="text-sm mt-2">Enable the toggle above to show and edit the content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutUsSettings;