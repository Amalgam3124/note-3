'use client';

import { useState, useEffect } from 'react';
import { getAllNotes, getNoteStatistics, getAllCategories, getAllTags } from '../src/lib/note';
import { NoteIndexItem } from '@filecoin-notes/types';
import NavBar from '../src/components/NavBar';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ClientOnly from '../src/components/ClientOnly';
import WalletStatus, { WalletConnectButton } from '../src/components/WalletStatus';
import ClientPageWrapper from '../src/components/ClientPageWrapper';

function HomePageContent() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<NoteIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    totalNotes: 0,
    totalImages: 0,
    totalCategories: 0,
    totalTags: 0
  });

  // Remove wagmi hook usage from this component

  // Load data on component mount
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allNotes = getAllNotes();
      const allCategories = getAllCategories();
      const allTags = getAllTags();
      const stats = getNoteStatistics();

      setNotes(allNotes);
      setCategories(allCategories);
      setTags(allTags);
      setStatistics(stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.category && note.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));

    return matchesSearch && matchesCategory && matchesTag;
  });

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="filecoin-text-gradient">Note3</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Store your notes on Filecoin with decentralized storage and Web3 integration
          </p>
          
          <ClientOnly fallback={
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 mb-3">Connect your wallet to start creating notes</p>
              <div className="animate-pulse bg-gray-300 h-10 w-32 rounded"></div>
            </div>
          }>
            <WalletStatus>
              {(isConnected) => !isConnected && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                  <p className="text-blue-800 mb-3">Connect your wallet to start creating notes</p>
                  <div className="flex justify-center">
                    <WalletConnectButton />
                  </div>
                </div>
              )}
            </WalletStatus>
          </ClientOnly>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-filecoin-600">{statistics.totalNotes}</div>
            <div className="text-sm text-gray-600">Total Notes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-filecoin-600">{statistics.totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-filecoin-600">{statistics.totalTags}</div>
            <div className="text-sm text-gray-600">Tags</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-filecoin-500 text-gray-900"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-filecoin-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-filecoin-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory || selectedTag
                ? 'Try adjusting your search or filters'
                : 'Create your first note to get started'
              }
            </p>
            <ClientOnly>
              <WalletStatus>
                {(isConnected) => isConnected && (
                  <a
                    href="/new"
                    className="inline-flex items-center px-4 py-2 bg-filecoin-600 text-white rounded-md hover:bg-filecoin-700 transition-colors"
                  >
                    Create Note
                  </a>
                )}
              </WalletStatus>
            </ClientOnly>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {note.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {note.category && (
                      <span className="px-2 py-1 bg-filecoin-100 text-filecoin-800 text-xs rounded-full">
                        {note.category}
                      </span>
                    )}
                    {note.tags && note.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                    {note.fileSize && (
                      <span className="ml-2">
                        • {Math.round(note.fileSize / 1024)}KB
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <a
                    href={`/note/${note.id}`}
                    className="px-3 py-1 bg-filecoin-600 text-white text-sm rounded hover:bg-filecoin-700 transition-colors"
                  >
                    View
                  </a>
                  <ClientOnly>
                    <WalletStatus>
                      {(isConnected) => isConnected && (
                        <a
                          href={`/edit/${note.id}`}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </a>
                      )}
                    </WalletStatus>
                  </ClientOnly>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ClientPageWrapper>
      <HomePageContent />
    </ClientPageWrapper>
  );
}
