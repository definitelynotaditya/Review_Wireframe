import { apiClient } from '../utils/apiClient';

export const awsApi = {
	// Get presigned URL for S3 upload
	getPresignedUrl: async (fileName, fileType, restaurantId) => {
		try {
			const response = await apiClient.post('/aws/upload/get-presigned-url', {
				fileName: fileName,
				fileType: fileType,
				restaurant_id: restaurantId
			});
			return response.data;
		} catch (error) {
			console.error('Error getting presigned URL:', error);
			throw error;
		}
	},

	// Upload file to S3 using presigned URL
	uploadToS3: async (presignedUrl, file) => {
		try {
			const response = await fetch(presignedUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			});

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.statusText}`);
			}

			return response;
		} catch (error) {
			console.error('Error uploading to S3:', error);
			throw error;
		}
	},

	// Helper function to upload image (combines getting presigned URL and uploading)
	uploadImage: async (file, restaurantId) => {
		try {
			// Generate unique filename with timestamp
			const fileExtension = file.name.split('.').pop();
			const fileName = file.name;
			const fileType = fileExtension;

			// Get presigned URL and unique filename from backend
			const { url: presignedUrl, fileName: uniqueFileName } = await awsApi.getPresignedUrl(fileName, fileType, restaurantId);

			// Upload to S3
			await awsApi.uploadToS3(presignedUrl, file);

			// Return the unique filename from backend for storing in database
			return uniqueFileName;

		} catch (error) {
			console.error('Error in uploadImage:', error);
			throw error;
		}
	},
};
