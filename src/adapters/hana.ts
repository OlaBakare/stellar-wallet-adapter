import type { WalletAdapter } from "../types";
import { NETWORK_PASSPHRASES } from "../constants";

/**
 * Hana adapter.
 *
 * Hana is injected into the page as a Freighter-compatible provider when its
 * Desktop extension is installed. Where the native injection is unavailable we
 * fall back to the official `@creit.tech/stellar-wallets-kit` HanaModule.
 */
export const hanaAdapter: WalletAdapter = {
  id: "hana",
  name: "Hana",
  icon: "https://hanawallet.io/favicon.ico",

  isAvailable: async () => {
    if (typeof window === "undefined") return false;
    try {
      if ((window as any).hana?.stellar) return true;
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );
      typeof StellarWalletsKit === "function";
      try {
        const { HanaModule } = await import(
          "@creit.tech/stellar-wallets-kit/modules/hana"
        );
        const moduleInstance = new HanaModule();
        return await moduleInstance.isAvailable();
      } catch {
        return false;
      }
    } catch {
      return !!(window as any).hana?.stellar;
    }
  },

  connect: async () => {
    try {
      const address = await getHanaAddress();
      if (!address) throw new Error("Failed to retrieve Hana address.");
      return address;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to connect to Hana wallet"
      );
    }
  },

  disconnect: async () => {
    // Hana uses extension injection — no explicit disconnect API.
  },

  getAddress: async () => {
    try {
      return await getHanaAddress();
    } catch {
      return "";
    }
  },

  signTransaction: async (xdr: string, networkPassphrase: string) => {
    try {
      if ((window as any).hana?.stellar) {
        const hana = (window as any).hana.stellar;
        const result = await hana.signTransaction(xdr, { networkPassphrase });
        if (result.error) throw new Error(result.error);
        return result.signedTxXdr;
      }
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );
      const { HanaModule } = await import(
        "@creit.tech/stellar-wallets-kit/modules/hana"
      );
      StellarWalletsKit.init({ modules: [new HanaModule()] });
      const result = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase,
      });
      return result.signedTxXdr;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to sign transaction"
      );
    }
  },

  signMessage: async (message: string, address: string) => {
    try {
      if ((window as any).hana?.stellar) {
        const hana = (window as any).hana.stellar;
        const result = await hana.signMessage(message, { address });
        if (result.error) throw new Error(result.error);
        return result.signedMessage ?? "";
      }
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );
      const { HanaModule } = await import(
        "@creit.tech/stellar-wallets-kit/modules/hana"
      );
      StellarWalletsKit.init({ modules: [new HanaModule()] });
      const result = await StellarWalletsKit.signMessage(message, { address });
      return result.signedMessage ?? "";
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to sign message"
      );
    }
  },

  getNetwork: async () => {
    try {
      if ((window as any).hana?.stellar) {
        const hana = (window as any).hana.stellar;
        const result = await hana.getNetwork();
        if (result.error) throw new Error(result.error);
        return {
          network: result.network,
          networkPassphrase: result.networkPassphrase,
        };
      }
      return {
        network: "TESTNET",
        networkPassphrase: NETWORK_PASSPHRASES.TESTNET,
      };
    } catch {
      return {
        network: "TESTNET",
        networkPassphrase: NETWORK_PASSPHRASES.TESTNET,
      };
    }
  },
};

async function getHanaAddress(): Promise<string> {
  if ((window as any).hana?.stellar) {
    const hana = (window as any).hana.stellar;
    const result = await hana.requestAccess();
    if (result.error) throw new Error(result.error);
    return result.address;
  }
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  const { HanaModule, HANA_ID } = await import(
    "@creit.tech/stellar-wallets-kit/modules/hana"
  );
  StellarWalletsKit.init({ modules: [new HanaModule()] });
  StellarWalletsKit.setWallet(HANA_ID);
  const result = await StellarWalletsKit.fetchAddress();
  return result.address;
}
