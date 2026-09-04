import type { FC, ReactNode } from "react";
import { ConnectModal } from "./components/ConnectModal";
import { useWallet } from "./hooks/useWallet";
import { WalletProvider } from "./context/WalletContext";
import type { StellarNetwork } from "./types";

export interface StellarWalletAdapterProps {
  children: ReactNode;
  defaultNetwork?: StellarNetwork;
  autoConnect?: boolean;
}

/**
 * Convenience component that wraps children in the WalletProvider and
 * automatically renders the ConnectModal bound to the provider's state.
 */
export const StellarWalletAdapter: FC<StellarWalletAdapterProps> = ({
  children,
  defaultNetwork,
  autoConnect = true,
}) => {
  return (
    <WalletProvider defaultNetwork={defaultNetwork} autoConnect={autoConnect}>
      <ConnectedModalBoundary>{children}</ConnectedModalBoundary>
    </WalletProvider>
  );
};

const ConnectedModalBoundary: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    isModalOpen,
    closeModal,
    wallets,
    connect,
    isConnecting,
    activeWallet,
    error,
  } = useWallet();

  return (
    <>
      {children}
      <ConnectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        wallets={wallets}
        onSelectWallet={(id) => void connect(id)}
        isConnecting={isConnecting}
        connectingWalletId={activeWallet?.id ?? null}
        error={error}
      />
    </>
  );
};

export { WalletProvider, useWallet, ConnectModal };
