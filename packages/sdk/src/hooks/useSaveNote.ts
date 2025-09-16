import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useFileUpload } from './useFileUpload';
import { Note } from '@filecoin-notes/types';

export interface SaveNoteOptions {
  category?: string;
  tags?: string[];
  images?: File[];
  inlineImages?: Array<{ markdown: string; file: File }>;
}

/**
 * Hook to save a note to Filecoin using Synapse SDK
 */
export const useSaveNote = (): {
  saveNoteMutation: any;
  progress: number;
  status: string;
  handleReset: () => void;
  isConnected: boolean;
} => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const { address, isConnected } = useAccount();
  const { uploadFileMutation, progress: uploadProgress, status: uploadStatus, uploadedInfo } = useFileUpload();

  // Monitor upload status changes, update note save status
  useEffect(() => {
    if (uploadFileMutation.isPending && uploadStatus) {
      // When upload is in progress, show detailed upload status
      setStatus(uploadStatus);
      setProgress(20 + (uploadProgress * 0.8)); // 20-100% range for upload
    }
  }, [uploadStatus, uploadProgress, uploadFileMutation.isPending]);

  const mutation = useMutation({
    mutationKey: ['save-note', address],
    mutationFn: async ({ 
      title, 
      content, 
      options 
    }: { 
      title: string; 
      content: string; 
      options?: SaveNoteOptions 
    }) => {
      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      if (!title.trim()) {
        throw new Error('Please enter a title');
      }

      if (!content.trim()) {
        throw new Error('Please enter some content');
      }

      setProgress(0);
      setStatus('🔄 Creating note...');

      // Create note object
      const note: Note = {
        id: crypto.randomUUID(),
        title: title.trim(),
        markdown: content.trim(),
        category: options?.category,
        tags: options?.tags || [],
        createdAt: Date.now(),
        author: address || '0x0000000000000000000000000000000000000000', // Use wallet address as author, fallback to zero address
        images: options?.images?.map(img => img.name) || [],
        inlineImages: options?.inlineImages?.map(img => ({
          cid: '',
          filename: img.file.name,
          alt: '',
          position: 0,
          markdownRef: img.markdown
        })) || [],
        public: false
      };

      setStatus('📁 Converting note to file...');
      setProgress(10);

      // Convert note to File object
      const jsonString = JSON.stringify(note, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `${note.id}.json`, { type: 'application/json' });

      setStatus('🚀 Starting upload to Filecoin...');
      setProgress(20);

      // Upload using the file upload hook
      // Detailed status will be updated through useEffect monitoring uploadStatus
      const uploadResult = await uploadFileMutation.mutateAsync(file);

      setStatus('✅ Note saved successfully!');
      setProgress(100);

      // Use upload result
      const cid = uploadResult?.pieceCid || '';
      const txHash = uploadResult?.txHash || '';

      // Note: Local index update will be handled in page component

      return {
        note,
        cid,
        size: file.size,
        txHash
      };
    },
    onSuccess: () => {
      setStatus('🎉 Note successfully stored on Filecoin!');
    },
    onError: (error) => {
      console.error('Save note failed:', error);
      setStatus(`❌ Failed to save note: ${error.message || 'Please try again'}`);
    }
  });

  const handleReset = () => {
    setProgress(0);
    setStatus('');
  };

  return {
    saveNoteMutation: mutation,
    progress,
    status,
    handleReset,
    isConnected
  };
};
