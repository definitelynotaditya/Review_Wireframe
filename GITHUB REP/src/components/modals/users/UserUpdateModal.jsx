import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiX, FiUpload, FiImage, FiTrash2, FiCrop } from "react-icons/fi";
import Cropper from "react-easy-crop";
import { userApi } from "../../../store/userStore";
import { awsApi } from "../../../store/awsStore";
import { useTheme } from "../../../context/ThemeContext.jsx";

const UserUpdateModal = ({ isOpen, onClose, user, restaurantId }) => {
	const { colors } = useTheme();
	const [formData, setFormData] = useState({
		username: "",
		name: "",
		contact: "",
		password: "",
		confirmPassword: "",
		role: "",
		server_code: "",
		img_name: "",
		newImageFile: null
	});
	const [previewImage, setPreviewImage] = useState("");
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
				
				canvas.width = pixelCrop.width;
				canvas.height = pixelCrop.height;
				
				ctx.drawImage(
					image,
					pixelCrop.x,
					pixelCrop.y,
					pixelCrop.width,
					pixelCrop.height,
					0,
					0,
					pixelCrop.width,
					pixelCrop.height
				);
				
				canvas.toBlob((blob) => {
					if (!blob) {
						reject(new Error('Canvas is empty'));
						return;
					}
					const file = new File([blob], 'user-photo.jpg', { type: 'image/jpeg' });
					resolve(file);
				}, 'image/jpeg', 0.95);
			};
			
			image.onerror = () => {
				reject(new Error('Failed to load image'));
			};
		});
	};

	// Populate form data when user prop changes
	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username || "",
				name: user.name || "",
				contact: user.contact || "",
				password: "",
				confirmPassword: "",
				role: user.role || "",
				server_code: user.server_code || "",
				img_name: "",
				newImageFile: null
			});
			// Set preview image with existing image URL
			if (user.img_url) {
				setPreviewImage(user.img_url);
			} else {
				setPreviewImage("");
			}
		}
	}, [user]);

	// Mutation for updating user
	const updateUserMutation = useMutation({
		mutationFn: userApi.updateUser,
		onSuccess: (data) => {
			toast.success(`User ${data.user.username} updated successfully!`);
			// Invalidate queries to refresh user list
			queryClient.invalidateQueries(['restaurant-users', restaurantId]);
			queryClient.invalidateQueries(['restaurant', restaurantId]);
			onClose();
			resetForm();
		},
		onError: (error) => {
			console.error('Error updating user:', error);
			if (error.response?.data?.error === "Server code already exists") {
				toast.error("Server code already exists. Please use a different server code.");
			} else {
				toast.error(error.response?.data?.message || 'Failed to update user. Please try again.');
			}
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const resetForm = () => {
		setFormData({
			username: "",
			name: "",
			contact: "",
			password: "",
			confirmPassword: "",
			role: "",
			server_code: "",
			img_name: "",
			newImageFile: null
		});
		setPreviewImage("");
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
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
		// Only validate password if it's being changed
		if (formData.password && formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match!");
			return false;
		}
		if (formData.password && formData.password.length < 6) {
			toast.error("Password must be at least 6 characters long!");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) return;

		setIsSubmitting(true);

		// Prepare data according to API specification
		const userData = {
			user_id: user.user_id,
			restaurant_id: restaurantId,
			username: formData.username,
			name: formData.name,
			server_code: formData.server_code,
			contact: formData.contact,
			role: formData.role,
			// For updates: only send img_name if new image was uploaded, otherwise send ""
			img_name: formData.newImageFile ? formData.img_name : "",
		};

		// Only include password if it's being changed
		if (formData.password) {
			userData.password = formData.password;
		}

		updateUserMutation.mutate(userData);
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
				<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
					<div className={`${colors.card} rounded-2xl p-8 w-full max-w-3xl mx-4`}>
						<h3 className={`text-xl font-bold ${colors.textPrimary} mb-4`}>
							Crop User Photo
						</h3>
						<div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden">
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
						<div className="mt-4">
							<label className={`block text-sm ${colors.textSecondary} mb-2`}>
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
						<div className="flex justify-end space-x-3 mt-6">
							<button
								type="button"
								onClick={handleCropCancel}
								disabled={isCropping}
								className={`px-6 py-3 border ${colors.border} ${colors.textSecondary} rounded-xl ${colors.hover} transition-colors duration-200 disabled:opacity-50 hover:cursor-pointer`}
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleCropSave}
								disabled={isCropping}
								className="px-6 py-3 bg-[#B69549] text-white rounded-xl hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 hover:cursor-pointer"
							>
								{isCropping ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Uploading...</span>
									</>
								) : (
									<>
										<FiCrop size={16} />
										<span>Crop & Upload</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Main Modal */}
			<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
				<div className={`${colors.card} rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-none`}>
					<div className="flex items-center justify-between mb-6">
						<h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
							Update User
						</h2>
						<button
							onClick={onClose}
							className={`p-2 ${colors.hover} rounded-xl transition-colors duration-200 hover:cursor-pointer`}
						>
							<FiX size={20} className={colors.textMuted} />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* User Photo Upload */}
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-3`}>
								User Photo
								<span className={`text-xs ${colors.textMuted} ml-2`}>(Optional, will be cropped to square, max 10MB)</span>
							</label>
							<div className="space-y-4">
								{!previewImage ? (
									<div className={`border-2 border-dashed ${colors.border} rounded-xl p-6 text-center ${colors.hover} transition-colors duration-200`}>
										<input
											type="file"
											id="user-photo"
											accept="image/*"
											onChange={handleImageChange}
											className="hidden"
											disabled={isSubmitting}
										/>
										<label
											htmlFor="user-photo"
											className="cursor-pointer flex flex-col items-center space-y-2"
										>
											<FiUpload size={32} className={colors.textMuted} />
											<p className={`text-sm ${colors.textMuted}`}>
												Upload user photo (Will be cropped to square, max 10MB)
											</p>
										</label>
									</div>
								) : (
									<div className="space-y-4">
										<div className="flex justify-center">
											<div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg">
												<img
													src={previewImage}
													alt="User preview"
													className="w-full h-full object-cover"
												/>
											</div>
										</div>
										<div className="flex justify-center space-x-3">
											<label
												htmlFor="user-photo"
												className={`cursor-pointer px-4 py-2 ${colors.button} rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm`}
											>
												<FiImage size={14} />
												<span>Change Photo</span>
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
												id="user-photo"
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
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Username
							</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Enter username"
								required
								disabled={isSubmitting}
							/>
						</div>
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
							Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
							placeholder="Display name for device"
							required
							disabled={isSubmitting}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
							Contact Number
						</label>
						<input
							type="tel"
							name="contact"
							value={formData.contact}
						onChange={(e) => {
							let value = e.target.value.replace(
								/\D/g,
								""
							);
							if (value.length > 10)
								value = value.slice(0, 10);
							setFormData((prev) => ({
								...prev,
								contact: value,
							}));
						}}
						className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
						placeholder="10-digit number"
						required
						disabled={isSubmitting}
						maxLength="10"
						/>
					</div>
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Server Code
							</label>
							<input
								type="text"
								name="server_code"
								value={formData.server_code}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="e.g., 001"
								required
								disabled={isSubmitting}
							/>
						</div>
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Role
							</label>
							{user?.role === "admin" ? (
								<div className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl ${colors.textMuted} flex items-center justify-between`}>
									<span>Manager</span>
									<span className={`text-xs ${colors.textMuted} italic`}>Managed by Super Admin</span>
								</div>
							) : (
								<select
									name="role"
									value={formData.role}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
									required
									disabled={isSubmitting}
								>
									<option value="">Select role</option>
									<option value="host">Host</option>
									<option value="server">Server</option>
									<option value="steward">Steward</option>
									<option value="chef">Chef</option>
									<option value="captain">Captain</option>
								</select>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								New Password (leave blank to keep current)
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Enter new password"
								disabled={isSubmitting}
								minLength={6}
							/>
						</div>
						<div>
							<label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>
								Confirm New Password
							</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 ${colors.input} border ${colors.border} rounded-xl focus:outline-none focus:ring-2 ${colors.inputFocus} focus:border-transparent`}
								placeholder="Confirm new password"
								disabled={isSubmitting}
								minLength={6}
							/>
						</div>
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
							className={`px-6 py-3 text-white font-bold rounded-xl bg-[#B69549] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer`}
						>
							{isSubmitting ? 'Updating User...' : 'Update User'}
						</button>
					</div>
				</form>
			</div>
		</div>
		</>
	);
};

export default UserUpdateModal;
