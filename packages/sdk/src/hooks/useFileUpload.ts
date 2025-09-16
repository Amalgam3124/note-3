import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "./useConfetti";
import { useAccount } from "wagmi";
import { preflightCheck } from "../utils/preflightCheck";
import { useSynapse } from "../providers/SynapseProvider";
import { Synapse } from "@filoz/synapse-sdk";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
};

/**
 * Hook to upload a file to the Filecoin network using Synapse.
 */
export const useFileUpload = (): {
  uploadFileMutation: any;
  progress: number;
  uploadedInfo: UploadedInfo | null;
  handleReset: () => void;
  status: string;
} => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const { synapse } = useSynapse();
  const { triggerConfetti } = useConfetti();
  const { address } = useAccount();
  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async (file: File) => {
      console.log('🔍 useFileUpload: mutationFn started', {
        synapse: !!synapse,
        address,
        file: file.name,
        fileSize: file.size,
      });
      
      if (!synapse) {
        console.error('🔍 useFileUpload: Synapse not found');
        throw new Error("Synapse not found");
      }
      if (!address) {
        console.error('🔍 useFileUpload: Address not found');
        throw new Error("Address not found");
      }
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      // 1) Convert File → ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // 2) Convert ArrayBuffer → Uint8Array
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      // 3) Create Synapse instance

      // 4) Get dataset
      const datasets = await synapse.storage.findDataSets(address);
      // 5) Check if we have a dataset
      const datasetExists = datasets.length > 0;
      // Include proofset creation fee if no proofset exists
      const includeDatasetCreationFee = !datasetExists;

      // 6) Check if we have enough USDFC to cover the storage costs and deposit if not
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        includeDatasetCreationFee,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and dataset...");
      setProgress(25);

      // 7) Create storage service with comprehensive debugging
      console.log("🔍 useFileUpload: Starting storage service creation...");
      console.log("🔍 useFileUpload: Synapse instance:", {
        chainId: synapse.getChainId(),
        warmStorageAddress: synapse.getWarmStorageAddress(),
        paymentsAddress: synapse.getPaymentsAddress(),
        pdpVerifierAddress: synapse.getPDPVerifierAddress(),
      });
      
      // Check signer status
      const signer = synapse.getSigner();
      console.log("🔍 useFileUpload: Signer status:", {
        address: signer ? await signer.getAddress() : 'N/A',
        provider: !!signer?.provider,
        chainId: signer?.provider ? await signer.provider.getNetwork().then(n => n.chainId) : 'N/A',
      });
      
      // Check network status
      if (signer?.provider) {
        try {
          const network = await signer.provider.getNetwork();
          const address = await signer.getAddress();
          const balance = await signer.provider.getBalance(address);
          const feeData = await signer.provider.getFeeData();
          console.log("🔍 useFileUpload: Network status:", {
            chainId: network.chainId.toString(),
            name: network.name,
            balance: balance.toString(),
            gasPrice: feeData.gasPrice?.toString(),
            maxFeePerGas: feeData.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
          });
        } catch (error) {
          console.error("🔍 useFileUpload: Network status check failed:", error);
        }
      }
      
      // Check USDFC balance and approval status
      try {
        const usdfcBalance = await synapse.payments.walletBalance("USDFC");
        const paymentsAddress = synapse.getPaymentsAddress();
        const usdfcAllowance = await synapse.payments.allowance(paymentsAddress, "USDFC");
        console.log("🔍 useFileUpload: USDFC status:", {
          balance: usdfcBalance.toString(),
          allowance: usdfcAllowance.toString(),
          paymentsAddress,
        });

        // If USDFC approval is insufficient, approve first
        if (usdfcAllowance < BigInt("1000000000000000000000")) { // 1000 USDFC
          console.log("🔍 useFileUpload: USDFC approval insufficient, starting approval...");
          setStatus("💰 Approving USDFC usage permissions...");
          
          const approvalTx = await synapse.payments.approve(
            paymentsAddress,
            BigInt("1000000000000000000000"), // Approve 1000 USDFC
            "USDFC"
          );
          
          console.log("🔍 useFileUpload: USDFC approval transaction:", approvalTx.hash);
          setStatus("⏳ Waiting for USDFC approval confirmation...");
          
          await approvalTx.wait();
          console.log("🔍 useFileUpload: USDFC approval completed");
          setStatus("✅ USDFC approval completed");
        }
      } catch (error) {
        console.error("🔍 useFileUpload: USDFC status check failed:", error);
      }
      
      // Check service approval status - use correct method
      try {
        const warmStorageAddress = synapse.getWarmStorageAddress();
        // Use approveService method to check service approval status
        console.log("🔍 useFileUpload: Service approval status check:", {
          warmStorageAddress,
          note: "Service approval will be handled in preflightCheck",
        });
      } catch (error) {
        console.error("🔍 useFileUpload: Service approval status check failed:", error);
      }

      const storageService = await synapse.createStorage({
        callbacks: {
          onDataSetResolved: (info: any) => {
            console.log("🔍 useFileUpload: Dataset resolved:", info);
            setStatus("🔗 Existing dataset found and resolved");
            setProgress(30);
          },
          onDataSetCreationStarted: (transactionResponse: any, statusUrl: any) => {
            console.log("🔍 useFileUpload: Dataset creation started:", transactionResponse);
            console.log("🔍 useFileUpload: Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: (status: any) => {
            console.log("🔍 useFileUpload: Dataset creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Dataset transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider: any) => {
            console.log("🔍 useFileUpload: Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);
      
      // Create Promise to wait for all callbacks to complete
      let uploadedTxHash = '';
      
      // 8) Upload file to storage provider
      const { pieceCid } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (piece: any) => {
          setStatus(
            `📊 File uploaded! Signing msg to add pieces to the dataset`
          );
          setUploadedInfo((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: file.size,
            pieceCid: piece.toV1().toString(),
          }));
          setProgress(80);
        },
        onPieceAdded: (transactionResponse: any) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
            }`
          );
          if (transactionResponse) {
            console.log("Transaction response:", transactionResponse);
            uploadedTxHash = transactionResponse?.hash || '';
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: uploadedTxHash,
            }));
          }
        },
        onPieceConfirmed: (pieceIds: any) => {
          setStatus("🌳 Data pieces added to dataset successfully");
          setProgress(90);
        },
      });

      setProgress(95);
      const finalUploadedInfo = {
        fileName: file.name,
        fileSize: file.size,
        pieceCid: pieceCid.toV1().toString(),
        txHash: uploadedTxHash,
      };
      
      setUploadedInfo(finalUploadedInfo);

      // Return upload result
      return finalUploadedInfo;
    },
    onSuccess: () => {
      setStatus("🎉 File successfully stored on Filecoin!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};