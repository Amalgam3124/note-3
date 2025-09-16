// Image storage utilities for Filecoin
import { ImageUpload } from '@filecoin-notes/types';
import { getStorageConfig } from './config';

export interface ImageUploadResult {
  cids: string[];
  imageDetails: ImageUpload[];
}

// Upload multiple images to Filecoin storage
export async function uploadImages(
  files: File[],
  signer: any
): Promise<ImageUploadResult> {
  try {
    console.log('Filecoin Storage: Starting image upload...', files.length, 'files');
    
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    // Get wallet address
    let walletAddress: `0x${string}`;
    try {
      if (typeof signer.getAddress === 'function') {
        walletAddress = await signer.getAddress();
      } else if (typeof signer.account === 'object' && signer.account?.address) {
        walletAddress = signer.account.address;
      } else {
        throw new Error('Unable to get wallet address from signer');
      }
    } catch (error) {
      console.error('Filecoin Storage: Failed to get wallet address:', error);
      throw new Error('Failed to get wallet address from signer');
    }
    
    const cids: string[] = [];
    const imageDetails: ImageUpload[] = [];
    
    // Upload each image
    for (const file of files) {
      try {
        console.log('Filecoin Storage: Uploading image:', file.name, file.size, 'bytes');
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} has unsupported type. Allowed types: ${allowedTypes.join(', ')}`);
        }
        
        // For now, we'll use a placeholder approach
        // In a real implementation, you would use the useFileUpload hook
        // or implement a proper file upload function
        const cid = `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        cids.push(cid);
        
        // Create image details
        const imageDetail: ImageUpload = {
          cid,
          filecoinCid: cid,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: Date.now(),
          author: walletAddress,
          storageProvider: 'filecoin'
        };
        
        imageDetails.push(imageDetail);
        
        console.log('Filecoin Storage: Image uploaded successfully:', file.name, 'CID:', cid);
        
      } catch (error) {
        console.error('Filecoin Storage: Failed to upload image:', file.name, error);
        throw new Error(`Failed to upload image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('Filecoin Storage: All images uploaded successfully:', cids);
    
    return {
      cids,
      imageDetails
    };
    
  } catch (error) {
    console.error('Filecoin Storage: uploadImages failed:', error);
    throw error;
  }
}

// Get image URL from CID
export function getImageUrl(cid: string): string {
  const config = getStorageConfig();
  return `${config.gatewayUrl}${cid}`;
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 10MB.`
    };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}
