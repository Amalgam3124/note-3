'use client';

import ReactMarkdown from 'react-markdown';
import { getImageUrl } from '../lib/image-storage';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Custom renderer for images to use Filecoin gateway URLs
  const components = {
    img: ({ src, alt, ...props }: any) => {
      // If it's a CID, use the Filecoin gateway URL
      if (src && (src.startsWith('Qm') || src.startsWith('bafy'))) {
        return (
          <img
            {...props}
            src={getImageUrl(src)}
            alt={alt}
            className="max-w-full h-auto rounded-lg shadow-sm"
            onError={(e) => {
              // Fallback to original src if gateway fails
              (e.target as HTMLImageElement).src = src;
            }}
          />
        );
      }
      
      // For other URLs, use as-is
      return (
        <img
          {...props}
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
      );
    },
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-5" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-gray-700 mb-4 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-700" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-filecoin-300 pl-4 py-2 mb-4 bg-gray-50 italic text-gray-700" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }: any) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
        {children}
      </pre>
    ),
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        className="text-filecoin-600 hover:text-filecoin-700 underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
