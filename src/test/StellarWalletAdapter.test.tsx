import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StellarWalletAdapter, useWallet } from "../index";

function WalletControls() {
  const { openModal } = useWallet();
  return <button onClick={openModal}>open wallets</button>;
}

describe("StellarWalletAdapter public component", () => {
  it("provides the wallet context and displays its connection modal", () => {
    render(
      <StellarWalletAdapter autoConnect={false}>
        <WalletControls />
      </StellarWalletAdapter>
    );

    fireEvent.click(screen.getByRole("button", { name: "open wallets" }));

    expect(
      screen.getByRole("dialog", { name: /connect a wallet/i })
    ).toBeInTheDocument();
  });
});
