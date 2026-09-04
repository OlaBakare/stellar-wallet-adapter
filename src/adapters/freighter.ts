import type { WalletAdapter } from "../types";

const FREIGHTER_NETWORK_MAP: Record<string, string> = {
  PUBLIC: "PUBLIC",
  TESTNET: "TESTNET",
  FUTURENET: "FUTURENET",
};

export const freighterAdapter: WalletAdapter = {
  id: "freighter",
  name: "Freighter",
  icon: "https://freighter.app/logo.svg",

  isAvailable: async () => {
    if (typeof window === "undefined") return false;
    try {
      const { isConnected } = await import("@stellar/freighter-api");
      const result = await isConnected();
      return result.isConnected || !!window.freighter;
    } catch {
      return !!(window as any).freighter;
    }
  },

  connect: async () => {
    const { requestAccess } = await import("@stellar/freighter-api");
    const result = await requestAccess();
    if (result.error) throw new Error(result.error);
    return result.address;
  },

  disconnect: async () => {
    // Freighter does not expose a disconnect API.
    // Authorization is managed in the extension's Allow List.
    // We clear local state to simulate disconnection.
  },

  getAddress: async () => {
    const { getAddress } = await import("@stellar/freighter-api");
    const result = await getAddress();
    if (result.error) throw new Error(result.error);
    return result.address;
  },

  signTransaction: async (xdr: string, networkPassphrase: string) => {
    const { signTransaction } = await import("@stellar/freighter-api");
    const result = await signTransaction(xdr, { networkPassphrase });
    if (result.error) throw new Error(result.error);
    return result.signedTxXdr;
  },

  signMessage: async (message: string, address: string) => {
    const { signMessage } = await import("@stellar/freighter-api");
    const result = await signMessage(message, { address });
    if (result.error) throw new Error(result.error);
    if (typeof result.signedMessage === "string") return result.signedMessage;
    if (result.signedMessage instanceof Uint8Array) {
      // V3 API returns a Buffer — normalize to a base64 string
      return Buffer.from(result.signedMessage).toString("base64");
    }
    return result.signedMessage ?? "";
  },

  getNetwork: async () => {
    const { getNetwork } = await import("@stellar/freighter-api");
    const result = await getNetwork();
    if (result.error) throw new Error(result.error);
    return {
      network: FREIGHTER_NETWORK_MAP[result.network] ?? result.network,
      networkPassphrase: result.networkPassphrase,
    };
  },
};
