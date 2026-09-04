import type { WalletAdapter } from "../types";

export const albedoAdapter: WalletAdapter = {
  id: "albedo",
  name: "Albedo",
  icon: "https://albedo.link/favicon.ico",

  isAvailable: async () => {
    if (typeof window === "undefined") return false;
    try {
      const albedo = await import("@albedo-link/intent");
      // Albedo uses a popup model — it is always "available" in a browser.
      // We check if the library loaded successfully.
      return typeof albedo.default?.publicKey === "function";
    } catch {
      return false;
    }
  },

  connect: async () => {
    const albedo = (await import("@albedo-link/intent")).default;
    const result = await albedo.publicKey({});
    return result.pubkey;
  },

  disconnect: async () => {
    // Albedo uses implicit sessions. Clear any stored session data.
    try {
      // Remove stored pubkey references
      localStorage.removeItem("albedo_pubkey");
    } catch {
      // Silent fail
    }
  },

  getAddress: async () => {
    const stored = localStorage.getItem("albedo_pubkey");
    if (stored) return stored;
    const albedo = (await import("@albedo-link/intent")).default;
    const result = await albedo.publicKey({});
    return result.pubkey;
  },

  signTransaction: async (xdr: string, networkPassphrase: string) => {
    const albedo = (await import("@albedo-link/intent")).default;
    const network =
      networkPassphrase.includes("PUBLIC")
        ? "public"
        : "testnet";
    const result = await albedo.tx({ xdr, network });
    return result.signed_envelope_xdr;
  },

  signMessage: async (message: string) => {
    const albedo = (await import("@albedo-link/intent")).default;
    const result = await albedo.signMessage({ message });
    return result.message_signature;
  },

  getNetwork: async () => {
    // Albedo doesn't expose a standalone network getter.
    // Default to testnet; consumers should set via provider.
    return { network: "testnet", networkPassphrase: "Test SDF Network ; September 2015" };
  },
};
