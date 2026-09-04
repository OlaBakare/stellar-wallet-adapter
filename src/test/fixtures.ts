import type { WalletAdapter } from "../types";

export const MOCK_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
export const MOCK_ADDRESS_2 = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWHF";

export function createMockAdapter(overrides: Partial<WalletAdapter> = {}): WalletAdapter {
  return {
    id: "mock",
    name: "Mock Wallet",
    icon: "",
    isAvailable: async () => true,
    connect: async () => MOCK_ADDRESS,
    disconnect: async () => undefined,
    getAddress: async () => MOCK_ADDRESS,
    signTransaction: async (xdr, passphrase) => `signed:${xdr}:${passphrase}`,
    signMessage: async () => "mock-signature",
    getNetwork: async () => ({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    }),
    ...overrides,
  };
}

export function createFailingAdapter(
  failOn: "connect" | "sign" = "connect"
): WalletAdapter {
  return createMockAdapter({
    ...(failOn === "connect"
      ? { connect: async () => { throw new Error("Connection rejected by user."); } }
      : {
          signMessage: async () => {
            throw new Error("Message signing rejected.");
          },
        }),
  });
}
