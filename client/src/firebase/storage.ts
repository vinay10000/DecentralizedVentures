import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadString,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from './config';

// Upload options interface
export interface UploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be saved
 * @param options Additional upload options
 * @returns The download URL for the uploaded file
 */
export const uploadFile = async (
  file: File, 
  path: string,
  options?: UploadOptions
): Promise<string> => {
  try {
    // Create a reference to the file location
    const fileRef = storageRef(storage, path);
    
    // Upload the file
    const uploadResult = await uploadBytes(fileRef, file, {
      contentType: options?.contentType || file.type,
      customMetadata: options?.customMetadata
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get the download URL for a file in Firebase Storage
 * @param path The path to the file in storage
 * @returns The download URL for the file
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const fileRef = storageRef(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param path The path to the file in storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = storageRef(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Upload a startup document
 * @param startupId The ID of the startup
 * @param file The file to upload
 * @param type The type of document
 * @returns The download URL for the uploaded document
 */
export const uploadStartupDocument = async (
  startupId: string,
  file: File,
  type: 'pitchDeck' | 'financialReport' | 'investorAgreement' | 'riskDisclosure'
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`;
  const path = `startups/${startupId}/documents/${type}/${fileName}`;
  
  return await uploadFile(file, path, {
    customMetadata: {
      startupId,
      documentType: type,
      originalName: file.name
    }
  });
};

/**
 * Upload a startup image (logo or cover)
 * @param startupId The ID of the startup
 * @param file The image file to upload
 * @param type The type of image (logo or cover)
 * @returns The download URL for the uploaded image
 */
export const uploadStartupImage = async (
  startupId: string,
  file: File,
  type: 'logo' | 'cover'
): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  const timestamp = Date.now();
  const fileName = `${type}_${timestamp}.${file.name.split('.').pop()}`;
  const path = `startups/${startupId}/images/${fileName}`;
  
  return await uploadFile(file, path);
};

/**
 * Upload a user profile picture
 * @param userId The ID of the user
 * @param file The image file to upload
 * @returns The download URL for the uploaded image
 */
export const uploadUserProfilePicture = async (userId: string, file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  const timestamp = Date.now();
  const fileName = `profile_${timestamp}.${file.name.split('.').pop()}`;
  const path = `users/${userId}/profile/${fileName}`;
  
  return await uploadFile(file, path);
};