'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWalletClient } from 'wagmi';
// import dynamic from 'next/dynamic'; 
import { findById, updateNoteAfterEdit } from '../../../src/lib/note';
import { useNoteDownload, useSaveNote } from '@filecoin-notes/sdk';
import { addCategory, addTags } from '../../../src/lib/note';
import { getAllCategories, getAllTags } from '../../../src/lib/note';
import { Note, NoteIndexItem } from '@filecoin-notes/types';
import NavBar from '../../../src/components/NavBar';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import MarkdownPreview from '../../../src/components/MarkdownPreview';
import InlineImageManager from '../../../src/components/InlineImageManager';
import { validateImageFile } from '../../../src/lib/image-storage';
import ClientOnly from '../../../src/components/ClientOnly';
import WalletStatus, { WalletConnectButton } from '../../../src/components/WalletStatus';
import ClientPageWrapper from '../../../src/components/ClientPageWrapper';

function EditNotePageContent() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const noteId = params.id as string;
  
  // Remove wagmi hook usage from this component
  
  const [note, setNote] = useState<Note | null>(null);
  const [noteIndex, setNoteIndex] = useState<NoteIndexItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [inlineImages, setInlineImages] = useState<Array<{ markdown: string; file: File }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  
  // Use the download and save hooks
  const { downloadNoteMutation } = useNoteDownload();
  const { saveNoteMutation } = useSaveNote();
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setExistingCategories(getAllCategories());
      setExistingTags(getAllTags());
    }
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

      // Check if download mutation is ready
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

          // Populate form fields
          setTitle(noteData.title);
          setContent(noteData.markdown);
          setCategory(noteData.category || '');
          setTags(noteData.tags || []);
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

  const handleAddCategory = () => {
    if (newCategory.trim() && !existingCategories.includes(newCategory.trim())) {
      addCategory(newCategory.trim());
      setExistingCategories(prev => [...prev, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()];
      setTags(newTags);
      addTags([newTag.trim()]);
      setExistingTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (file: File) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      setImages([...images, file]);
    } else {
      setError(validation.error || 'Invalid image file');
    }
  };

  const handleInlineImageUpload = (file: File) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      const markdown = `![${file.name}](${file.name})`;
      setInlineImages([...inlineImages, { markdown, file }]);
    } else {
      setError(validation.error || 'Invalid image file');
    }
  };

  // handleSave function will be defined inside WalletStatus component

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">
              {loading ? 'Loading note...' : 'Loading editor...'}
            </p>
          </div>
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
                onClick={() => router.back()}
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
                onClick={() => router.back()}
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

  // Owner check will be handled by WalletStatus component

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <NavBar />
      
      <ClientOnly fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Loading...</h2>
              <p className="text-yellow-700 mb-4">Please wait while we load the editor.</p>
            </div>
          </div>
        </div>
      }>
        <WalletStatus>
          {(isConnected, address) => {
            if (!isConnected) {
              return (
                <div className="container mx-auto px-4 py-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
                      <p className="text-yellow-700 mb-4">
                        Please connect your wallet to edit notes.
                      </p>
                      <div className="flex justify-center">
                        <WalletConnectButton />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const isOwner = note && address === note.author;
            if (!isOwner) {
              return (
                <div className="container mx-auto px-4 py-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-yellow-800 mb-2">Access Denied</h2>
                      <p className="text-yellow-700 mb-4">
                        You can only edit notes that you created.
                      </p>
                      <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            const handleSave = async () => {
              if (!title.trim()) {
                setError('Please enter a title');
                return;
              }

              if (!content.trim()) {
                setError('Please enter some content');
                return;
              }

              if (!walletClient) {
                setError('Wallet not connected');
                return;
              }

              setSaving(true);
              setError('');

              try {
                const result = await saveNoteMutation.mutateAsync({
                  title,
                  content,
                  options: {
                    category: category || undefined,
                    tags: tags.length > 0 ? tags : undefined,
                    images: images.length > 0 ? images : undefined,
                    inlineImages: inlineImages.length > 0 ? inlineImages : undefined,
                  }
                });

                console.log('Note updated successfully:', result);

                // Update the local index with the new CID
                if (noteIndex) {
                  updateNoteAfterEdit(noteId, {
                    id: noteId,
                    title: result.note.title,
                    cid: result.cid,
                    filecoinCid: result.cid,
                    createdAt: result.note.createdAt,
                    public: result.note.public,
                    category: result.note.category,
                    tags: result.note.tags,
                    version: result.note.version,
                    parentId: result.note.parentId,
                    hasImages: result.note.images && result.note.images.length > 0,
                    fileSize: result.size
                  }, result.cid);
                }

                router.push(`/note/${noteId}`);
              } catch (error) {
                console.error('Failed to update note:', error);
                setError(error instanceof Error ? error.message : 'Failed to update note');
              } finally {
                setSaving(false);
              }
            };

            return (
              <>
                {/* Loading overlay */}
                {saving && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 text-center">
                      <LoadingSpinner />
                      <p className="mt-4 text-gray-600">Saving changes to Filecoin...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </div>
                  </div>
                )}
                
                <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Note</h1>
            <p className="text-gray-600">Update your note stored on Filecoin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
                disabled={saving}
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex space-x-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
                  disabled={saving}
                >
                  <option value="">Select a category</option>
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
                  disabled={saving}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  disabled={saving}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-filecoin-100 text-filecoin-800 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-filecoin-600 hover:text-filecoin-800"
                      disabled={saving}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  disabled={saving}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
              
              {previewMode ? (
                <div className="border border-gray-300 rounded-md p-4 min-h-[300px] bg-gray-50">
                  <MarkdownPreview content={content} />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note in Markdown..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 min-h-[300px] text-gray-900"
                  disabled={saving}
                />
              )}
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Images
              </label>
              <InlineImageManager
                onImageSelect={handleImageUpload}
                disabled={saving}
              />
              {images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Selected images:</p>
                  <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center space-x-1"
                      >
                        <span>{image.name}</span>
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="text-gray-500 hover:text-gray-700"
                          disabled={saving}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inline Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inline Images (for Markdown content)
              </label>
              <InlineImageManager
                onImageSelect={handleInlineImageUpload}
                disabled={saving}
              />
              {inlineImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Selected inline images:</p>
                  <div className="flex flex-wrap gap-2">
                    {inlineImages.map((img, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center space-x-1"
                      >
                        <span>{img.file.name}</span>
                        <button
                          type="button"
                          onClick={() => setInlineImages(inlineImages.filter((_, i) => i !== index))}
                          className="text-gray-500 hover:text-gray-700"
                          disabled={saving}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="px-6 py-2 bg-filecoin-600 text-white rounded-md hover:bg-filecoin-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving && <LoadingSpinner size="sm" />}
                <span>{saving ? 'Updating...' : 'Update Note'}</span>
              </button>
            </div>
          </div>
                </div>
              </main>
              </>
            );
          }}
        </WalletStatus>
      </ClientOnly>
    </div>
  );
}

export default function EditNotePage() {
  return (
    <ClientPageWrapper>
      <EditNotePageContent />
    </ClientPageWrapper>
  );
}
