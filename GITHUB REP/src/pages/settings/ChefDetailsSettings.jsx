import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { FiUpload, FiSave, FiPlus, FiTrash2, FiImage, FiLoader, FiX, FiCrop } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { chefSettingsApi } from "../../store/chefDetailsSettingsStore";
import { awsApi } from "../../store/awsStore";
import ChefDeleteConfirmationModal from "../../components/modals/ChefDeleteConfirmationModal";
import Loader from "../../components/common/Loader.jsx";
import Cropper from "react-easy-crop";

const ChefDetailsSettings = () => {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [chefs, setChefs] = useState([]);
    const [previewImages, setPreviewImages] = useState({});
    const [uploadingChefs, setUploadingChefs] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chefToDelete, setChefToDelete] = useState(null);
    const [isActive, setIsActive] = useState(false); // Toggle state
    const [aboutUsItemId, setAboutUsItemId] = useState(null); // Store about_us_item_id (convention for all sections)
    const [isCreated, setIsCreated] = useState(false); // Check if Chefs section is created
    
    // Cropper states
    const [imageToCrop, setImageToCrop] = useState(null);
    const [chefIdBeingCropped, setChefIdBeingCropped] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    // React Query to fetch existing chefs with caching
    const {
        data: chefsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["chefs", user?.restaurant_id],
        queryFn: () => chefSettingsApi.getChefs(user.restaurant_id),
        enabled: !!user?.restaurant_id,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        retry: 1, // Only retry once on failure
    });

    // Update chefs when query data changes
    useEffect(() => {
        console.log("ChefsData changed:", chefsData); // Debug log
        if (chefsData && chefsData.success) {
            // Set toggle state and about_us_item_id from response
            if (chefsData.about_us_item_id) {
                setAboutUsItemId(chefsData.about_us_item_id);
                setIsCreated(true);
                setIsActive(chefsData.active !== undefined ? chefsData.active : true);
            } else {
                setIsCreated(false);
                setIsActive(false);
                setAboutUsItemId(null);
            }
            
            if (chefsData.data && chefsData.data.length > 0) {
                // Transform API data to match local state structure
                const transformedChefs = chefsData.data.map(chef => {
                    // Extract filename from img_url if present
                    let imgName = "";
                    if (chef.img_url) {
                        const urlParts = chef.img_url.split('/');
                        imgName = urlParts[urlParts.length - 1] || "";
                    }
                    
                    return {
                        chef_id: chef.chef_id,
                        restaurant_id: chef.restaurant_id,
                        img_name: imgName, // Store S3 filename
                        img_url: chef.img_url, // Keep full URL for display
                        name: chef.name,
                        designation: chef.designation,
                        information: chef.information
                    };
                });
                setChefs(transformedChefs);
            } else {
                // No chefs exist, add an empty one for creation
                const newChef = {
                    id: 'new-' + Date.now(),
                    restaurant_id: user?.restaurant_id || null,
                    img_name: "",
                    img_url: "",
                    name: "",
                    designation: "",
                    information: ""
                };
                setChefs([newChef]);
            }
        } else {
            // Error or no data, add an empty chef for creation
            const newChef = {
                id: 'new-' + Date.now(),
                restaurant_id: user?.restaurant_id || null,
                img_name: "",
                img_url: "",
                name: "",
                designation: "",
                information: ""
            };
            setChefs([newChef]);
            setIsCreated(false);
            setIsActive(false);
            setAboutUsItemId(null);
        }
    }, [chefsData, user?.restaurant_id]);

    // Mutation for saving individual chefs
    const saveChefMutation = useMutation({
        mutationFn: ({ chefData, isUpdate, chefId }) => 
            chefSettingsApi.saveChef(user.restaurant_id, chefData, isUpdate, chefId),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Chef saved successfully!");
                
                // Update toggle state if about_us_item_id is returned
                if (result.about_us_item_id) {
                    setAboutUsItemId(result.about_us_item_id);
                    setIsCreated(true);
                    setIsActive(result.active !== undefined ? result.active : true);
                }
                
                // Invalidate and refetch chefs data
                queryClient.invalidateQueries(["chefs", user.restaurant_id]);
            }
        },
        onError: (error) => {
            console.error("Save Chef failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save chef";
            toast.error(errorMessage);
        },
    });

    // Mutation for toggling Chefs visibility
    const toggleChefsMutation = useMutation({
        mutationFn: ({ chefItemId, active }) => chefSettingsApi.toggleChefs(chefItemId, active),
        onSuccess: (result) => {
            if (result.success) {
                setIsActive(result.about_us_item.active);
                // Invalidate and refetch the chefs query to get updated data
                queryClient.invalidateQueries(["chefs", user.restaurant_id]);
                toast.success(`Chefs section ${result.about_us_item.active ? 'enabled' : 'disabled'} successfully!`);
            }
        },
        onError: (error) => {
            console.error("Toggle Chefs failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to toggle Chefs visibility";
            toast.error(errorMessage);
        },
    });

    // Add new chef
    const addChef = () => {
        const newChef = {
            id: 'new-' + Date.now(),
            restaurant_id: user?.restaurant_id || null,
            img_name: "",
            img_url: "",
            name: "",
            designation: "",
            information: ""
        };
        setChefs(prev => [newChef, ...prev]); // Add to top instead of bottom
    };

    // Handle input changes for chefs
    const handleInputChange = (chefIdentifier, field, value) => {
        setChefs(prev => prev.map(chef => 
            (chef.chef_id || chef.id) === chefIdentifier ? { ...chef, [field]: value } : chef
        ));
    };

    // Crop complete callback
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Create cropped circular image
    const createCroppedImage = async (imageSrc, pixelCrop) => {
        const image = new Image();
        image.src = imageSrc;
        
        return new Promise((resolve, reject) => {
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to square
                const size = Math.min(pixelCrop.width, pixelCrop.height);
                canvas.width = size;
                canvas.height = size;
                
                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    size,
                    size
                );
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    const file = new File([blob], 'cropped-chef-image.jpg', { type: 'image/jpeg' });
                    resolve(file);
                }, 'image/jpeg', 0.95);
            };
            
            image.onerror = () => reject(new Error('Failed to load image'));
        });
    };

    // Handle crop save
    const handleCropSave = async () => {
        try {
            if (!croppedAreaPixels || !imageToCrop) return;

            setIsCropping(true);

            // Create cropped image file
            const croppedFile = await createCroppedImage(imageToCrop, croppedAreaPixels);
            
            // Validate final size (2MB limit)
            if (croppedFile.size > 5 * 1024 * 1024) {
                toast.error("Cropped image is too large. Please select a smaller image.");
                setIsCropping(false);
                return;
            }

            // Upload to S3
            const fileName = await awsApi.uploadImage(croppedFile, user.restaurant_id);
            
            // Create preview URL for cropped image
            const previewUrl = URL.createObjectURL(croppedFile);
            setPreviewImages(prev => ({
                ...prev,
                [chefIdBeingCropped]: previewUrl
            }));
            
            setChefs(prev => prev.map(chef => 
                (chef.chef_id || chef.id) === chefIdBeingCropped 
                    ? { ...chef, img_name: fileName }
                    : chef
            ));
            
            // Clean up and close cropper
            URL.revokeObjectURL(imageToCrop);
            setShowCropper(false);
            setImageToCrop(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setChefIdBeingCropped(null);
            setIsCropping(false);
            
            toast.success("Chef image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading chef image:", error);
            toast.error("Failed to upload chef image. Please try again.");
            setIsCropping(false);
        }
    };

    // Handle crop cancel
    const handleCropCancel = () => {
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
        }
        setShowCropper(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setChefIdBeingCropped(null);
    };

    // Handle image selection - opens cropper
    const handleImageChange = (chefIdentifier, e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB limit for cropping)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size should be less than 10MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            // Create preview URL and show cropper
            const imageUrl = URL.createObjectURL(file);
            setImageToCrop(imageUrl);
            setChefIdBeingCropped(chefIdentifier);
            setShowCropper(true);
        }
    };

    // Remove image from chef
    const removeChefImage = (chefIdentifier) => {
        setPreviewImages(prev => {
            // eslint-disable-next-line no-unused-vars
            const { [chefIdentifier]: removed, ...rest } = prev;
            return rest;
        });
        
        setChefs(prev => prev.map(chef => 
            (chef.chef_id || chef.id) === chefIdentifier 
                ? { ...chef, img_name: "", img_url: "" }
                : chef
        ));
    };

    // Save individual chef
    const handleSaveChef = async (chef) => {
        if (!user?.restaurant_id) {
            toast.error("Restaurant ID not found");
            return;
        }

        // Validate required fields
        if (!chef.name || !chef.designation) {
            toast.error("Chef name and designation are required");
            return;
        }

        try {
            const isExistingChef = !!chef.chef_id;
            const chefData = {
                img_name: chef.img_name, // S3 filename (already uploaded)
                name: chef.name,
                designation: chef.designation,
                information: chef.information
            };

            await saveChefMutation.mutateAsync({
                chefData,
                isUpdate: isExistingChef,
                chefId: chef.chef_id
            });
        } catch (error) {
            // Error is already handled in the mutation
        }
    };

    // Delete chef confirmation
    const handleDeleteChef = (chef) => {
        setChefToDelete(chef);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setChefToDelete(null);
    };

    // Remove chef from local state (for new chefs that haven't been saved)
    const removeLocalChef = (chefId) => {
        if (chefs.length > 1) {
            setChefs(prev => prev.filter(chef => (chef.chef_id || chef.id) !== chefId));
        }
    };

    const handleToggle = () => {
        if (!aboutUsItemId) {
            toast.error("Please save at least one chef first before toggling");
            return;
        }
        
        const newActiveState = !isActive;
        toggleChefsMutation.mutate({ chefItemId: aboutUsItemId, active: newActiveState });
    };

    // Show loading state
    if (isLoading) {
        return <Loader />;
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Error loading chefs: {error.message}</div>
            </div>
        );
    }

    return (
        <>
            {/* Image Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]">
                    <div className={`${colors.card} rounded-2xl p-6 w-full max-w-4xl mx-4`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xl font-bold ${colors.textPrimary}`}>
                                Crop Chef Photo to Circle
                            </h3>
                            <button
                                onClick={handleCropCancel}
                                className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200`}
                            >
                                <FiX size={20} className={colors.textMuted} />
                            </button>
                        </div>

                        <div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden mb-6">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                    Zoom
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    onClick={handleCropCancel}
                                    disabled={isCropping}
                                    className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    disabled={isCropping}
                                    className="px-6 py-3 bg-[#B69549] hover:bg-yellow-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCropping ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCrop size={18} />
                                            <span>Crop & Upload</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
            <div className={`${colors.card} rounded-2xl p-4 sm:p-6 border ${colors.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                        Chef Details Settings
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Toggle Switch - Only show if Chefs section is created */}
                        {isCreated && (
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${colors.textSecondary}`}>
                                    {isActive ? 'Visible in LUXEGENIE' : 'Hidden in LUXEGENIE'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    disabled={toggleChefsMutation.isPending}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                        isActive ? 'bg-yellow-600' : 'bg-gray-300'
                                    } ${toggleChefsMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                            onClick={addChef}
                            disabled={isCreated && !isActive}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 ${isDark ? 'bg-slate-500 text-white' : 'bg-[#B69549] text-white'} rounded-lg hover:cursor-pointer
                            transition-colors duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <FiPlus size={16} />
                            <span>Add Chef</span>
                        </button>
                    </div>
                </div>
                
                {/* Show chefs only if not created OR if created and active */}
                {(!isCreated || isActive) && (
                    <div className="space-y-8">
                    {chefs.map((chef, index) => {
                        const chefIdentifier = chef.chef_id || chef.id;
                        const isExistingChef = !!chef.chef_id;
                        const chefPreview = previewImages[chefIdentifier] || chef.img_url;
                        
                        return (
                            <div key={chefIdentifier} className={`p-4 sm:p-6 ${isDark ? 'bg-slate-700 border-slate-800' : 'bg-gray-100 border-gray-300'} rounded-xl border ${colors.borderMuted}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                    <h4 className={`text-lg font-medium ${colors.textPrimary}`}>
                                        Chef {index + 1}
                                    </h4>
                                    {!isExistingChef && chefs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLocalChef(chefIdentifier)}
                                            className="flex items-center justify-center p-2 text-red-400 hover:cursor-pointer hover:bg-red-500/20 rounded-lg transition-colors duration-200 w-full sm:w-auto"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Chef Image Upload */}
                                    <div>
                                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
                                            Chef Image
                                        </label>
                                        <div className="space-y-4">
                                            {!chefPreview ? (
                                                <div className={`border-2 border-dashed ${colors.borderMuted} rounded-xl p-4 text-center hover:border-gray-400 transition-colors duration-200`}>
                                                    <input
                                                        type="file"
                                                        id={`chef-image-${chefIdentifier}`}
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(chefIdentifier, e)}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor={`chef-image-${chefIdentifier}`}
                                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                                    >
                                                        <FiUpload size={24} className={colors.textMuted} />
                                                        <p className={`text-sm ${colors.textSecondary}`}>
                                                            Click to upload chef photo
                                                        </p>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex justify-center">
                                                        <div className="relative w-36 h-36 rounded-full overflow-hidden bg-white p-0.5 shadow-lg">
                                                            <img
                                                                src={chefPreview}
                                                                alt="Chef preview"
                                                                className="w-full h-full obje ct-cover rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                                                        <label
                                                            htmlFor={`chef-image-${chefIdentifier}`}
                                                            className={`cursor-pointer px-3 py-2 ${colors.buttonSecondary} rounded-lg transition-colors duration-200 hover:opacity-80 flex items-center justify-center space-x-2 text-sm`}
                                                        >
                                                            <FiImage size={14} />
                                                            <span>Change photo</span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChefImage(chefIdentifier)}
                                                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500/30 flex items-center justify-center space-x-2 text-sm"
                                                        >
                                                            <FiTrash2 size={14} />
                                                            <span>Remove</span>
                                                        </button>
                                                        <input
                                                            type="file"
                                                            id={`chef-image-${chefIdentifier}`}
                                                            accept="image/*"
                                                            onChange={(e) => handleImageChange(chefIdentifier, e)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chef Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                Chef Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={chef.name}
                                                onChange={(e) => handleInputChange(chefIdentifier, 'name', e.target.value)}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                                placeholder="e.g., John Smith"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                Designation *
                                            </label>
                                            <input
                                                type="text"
                                                value={chef.designation}
                                                onChange={(e) => handleInputChange(chefIdentifier, 'designation', e.target.value)}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all duration-200`}
                                                placeholder="e.g., Head Chef, Sous Chef"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
                                                Information
                                            </label>
                                            <textarea
                                                value={chef.information}
                                                onChange={(e) => handleInputChange(chefIdentifier, 'information', e.target.value)}
                                                rows={4}
                                                className={`w-full px-4 py-3 ${colors.input} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} transition-all scrollbar-none duration-200 resize-none`}
                                                placeholder="Chef's experience, specialties, achievements..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Chef Actions */}
                                <div className={`flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveChef(chef)}
                                        disabled={saveChefMutation.isPending}
                                        className={`flex items-center justify-center space-x-2 px-6 py-3 bg-[#B69549] hover:cursor-pointer text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
                                    >
                                        <FiSave size={18} />
                                        <span>
                                            {saveChefMutation.isPending ? "Saving..." : isExistingChef ? "Save Chef" : "Create Chef"}
                                        </span>
                                    </button>

                                    {isExistingChef && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteChef(chef)}
                                            className="flex hover:cursor-pointer items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700  text-white rounded-xl transition-all duration-200 hover:shadow-lg"
                                        >
                                            <FiTrash2 size={18} />
                                            <span>Delete Chef</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* Message when section is hidden */}
                {isCreated && !isActive && (
                    <div className={`text-center py-12 ${colors.textMuted}`}>
                        <p className="text-lg">Chefs section is currently hidden in LuxeGenie.</p>
                        <p className="text-sm mt-2">Enable the toggle above to show and manage chefs.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ChefDeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                chef={chefToDelete}
                restaurantId={user?.restaurant_id}
            />
            </div>
        </>
    );
};

export default ChefDetailsSettings;