'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletStatusProps {
  children: (isConnected: boolean, address?: string) => React.ReactNode;
}

export default function WalletStatus({ children }: WalletStatusProps) {
  try {
    const { isConnected, address } = useAccount();
    return <>{children(isConnected, address)}</>;
  } catch (error) {
    // Provider not available during SSR
    return <>{children(false, undefined)}</>;
  }
}

export function WalletConnectButton() {
  return <ConnectButton />;
}
