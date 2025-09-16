import { config } from "../config";
import { DATA_SET_CREATION_FEE } from "./constants";
import {
  SIZE_CONSTANTS,
  Synapse,
  TIME_CONSTANTS,
  WarmStorageService,
} from "@filoz/synapse-sdk";

// Types from Synapse SDK
export interface WarmStorageBalance {
  rateAllowanceNeeded: bigint;
  lockupAllowanceNeeded: bigint;
  currentRateAllowance: bigint;
  currentLockupAllowance: bigint;
  currentRateUsed: bigint;
  currentLockupUsed: bigint;
  sufficient: boolean;
  message?: string;
  costs: {
    perEpoch: bigint;
    perDay: bigint;
    perMonth: bigint;
  };
  depositAmountNeeded: bigint;
}

export interface StorageCosts {
  pricePerTiBPerMonthNoCDN: bigint;
  pricePerTiBPerMonthWithCDN: bigint;
}

/**
 * Fetches the current storage costs from the WarmStorage service.
 * @param synapse - The Synapse instance
 * @returns The storage costs object
 */
export const fetchWarmStorageCosts = async (
  synapse: Synapse
): Promise<StorageCosts> => {
  const warmStorageService = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );
  return warmStorageService.getServicePrice();
};

/**
 * Fetches the current WarmStorage balance data for a given storage capacity (in bytes) and period (in days).
 * @param synapse - The Synapse instance
 * @param storageCapacityBytes - Storage capacity in bytes
 * @param persistencePeriodDays - Desired persistence period in days
 * @returns The WarmStorage balance data object
 */
export const fetchWarmStorageBalanceData = async (
  synapse: Synapse,
  storageCapacityBytes: number,
  persistencePeriodDays: number
): Promise<WarmStorageBalance> => {
  const warmStorageService = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );
  return warmStorageService.checkAllowanceForStorage(
    storageCapacityBytes,
    config.withCDN,
    synapse.payments,
    persistencePeriodDays
  );
};

/**
 * Calculates current storage usage based on rate usage and storage capacity.
 *
 * @param warmStorageBalance - The WarmStorage balance data
 * @param storageCapacityBytes - The storage capacity in bytes
 * @returns Object with currentStorageBytes and currentStorageGB
 */
export const calculateCurrentStorageUsage = (
  warmStorageBalance: WarmStorageBalance,
  storageCapacityBytes: number
): { currentStorageBytes: bigint; currentStorageGB: number } => {
  let currentStorageBytes = 0n;
  let currentStorageGB = 0;

  if (
    warmStorageBalance.currentRateUsed > 0n &&
    warmStorageBalance.rateAllowanceNeeded > 0n
  ) {
    try {
      // Proportionally calculate storage usage based on rate used
      currentStorageBytes =
        (warmStorageBalance.currentRateUsed * BigInt(storageCapacityBytes)) /
        warmStorageBalance.rateAllowanceNeeded;
      // Convert bytes to GB
      currentStorageGB =
        Number(currentStorageBytes) / Number(SIZE_CONSTANTS.GiB);
      console.log("currentStorageGB", currentStorageGB);
    } catch (error) {
      console.warn("Failed to calculate current storage usage:", error);
    }
  }

  return { currentStorageBytes, currentStorageGB };
};

/**
 * Checks if the current allowances and balances are sufficient for storage and dataset creation.
 *
 * @param warmStorageBalance - The WarmStorage balance data
 * @param minDaysThreshold - Minimum days threshold for lockup sufficiency
 * @param includeDataSetCreationFee - Whether to include the dataset creation fee in calculations
 * @returns Object with sufficiency flags and allowance details
 */
export const checkAllowances = async (
  warmStorageBalance: WarmStorageBalance,
  minDaysThreshold: number,
  includeDataSetCreationFee: boolean
) => {
  console.log("🔍 checkAllowances: Starting allowance check...");
  console.log("🔍 checkAllowances: Warm storage balance:", warmStorageBalance);
  console.log("🔍 checkAllowances: Min days threshold:", minDaysThreshold);
  console.log("🔍 checkAllowances: Include dataset creation fee:", includeDataSetCreationFee);
  
  // Calculate the rate needed per epoch
  const rateNeeded = warmStorageBalance.costs.perEpoch;
  console.log("🔍 checkAllowances: Rate needed per epoch:", rateNeeded.toString());

  // Calculate daily lockup requirements
  const lockupPerDay = TIME_CONSTANTS.EPOCHS_PER_DAY * rateNeeded;
  console.log("🔍 checkAllowances: Lockup per day:", lockupPerDay.toString());

  // Calculate remaining lockup and persistence days
  const currentLockupRemaining =
    warmStorageBalance.currentLockupAllowance -
    warmStorageBalance.currentLockupUsed;
  console.log("🔍 checkAllowances: Current lockup remaining:", currentLockupRemaining.toString());

  // Calculate total allowance needed including dataset creation fee if required
  const dataSetCreationFee = includeDataSetCreationFee
    ? DATA_SET_CREATION_FEE
    : BigInt(0);

  // Use available properties for lockup and deposit
  const totalLockupNeeded = warmStorageBalance.lockupAllowanceNeeded;
  const depositNeeded = warmStorageBalance.depositAmountNeeded;

  // Use the greater of current or needed rate allowance
  const rateAllowanceNeeded =
    warmStorageBalance.currentRateAllowance >
    warmStorageBalance.rateAllowanceNeeded
      ? warmStorageBalance.currentRateAllowance
      : warmStorageBalance.rateAllowanceNeeded;

  // Add dataset creation fee to lockup and deposit if needed
  const lockupAllowanceNeeded = totalLockupNeeded + dataSetCreationFee;
  const depositAmountNeeded = depositNeeded + dataSetCreationFee;

  // Check if lockup balance is sufficient for dataset creation
  const isLockupBalanceSufficientForDataSetCreation =
    currentLockupRemaining >= lockupAllowanceNeeded;

  // Calculate how many days of persistence are left
  const persistenceDaysLeft =
    Number(currentLockupRemaining) / Number(lockupPerDay);

  // Determine sufficiency of allowances
  const isRateSufficient =
    warmStorageBalance.currentRateAllowance >= rateAllowanceNeeded;
  // Lockup is sufficient if enough days remain and enough for dataset creation
  const isLockupSufficient =
    persistenceDaysLeft >= Number(minDaysThreshold) &&
    isLockupBalanceSufficientForDataSetCreation;
  // Both must be sufficient
  const isSufficient = isRateSufficient && isLockupSufficient;

  console.log("🔍 checkAllowances: Final check result:");
  console.log("🔍 checkAllowances: isRateSufficient:", isRateSufficient);
  console.log("🔍 checkAllowances: isLockupSufficient:", isLockupSufficient);
  console.log("🔍 checkAllowances: isSufficient:", isSufficient);
  console.log("🔍 checkAllowances: rateAllowanceNeeded:", rateAllowanceNeeded.toString());
  console.log("🔍 checkAllowances: lockupAllowanceNeeded:", lockupAllowanceNeeded.toString());
  console.log("🔍 checkAllowances: depositAmountNeeded:", depositAmountNeeded.toString());
  console.log("🔍 checkAllowances: persistenceDaysLeft:", persistenceDaysLeft);

  // Return detailed sufficiency and allowance info
  return {
    isSufficient, // true if both rate and lockup are sufficient
    isLockupSufficient, // true if lockup is sufficient
    isRateSufficient, // true if rate is sufficient
    rateAllowanceNeeded, // rate allowance required
    lockupAllowanceNeeded, // lockup allowance required
    depositAmountNeeded, // deposit required
    currentLockupRemaining, // current lockup remaining
    lockupPerDay, // lockup needed per day
    persistenceDaysLeft, // days of persistence left
  };
};
