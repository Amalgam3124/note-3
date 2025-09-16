'use client';

import { useState, useRef } from 'react';
import { validateImageFile } from '../lib/image-storage';

interface InlineImageManagerProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function InlineImageManager({ onImageSelect, disabled = false }: InlineImageManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const file = imageFiles[0]; // Take the first image file
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        onImageSelect(file);
      } else {
        alert(validation.error);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const file = imageFiles[0]; // Take the first image file
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        onImageSelect(file);
      } else {
        alert(validation.error);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? 'border-filecoin-400 bg-filecoin-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="text-gray-400 text-4xl mb-2">📷</div>
      <p className="text-sm text-gray-600 mb-1">
        {disabled ? 'Image upload disabled' : 'Drop an image here or click to browse'}
      </p>
      <p className="text-xs text-gray-500">
        Supports JPG, PNG, GIF, WebP (max 10MB)
      </p>
    </div>
  );
}
