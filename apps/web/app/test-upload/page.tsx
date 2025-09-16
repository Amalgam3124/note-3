"use client";

import { useState, useEffect } from "react";
import { useFileUpload } from "@filecoin-notes/sdk";
import { useAccount } from "wagmi";

export default function TestUploadPage() {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { uploadFileMutation, progress, status, uploadedInfo, handleReset } = useFileUpload();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTestFile(file);
    }
  };

  const handleTestUpload = async () => {
    if (!testFile) {
      alert("Please select a file first");
      return;
    }

    if (!isConnected) {
      alert("Please connect wallet first");
      return;
    }

    try {
      console.log("🧪 Starting test upload...");
      console.log("🧪 File:", testFile.name, testFile.size, "bytes");
      console.log("🧪 Address:", address);
      
      await uploadFileMutation.mutateAsync(testFile);
      console.log("🧪 Upload successful!");
    } catch (error) {
      console.error("🧪 Upload failed:", error);
    }
  };

  const handleProviderTest = async () => {
    console.log("🧪 Testing provider availability...");
    
    const providers = [
      { id: 2, name: 'pspsps', url: 'https://calibnet.pspsps.io/pdp/ping' },
      { id: 3, name: 'ezpdpz-calib', url: 'https://calib.ezpdpz.net/pdp/ping' }
    ];
    
    for (const provider of providers) {
      try {
        console.log(`🧪 Testing ${provider.name}...`);
        const response = await fetch(provider.url, { 
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        console.log(`✅ ${provider.name}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`❌ ${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
          <p className="text-gray-600">
            Connection Status: {mounted ? (isConnected ? "✅ Connected" : "❌ Not Connected") : "Loading..."}
          </p>
          {mounted && address && (
            <p className="text-gray-600">
              Address: {address}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Provider Test</h2>
          <button
            onClick={handleProviderTest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Provider Availability
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Click button to test all storage provider availability, check console output
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">File Upload Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Test File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {testFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {testFile.name} ({testFile.size} bytes)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTestUpload}
              disabled={!testFile || !mounted || !isConnected || uploadFileMutation.isPending}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploadFileMutation.isPending ? "Uploading..." : "Start Upload Test"}
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>

        {status && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Status</h2>
            <p className="text-gray-700 mb-2">{status}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{progress}%</p>
          </div>
        )}

        {uploadedInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Result</h2>
            <div className="space-y-2">
              <p><strong>File Name:</strong> {uploadedInfo.fileName}</p>
              <p><strong>File Size:</strong> {uploadedInfo.fileSize} bytes</p>
              {uploadedInfo.pieceCid && (
                <p><strong>Piece CID:</strong> {uploadedInfo.pieceCid}</p>
              )}
              {uploadedInfo.txHash && (
                <p><strong>Transaction Hash:</strong> {uploadedInfo.txHash}</p>
              )}
            </div>
          </div>
        )}

        {uploadFileMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Upload Error</h2>
            <p className="text-red-700">{uploadFileMutation.error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
