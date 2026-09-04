import { useCallback, useState } from "react";
import type { WalletAdapter } from "../types";
import { useWallet } from "../context/WalletContext";

export type UseWalletResult = ReturnType<typeof useWallet>;
export { useWallet };

/**
 * Composes the wallet context with per-action loading state for finer
 * control over asynchronous wallet operations (connect/transaction/message).
 */
export function useWalletActions() {
  const { connect, disconnect, signTransaction, signMessage, ...rest } =
    useWallet();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConnect = useCallback(
    async (walletId: string) => {
      setActionLoading(true);
      setActionError(null);
      try {
        await connect(walletId);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Connection failed."
        );
      } finally {
        setActionLoading(false);
      }
    },
    [connect]
  );

  const handleDisconnect = useCallback(async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await disconnect();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Disconnect failed."
      );
    } finally {
      setActionLoading(false);
    }
  }, [disconnect]);

  const handleSignTransaction = useCallback(
    async (xdr: string) => {
      return signTransaction(xdr);
    },
    [signTransaction]
  );

  const handleSignMessage = useCallback(
    async (message: string) => {
      return signMessage(message);
    },
    [signMessage]
  );

  return {
    ...rest,
    connect: handleConnect,
    disconnect: handleDisconnect,
    signTransaction: handleSignTransaction,
    signMessage: handleSignMessage,
    actionLoading,
    actionError,
  };
}

export type { WalletAdapter };
