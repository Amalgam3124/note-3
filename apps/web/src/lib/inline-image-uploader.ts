// Inline image uploader for markdown content
import { validateImageFile, getImageUrl } from './image-storage';

export interface InlineImageUpload {
  markdown: string;
  file: File;
}

// Process markdown content and extract inline images
export function extractInlineImages(markdown: string): Array<{ markdown: string; file: File }> {
  // This is a placeholder - in a real implementation, you would:
  // 1. Parse the markdown content
  // 2. Find image references like ![alt](file://...)
  // 3. Extract the file objects
  // 4. Return the markdown with updated references
  
  console.log('Inline image extraction not yet implemented');
  return [];
}

// Upload inline images and update markdown content
export async function uploadInlineImages(
  markdown: string,
  signer: any
): Promise<{ updatedMarkdown: string; imageCids: string[] }> {
  try {
    console.log('Filecoin Storage: Processing inline images...');
    
    // Extract inline images from markdown
    const inlineImages = extractInlineImages(markdown);
    
    if (inlineImages.length === 0) {
      return {
        updatedMarkdown: markdown,
        imageCids: []
      };
    }
    
    // Validate all files
    for (const { file } of inlineImages) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(`Invalid image file: ${validation.error}`);
      }
    }
    
    // Upload images
    const { uploadImages } = await import('./image-storage');
    const files = inlineImages.map(img => img.file);
    const uploadResult = await uploadImages(files, signer);
    
    // Update markdown content with CIDs
    let updatedMarkdown = markdown;
    for (let i = 0; i < inlineImages.length; i++) {
      const { markdown: originalMarkdown } = inlineImages[i];
      const cid = uploadResult.cids[i];
      const imageUrl = getImageUrl(cid);
      
      // Replace file:// references with CID references
      updatedMarkdown = updatedMarkdown.replace(
        originalMarkdown,
        `![alt](${imageUrl})`
      );
    }
    
    console.log('Filecoin Storage: Inline images processed successfully');
    
    return {
      updatedMarkdown,
      imageCids: uploadResult.cids
    };
    
  } catch (error) {
    console.error('Filecoin Storage: Failed to upload inline images:', error);
    throw error;
  }
}

// Create inline image reference for markdown
export function createInlineImageRef(file: File): string {
  // Create a temporary reference that will be replaced with CID after upload
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return `![alt](file://${tempId})`;
}
