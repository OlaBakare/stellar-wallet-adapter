declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean; error?: string }>;
      requestAccess: () => Promise<{ address: string; error?: string }>;
      getAddress: () => Promise<{ address: string; error?: string }>;
      signTransaction: (
        xdr: string,
        opts?: { networkPassphrase?: string; network?: string }
      ) => Promise<{ signedTxXdr: string; error?: string }>;
      signMessage: (
        message: string,
        opts: { address: string }
      ) => Promise<{ signedMessage: string | null; error?: string }>;
      signAuthEntry: (entryXdr: string, opts: { address: string }) => Promise<{
        signedAuthEntry: string | null;
        error?: string;
      }>;
      getNetwork: () => Promise<{
        network: string;
        networkPassphrase: string;
        error?: string;
      }>;
      getNetworkDetails: () => Promise<{
        network: string;
        networkUrl: string;
        networkPassphrase: string;
        sorobanRpcUrl?: string;
        error?: string;
      }>;
      setAllowed: () => Promise<{ isAllowed: boolean; error?: string }>;
      isAllowed: () => Promise<{ isAllowed: boolean; error?: string }>;
    };
  }
}

export {};
