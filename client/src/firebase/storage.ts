import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param path Path in storage where the file should be stored
 * @returns Download URL of the uploaded file
 */
export const uploadFile = async (
  file: File, 
  path: string = 'uploads'
): Promise<string> => {
  // Generate a unique filename to prevent collisions
  const filename = `${uuidv4()}-${file.name}`;
  const storageRef = ref(storage, `${path}/${filename}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get and return the download URL
  return getDownloadURL(snapshot.ref);
};

/**
 * Upload multiple files to Firebase Storage
 * @param files Array of files to upload
 * @param path Path in storage where the files should be stored
 * @returns Array of download URLs of the uploaded files
 */
export const uploadMultipleFiles = async (
  files: File[], 
  path: string = 'uploads'
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Firebase Storage by its URL
 * @param url Download URL of the file to delete
 */
export const deleteFileByUrl = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL (this is Firebase Storage specific)
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage by its path
 * @param path Path of the file to delete
 */
export const deleteFileByPath = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * List all files in a specific directory
 * @param path Directory path in storage
 * @returns Array of download URLs of all files in the directory
 */
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const directoryRef = ref(storage, path);
    const result = await listAll(directoryRef);
    
    const urlPromises = result.items.map(item => getDownloadURL(item));
    return Promise.all(urlPromises);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Get a file's download URL from its path
 * @param path Path of the file in storage
 * @returns Download URL of the file
 */
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Upload a startup profile image
 * @param file Image file to upload
 * @param startupId ID of the startup
 * @returns Download URL of the uploaded image
 */
export const uploadStartupImage = async (file: File, startupId: string): Promise<string> => {
  return uploadFile(file, `startups/${startupId}/images`);
};

/**
 * Upload a startup document (PDF, etc.)
 * @param file Document file to upload
 * @param startupId ID of the startup
 * @returns Download URL of the uploaded document
 */
export const uploadStartupDocument = async (file: File, startupId: string): Promise<string> => {
  return uploadFile(file, `startups/${startupId}/documents`);
};

/**
 * Upload a user profile picture
 * @param file Image file to upload
 * @param userId ID of the user
 * @returns Download URL of the uploaded image
 */
export const uploadUserProfilePicture = async (file: File, userId: string): Promise<string> => {
  return uploadFile(file, `users/${userId}/profile`);
};