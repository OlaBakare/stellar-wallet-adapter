import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FC } from "react";
import {
  type StellarNetwork,
  type WalletAdapter,
  type WalletContextValue,
  type WalletProviderProps,
} from "../types";
import { freighterAdapter } from "../adapters/freighter";
import { albedoAdapter } from "../adapters/albedo";
import { hanaAdapter } from "../adapters/hana";
import { DEFAULT_NETWORK, NETWORK_PASSPHRASES, STORAGE_KEYS } from "../constants";

const WalletContext = createContext<WalletContextValue | null>(null);

const DEFAULT_WALLETS: WalletAdapter[] = [
  freighterAdapter,
  albedoAdapter,
  hanaAdapter,
];

export const WalletProvider: FC<WalletProviderProps> = ({
  children,
  defaultNetwork = DEFAULT_NETWORK,
  autoConnect = true,
}) => {
  const [wallets] = useState<WalletAdapter[]>(DEFAULT_WALLETS);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activeWallet, setActiveWallet] = useState<WalletAdapter | null>(null);
  const [activeChain, setActiveChainState] = useState<StellarNetwork>(
    defaultNetwork
  );
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const autoConnectAttempted = useRef(false);

  const setActiveChain = useCallback((chain: StellarNetwork) => {
    setActiveChainState(chain);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NETWORK, chain);
    }
  }, []);

  const connect = useCallback(
    async (walletId: string) => {
      if (isConnecting) return;
      const wallet =
        wallets.find((w) => w.id === walletId) ?? activeWallet ?? null;
      if (!wallet) {
        setError("Select a wallet to connect.");
        return;
      }
      setIsConnecting(true);
      setError(null);
      try {
        const address = await wallet.connect();
        setWalletAddress(address);
        setIsConnected(true);
        setActiveWallet(wallet);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.WALLET_ID, wallet.id);
          localStorage.setItem(STORAGE_KEYS.ADDRESS, address);
        }
        setIsModalOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Connection rejected by user.";
        setError(message);
        setIsConnected(false);
        setWalletAddress("");
        setActiveWallet(null);
      } finally {
        setIsConnecting(false);
      }
    },
    // activeWallet intentionally omitted to avoid stale reference in auto-reconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnecting, wallets]
  );

  const disconnect = useCallback(async () => {
    try {
      await activeWallet?.disconnect();
    } catch {
      // best-effort disconnect
    }
    setWalletAddress("");
    setIsConnected(false);
    setActiveWallet(null);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ID);
      localStorage.removeItem(STORAGE_KEYS.ADDRESS);
    }
  }, [activeWallet]);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!isConnected || !activeWallet) {
        throw new Error("Wallet is not connected.");
      }
      try {
        return await activeWallet.signTransaction(
          xdr,
          NETWORK_PASSPHRASES[activeChain]
        );
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Transaction signing rejected."
        );
      }
    },
    [isConnected, activeWallet, activeChain]
  );

  const signMessage = useCallback(
    async (message: string) => {
      if (!isConnected || !activeWallet || !walletAddress) {
        throw new Error("Wallet is not connected.");
      }
      try {
        return await activeWallet.signMessage(message, walletAddress);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Message signing rejected."
        );
      }
    },
    [isConnected, activeWallet, walletAddress]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const autoReconnect = useCallback(async () => {
    if (typeof window === "undefined" || autoConnectAttempted.current) return;
    autoConnectAttempted.current = true;

    const storedWalletId = localStorage.getItem(STORAGE_KEYS.WALLET_ID);
    const storedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
    const storedNetwork = localStorage.getItem(
      STORAGE_KEYS.NETWORK
    ) as StellarNetwork | null;

    if (storedNetwork && (storedNetwork === "PUBLIC" || storedNetwork === "TESTNET" || storedNetwork === "FUTURENET")) {
      setActiveChainState(storedNetwork);
    }

    if (!storedWalletId || !storedAddress) return;

    const wallet = wallets.find((w) => w.id === storedWalletId);
    if (!wallet) return;

    setIsConnecting(true);
    try {
      const available = await wallet.isAvailable();
      if (!available) {
        setError("Wallet extension not installed. Please install it and try again.");
        return;
      }
      const address = await wallet.getAddress();
      if (!address) {
        setError("Wallet is locked or unauthorized.");
        return;
      }
      setWalletAddress(address);
      setIsConnected(true);
      setActiveWallet(wallet);
    } catch {
      setError("Auto-reconnect failed. Please reconnect manually.");
    } finally {
      setIsConnecting(false);
    }
  }, [wallets, setActiveChainState]);

  useEffect(() => {
    if (autoConnect) {
      void autoReconnect();
    } else {
      autoConnectAttempted.current = true;
    }
  }, [autoConnect, autoReconnect]);

  const value = useMemo<WalletContextValue>(
    () => ({
      walletAddress,
      isConnected,
      isConnecting,
      activeWallet,
      activeChain,
      error,
      wallets,
      connect,
      disconnect,
      signTransaction,
      signMessage,
      setActiveChain,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [
      walletAddress,
      isConnected,
      isConnecting,
      activeWallet,
      activeChain,
      error,
      wallets,
      connect,
      disconnect,
      signTransaction,
      signMessage,
      setActiveChain,
      isModalOpen,
      openModal,
      closeModal,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider.");
  }
  return context;
}

export { WalletContext };
