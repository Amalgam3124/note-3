'use client';

export default function DebugEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
        </div>
        <div>
          <strong>NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:</strong> {process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'undefined'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FILECOIN_RPC_URL:</strong> {process.env.NEXT_PUBLIC_FILECOIN_RPC_URL || 'undefined'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FILECOIN_NETWORK:</strong> {process.env.NEXT_PUBLIC_FILECOIN_NETWORK || 'undefined'}
        </div>
        <div>
          <strong>All NEXT_PUBLIC_ variables:</strong>
          <pre className="bg-gray-100 p-2 mt-2 rounded">
            {JSON.stringify(
              Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
