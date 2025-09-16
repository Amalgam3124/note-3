"use client";

import { useQuery } from "@tanstack/react-query";
import { EnhancedDataSetInfo, PDPServer } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { useSynapse } from "../providers/SynapseProvider";

import { DataSetPieceData as SDKDataSetPieceData } from "@filoz/synapse-sdk";

export type DataSetPieceData = SDKDataSetPieceData;

export interface DataSet {
  pdpVerifierDataSetId: number;
  providerId: number;
  payee: string;
  data?: {
    pieces: DataSetPieceData[];
  };
  provider?: any;
  serviceURL?: string;
}

/**
 * Hook to fetch and manage user datasets from Filecoin storage
 */
export const useDatasets = () => {
  const { address } = useAccount();
  const { synapse, warmStorageService } = useSynapse();

  return useQuery({
    enabled: !!address && !!synapse && !!warmStorageService,
    queryKey: ["datasets", address],
    queryFn: async () => {
      // STEP 1: Validate prerequisites
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");
      if (!warmStorageService)
        throw new Error("Warm storage service not found");

      // STEP 2: Fetch providers and datasets in parallel for efficiency
      const [providerIds, datasets] = await Promise.all([
        warmStorageService.getApprovedProviderIds(),
        warmStorageService.getClientDataSetsWithDetails(address),
      ]);

      // STEP 3: Create provider ID to address mapping from datasets
      const providerIdToAddressMap = datasets.reduce((acc, dataset) => {
        acc[dataset.providerId] = dataset.payee;
        return acc;
      }, {} as Record<number, string>);

      // STEP 4: Fetch provider information with error handling
      const providers = await Promise.all(
        providerIds.map(async (providerId) => {
          const providerAddress = providerIdToAddressMap[providerId];
          if (!providerAddress) {
            return null; // Skip if no address mapping exists
          }
          try {
            return await synapse.getProviderInfo(providerId);
          } catch (error) {
            console.warn(`Failed to fetch provider ${providerId}:`, error);
            return null; // Continue with other providers
          }
        })
      );

      // Filter out failed provider requests
      const filteredProviders = providers.filter(
        (provider) => provider !== null
      );

      // STEP 5: Create provider ID to service URL mapping
      const providerIdToServiceUrlMap = filteredProviders.reduce(
        (acc, provider) => {
          acc[provider.id] = provider.products.PDP?.data.serviceURL || "";
          return acc;
        },
        {} as Record<string, string>
      );

      // STEP 6: Fetch detailed dataset information with PDP data
      const datasetDetailsPromises = datasets.map(
        async (dataset: EnhancedDataSetInfo) => {
          const serviceURL = providerIdToServiceUrlMap[dataset.providerId];
          const provider = filteredProviders.find(
            (p) => p.id === dataset.providerId
          );

          try {
            // Connect to PDP server to get piece information
            const pdpServer = new PDPServer(null, serviceURL || "");
            const data = await pdpServer.getDataSet(
              dataset.pdpVerifierDataSetId
            );

            return {
              ...dataset,
              provider: provider,
              serviceURL: serviceURL,
              data, // Contains pieces array with CIDs
            } as DataSet;
          } catch (error) {
            console.warn(
              `Failed to fetch dataset details for ${dataset.pdpVerifierDataSetId}:`,
              error
            );
            // Return dataset without detailed data but preserve basic info
            return {
              ...dataset,
              provider: provider,
              serviceURL: serviceURL,
            } as unknown as DataSet;
          }
        }
      );

      // STEP 7: Wait for all dataset details to resolve
      const datasetDataResults = await Promise.all(datasetDetailsPromises);

      // STEP 8: Map results back to original dataset order
      const datasetsWithDetails = datasets.map((dataset) => {
        const dataResult = datasetDataResults.find(
          (result) =>
            result.pdpVerifierDataSetId === dataset.pdpVerifierDataSetId
        );
        return dataResult;
      });

      return { datasets: datasetsWithDetails };
    },
  });
};