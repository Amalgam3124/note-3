import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { type Config, useConnectorClient } from "wagmi";

export const clientToSigner = (client: Client<Transport, Chain, Account>) => {
  const { account, chain, transport } = client;
  if (!chain) return null;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  provider.getSigner();
  const signer = new JsonRpcSigner(provider, account.address);

  // Add detailed debug logs
  console.log('🔍 clientToSigner: Creating signer', {
    chainId: chain.id,
    chainName: chain.name,
    address: account.address,
    providerType: provider.constructor.name,
  });

  // Check signer original properties
  console.log('🔍 clientToSigner: Signer original properties:', {
    address: signer.address,
    provider: !!signer.provider,
    hasSignTypedData: typeof signer.signTypedData === 'function',
    hasSignMessage: typeof signer.signMessage === 'function',
    hasSendTransaction: typeof signer.sendTransaction === 'function',
    hasGetAddress: typeof signer.getAddress === 'function',
  });

  // Check provider original properties
  console.log('🔍 clientToSigner: Provider original properties:', {
    hasGetSigner: typeof provider.getSigner === 'function',
    hasGetNetwork: typeof provider.getNetwork === 'function',
    hasGetBalance: typeof provider.getBalance === 'function',
    hasGetFeeData: typeof provider.getFeeData === 'function',
    hasRequest: typeof (provider as any).request === 'function',
    hasSend: typeof (provider as any).send === 'function',
    hasEip1193Provider: '_eip1193Provider' in provider,
  });

  // Override provider detection methods, force disable MetaMask detection
  // Because Filecoin RPC doesn't support eth_signTypedData_v4 method
  const originalProvider = signer.provider;
  if (originalProvider) {
    console.log('🔍 clientToSigner: Before modifying provider properties:', {
      hasEip1193Provider: '_eip1193Provider' in originalProvider,
      hasRequest: 'request' in originalProvider,
      hasSend: 'send' in originalProvider,
    });

    // Remove _eip1193Provider property so isMetaMaskSigner returns false
    if ('_eip1193Provider' in originalProvider) {
      delete (originalProvider as any)._eip1193Provider;
    }
    // Remove request method
    if ('request' in originalProvider) {
      delete (originalProvider as any).request;
    }
    // Remove send method
    if ('send' in originalProvider) {
      delete (originalProvider as any).send;
    }

    console.log('🔍 clientToSigner: After modifying provider properties:', {
      hasEip1193Provider: '_eip1193Provider' in originalProvider,
      hasRequest: 'request' in originalProvider,
      hasSend: 'send' in originalProvider,
    });
  }

  return signer;
};

export const clientToProvider = (client: Client<Transport, Chain, Account>) => {
  const { chain, transport } = client;
  if (!chain) return null;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return provider;
};

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId });
  
  console.log('🔍 useEthersSigner: Checking client', {
    client: !!client,
    chainId,
    account: client?.account?.address,
  });
  
  return useMemo(() => {
    if (!client) {
      console.log('🔍 useEthersSigner: client is null, returning undefined');
      return undefined;
    }
    
    const signer = clientToSigner(client);
    console.log('🔍 useEthersSigner: Signer created successfully', {
      signer: !!signer,
      address: signer?.address,
    });
    return signer;
  }, [client]);
};
/** Hook to convert a viem Wallet Client to an ethers.js Provider. */
export const useEthersProvider = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(
    () => (client ? clientToProvider(client) : undefined),
    [client]
  );
};
