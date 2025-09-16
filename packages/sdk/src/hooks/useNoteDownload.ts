import { useMutation } from "@tanstack/react-query";
import { useSynapse } from "../providers/SynapseProvider";
import { Note } from "@filecoin-notes/types";
import { useRef, useEffect } from "react";

/**
 * Hook to download a note from Filecoin using Synapse SDK
 */
export const useNoteDownload = () => {
  const { synapse, isLoading } = useSynapse();
  const synapseRef = useRef(synapse);
  const isLoadingRef = useRef(isLoading);

  // Update refs when values change
  useEffect(() => {
    synapseRef.current = synapse;
    isLoadingRef.current = isLoading;
    console.log("🔍 useNoteDownload: Refs updated", { 
      synapse: !!synapse, 
      isLoading,
      refSynapse: !!synapseRef.current,
      refIsLoading: isLoadingRef.current
    });
  }, [synapse, isLoading]);

  console.log("🔍 useNoteDownload: Hook initialized", { 
    synapse: !!synapse, 
    isLoading
  });

  const mutation = useMutation({
    mutationKey: ["download-note"],
    mutationFn: async (cid: string): Promise<Note> => {
      console.log("🔍 useNoteDownload: Mutation called", { 
        synapse: !!synapseRef.current,
        isLoading: isLoadingRef.current,
        cid 
      });
      
      if (isLoadingRef.current) {
        throw new Error("Synapse is still loading. Please wait and try again.");
      }
      
      if (!synapseRef.current) {
        console.error("🔍 useNoteDownload: Synapse not available");
        throw new Error("Synapse not found. Please ensure your wallet is connected and try again.");
      }

      console.log("🔍 useNoteDownload: Starting note download with CID:", cid);

      try {
        // Create a storage service instance for downloading
        const storageService = await synapseRef.current.createStorage();
        
        console.log("🔍 useNoteDownload: Storage service created successfully");

        // Use the storage service to download the file
        const uint8ArrayBytes = await storageService.download(cid);
        
        console.log("🔍 useNoteDownload: Downloaded bytes:", uint8ArrayBytes.length);

        // Convert Uint8Array to string and parse as JSON
        const jsonString = new TextDecoder().decode(uint8ArrayBytes);
        const note = JSON.parse(jsonString) as Note;

        console.log("🔍 useNoteDownload: Note downloaded successfully:", note);

        return note;
      } catch (error) {
        console.error("🔍 useNoteDownload: Download failed:", error);
        throw error;
      }
    },
    onSuccess: (note) => {
      console.log("✅ Note downloaded successfully:", note.title);
    },
    onError: (error) => {
      console.error("❌ Error downloading note:", error);
    },
  });

  return {
    downloadNoteMutation: mutation,
  };
};
