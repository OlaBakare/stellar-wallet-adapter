import { createKitAdapter } from "./createKitAdapter";

/**
 * Hana adapter — delegates to the official Stellar Wallets Kit's HanaModule.
 * Falls back to the injected (Freighter-compatible) provider when present.
 */
export const hanaAdapter = createKitAdapter({
  id: "hana",
  name: "Hana",
  icon: "https://hanawallet.io/favicon.ico",
  module: () =>
    import("@creit.tech/stellar-wallets-kit/modules/hana").then(
      (m) => new m.HanaModule()
    ),
  availableCheck: async () => {
    if (typeof window === "undefined") return false;
    if ((window as any).hana?.stellar) return true;
    try {
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );
      const { HanaModule } = await import(
        "@creit.tech/stellar-wallets-kit/modules/hana"
      );
      StellarWalletsKit.init({ modules: [new HanaModule()] });
      StellarWalletsKit.setWallet("hana");
      return await new HanaModule().isAvailable();
    } catch {
      return false;
    }
  },
});
