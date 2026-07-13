import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiWifi, FiEye, FiEyeOff, FiLock, FiUpload, FiImage, FiTrash2, FiLoader } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { wifiSettingsApi } from "../../store/wifiSettingsStore";
import { awsApi } from "../../store/awsStore";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";

const WiFiSettings = () => {
    const { colors } = useTheme();
    const { user, restaurant, updateRestaurant } = useAuthStore();
    const queryClient = useQueryClient();
    
    // Form data matching API request body structure
    const [formData, setFormData] = useState({
        restaurant_id: user?.restaurant_id || null,
        qr_url: "", // S3 filename (sent to API as qr_url)
        wifi_address: "",
        wifi_password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null); // Full URL for display
    const [isUploading, setIsUploading] = useState(false);
    // Read initial value from restaurant stored in localStorage at login (default false)
    const [showAccessWifi, setShowAccessWifi] = useState(restaurant?.show_access_wifi ?? false);

    // React Query to fetch existing WiFi data with caching
    const {
        data: wifiData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["wifi-settings", user?.restaurant_id],
        queryFn: () => wifiSettingsApi.getWiFi(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update form data when query data changes
    useEffect(() => {
        console.log("WiFiData changed:", wifiData); // Debug log
        if (wifiData) {
            if (wifiData.success && wifiData.data && wifiData.data.length > 0) {
                console.log("Setting form data with existing wifi data:", wifiData.data[0]); // Debug log
                const existingWiFi = wifiData.data[0];
                
                // Extract filename from qr_url if present
                let qrUrlFilename = "";
                if (existingWiFi.qr_url) {
                    const urlParts = existingWiFi.qr_url.split('/');
                    qrUrlFilename = urlParts[urlParts.length - 1];
                }
                
                // Update form data with existing data
                setFormData({
                    restaurant_id: existingWiFi.restaurant_id,
                    qr_url: qrUrlFilename,
                    wifi_address: existingWiFi.wifi_address || "",
                    wifi_password: existingWiFi.wifi_password || ""
                });
                
                // Update preview image with full URL
                if (existingWiFi.qr_url) {
                    setPreviewImage(existingWiFi.qr_url);
                }
            } else {
                console.log("Initializing form for new WiFi"); // Debug log
                // Initialize form for new WiFi
                setFormData({
                    restaurant_id: user?.restaurant_id || null,
                    qr_url: "",
                    wifi_address: "",
                    wifi_password: ""
                });
                setPreviewImage(null);
            }
        }
    }, [wifiData, user?.restaurant_id]);

    // Mutation for saving WiFi data
    const saveWiFiMutation = useMutation({
        mutationFn: (formDataToSubmit) => wifiSettingsApi.saveWiFi(user.restaurant_id, formDataToSubmit),
        onSuccess: (result) => {
            if (result.success) {
                // Update cache with new data
                queryClient.setQueryData(["wifi-settings", user.restaurant_id], {
                    success: true,
                    data: [result.data] // Wrap in array to match GET response format
                });
                
                // Extract filename from qr_url if present
                let qrUrlFilename = "";
                if (result.data.qr_url) {
                    const urlParts = result.data.qr_url.split('/');
                    qrUrlFilename = urlParts[urlParts.length - 1];
                }
                
                // Update form data to reflect saved changes
                setFormData({
                    restaurant_id: result.data.restaurant_id,
                    qr_url: qrUrlFilename,
                    wifi_address: result.data.wifi_address || "",
                    wifi_password: result.data.wifi_password || ""
                });
                
                // Update preview image with full URL
                if (result.data.qr_url) {
                    setPreviewImage(result.data.qr_url);
                } else {
                    setPreviewImage(null);
                }
                
                toast.success(result.message || "WiFi settings saved successfully!");
            }
        },
        onError: (error) => {
            console.error("Save WiFi failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save wifi settings";
            toast.error(errorMessage);
        },
    });

    // Mutation for toggling WiFi visibility in LuxeGenie
    const toggleWifiMutation = useMutation({
        mutationFn: (newState) => wifiSettingsApi.toggleWifi(user.restaurant_id, newState),
        onSuccess: (result) => {
            if (result.success) {
                const newState = result.data.show_access_wifi;
                setShowAccessWifi(newState);
                // Persist updated value into localStorage via authStore so it survives page refresh
                updateRestaurant({ show_access_wifi: newState });
                toast.success(result.message || `Access WiFi tab ${newState ? 'visible' : 'hidden'} in LuxeGenie`);
            }
        },
        onError: (error) => {
            console.error("Toggle WiFi failed:", error);
            toast.error(error.response?.data?.message || "Failed to update WiFi visibility");
        },
    });

    const handleToggle = () => {
        toggleWifiMutation.mutate(!showAccessWifi);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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

    const removeImage = () => {
        setFormData(prev => ({ 
            ...prev, 
            qr_url: "" // Clear S3 filename
        }));
        setPreviewImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user?.restaurant_id) {
            toast.error("Restaurant information not found");
            return;
        }

        // if (!formData.wifi_address.trim()) {
        //     toast.error("WiFi network name is required");
        //     return;
        // }

        // if (!formData.wifi_password.trim()) {
        //     toast.error("WiFi password is required");
        //     return;
        // }

        // Prepare submission data with qr_url (already uploaded to S3)
        const submitData = {
            restaurant_id: user.restaurant_id,
            qr_url: formData.qr_url, // S3 filename
            wifi_address: formData.wifi_address.trim(),
            wifi_password: formData.wifi_password.trim()
        };

        saveWiFiMutation.mutate(submitData);
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading wifi settings: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-6 border ${colors.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                        WiFi Settings
                    </h3>

                    {/* Toggle: controls Access-WiFi tab visibility in LuxeGenie */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm ${colors.textSecondary}`}>
                            {showAccessWifi ? 'Visible in LUXEGENIE' : 'Hidden in LUXEGENIE'}
                        </span>
                        <button
                            type="button"
                            onClick={handleToggle}
                            disabled={toggleWifiMutation.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                showAccessWifi ? 'bg-yellow-600' : 'bg-gray-300'
                            } ${
                                toggleWifiMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                    showAccessWifi ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {showAccessWifi && (<form onSubmit={handleSubmit} className="space-y-6">
                    {/* WiFi Name */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                            <FiWifi size={16} className="inline mr-2" />
                            WiFi Network Name (SSID)
                        </label>
                        <input
                            type="text"
                            name="wifi_address"
                            value={formData.wifi_address}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                            placeholder="Enter WiFi network name"
                        />
                    </div>

                    {/* WiFi Password */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                            <FiLock size={16} className="inline mr-2" />
                            WiFi Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="wifi_password"
                                value={formData.wifi_password}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 pr-12 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                placeholder="Enter WiFi password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${colors.textMuted} hover:${colors.textSecondary} transition-colors duration-200`}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* WiFi QR Code Upload */}
                    <div>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                            WiFi QR Code Image
                        </label>
                        <div className="space-y-4">
                            {!previewImage ? (
                                <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                        type="file"
                                        id="wifi-qr-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={isUploading || isLoading}
                                    />
                                    <label
                                        htmlFor="wifi-qr-image"
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
                                                    Click to upload WiFi QR code
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
                                                alt="WiFi QR preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-3">
                                        <label
                                            htmlFor="wifi-qr-image"
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
                                            id="wifi-qr-image"
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

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || saveWiFiMutation.isPending}
                            className={`flex items-center space-x-2 px-6 py-3 bg-[#B69549] text-white hover:cursor-pointer rounded-xl transition-all duration-200 ${colors.shadow} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {(isLoading || saveWiFiMutation.isPending) ? (
                                <>
                                    <FiLoader size={18} className="animate-spin" />
                                    <span>{isLoading ? "Loading..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    <span>Save Wi-Fi Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>)}

                {!showAccessWifi && (
                    <div className={`text-center py-12 ${colors.textMuted}`}>
                        <p className="text-lg">Access WiFi section is currently hidden in LuxeGenie.</p>
                        <p className="text-sm mt-2">Enable the toggle above to show and manage WiFi settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WiFiSettings;
