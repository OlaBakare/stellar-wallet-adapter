import { createKitAdapter } from "./createKitAdapter";

/**
 * Freighter adapter — delegates to the official Stellar Wallets Kit's
 * FreighterModule so wallet behaviour stays aligned with the ecosystem
 * standard.
 */
export const freighterAdapter = createKitAdapter({
  id: "freighter",
  name: "Freighter",
  icon: "https://freighter.app/logo.svg",
  module: () =>
    import("@creit.tech/stellar-wallets-kit/modules/freighter").then(
      (m) => new m.FreighterModule()
    ),
  availableCheck: async () => {
    if (typeof window === "undefined") return false;
    if (window.freighter) return true;
    try {
      const { isConnected } = await import("@stellar/freighter-api");
      const res = await isConnected();
      return res.isConnected;
    } catch {
      return false;
    }
  },
});
