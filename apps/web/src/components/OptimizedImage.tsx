'use client';

import { useState } from 'react';
import { getImageUrl } from '../lib/image-storage';

interface OptimizedImageProps {
  cid: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function OptimizedImage({ 
  cid, 
  alt, 
  className = '', 
  fallback = '/placeholder-image.png' 
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin">
            <div className="w-full h-full border-2 border-filecoin-200 border-t-filecoin-600 rounded-full"></div>
          </div>
        </div>
      )}
      <img
        src={getImageUrl(cid)}
        alt={alt}
        className={`max-w-full h-auto ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}
