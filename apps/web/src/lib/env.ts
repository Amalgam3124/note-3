// Environment variable loading utility
export function getEnvVar(key: string, defaultValue?: string): string {
  // On client side, use process.env directly
  if (typeof window !== 'undefined') {
    return process.env[key] || defaultValue || '';
  }
  
  // On server side, try to get environment variables from different sources
  // First try process.env
  if (process.env[key]) {
    return process.env[key];
  }
  
  // If not found on server side, return default value
  return defaultValue || '';
}

export function getWalletConnectProjectId(): string {
  const projectId = getEnvVar('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
  
  if (!projectId || projectId === 'your_wallet_connect_project_id_here') {
    console.error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set');
    console.error('Please set it in your .env.local file in the apps/web directory');
    throw new Error('WalletConnect Project ID is required');
  }
  
  return projectId;
}

export function getFilecoinRpcUrl(): string {
  return getEnvVar('NEXT_PUBLIC_FILECOIN_RPC_URL', 'https://api.calibration.node.glif.io/rpc/v1');
}

export function getFilecoinNetwork(): string {
  return getEnvVar('NEXT_PUBLIC_FILECOIN_NETWORK', 'testnet');
}
