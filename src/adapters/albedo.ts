import { createKitAdapter } from "./createKitAdapter";

/**
 * Albedo adapter — delegates to the official Stellar Wallets Kit's
 * AlbedoModule (a web/popup based wallet, so it does not require an
 * installed extension).
 */
export const albedoAdapter = createKitAdapter({
  id: "albedo",
  name: "Albedo",
  icon: "https://albedo.link/favicon.ico",
  module: () =>
    import("@creit.tech/stellar-wallets-kit/modules/albedo").then(
      (m) => new m.AlbedoModule()
    ),
  availableCheck: async () => {
    if (typeof window === "undefined") return false;
    try {
      const albedo = (await import("@albedo-link/intent")).default;
      return typeof albedo?.publicKey === "function";
    } catch {
      return false;
    }
  },
});
