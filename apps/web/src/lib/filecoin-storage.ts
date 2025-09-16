// Filecoin Storage implementation
// Access Filecoin Storage functionality through SDK package

import { Note, ImageUpload, FilecoinStorageConfig } from '@filecoin-notes/types';
import { getStorageConfig } from './config';

// Extended Note type with Filecoin CID
type NoteWithFilecoinCID = Note & { filecoinCid?: string };

// Save note to Filecoin Storage
export async function saveNote(
  title: string,
  content: string,
  signer: any,
  options?: {
    category?: string;
    tags?: string[];
    images?: File[];
    inlineImages?: Array<{ markdown: string; file: File }>;
    isEdit?: boolean;
    originalId?: string;
  }
): Promise<{ note: NoteWithFilecoinCID; estimatedFee: bigint }> {
  try {
    console.log('Filecoin Storage: Starting note upload...', options);
    
    // Validate signer
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
    
    console.log('Filecoin Storage: Wallet address:', walletAddress);
    
    // Handle image uploads if provided
    let imageCids: string[] = [];
    let imageDetails: ImageUpload[] = [];
    
    if (options?.images && options.images.length > 0) {
      console.log('Filecoin Storage: Uploading cover images...');
      const { uploadImages } = await import('./image-storage');
      const uploadResult = await uploadImages(options.images, signer);
      imageCids = uploadResult.cids;
      imageDetails = uploadResult.imageDetails;
      console.log('Filecoin Storage: Cover images uploaded:', imageCids);
    }
    
    // Handle inline images if provided
    let inlineImageCids: string[] = [];
    if (options?.inlineImages && options.inlineImages.length > 0) {
      console.log('Filecoin Storage: Processing inline images...');
      const { uploadImages } = await import('./image-storage');
      const inlineFiles = options.inlineImages.map(img => img.file);
      const uploadResult = await uploadImages(inlineFiles, signer);
      inlineImageCids = uploadResult.cids;
      console.log('Filecoin Storage: Inline images uploaded:', inlineImageCids);
    }
    
    // Create note object
    const note: Note = {
      id: options?.isEdit && options?.originalId 
        ? options.originalId  // Keep the same ID for edits
        : `${walletAddress}-${Date.now()}`,
      title,
      markdown: content,
      images: imageCids,
      inlineImages: [], // TODO: Parse markdown content to extract inline images
      public: false,
      createdAt: options?.isEdit ? Date.now() : Date.now(), // Keep original creation date for edits
      author: walletAddress,
      category: options?.category,
      tags: options?.tags,
      version: options?.isEdit ? undefined : undefined, // No version for edits
      parentId: undefined, // No parent ID for edits
    };
    
    console.log('Filecoin Storage: Note object created:', note);
    
    // Calculate estimated fee based on data size
    const jsonString = JSON.stringify(note);
    const dataSize = jsonString.length;
    const estimatedFee = BigInt(Math.ceil(dataSize * 0.000001 * 1e18)); // Rough estimate: 0.000001 FIL per byte
    
    console.log('Filecoin Storage: Estimated storage fee:', {
      dataSize,
      estimatedFee: estimatedFee.toString(),
      estimatedFeeFIL: parseFloat((Number(estimatedFee) / 1e18).toFixed(6))
    });
    
    // Filecoin Storage supports large files natively
    console.log('Filecoin Storage: Data size:', dataSize, 'bytes');
    
    // Dynamically import SDK to avoid SSR issues
    const { putJSON } = await import('@filecoin-notes/sdk');
    
    // Upload to Filecoin Storage
    const { cid } = await putJSON(note, signer);
    
    // Create note with Filecoin CID
    const noteWithFilecoinCID: NoteWithFilecoinCID = {
      ...note,
      filecoinCid: cid
    };
    
    console.log('Filecoin Storage: Note uploaded successfully with CID:', cid);
    
    // Add the note to local index so it appears on the home page
    const { addToLocalIndex, updateNoteAfterEdit } = await import('./note');
    
    // Create index item for local storage
    const indexItem = {
      id: note.id,
      title: note.title,
      cid: cid,
      filecoinCid: cid,
      createdAt: note.createdAt,
      public: note.public,
      category: note.category,
      tags: note.tags,
      version: note.version,
      parentId: note.parentId,
      hasImages: imageCids.length > 0,
      fileSize: dataSize
    };
    
    if (options?.isEdit && options?.originalId) {
      // Replace the original note with the updated version
      updateNoteAfterEdit(options.originalId, indexItem, cid);
      console.log('Filecoin Storage: Note replaced after editing:', indexItem);
    } else {
      // Add new note to local index
      addToLocalIndex(indexItem);
      console.log('Filecoin Storage: Note added to local index:', indexItem);
    }
    
    return { note: noteWithFilecoinCID, estimatedFee };
  } catch (error) {
    console.error('Filecoin Storage: saveNote failed:', error);
    throw error;
  }
}

// Get note from Filecoin Storage
export async function getNote(cid: string): Promise<Note> {
  try {
    console.log('Filecoin Storage: Fetching note with CID:', cid);
    
    // Dynamically import SDK to avoid SSR issues
    const { getJSON } = await import('@filecoin-notes/sdk');
    
    const result = await getJSON(cid);
    const note = JSON.parse(new TextDecoder().decode(result.content)) as Note;
    
    console.log('Filecoin Storage: Note fetched successfully:', note);
    
    return note;
  } catch (error) {
    console.error('Filecoin Storage: getNote failed:', error);
    throw error;
  }
}

// Function to get note edit history
export async function getNoteHistory(noteId: string): Promise<Note[]> {
  try {
    const { findById } = await import('./note');
    const indexItem = findById(noteId);
    
    if (!indexItem || !(indexItem as any).editHistory) {
      return [];
    }
    
    const history: Note[] = [];
    for (const cid of (indexItem as any).editHistory) {
      try {
        const note = await getNote(cid);
        history.push(note);
      } catch (error) {
        console.warn('Failed to load note from history:', cid, error);
      }
    }
    
    return history;
  } catch (error) {
    console.error('Failed to get note history:', error);
    return [];
  }
}
