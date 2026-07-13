import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUpload, FiSave, FiImage, FiTrash2, FiLoader } from "react-icons/fi";
import { menuSettingsApi } from "../../store/menuSettingsStore";
import { awsApi } from "../../store/awsStore";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import Loader from "../../components/common/Loader";

const MenuSettings = () => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    // Form data matching API request body structure
    const [formData, setFormData] = useState({
        restaurant_id: user?.restaurant_id || null,
        qr_url: "" // S3 filename (sent to API as qr_url)
    });
    const [previewImage, setPreviewImage] = useState(null); // Full URL for display
    const [isUploading, setIsUploading] = useState(false);

    // React Query to fetch existing Menu data with caching
    const {
        data: menuData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["menu-settings", user?.restaurant_id],
        queryFn: () => menuSettingsApi.getMenu(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update form data when query data changes
    useEffect(() => {
        console.log("MenuData changed:", menuData); // Debug log
        if (menuData) {
            if (menuData.success && menuData.data && menuData.data.length > 0) {
                console.log("Setting form data with existing menu data:", menuData.data[0]); // Debug log
                const existingMenu = menuData.data[0];
                
                // Extract filename from qr_url if present
                let qrUrl = "";
                if (existingMenu.qr_url) {
                    const urlParts = existingMenu.qr_url.split('/');
                    qrUrl = urlParts[urlParts.length - 1];
                }
                
                // Update form data with existing data
                setFormData({
                    restaurant_id: existingMenu.restaurant_id,
                    qr_url: qrUrl
                });
                
                // Update preview image with full URL
                if (existingMenu.qr_url) {
                    setPreviewImage(existingMenu.qr_url);
                }
            } else {
                console.log("Initializing form for new Menu"); // Debug log
                // Initialize form for new Menu
                setFormData({
                    restaurant_id: user?.restaurant_id || null,
                    qr_url: ""
                });
                setPreviewImage(null);
            }
        }
    }, [menuData, user?.restaurant_id]);

    // Mutation for saving Menu data
    const saveMenuMutation = useMutation({
        mutationFn: (formDataToSubmit) => menuSettingsApi.saveMenu(user.restaurant_id, formDataToSubmit),
        onSuccess: (result) => {
            if (result.success) {
                // Update cache with new data
                queryClient.setQueryData(["menu-settings", user.restaurant_id], {
                    success: true,
                    data: [result.data] // Wrap in array to match GET response format
                });
                
                // Extract filename from qr_url if present
                let qrUrl = "";
                if (result.data.qr_url) {
                    const urlParts = result.data.qr_url.split('/');
                    qrUrl = urlParts[urlParts.length - 1];
                }
                
                // Update form data to reflect saved changes
                setFormData({
                    restaurant_id: result.data.restaurant_id,
                    qr_url: qrUrl
                });
                
                // Update preview image with full URL
                if (result.data.qr_url) {
                    setPreviewImage(result.data.qr_url);
                } else {
                    setPreviewImage(null);
                }
                
                toast.success(result.message || "Menu settings saved successfully!");
            }
        },
        onError: (error) => {
            console.error("Save Menu failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save menu settings";
            toast.error(errorMessage);
        },
    });

    // Handle image selection with S3 upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size should be less than 10MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload a valid image file");
                return;
            }

            try {
                setIsUploading(true);
                
                // Upload to S3 and get unique filename
                const uniqueFileName = await awsApi.uploadImage(file, user.restaurant_id);
                
                // Update form data with S3 filename
                setFormData(prev => ({
                    ...prev,
                    qr_url: uniqueFileName
                }));
                
                // Create local preview URL for immediate display
                const previewUrl = URL.createObjectURL(file);
                setPreviewImage(previewUrl);
                
                toast.success("Image uploaded successfully!");
            } catch (error) {
                console.error("Image upload failed:", error);
                toast.error("Failed to upload image. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Remove image
    const removeImage = () => {
        setFormData(prev => ({ 
            ...prev, 
            qr_url: "" // Clear S3 filename
        }));
        setPreviewImage(null);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user?.restaurant_id) {
            toast.error("Restaurant information not found");
            return;
        }

        // Prepare submission data with qr_url (already uploaded to S3)
        const submitData = {
            restaurant_id: user.restaurant_id,
            qr_url: formData.qr_url // S3 filename
        };

        saveMenuMutation.mutate(submitData);
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading menu settings: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
                <h3 className={`text-xl font-semibold ${colors.textPrimary} mb-6`}>
                    Menu Settings
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Menu QR Code Upload */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                            Menu QR Code Image
                        </label>
                        <div className="space-y-4">
                            {!previewImage ? (
                                <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                        type="file"
                                        id="menu-qr-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={isUploading || isLoading}
                                    />
                                    <label
                                        htmlFor="menu-qr-image"
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
                                                    Click to upload menu QR code
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
                                        <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-white p-4 shadow-lg">
                                            <img
                                                src={previewImage}
                                                alt="Menu QR preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-3">
                                        <label
                                            htmlFor="menu-qr-image"
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
                                            id="menu-qr-image"
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

                    {/* Info Card */}
                    {/* <div className={`${colors.secondary} rounded-xl `}>
                        <h4 className={`font-medium luxegenie-gradient mb-2`}>
                            This QR code image will be shown on Luxegenies                        </h4>
                    </div> */}
                    

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || saveMenuMutation.isPending}
                            className={`flex items-center space-x-2 px-6 py-3 bg-[#B69549] text-white hover:cursor-pointer rounded-xl transition-all duration-200 ${colors.shadow} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {(isLoading || saveMenuMutation.isPending) ? (
                                <>
                                    <FiLoader size={18} className="animate-spin" />
                                    <span>{isLoading ? "Loading..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    <span>Save Menu Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuSettings;