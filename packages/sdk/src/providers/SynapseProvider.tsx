"use client";

import {
  Synapse,
  WarmStorageService,
} from "@filoz/synapse-sdk";
import { createContext, useState, useEffect, useContext } from "react";
import { useEthersSigner } from "../hooks/useEthers";
import { config } from "../config";

export const SynapseContext = createContext<{
  synapse: Synapse | null;
  warmStorageService: WarmStorageService | null;
  isLoading: boolean;
}>({ synapse: null, warmStorageService: null, isLoading: true });

export const SynapseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [synapse, setSynapse] = useState<Synapse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warmStorageService, setWarmStorageService] =
    useState<WarmStorageService | null>(null);
  const signer = useEthersSigner();

  const createSynapse = async () => {
    console.log('🔍 SynapseProvider: createSynapse called', {
      signer: !!signer,
      signerAddress: signer ? await signer.getAddress() : 'N/A',
    });
    
    if (!signer) {
      console.log('🔍 SynapseProvider: signer is null, skipping Synapse creation');
      setIsLoading(false);
      return;
    }

    // Add detailed debug logs
    console.log('🔍 SynapseProvider: Starting Synapse creation', {
      signerAddress: await signer.getAddress(),
      chainId: await signer.provider?.getNetwork().then(n => n.chainId),
      withCDN: config.withCDN,
      disableNonceManager: false,
    });

    // Check signer detailed properties
    console.log('🔍 SynapseProvider: Signer detailed properties:', {
      address: signer.address,
      provider: !!signer.provider,
      providerType: signer.provider?.constructor.name,
      hasSignTypedData: typeof signer.signTypedData === 'function',
      hasSignMessage: typeof signer.signMessage === 'function',
      hasSendTransaction: typeof signer.sendTransaction === 'function',
    });

    // Check provider detailed properties
    if (signer.provider) {
      try {
        const network = await signer.provider.getNetwork();
        const feeData = await signer.provider.getFeeData();
        console.log('🔍 SynapseProvider: Provider detailed properties:', {
          chainId: network.chainId.toString(),
          name: network.name,
          gasPrice: feeData.gasPrice?.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
          hasGetSigner: typeof signer.provider.getSigner === 'function',
          hasGetNetwork: typeof signer.provider.getNetwork === 'function',
          hasGetBalance: typeof signer.provider.getBalance === 'function',
          hasGetFeeData: typeof signer.provider.getFeeData === 'function',
        });
      } catch (error) {
        console.error('🔍 SynapseProvider: Provider property check failed:', error);
      }
    }

    const synapse = await Synapse.create({
      signer,
      withCDN: config.withCDN,
      disableNonceManager: false, // Keep consistent with example dapp
    });

    console.log('🔍 SynapseProvider: Synapse created successfully', {
      chainId: synapse.getChainId(),
      warmStorageAddress: synapse.getWarmStorageAddress(),
      paymentsAddress: synapse.getPaymentsAddress(),
      pdpVerifierAddress: synapse.getPDPVerifierAddress(),
    });

    // Check Synapse instance detailed properties
    console.log('🔍 SynapseProvider: Synapse detailed properties:', {
      hasGetSigner: typeof synapse.getSigner === 'function',
      hasGetProvider: typeof synapse.getProvider === 'function',
      hasGetChainId: typeof synapse.getChainId === 'function',
      hasGetWarmStorageAddress: typeof synapse.getWarmStorageAddress === 'function',
      hasGetPaymentsAddress: typeof synapse.getPaymentsAddress === 'function',
      hasGetPDPVerifierAddress: typeof synapse.getPDPVerifierAddress === 'function',
      hasCreateStorage: typeof synapse.createStorage === 'function',
      hasPayments: !!synapse.payments,
      hasStorage: !!synapse.storage,
    });

    const warmStorageService = await WarmStorageService.create(
      synapse.getProvider(),
      synapse.getWarmStorageAddress()
    );
    setSynapse(synapse);
    setWarmStorageService(warmStorageService);
    setIsLoading(false);
  };
  useEffect(() => {
    createSynapse();
  }, [signer]);

  console.log("🔍 SynapseProvider: Rendering with state", { 
    synapse: !!synapse, 
    warmStorageService: !!warmStorageService, 
    isLoading 
  });

  return (
    <SynapseContext.Provider value={{ synapse, warmStorageService, isLoading }}>
      {children}
    </SynapseContext.Provider>
  );
};

export const useSynapse = () => {
  const { synapse, warmStorageService, isLoading } = useContext(SynapseContext);
  return { synapse, warmStorageService, isLoading };
};