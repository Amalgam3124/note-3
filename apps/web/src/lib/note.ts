// Note management utilities
import { NoteIndexItem } from '@filecoin-notes/types';

const STORAGE_KEYS = {
  INDEX: 'filecoin-notes-index',
  CATEGORIES: 'filecoin-notes-categories',
  TAGS: 'filecoin-notes-tags',
  NOTE_PREFIX: 'filecoin-note-',
  FILE_PREFIX: 'filecoin-file-'
};

// Get all notes from local index
export function getAllNotes(): NoteIndexItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.INDEX);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get notes from local storage:', error);
    return [];
  }
}

// Add note to local index
export function addToLocalIndex(note: NoteIndexItem): void {
  try {
    if (typeof window === 'undefined') return;
    const notes = getAllNotes();
    notes.unshift(note); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(notes));
    console.log('Note added to local index:', note);
  } catch (error) {
    console.error('Failed to add note to local index:', error);
  }
}

// Update note in local index after edit
export function updateNoteAfterEdit(originalId: string, updatedNote: NoteIndexItem, newCid: string): void {
  try {
    if (typeof window === 'undefined') return;
    const notes = getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === originalId);
    
    if (noteIndex !== -1) {
      // Add to edit history
      const originalNote = notes[noteIndex];
      if (!originalNote.editHistory) {
        originalNote.editHistory = [];
      }
      originalNote.editHistory.push(originalNote.cid);
      
      // Update the note with new CID and details
      notes[noteIndex] = {
        ...updatedNote,
        id: originalId, // Keep original ID
        cid: newCid,
        filecoinCid: newCid,
        updatedAt: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(notes));
      console.log('Note updated after edit:', updatedNote);
    }
  } catch (error) {
    console.error('Failed to update note after edit:', error);
  }
}

// Find note by ID
export function findById(id: string): NoteIndexItem | null {
  try {
    const notes = getAllNotes();
    return notes.find(note => note.id === id) || null;
  } catch (error) {
    console.error('Failed to find note by ID:', error);
    return null;
  }
}

// Get notes by category
export function getNotesByCategory(category: string): NoteIndexItem[] {
  try {
    const notes = getAllNotes();
    return notes.filter(note => note.category === category);
  } catch (error) {
    console.error('Failed to get notes by category:', error);
    return [];
  }
}

// Get notes by tag
export function getNotesByTag(tag: string): NoteIndexItem[] {
  try {
    const notes = getAllNotes();
    return notes.filter(note => note.tags && note.tags.includes(tag));
  } catch (error) {
    console.error('Failed to get notes by tag:', error);
    return [];
  }
}

// Search notes
export function searchNotes(query: string): NoteIndexItem[] {
  try {
    const notes = getAllNotes();
    const lowercaseQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      (note.category && note.category.toLowerCase().includes(lowercaseQuery)) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  } catch (error) {
    console.error('Failed to search notes:', error);
    return [];
  }
}

// Get all categories
export function getAllCategories(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get categories from local storage:', error);
    return [];
  }
}

// Add category
export function addCategory(category: string): void {
  try {
    if (typeof window === 'undefined') return;
    const categories = getAllCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  } catch (error) {
    console.error('Failed to add category:', error);
  }
}

// Get all tags
export function getAllTags(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get tags from local storage:', error);
    return [];
  }
}

// Add tags
export function addTags(tags: string[]): void {
  try {
    if (typeof window === 'undefined') return;
    const existingTags = getAllTags();
    const newTags = tags.filter(tag => !existingTags.includes(tag));
    if (newTags.length > 0) {
      const updatedTags = [...existingTags, ...newTags];
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updatedTags));
    }
  } catch (error) {
    console.error('Failed to add tags:', error);
  }
}

// Get note statistics
export function getNoteStatistics(): {
  totalNotes: number;
  totalImages: number;
  totalCategories: number;
  totalTags: number;
} {
  try {
    const notes = getAllNotes();
    const categories = getAllCategories();
    const tags = getAllTags();
    
    const totalImages = notes.reduce((count, note) => {
      return count + (note.hasImages ? 1 : 0);
    }, 0);
    
    return {
      totalNotes: notes.length,
      totalImages,
      totalCategories: categories.length,
      totalTags: tags.length
    };
  } catch (error) {
    console.error('Failed to get note statistics:', error);
    return {
      totalNotes: 0,
      totalImages: 0,
      totalCategories: 0,
      totalTags: 0
    };
  }
}
