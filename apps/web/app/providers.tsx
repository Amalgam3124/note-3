'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { getWagmiConfig } from '../src/wagmi';
import { SynapseProvider } from '@filecoin-notes/sdk';
import { filecoinCalibration } from 'viem/chains';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const config = getWagmiConfig();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={filecoinCalibration.id}
          locale="en"
        >
          <SynapseProvider>
            {children}
          </SynapseProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
