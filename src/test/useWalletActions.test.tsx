import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WalletProvider } from "../context/WalletContext";
import { useWalletActions } from "../hooks/useWallet";
import { createMockAdapter, createFailingAdapter, MOCK_ADDRESS } from "./fixtures";
import type { ReactNode } from "react";

function wrapper(wallets: ReturnType<typeof createMockAdapter>[]) {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    );
  };
}

describe("useWalletActions", () => {
  it("toggles actionLoading during connect and clears it after", async () => {
    let resolveConnect: (address: string) => void = () => undefined;
    const adapter = createMockAdapter({
      connect: () =>
        new Promise<string>((resolve) => {
          resolveConnect = resolve;
        }),
    });

    const { result } = renderHook(() => useWalletActions(), {
      wrapper: wrapper([adapter]),
    });

    expect(result.current.actionLoading).toBe(false);

    let pending = true;
    act(() => {
      void result.current.connect("mock").then(() => {
        pending = false;
      });
    });

    expect(result.current.actionLoading).toBe(true);

    await act(async () => {
      resolveConnect(MOCK_ADDRESS);
    });

    expect(pending).toBe(false);
    expect(result.current.actionLoading).toBe(false);
    expect(result.current.walletAddress).toBe(MOCK_ADDRESS);
    expect(result.current.isConnected).toBe(true);
  });

  it("captures connection errors into actionError", async () => {
    const { result } = renderHook(() => useWalletActions(), {
      wrapper: wrapper([createFailingAdapter("connect")]),
    });

    let resolved = false;
    await act(async () => {
      await result.current.connect("mock");
      resolved = true;
    });

    expect(resolved).toBe(true);
    expect(result.current.actionError).toBe("Connection rejected by user.");
    expect(result.current.isConnected).toBe(false);
  });
});
