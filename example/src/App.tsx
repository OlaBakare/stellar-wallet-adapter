import { useState } from "react";
import { StellarWalletAdapter, useWallet } from "stellar-wallet-adapter";

/**
 * Interactive example demonstrating the Stellar Wallet Adapter:
 * - Wallet detection + connection via the modal
 * - Auto-reconnect on page load
 * - Message signing
 * - Network switching
 */
function ConnectDemo() {
  const {
    walletAddress,
    isConnected,
    isConnecting,
    activeChain,
    activeWallet,
    error,
    wallets,
    openModal,
    disconnect,
    signMessage,
    setActiveChain,
  } = useWallet();

  const [message, setMessage] = useState("Hello Stellar 👋");
  const [signature, setSignature] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : "";

  const handleSign = async () => {
    setSignError(null);
    setSignature(null);
    setSigning(true);
    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (e) {
      setSignError(e instanceof Error ? e.message : "Signing failed.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="text-sm text-[#B0C4FF] uppercase tracking-widest mb-2">
          Stellar Wallet Adapter
        </p>
        <h1 className="text-3xl font-bold text-white">
          Plug-and-play wallet connection
        </h1>
        <p className="mt-2 text-gray-400">
          Connect Freighter, Albedo, or Hana. Try auto-reconnect, signing, and
          network switching.
        </p>
      </header>

      {/* Status card */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Connection status</p>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? "bg-emerald-400" : "bg-amber-400"
                } ${isConnecting ? "animate-pulse-slow" : ""}`}
              />
              <span className="font-medium text-white">
                {isConnecting
                  ? "Connecting…"
                  : isConnected
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
          </div>

          {isConnected ? (
            <button
              onClick={() => void disconnect()}
              className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={openModal}
              className="px-4 py-2.5 rounded-xl bg-[#0805F6] hover:bg-[#0805F6]/90 text-white font-medium transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {isConnected && activeWallet && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-gray-400 mb-1">Wallet</p>
              <p className="text-white font-medium">{activeWallet.name}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-gray-400 mb-1">Address</p>
              <p className="text-white font-medium font-mono break-all">
                {shortAddress}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-gray-400 mb-1">Active chain</p>
              <p className="text-white font-medium">{activeChain}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-gray-400 mb-1">Detected wallets</p>
              <p className="text-white font-medium">
                {wallets.filter((w) => w.isAvailable).length}/3
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6 text-red-300 text-sm">
          {error}
        </section>
      )}

      {/* Signing demo */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Sign a message
        </h2>
        <div className="flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected || signing}
            rows={3}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#B0C4FF] disabled:opacity-50"
            placeholder="Message to sign"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleSign()}
              disabled={!isConnected || signing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? "Signing…" : "Sign Message"}
            </button>
            {signing && (
              <span className="w-5 h-5 border-2 border-[#B0C4FF] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {signature && (
            <div className="rounded-xl bg-white/5 p-4 text-sm">
              <p className="text-gray-400 mb-1">Signature</p>
              <p className="text-emerald-300 font-mono break-all">{signature}</p>
            </div>
          )}
          {signError && (
            <p className="text-red-300 text-sm">{signError}</p>
          )}
        </div>
      </section>

      {/* Network switch */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Network</h2>
        <div className="flex flex-wrap gap-2">
          {(["TESTNET", "PUBLIC", "FUTURENET"] as const).map((chain) => (
            <button
              key={chain}
              onClick={() => setActiveChain(chain)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeChain === chain
                  ? "bg-[#0805F6] text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <StellarWalletAdapter defaultNetwork="TESTNET" autoConnect>
      <ConnectDemo />
    </StellarWalletAdapter>
  );
}
