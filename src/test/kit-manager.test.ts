import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";

const kitMethods = vi.hoisted(() => ({
  init: vi.fn(),
  setWallet: vi.fn(),
  setNetwork: vi.fn(),
  fetchAddress: vi.fn(async () => ({ address: "GADDRESS" })),
  signTransaction: vi.fn(async () => ({ signedTxXdr: "signed-xdr" })),
  signMessage: vi.fn(async () => ({ signedMessage: "signature" })),
  getNetwork: vi.fn(async () => ({
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
  })),
  disconnect: vi.fn(async () => undefined),
}));

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: kitMethods,
}));

describe("Stellar Wallets Kit manager", () => {
  let kitManager: typeof import("../kit/kit-manager");

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    kitManager = await import("../kit/kit-manager");
  });

  it("awaits kit initialization and retains previously registered wallet modules", async () => {
    const freighter = { productId: "freighter" } as ModuleInterface;
    const albedo = { productId: "albedo" } as ModuleInterface;

    await Promise.all([
      kitManager.ensureKitInitialized([freighter]),
      kitManager.ensureKitInitialized([albedo]),
    ]);

    expect(kitMethods.init).toHaveBeenCalledTimes(1);
    expect(kitMethods.init).toHaveBeenCalledWith({
      modules: [freighter, albedo],
    });
  });

  it("reinitializes with the complete module set when a wallet loads later", async () => {
    const freighter = { productId: "freighter" } as ModuleInterface;
    const hana = { productId: "hana" } as ModuleInterface;

    await kitManager.ensureKitInitialized([freighter]);
    await kitManager.ensureKitInitialized([hana]);

    expect(kitMethods.init).toHaveBeenCalledTimes(2);
    expect(kitMethods.init).toHaveBeenLastCalledWith({
      modules: [freighter, hana],
    });
  });

  it("selects the requested network and forwards it for message signing", async () => {
    await kitManager.selectKitWallet("freighter", "PUBLIC");
    await kitManager.kitSignMessage(
      "hello",
      "GADDRESS",
      "Public Global Stellar Network ; September 2015"
    );

    expect(kitMethods.setWallet).toHaveBeenCalledWith("freighter");
    expect(kitMethods.setNetwork).toHaveBeenCalledWith(
      "Public Global Stellar Network ; September 2015"
    );
    expect(kitMethods.signMessage).toHaveBeenCalledWith("hello", {
      address: "GADDRESS",
      networkPassphrase: "Public Global Stellar Network ; September 2015",
    });
  });

  it("forwards account, transaction, network, and disconnect requests", async () => {
    expect(await kitManager.kitGetAddress()).toBe("GADDRESS");
    expect(
      await kitManager.kitSignTransaction(
        "unsigned-xdr",
        "Test SDF Network ; September 2015"
      )
    ).toBe("signed-xdr");
    expect(await kitManager.kitGetNetwork()).toEqual({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    await kitManager.kitDisconnect();

    expect(kitMethods.fetchAddress).toHaveBeenCalledOnce();
    expect(kitMethods.signTransaction).toHaveBeenCalledWith("unsigned-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    expect(kitMethods.getNetwork).toHaveBeenCalledOnce();
    expect(kitMethods.disconnect).toHaveBeenCalledOnce();
  });

  it("can retry module registration after kit initialization fails", async () => {
    const freighter = { productId: "freighter" } as ModuleInterface;
    kitMethods.init.mockImplementationOnce(() => {
      throw new Error("Kit initialization failed.");
    });

    await expect(
      kitManager.ensureKitInitialized([freighter])
    ).rejects.toThrow("Kit initialization failed.");
    await kitManager.ensureKitInitialized([freighter]);

    expect(kitMethods.init).toHaveBeenCalledTimes(2);
  });
});
