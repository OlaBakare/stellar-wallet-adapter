import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";
import type { WalletAdapter } from "../types";
import {
  ensureKitInitialized,
  kitDisconnect,
  kitGetAddress,
  kitGetNetwork,
  kitSignMessage,
  kitSignTransaction,
  selectKitWallet,
} from "../kit/kit-manager";
import { NETWORK_PASSPHRASES } from "../constants";

export interface KitAdapterConfig {
  id: string;
  name: string;
  icon: string;
  module: () => Promise<ModuleInterface>;
  availableCheck?: () => Promise<boolean>;
}

/**
 * Builds a `WalletAdapter` that delegates to the official Stellar Wallets Kit.
 *
 * All wallet communication (connect, signing, network) is handled by the
 * ecosystem-standard kit; this adapter only maps the kit's module to our
 * uniform `WalletAdapter` contract used by the React layer.
 */
export function createKitAdapter(config: KitAdapterConfig): WalletAdapter {
  const loadModule = async (): Promise<ModuleInterface> => {
    const mod = await config.module();
    ensureKitInitialized([mod]);
    return mod;
  };

  return {
    id: config.id,
    name: config.name,
    icon: config.icon,

    isAvailable: async () => {
      if (typeof window === "undefined") return false;
      try {
        if (config.availableCheck) {
          return await config.availableCheck();
        }
        const mod = await loadModule();
        return await mod.isAvailable();
      } catch {
        return false;
      }
    },

    connect: async () => {
      await loadModule();
      await selectKitWallet(config.id);
      const address = await kitGetAddress();
      if (!address) {
        throw new Error(
          `Could not read an address from ${config.name}. Is the wallet unlocked and authorized?`
        );
      }
      return address;
    },

    disconnect: () => {
      // Extension wallets (Freighter/Hana) manage their own sessions.
      // We clear kit state to reflect a logical disconnect.
      return kitDisconnect().catch(() => undefined);
    },

    getAddress: () => kitGetAddress().catch(() => ""),

    signTransaction: (xdr: string, networkPassphrase: string) =>
      kitSignTransaction(xdr, networkPassphrase),

    signMessage: (message: string, address: string) =>
      kitSignMessage(message, address, NETWORK_PASSPHRASES.TESTNET),

    getNetwork: () => kitGetNetwork(),
  };
}
