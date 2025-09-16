import { 
  Note, 
  ImageUpload, 
  FilecoinStorageConfig, 
  FilecoinUploadResult, 
  FilecoinRetrieveResult 
} from '@filecoin-notes/types';


import { useFileUpload } from './hooks/useFileUpload';
import { useSynapse } from './providers/SynapseProvider';

// Default Filecoin storage configuration
const DEFAULT_CONFIG: FilecoinStorageConfig = {
  apiUrl: process.env.NEXT_PUBLIC_FILECOIN_STORAGE_API_URL || 'https://api.filecoin.io/storage/v1',
  gatewayUrl: process.env.NEXT_PUBLIC_FILECOIN_GATEWAY_URL || 'https://gateway.filecoin.io/ipfs/',
  network: (process.env.NEXT_PUBLIC_FILECOIN_NETWORK as 'mainnet' | 'testnet') || 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
};

/**
 * Convert Note object to File object for upload
 */
function noteToFile(note: Note): File {
  const jsonString = JSON.stringify(note, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return new File([blob], `${note.id}.json`, { type: 'application/json' });
}

/**
 * Upload JSON data to Filecoin using Synapse SDK
 */
export async function putJSON(
  data: Note, 
  walletClient?: any
): Promise<FilecoinUploadResult> {
  try {
    console.log('Filecoin Storage: Starting JSON upload with Synapse SDK...');
    
    // Convert Note to File object
    const file = noteToFile(data);
    console.log('Filecoin Storage: Note converted to file:', {
      fileName: file.name,
      fileSize: file.size,
      type: file.type
    });

    // Use useFileUpload hook for upload
    // Note: This needs to be called from within a React component, so we need to create a wrapper
    throw new Error('putJSON must be called from within a React component that uses useFileUpload hook');
    
  } catch (error) {
    console.error('Filecoin Storage: putJSON failed:', error);
    throw error;
  }
}

/**
 * Retrieve JSON data from Filecoin
 */
export async function getJSON(
  cid: string, 
  walletClient?: any
): Promise<FilecoinRetrieveResult> {
  try {
    console.log('Filecoin Storage: Starting JSON retrieval with Synapse SDK...');
    console.log('Filecoin Storage: CID:', cid);
    
    // Dynamically import Synapse SDK to avoid SSR issues
    const { Synapse } = await import('@filoz/synapse-sdk');
    
    // Create temporary Synapse instance for download
    // Note: This requires a signer, but it's hard to get in non-React components
    // We need to redesign this architecture
    throw new Error('getJSON must be called from within a React component that has access to Synapse context');
    
  } catch (error) {
    console.error('Filecoin Storage: getJSON failed:', error);
    throw error;
  }
}

/**
 * Upload image to Filecoin using Synapse SDK
 */
export async function putImage(
  image: ImageUpload, 
  walletClient?: any
): Promise<FilecoinUploadResult> {
  try {
    console.log('Filecoin Storage: Starting image upload with Synapse SDK...');
    console.log('Filecoin Storage: Image:', {
      filename: image.filename,
      fileSize: image.size,
      mimeType: image.mimeType
    });

    // Convert ImageUpload to File object
    // Note: ImageUpload type doesn't have data field, needs redesign
    throw new Error('putImage: ImageUpload type does not contain data field, needs redesign');
    
    // Use useFileUpload hook for upload
    throw new Error('putImage must be called from within a React component that uses useFileUpload hook');
    
  } catch (error) {
    console.error('Filecoin Storage: putImage failed:', error);
    throw error;
  }
}

/**
 * Retrieve image from Filecoin
 */
export async function getImage(
  cid: string, 
  walletClient?: any
): Promise<FilecoinRetrieveResult> {
  try {
    console.log('Filecoin Storage: Starting image retrieval with Synapse SDK...');
    console.log('Filecoin Storage: CID:', cid);
    
    // Need to implement image retrieval logic from Filecoin
    throw new Error('getImage retrieval not implemented yet');
    
  } catch (error) {
    console.error('Filecoin Storage: getImage failed:', error);
    throw error;
  }
}

// Export hooks for React components to use
export { useFileUpload, useSynapse };