'use client';

import { useState, useRef } from 'react';
import { useFileUpload } from '@filecoin-notes/sdk';
import { useAccount } from 'wagmi';

export function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();
  const { uploadFileMutation, progress, status, uploadedInfo, handleReset } = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await uploadFileMutation.mutateAsync(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleResetUpload = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleReset();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload File to Filecoin</h2>
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to upload files</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadFileMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploadFileMutation.isPending ? 'Uploading...' : 'Upload to Filecoin'}
            </button>
            
            <button
              onClick={handleResetUpload}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{status}</p>
            </div>
          )}

          {/* Upload Result */}
          {uploadedInfo && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Upload Successful!</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>File:</strong> {uploadedInfo.fileName}</p>
                <p><strong>Size:</strong> {uploadedInfo.fileSize ? (uploadedInfo.fileSize / 1024).toFixed(2) + ' KB' : 'Unknown'}</p>
                <p><strong>Piece CID:</strong> {uploadedInfo.pieceCid}</p>
                {uploadedInfo.txHash && (
                  <p><strong>Transaction:</strong> {uploadedInfo.txHash}</p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {uploadFileMutation.error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Upload Failed</h3>
              <p className="text-sm text-red-700">
                {uploadFileMutation.error.message || 'An error occurred during upload'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
