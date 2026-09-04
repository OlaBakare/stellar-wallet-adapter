export type StellarNetwork = "PUBLIC" | "TESTNET" | "FUTURENET";

export interface WalletAdapter {
  id: string;
  name: string;
  icon: string;
  isAvailable: () => Promise<boolean> | boolean;
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  getAddress: () => Promise<string>;
  signTransaction: (xdr: string, networkPassphrase: string) => Promise<string>;
  signMessage: (message: string, address: string) => Promise<string>;
  getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
}

export interface WalletState {
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  activeWallet: WalletAdapter | null;
  activeChain: StellarNetwork;
  error: string | null;
}

export interface WalletContextValue extends WalletState {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  setActiveChain: (chain: StellarNetwork) => void;
  wallets: WalletAdapter[];
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export interface WalletProviderProps {
  children: React.ReactNode;
  defaultNetwork?: StellarNetwork;
  autoConnect?: boolean;
}

export interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletAdapter[];
  onSelectWallet: (walletId: string) => void;
  isConnecting: boolean;
  connectingWalletId: string | null;
  error: string | null;
}
