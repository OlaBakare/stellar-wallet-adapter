import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { WalletProvider, useWallet } from "../context/WalletContext";
import {
  createMockAdapter,
  createFailingAdapter,
  MOCK_ADDRESS,
} from "./fixtures";

function Consumer() {
  const {
    walletAddress,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
  } = useWallet();

  return (
    <div>
      <p data-testid="address">{walletAddress || "none"}</p>
      <p data-testid="connected">{String(isConnected)}</p>
      <p data-testid="connecting">{String(isConnecting)}</p>
      <p data-testid="error">{error ?? "none"}</p>
      <button onClick={() => void connect("mock").catch(() => undefined)}>connect-mock</button>
      <button onClick={() => void connect("missing").catch(() => undefined)}>connect-missing</button>
      <button onClick={() => void disconnect()}>disconnect</button>
      <button onClick={() => void signMessage("hi").catch(() => undefined)}>sign</button>
    </div>
  );
}

describe("WalletProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes an initially disconnected state", () => {
    render(
      <WalletProvider wallets={[createMockAdapter()]} autoConnect={false}>
        <Consumer />
      </WalletProvider>
    );

    expect(screen.getByTestId("address")).toHaveTextContent("none");
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
    expect(screen.getByTestId("connecting")).toHaveTextContent("false");
  });

  it("connects, stores the address, and persists to localStorage", async () => {
    render(
      <WalletProvider wallets={[createMockAdapter()]} autoConnect={false}>
        <Consumer />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText("connect-mock"));

    await waitFor(() =>
      expect(screen.getByTestId("address")).toHaveTextContent(MOCK_ADDRESS)
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("true");
    expect(localStorage.getItem("stellar-wallet-adapter:address")).toBe(
      MOCK_ADDRESS
    );
  });

  it("disconnects and clears persisted state", async () => {
    render(
      <WalletProvider wallets={[createMockAdapter()]} autoConnect={false}>
        <Consumer />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText("connect-mock"));
    await waitFor(() =>
      expect(screen.getByTestId("connected")).toHaveTextContent("true")
    );

    fireEvent.click(screen.getByText("disconnect"));
    await waitFor(() =>
      expect(screen.getByTestId("connected")).toHaveTextContent("false")
    );
    expect(localStorage.getItem("stellar-wallet-adapter:address")).toBeNull();
  });

  it("surfaces an error on rejected connection", async () => {
    render(
      <WalletProvider wallets={[createFailingAdapter("connect")]} autoConnect={false}>
        <Consumer />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText("connect-mock"));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Connection rejected by user."
      )
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });

  it("auto-reconnects from localStorage on mount", async () => {
    localStorage.setItem("stellar-wallet-adapter:walletId", "mock");
    localStorage.setItem("stellar-wallet-adapter:address", MOCK_ADDRESS);

    const adapter = createMockAdapter();
    const getAddressSpy = vi.spyOn(adapter, "getAddress");

    render(
      <WalletProvider wallets={[adapter]} autoConnect>
        <Consumer />
      </WalletProvider>
    );

    await waitFor(() =>
      expect(getAddressSpy).toHaveBeenCalled()
    );
    await waitFor(() =>
      expect(screen.getByTestId("connected")).toHaveTextContent("true")
    );
    expect(screen.getByTestId("address")).toHaveTextContent(MOCK_ADDRESS);
  });

  it("throws a descriptive error when signing while disconnected", async () => {
    const { useWallet } = await import("../context/WalletContext");
    const signSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let capturedError = "";

    function SignConsumer() {
      const { signMessage } = useWallet();
      return (
        <button
          onClick={() =>
            void signMessage("x").catch((e: Error) => {
              capturedError = e.message;
            })
          }
        >
          sign
        </button>
      );
    }

    render(
      <WalletProvider wallets={[createMockAdapter()]} autoConnect={false}>
        <SignConsumer />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText("sign"));
    await vi.waitFor(() => expect(capturedError).toBe("Wallet is not connected."));
    signSpy.mockRestore();
  });
});
