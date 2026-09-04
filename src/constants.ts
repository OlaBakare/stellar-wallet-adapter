import type { StellarNetwork } from "./types";

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  PUBLIC: "Public Global Stellar Network ; September 2015",
  TESTNET: "Test SDF Network ; September 2015",
  FUTURENET: "Future Stellar Network ; September 2022",
};

export const STORAGE_KEYS = {
  WALLET_ID: "stellar-wallet-adapter:walletId",
  ADDRESS: "stellar-wallet-adapter:address",
  NETWORK: "stellar-wallet-adapter:network",
} as const;

export const DEFAULT_NETWORK: StellarNetwork = "TESTNET";
