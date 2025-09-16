export type Note = {
  id: string;                 // `${address}-${Date.now()}`
  title: string;
  markdown: string;
  images: string[];           // Array of image CIDs (for cover/attachments)
  inlineImages: InlineImage[]; // Array of inline images in markdown
  public: boolean;            // Reserved for future public sharing
  createdAt: number;
  author: `0x${string}`;      // Wallet address
  category?: string;          // Note category for filtering
  tags?: string[];            // Optional tags for better organization
  version?: number;           // Version number for edited notes
  parentId?: string;          // ID of the original note (for edited versions)
  editHistory?: string[];     // Array of previous CIDs
  filecoinCid?: string;       // Filecoin storage CID
  fileSize?: number;          // Size of the note in bytes
};

// New type for inline images in markdown
export type InlineImage = {
  cid: string;
  filename: string;
  alt: string;
  position: number;           // Position in markdown text
  markdownRef: string;        // The actual markdown syntax like ![alt](cid)
  filecoinCid?: string;       // Filecoin storage CID for the image
};

export type NoteIndexItem = {
  id: string;
  cid: string;
  filecoinCid?: string;       // Filecoin storage CID
  title: string;
  createdAt: number;
  updatedAt?: number;
  public?: boolean;
  category?: string;          // Note category
  tags?: string[];            // Optional tags
  version?: number;           // Version number
  parentId?: string;          // Parent note ID for edited versions
  hasImages?: boolean;        // Whether the note contains cover/attachment images
  hasInlineImages?: boolean;  // Whether the note contains inline images in markdown
  fileSize?: number;          // Size of the note in bytes
  editHistory?: string[];     // Array of previous CIDs for edit history
};

export type NoteSnapshot = {
  title: string;
  markdown: string;
  images: string[];
  sourceCID: string;
  filecoinCid?: string;       // Filecoin storage CID
  sha256: `0x${string}`;
  publishedAt: number;
  author: `0x${string}`;
  category?: string;
  tags?: string[];
  version?: number;
  parentId?: string;
};

// New types for image handling with Filecoin
export type ImageUpload = {
  cid: string;
  filecoinCid?: string;       // Filecoin storage CID
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  author: `0x${string}`;
  storageProvider?: string;   // Which storage provider was used
};

export type NoteWithImages = Note & {
  imageDetails?: ImageUpload[];
};

// Filecoin storage specific types
export type FilecoinStorageConfig = {
  apiUrl: string;
  gatewayUrl: string;
  network: 'mainnet' | 'testnet';
  rpcUrl?: string;
  storageProvider?: string;
};

export type FilecoinUploadResult = {
  cid: string;
  size: number;
  storageProvider: string;
  uploadTime: number;
  cost?: number;              // Cost in FIL tokens
};

export type FilecoinRetrieveResult = {
  content: Uint8Array;
  cid: string;
  size: number;
  mimeType?: string;
};
