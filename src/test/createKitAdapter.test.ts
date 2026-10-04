import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";

const kitCalls = vi.hoisted(() => ({
  ensureKitInitialized: vi.fn(async () => undefined),
  kitDisconnect: vi.fn(async () => undefined),
  kitGetAddress: vi.fn(async () => "GADDRESS"),
  kitGetNetwork: vi.fn(async () => ({
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
  })),
  kitSignMessage: vi.fn(async () => "signature"),
  kitSignTransaction: vi.fn(async () => "signed-xdr"),
  selectKitWallet: vi.fn(async () => undefined),
  moduleIsAvailable: vi.fn(async () => true),
}));

vi.mock("../kit/kit-manager", () => kitCalls);

describe("createKitAdapter", () => {
  let createKitAdapter: typeof import("../adapters/createKitAdapter").createKitAdapter;

  const walletModule = {
    productId: "test-wallet",
    isAvailable: kitCalls.moduleIsAvailable,
  } as unknown as ModuleInterface;

  beforeEach(async () => {
    vi.clearAllMocks();
    kitCalls.kitGetAddress.mockResolvedValue("GADDRESS");
    kitCalls.ensureKitInitialized.mockResolvedValue(undefined);
    createKitAdapter = (await import("../adapters/createKitAdapter"))
      .createKitAdapter;
  });

  function createAdapter(availableCheck?: () => Promise<boolean>) {
    return createKitAdapter({
      id: "test-wallet",
      name: "Test Wallet",
      icon: "",
      module: async () => walletModule,
      availableCheck,
    });
  }

  it("checks availability through the module and handles unavailable modules", async () => {
    const adapter = createAdapter();
    expect(await adapter.isAvailable()).toBe(true);

    kitCalls.moduleIsAvailable.mockRejectedValueOnce(
      new Error("Wallet detection failed.")
    );
    expect(await adapter.isAvailable()).toBe(false);
  });

  it("uses the configured availability check", async () => {
    const availableCheck = vi.fn(async () => true);
    const adapter = createAdapter(availableCheck);

    expect(await adapter.isAvailable()).toBe(true);
    expect(availableCheck).toHaveBeenCalledOnce();
    expect(kitCalls.ensureKitInitialized).not.toHaveBeenCalled();
  });

  it("initializes and selects its module and requested network before connecting", async () => {
    const adapter = createAdapter();
    expect(await adapter.connect("PUBLIC")).toBe("GADDRESS");

    expect(kitCalls.ensureKitInitialized).toHaveBeenCalledWith([walletModule]);
    expect(kitCalls.selectKitWallet).toHaveBeenCalledWith(
      "test-wallet",
      "PUBLIC"
    );
    expect(kitCalls.kitGetAddress).toHaveBeenCalledOnce();
  });

  it("rejects connection when the kit returns no address", async () => {
    kitCalls.kitGetAddress.mockResolvedValueOnce("");

    await expect(createAdapter().connect()).rejects.toThrow(
      "Could not read an address from Test Wallet."
    );
  });

  it("prepares the kit when reading an address for auto-reconnect", async () => {
    const adapter = createAdapter();

    expect(await adapter.getAddress("FUTURENET")).toBe("GADDRESS");
    expect(kitCalls.ensureKitInitialized).toHaveBeenCalledWith([walletModule]);
    expect(kitCalls.selectKitWallet).toHaveBeenCalledWith(
      "test-wallet",
      "FUTURENET"
    );
  });

  it("forwards signing, network, and disconnect operations", async () => {
    const adapter = createAdapter();
    expect(
      await adapter.signTransaction(
        "unsigned-xdr",
        "Public Global Stellar Network ; September 2015"
      )
    ).toBe("signed-xdr");
    expect(
      await adapter.signMessage(
        "hello",
        "GADDRESS",
        "Public Global Stellar Network ; September 2015"
      )
    ).toBe("signature");
    expect(await adapter.getNetwork()).toEqual({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    await adapter.disconnect();

    expect(kitCalls.kitSignTransaction).toHaveBeenCalledWith(
      "unsigned-xdr",
      "Public Global Stellar Network ; September 2015"
    );
    expect(kitCalls.kitSignMessage).toHaveBeenCalledWith(
      "hello",
      "GADDRESS",
      "Public Global Stellar Network ; September 2015"
    );
    expect(kitCalls.kitGetNetwork).toHaveBeenCalledOnce();
    expect(kitCalls.kitDisconnect).toHaveBeenCalledOnce();
  });
});
