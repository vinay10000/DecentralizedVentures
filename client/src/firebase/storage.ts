import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

export interface UploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File, 
  path: string, 
  options?: UploadOptions
) => {
  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: options?.contentType || file.type,
      customMetadata: options?.customMetadata
    };
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      contentType: file.type,
      size: file.size,
      name: file.name
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get the download URL for a file
export const getFileURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Upload startup documents
export const uploadStartupDocument = async (
  startupId: string,
  file: File,
  documentType: 'pitchDeck' | 'financialReport' | 'investorAgreement' | 'riskDisclosure'
) => {
  try {
    const path = `startups/${startupId}/documents/${documentType}/${file.name}`;
    
    const customMetadata = {
      startupId,
      documentType
    };
    
    return await uploadFile(file, path, { customMetadata });
  } catch (error) {
    console.error("Error uploading startup document:", error);
    throw error;
  }
};

// Upload startup profile images
export const uploadStartupImage = async (
  startupId: string,
  file: File,
  imageType: 'logo' | 'cover' | 'qrCode'
) => {
  try {
    const path = `startups/${startupId}/images/${imageType}`;
    
    const customMetadata = {
      startupId,
      imageType
    };
    
    return await uploadFile(file, path, { customMetadata });
  } catch (error) {
    console.error("Error uploading startup image:", error);
    throw error;
  }
};

// Upload user profile picture
export const uploadUserProfilePicture = async (userId: string, file: File) => {
  try {
    const path = `users/${userId}/profile-picture`;
    
    const customMetadata = {
      userId
    };
    
    return await uploadFile(file, path, { customMetadata });
  } catch (error) {
    console.error("Error uploading user profile picture:", error);
    throw error;
  }
};
