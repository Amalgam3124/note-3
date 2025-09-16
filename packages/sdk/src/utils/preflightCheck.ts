import { checkAllowances } from "./warmStorageUtils";
import { config } from "../config";
import { Synapse, TIME_CONSTANTS } from "@filoz/synapse-sdk";
import { WarmStorageService } from "@filoz/synapse-sdk/warm-storage";
import { ethers } from "ethers";

/**
 * Performs a preflight check before file upload to ensure sufficient USDFC balance and allowances
 * for storage costs. This function:
 * 1. Verifies signer and provider availability
 * 2. Checks if there's enough USDFC allowance for the file size
 * 3. If insufficient, handles the deposit and approval process
 *
 * @param file - The file to be uploaded
 * @param synapse - Synapse SDK instance
 * @param includeDataSetCreationFee - Whether to include data set creation fee
 * @param updateStatus - Callback to update status messages
 * @param updateProgress - Callback to update progress percentage
 */
export const preflightCheck = async (
  file: File,
  synapse: Synapse,
  includeDataSetCreationFee: boolean,
  updateStatus: (status: string) => void,
  updateProgress: (progress: number) => void
) => {
  console.log("🔍 preflightCheck: Starting preflight check...");
  console.log("🔍 preflightCheck: File info:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });
  console.log("🔍 preflightCheck: Config info:", {
    withCDN: config.withCDN,
    persistencePeriod: config.persistencePeriod,
    minDaysThreshold: config.minDaysThreshold,
    includeDataSetCreationFee,
  });

  // Verify signer and provider are available
  // Initialize Pandora service for allowance checks
  const warmStorageService = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );

  console.log("🔍 preflightCheck: WarmStorageService created successfully");

  // Step 1: Check if current allowance is sufficient for the file size
  console.log("🔍 preflightCheck: Starting storage allowance check...");
  const warmStorageBalance = await warmStorageService.checkAllowanceForStorage(
    file.size,
    config.withCDN,
    synapse.payments,
    config.persistencePeriod
  );

  console.log("🔍 preflightCheck: WarmStorageBalance result:", warmStorageBalance);

  // Step 2: Check if allowances and balances are sufficient for storage and data set creation
  console.log("🔍 preflightCheck: Starting allowance sufficiency check...");
  const {
    isSufficient,
    rateAllowanceNeeded,
    lockupAllowanceNeeded,
    depositAmountNeeded,
  } = await checkAllowances(
    warmStorageBalance,
    config.minDaysThreshold,
    includeDataSetCreationFee
  );

  console.log("🔍 preflightCheck: Allowance check result:", {
    isSufficient,
    rateAllowanceNeeded: rateAllowanceNeeded.toString(),
    lockupAllowanceNeeded: lockupAllowanceNeeded.toString(),
    depositAmountNeeded: depositAmountNeeded.toString(),
  });

  // Always ensure service approval is set up, regardless of sufficiency
  // This is critical for dataset creation to work properly
  updateStatus("💰 Ensuring Filecoin Warm Storage service approval...");
  
  // Step 3: Deposit USDFC to cover storage costs (if needed)
  if (!isSufficient) {
    updateStatus("💰 Insufficient USDFC allowance, depositing...");
    const depositTx = await synapse.payments.deposit(
      depositAmountNeeded,
      "USDFC",
      {
        onDepositStarting: () => updateStatus("💰 Depositing USDFC..."),
        onAllowanceCheck: (current: bigint, required: bigint) =>
          updateStatus(
            `💰 Allowance check ${
              current > required ? "sufficient" : "insufficient"
            }`
          ),
        onApprovalTransaction: async (tx: ethers.TransactionResponse) => {
          updateStatus(`💰 Approving USDFC... ${tx.hash}`);
          const receipt = await tx.wait();
          updateStatus(`💰 USDFC approved ${receipt?.hash}`);
        },
      }
    );
    await depositTx.wait();
    updateStatus("💰 USDFC deposited successfully");
    updateProgress(10);
  } else {
    updateStatus("💰 USDFC allowance sufficient");
    updateProgress(5);
  }

  // Step 4: Always approve Filecoin Warm Storage service to spend USDFC at specified rates
  // This is required for dataset creation regardless of current allowance status
  updateStatus(
    "💰 Approving Filecoin Warm Storage service USDFC spending rates..."
  );
  const approvalTx = await synapse.payments.approveService(
    synapse.getWarmStorageAddress(),
    rateAllowanceNeeded,
    lockupAllowanceNeeded,
    TIME_CONSTANTS.EPOCHS_PER_DAY * BigInt(config.persistencePeriod)
  );
  await approvalTx.wait();
  updateStatus("💰 Filecoin Warm Storage service approved to spend USDFC");
  updateProgress(20);
};