'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'next/navigation';
import { getNoteHistory } from '../../../src/lib/filecoin-storage';
import { findById } from '../../../src/lib/note';
import { Note, NoteIndexItem } from '@filecoin-notes/types';
import { useNoteDownload } from '@filecoin-notes/sdk';
import NavBar from '../../../src/components/NavBar';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import MarkdownPreview from '../../../src/components/MarkdownPreview';
import OptimizedImage from '../../../src/components/OptimizedImage';

export default function NotePage() {
  const { isConnected, address } = useAccount();
  const params = useParams();
  const noteId = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [noteIndex, setNoteIndex] = useState<NoteIndexItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Note[]>([]);
  
  const { downloadNoteMutation } = useNoteDownload();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadNote();
    }
  }, [noteId, mounted]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError('');

      // First, get the note index to find the CID
      const indexItem = findById(noteId);
      if (!indexItem) {
        setError('Note not found');
        setLoading(false);
        return;
      }

      setNoteIndex(indexItem);

      // Check if download service is ready
      if (!downloadNoteMutation) {
        setError('Download service not ready');
        setLoading(false);
        return;
      }

      // Wait for synapse to be ready before downloading
      // This ensures we don't call mutateAsync before synapse is initialized
      let retries = 0;
      const maxRetries = 10;
      const retryDelay = 500; // 500ms

      while (retries < maxRetries) {
        try {
          // Try to download the note
          const noteData = await downloadNoteMutation.mutateAsync(indexItem.cid);
          setNote(noteData);
          break; // Success, exit the retry loop
        } catch (error) {
          if (error instanceof Error && error.message.includes('Synapse not found')) {
            // Synapse not ready yet, wait and retry
            retries++;
            if (retries < maxRetries) {
              console.log(`🔍 Synapse not ready, retrying in ${retryDelay}ms (attempt ${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            } else {
              throw new Error('Synapse initialization timeout. Please refresh the page and try again.');
            }
          } else {
            // Other error, don't retry
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load note:', error);
      setError(error instanceof Error ? error.message : 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getNoteHistory(noteId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load note history:', error);
    }
  };

  const handleShowHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!note || !noteIndex) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Note Not Found</h2>
              <p className="text-yellow-700 mb-4">The requested note could not be found.</p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = isConnected && address === note.author;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.category && (
                    <span className="px-2 py-1 bg-filecoin-100 text-filecoin-800 text-sm rounded-full">
                      {note.category}
                    </span>
                  )}
                  {note.tags && note.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                  {noteIndex.fileSize && (
                    <span className="ml-2">
                      • {Math.round(noteIndex.fileSize / 1024)}KB
                    </span>
                  )}
                  {note.filecoinCid && (
                    <span className="ml-2">
                      • CID: {note.filecoinCid.slice(0, 10)}...
                    </span>
                  )}
                </div>
              </div>
              
              {isOwner && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleShowHistory}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                  <a
                    href={`/edit/${note.id}`}
                    className="px-3 py-1 text-sm bg-filecoin-600 text-white rounded hover:bg-filecoin-700 transition-colors"
                  >
                    Edit Note
                  </a>
                </div>
              )}
            </div>

            {/* Cover Images */}
            {note.images && note.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {note.images.map((imageCid, index) => (
                    <OptimizedImage
                      key={index}
                      cid={imageCid}
                      alt={`Note image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Note History */}
          {showHistory && history.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit History</h3>
              <div className="space-y-3">
                {history.map((historyNote, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        Version {history.length - index}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(historyNote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {historyNote.markdown.slice(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <MarkdownPreview content={note.markdown} />
          </div>

          {/* Note Properties */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Note Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>Author:</strong> {note.author}
              </div>
              <div>
                <strong>Created:</strong> {new Date(note.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Size:</strong> {note.fileSize ? `${(note.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
              </div>
              <div>
                <strong>Category:</strong> {note.category || 'None'}
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="md:col-span-2">
                  <strong>Tags:</strong> {note.tags.join(', ')}
                </div>
              )}
              {note.filecoinCid && (
                <div className="md:col-span-2">
                  <strong>Storage CID:</strong> 
                  <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {note.filecoinCid}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
