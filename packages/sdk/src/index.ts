// Core storage functionality
export { putJSON, getJSON, putImage, getImage } from './storage';

// Hooks
export { useSaveNote } from './hooks/useSaveNote';
export { useFileUpload } from './hooks/useFileUpload';
export { useDatasets } from './hooks/useDatasets';
export { useDownloadPiece } from './hooks/useDownloadPiece';
export { useNoteDownload } from './hooks/useNoteDownload';
export { useEthersSigner, useEthersProvider } from './hooks/useEthers';

// Providers
export { SynapseProvider, useSynapse as useSynapseContext } from './providers/SynapseProvider';

// Utils
export { preflightCheck } from './utils/preflightCheck';
export * from './utils/warmStorageUtils';
export * from './utils/constants';

// Config
export { config } from './config';

// Placeholder modules for future features
export * from './hash';
export * from './encrypt';
export * from './registry';
export * from './nft';
