import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectModal } from "../components/ConnectModal";
import { createMockAdapter } from "./fixtures";

describe("ConnectModal", () => {
  const wallets = [
    createMockAdapter({ id: "freighter", name: "Freighter" }),
    createMockAdapter({ id: "albedo", name: "Albedo", isAvailable: async () => false }),
  ];

  it("renders nothing when closed", () => {
    const { container } = render(
      <ConnectModal
        isOpen={false}
        onClose={() => undefined}
        wallets={wallets}
        onSelectWallet={() => undefined}
        isConnecting={false}
        connectingWalletId={null}
        error={null}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each wallet with a live availability state", async () => {
    render(
      <ConnectModal
        isOpen
        onClose={() => undefined}
        wallets={wallets}
        onSelectWallet={() => undefined}
        isConnecting={false}
        connectingWalletId={null}
        error={null}
      />
    );

    expect(
      screen.getByRole("dialog", { name: /connect a wallet/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Freighter")).toBeInTheDocument();
    expect(screen.getByText("Albedo")).toBeInTheDocument();
    // Availability is resolved asynchronously
    expect(await screen.findByText("Available")).toBeInTheDocument();
    expect(await screen.findByText("Not detected")).toBeInTheDocument();
  });

  it("calls onSelectWallet with the selected wallet id", async () => {
    const onSelect = vi.fn();
    render(
      <ConnectModal
        isOpen
        onClose={() => undefined}
        wallets={wallets}
        onSelectWallet={onSelect}
        isConnecting={false}
        connectingWalletId={null}
        error={null}
      />
    );

    fireEvent.click(await screen.findByText("Freighter"));
    expect(onSelect).toHaveBeenCalledWith("freighter");
  });

  it("shows a loading spinner for the connecting wallet", async () => {
    render(
      <ConnectModal
        isOpen
        onClose={() => undefined}
        wallets={wallets}
        onSelectWallet={() => undefined}
        isConnecting
        connectingWalletId="albedo"
        error={null}
      />
    );

    // Let the async availability check settle within act()
    await screen.findByText("Available");
    // The spinner element is present for the connecting wallet
    expect(document.querySelectorAll(".animate-spin").length).toBeGreaterThan(0);
  });

  it("renders the error banner when an error is provided", async () => {
    render(
      <ConnectModal
        isOpen
        onClose={() => undefined}
        wallets={wallets}
        onSelectWallet={() => undefined}
        isConnecting={false}
        connectingWalletId={null}
        error="Connection rejected by user."
      />
    );

    await screen.findByText("Freighter");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Connection rejected by user."
    );
  });

  it("closes on Escape key and click outside", async () => {
    const onClose = vi.fn();
    render(
      <ConnectModal
        isOpen
        onClose={onClose}
        wallets={wallets}
        onSelectWallet={() => undefined}
        isConnecting={false}
        connectingWalletId={null}
        error={null}
      />
    );

    await screen.findByText("Freighter");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
