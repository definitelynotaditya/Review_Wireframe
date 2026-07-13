import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiUpload, FiImage, FiTrash2, FiCrop } from "react-icons/fi";
import Cropper from "react-easy-crop";
import { chefSpecialsApi } from "../../../store/chefSpecialsStore";
import { awsApi } from "../../../store/awsStore";
import { useTheme } from "../../../context/ThemeContext.jsx";

const AddChefSpecialModal = ({ isOpen, onClose, restaurantId, chefSpecial = null, isUpdate = false }) => {
	const { colors } = useTheme();
	const [formData, setFormData] = useState({
		dish_name: chefSpecial?.dish_name || "",
		dish_description: chefSpecial?.dish_description || "",
		img_name: chefSpecial?.img_name || "",
		calories: chefSpecial?.calories || "",
		veg_nonveg: chefSpecial?.veg_nonveg || "veg",
		dish_price: chefSpecial?.dish_price || "",
		menu_category_name: chefSpecial?.menu_category_name || "",
		menu_sub_category_name: chefSpecial?.menu_sub_category_name || "",
		newImageFile: null
	});
	const [previewImage, setPreviewImage] = useState(chefSpecial?.img_name || "");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCropping, setIsCropping] = useState(false);
	
	// Cropper states
	const [imageToCrop, setImageToCrop] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [showCropper, setShowCropper] = useState(false);

	const queryClient = useQueryClient();

	// Crop complete callback
	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	// Create cropped image
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
					const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
					resolve(file);
				}, 'image/jpeg', 0.95);
			};
			
			image.onerror = () => reject(new Error('Failed to load image'));
		});
	};

	// Mutation for adding/updating chef special
	const saveChefSpecialMutation = useMutation({
		mutationFn: ({ chefSpecialData, isUpdate, chefSpecialId }) => 
			chefSpecialsApi.saveChefSpecial(restaurantId, chefSpecialData, isUpdate, chefSpecialId),
		onSuccess: () => {
			toast.success(`Chef special ${isUpdate ? 'updated' : 'added'} successfully!`);
			// Invalidate queries to refresh chef specials list
			queryClient.invalidateQueries(["chef-specials", restaurantId]);
			resetForm();
			onClose();
		},
		onError: (error) => {
			console.error("Save chef special failed:", error);
			const errorMessage = error.response?.data?.message || error.message || `Failed to ${isUpdate ? 'update' : 'add'} chef special`;
			toast.error(errorMessage);
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const resetForm = () => {
		setFormData({
			dish_name: "",
			dish_description: "",
			img_name: "",
			calories: "",
			veg_nonveg: "veg",
			dish_price: "",
			menu_category_name: "",
			menu_sub_category_name: "",
			newImageFile: null
		});
		setPreviewImage("");
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
			// Clear sub category if category is not Drinks
			...(name === 'menu_category_name' && value !== 'Drinks' && {
				menu_sub_category_name: ''
			}),
			// Set veg_nonveg to 'veg' if Drinks is selected
			...(name === 'menu_category_name' && value === 'Drinks' && {
				veg_nonveg: 'veg'
			})
		}));
	};

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate image size (10MB limit for cropping)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("Image size should be less than 10MB");
				return;
			}

			// Create preview URL and show cropper
			const imageUrl = URL.createObjectURL(file);
			setImageToCrop(imageUrl);
			setShowCropper(true);
		}
	};

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
			const fileName = await awsApi.uploadImage(croppedFile, restaurantId);
			
			// Create preview URL for cropped image
			const previewUrl = URL.createObjectURL(croppedFile);
			setPreviewImage(previewUrl);
			
			setFormData(prev => ({
				...prev,
				img_name: fileName,
				newImageFile: croppedFile
			}));
			
			// Clean up and close cropper
			URL.revokeObjectURL(imageToCrop);
			setShowCropper(false);
			setImageToCrop(null);
			setCrop({ x: 0, y: 0 });
			setZoom(1);
			setIsCropping(false);
			
			toast.success("Image uploaded successfully!");
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload image. Please try again.");
			setIsCropping(false);
		}
	};

	const handleCropCancel = () => {
		if (imageToCrop) {
			URL.revokeObjectURL(imageToCrop);
		}
		setShowCropper(false);
		setImageToCrop(null);
		setCrop({ x: 0, y: 0 });
		setZoom(1);
	};

	const removeImage = () => {
		setPreviewImage("");
		setFormData(prev => ({
			...prev,
			img_name: "",
			newImageFile: null
		}));
	};

	const validateForm = () => {
		if (!formData.dish_name.trim()) {
			toast.error("Dish name is required");
			return false;
		}
		if (!formData.dish_description.trim()) {
			toast.error("Dish description is required");
			return false;
		}
		if (!formData.dish_price || parseFloat(formData.dish_price) <= 0) {
			toast.error("Valid dish price is required");
			return false;
		}
		if (!formData.menu_category_name.trim()) {
			toast.error("Menu category is required");
			return false;
		}
		if (!formData.veg_nonveg) {
			toast.error("Veg/Non-veg selection is required");
			return false;
		}
		// Image is mandatory
		if (!previewImage) {
			toast.error("Dish image is required");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		setIsSubmitting(true);
		
		try {
			await saveChefSpecialMutation.mutateAsync({
				chefSpecialData: formData,
				isUpdate,
				chefSpecialId: chefSpecial?.chef_special_id
			});
		} catch (error) {
			// Error is already handled in the mutation
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Image Cropper Modal */}
			{showCropper && (
				<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]">
					<div className={`${colors.card} rounded-2xl p-6 w-full max-w-4xl mx-4`}>
						<div className="flex items-center justify-between mb-6">
							<h3 className={`text-xl font-bold ${colors.textPrimary}`}>
								Crop Image to Square
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

			{/* Main Modal */}
			<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className={`${colors.card} rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-none`}>
				<div className="flex items-center justify-between mb-6">
					<h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
						{isUpdate ? "Update Chef Special" : "Add New Chef Special"}
					</h2>
					<button
						onClick={handleClose}
						className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 hover:cursor-pointer`}
					>
						<FiX size={20} className={colors.textMuted} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Dish Image Upload */}
					<div>
						<label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
							Dish Image *
							<span className={`text-xs ${colors.textMuted} ml-2`}>(Will be cropped to square, max 10MB)</span>
						</label>
						<div className="space-y-4">
							{!previewImage ? (
								<div className={`border-2 border-dashed ${colors.border} rounded-xl p-6 text-center ${colors.hover} transition-colors duration-200`}>
									<input
										type="file"
										id="dish-image"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
										disabled={isSubmitting}
									/>
									<label
										htmlFor="dish-image"
										className="cursor-pointer flex flex-col items-center space-y-2"
									>
										<FiUpload size={32} className={colors.textMuted} />
										<p className={`text-sm ${colors.textMuted}`}>
											Upload dish image (Will be cropped to square, max 10MB)
										</p>
									</label>
								</div>
							) : (
								<div className="space-y-4">
									<div className="flex justify-center">
										<div className="relative w-48 h-48 rounded-xl overflow-hidden bg-white shadow-lg">
											<img
												src={previewImage}
												alt="Dish preview"
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
									<div className="flex justify-center space-x-3">
										<label
											htmlFor="dish-image"
											className={`cursor-pointer px-4 py-2 ${colors.button} rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm`}
										>
											<FiImage size={14} />
											<span>Change Image</span>
										</label>
										<button
											type="button"
											onClick={removeImage}
											className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200 hover:bg-red-500/30 flex items-center space-x-2 text-sm"
										>
											<FiTrash2 size={14} />
											<span>Remove</span>
										</button>
										<input
											type="file"
											id="dish-image"
											accept="image/*"
											onChange={handleImageChange}
											className="hidden"
											disabled={isSubmitting}
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Dish Name */}
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Dish Name *
							</label>
							<input
								type="text"
								name="dish_name"
								value={formData.dish_name}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Enter dish name"
								required
								disabled={isSubmitting}
							/>
						</div>

						{/* Dish Price */}
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Price *
							</label>
							<input
								type="number"
								name="dish_price"
								value={formData.dish_price}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Enter price"
								required
								min="0"
								step="0.01"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Dish Description */}
					<div>
						<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
							Description *
						</label>
						<textarea
							name="dish_description"
							value={formData.dish_description}
							onChange={handleInputChange}
							rows={3}
							className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent resize-none`}
							placeholder="Enter dish description"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Menu Category */}
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Menu Category *
							</label>
							<select
								name="menu_category_name"
								value={formData.menu_category_name}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								required
								disabled={isSubmitting}
							>
								<option value="">Select category</option>
								<option value="Drinks">Drinks</option>
								<option value="Starters">Starters</option>
								<option value="Mains">Mains</option>
								<option value="Desserts">Desserts</option>
							</select>
						</div>

						{/* Menu Sub Category - Only show for Drinks */}
						{formData.menu_category_name === 'Drinks' && (
							<div>
								<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
									Sub Category
								</label>
								<select
									name="menu_sub_category_name"
									value={formData.menu_sub_category_name}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
									disabled={isSubmitting}
								>
									<option value="">Select sub category</option>
									<option value="Cocktails">Cocktails</option>
									<option value="Mocktails">Mocktails</option>
								</select>
							</div>
						)}

						{/* Veg/Non-Veg - Hide for Drinks */}
						{formData.menu_category_name !== 'Drinks' && (
							<div>
								<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
									Type *
								</label>
								<select
									name="veg_nonveg"
									value={formData.veg_nonveg}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
									required
									disabled={isSubmitting}
								>
									<option value="veg">Vegetarian</option>
									<option value="non-veg">Non-Vegetarian</option>
								</select>
							</div>
						)}
					</div>

					{/* Calories */}
					<div>
						<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
							Calories (optional)
						</label>
						<input
							type="number"
							name="calories"
							value={formData.calories}
							onChange={handleInputChange}
							className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
							placeholder="Enter calories count"
							min="0"
							disabled={isSubmitting}
						/>
					</div>

					<div className={`flex justify-end space-x-4 pt-6 border-t ${colors.border}`}>
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-3 bg-[#B69549] text-white font-bold rounded-xl hover:cursor-pointer transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? `${isUpdate ? 'Updating' : 'Adding'}...` : isUpdate ? 'Update ' : 'Add'}
						</button>
					</div>
				</form>
			</div>
		</div>
		</>
	);
};

export default AddChefSpecialModal;
