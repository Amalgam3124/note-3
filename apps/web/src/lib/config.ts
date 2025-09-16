// Filecoin Storage Configuration
// This file provides configuration for Filecoin storage integration

export const FILECOIN_CONFIG = {
  // Filecoin Storage Service API
  STORAGE_API_URL: process.env.NEXT_PUBLIC_FILECOIN_STORAGE_API_URL || 'https://api.filecoin.io/storage/v1',
  
  // Filecoin Gateway URL for accessing stored content
  GATEWAY_URL: process.env.NEXT_PUBLIC_FILECOIN_GATEWAY_URL || 'https://gateway.filecoin.io/ipfs/',
  
  // Filecoin Network (mainnet or testnet)
  NETWORK: (process.env.NEXT_PUBLIC_FILECOIN_NETWORK as 'mainnet' | 'testnet') || 'testnet',
  
  // Optional: Custom Filecoin RPC endpoint
  RPC_URL: process.env.NEXT_PUBLIC_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
  
  // Storage provider preference
  STORAGE_PROVIDER: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'default',
  
  // Wallet Connect Project ID
  WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your_wallet_connect_project_id_here'
};

// Validate configuration
export function validateFilecoinConfig() {
  const warnings = [];
  
  if (!process.env.NEXT_PUBLIC_FILECOIN_STORAGE_API_URL) {
    warnings.push('NEXT_PUBLIC_FILECOIN_STORAGE_API_URL not set, using default Filecoin storage API');
  }
  
  if (!process.env.NEXT_PUBLIC_FILECOIN_GATEWAY_URL) {
    warnings.push('NEXT_PUBLIC_FILECOIN_GATEWAY_URL not set, using default Filecoin gateway');
  }
  
  if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID === 'your_wallet_connect_project_id_here') {
    warnings.push('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID not set, wallet connection may not work');
  }
  
  if (warnings.length > 0) {
    console.warn('Filecoin Storage Configuration Warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
    console.warn('Please check your .env.local file configuration');
  }
  
  return warnings.length === 0;
}

// Get storage configuration for SDK
export function getStorageConfig() {
  return {
    apiUrl: FILECOIN_CONFIG.STORAGE_API_URL,
    gatewayUrl: FILECOIN_CONFIG.GATEWAY_URL,
    network: FILECOIN_CONFIG.NETWORK,
    rpcUrl: FILECOIN_CONFIG.RPC_URL,
    storageProvider: FILECOIN_CONFIG.STORAGE_PROVIDER
  };
}
