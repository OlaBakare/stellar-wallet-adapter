# 🌠 Stellar Wallet Adapter

A **plug-and-play, open-source React UI library and context provider** that unifies native Stellar wallet connections. Connect, disconnect, and sign messages across the top **3 Stellar wallets** — **Freighter**, **Albedo**, and **Hana** — with a single drop-in provider and a beautiful, accessible connection modal.

Built with **TypeScript**, **React 18+**, and **Tailwind CSS**.

---

## ✨ Features

- 🔌 **One provider, three wallets** — Freighter, Albedo, and Hana behind a unified API.
- 📦 **Drop-in `<ConnectModal />`** — responsive, keyboard-accessible, with live wallet detection.
- 💾 **Auto-reconnect** — persists the last wallet + address in `localStorage` and reconnects on page load.
- 🛡️ **Graceful error handling** — rejected requests, missing extensions, and locked wallets are surfaced clearly.
- 🔐 **Full type safety** — strict TypeScript throughout.
- 🎨 **Tailwind CSS** modular styling with a Stellar-themed dark/light design.
- 🪝 **`useWallet()` + `useWalletActions()`** custom hooks.

---

## 📦 What's Exposed

| Export | Type | Description |
|--------|------|-------------|
| `WalletProvider` | Context Provider | Wraps your app, exposes wallet state & actions |
| `useWallet` | Hook | Read/write access to wallet context |
| `useWalletActions` | Hook | Context + per-action loading state |
| `ConnectModal` | Component | Accessible wallet-connection modal |
| `StellarWalletAdapter` | Component | Provider + bound modal in one line |
| `useWallet` | Context | Low-level context (for advanced use) |

---

## 🚀 Quick Start

### 1. Install

```bash
npm install stellar-wallet-adapter
```

### 2. Configure Tailwind (optional)

The modal is styled with Tailwind utility classes. Add the package to your `tailwind.config`:

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./node_modules/stellar-wallet-adapter/dist/**/*.{js,mjs}"],
  // ...
};
```

### 3. Wrap your app

```tsx
import { StellarWalletAdapter, useWallet } from "stellar-wallet-adapter";

function AppContent() {
  const { walletAddress, isConnected, connect, disconnect } = useWallet();

  return (
    <div>
      {isConnected ? (
        <>
          <p>Connected: {walletAddress}</p>
          <button onClick={() => void disconnect()}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connect("freighter")}>Connect Freighter</button>
      )}
    </div>
  );
}

export default function App() {
  return (
    // One-liner: provider + modal bound together
    <StellarWalletAdapter defaultNetwork="TESTNET">
      <AppContent />
    </StellarWalletAdapter>
  );
}
```

### 4. (Optional) Manual setup

Prefer explicit wiring? Use the provider separately and render the modal yourself:

```tsx
import { WalletProvider, useWallet, ConnectModal } from "stellar-wallet-adapter";

function App() {
  return (
    <WalletProvider autoConnect defaultNetwork="TESTNET">
      <ModalBoundary />
    </WalletProvider>
  );
}

function ModalBoundary() {
  const { isModalOpen, closeModal, wallets, connect, activeWallet, isConnecting, error } =
    useWallet();

  return (
    <ConnectModal
      isOpen={isModalOpen}
      onClose={closeModal}
      wallets={wallets}
      onSelectWallet={(id) => void connect(id)}
      isConnecting={isConnecting}
      connectingWalletId={activeWallet?.id ?? null}
      error={error}
    />
  );
}
```

---

## 🪝 The `useWallet` Hook

```tsx
const {
  // State
  walletAddress,
  isConnected,
  isConnecting,
  activeChain,        // "PUBLIC" | "TESTNET" | "FUTURENET"
  activeWallet,
  error,
  wallets,

  // Actions
  connect,            // (walletId: string) => Promise<void>
  disconnect,         // () => Promise<void>
  signMessage,        // (message: string) => Promise<string>
  signTransaction,    // (xdr: string) => Promise<string>
  setActiveChain,     // (chain) => void

  // Modal
  isModalOpen,
  openModal,
  closeModal,
} = useWallet();
```

### Signing a message

```tsx
const { signMessage, isConnected } = useWallet();

const onSign = async () => {
  if (!isConnected) return;
  try {
    const signature = await signMessage("Hello Stellar 👋");
    console.log("Signature:", signature);
  } catch (e) {
    console.error("User rejected the request:", e);
  }
};
```

---

## 🌐 Supported Wallets

| Wallet | Install | Connect | Sign |
|--------|---------|---------|------|
| **Freighter** | Chrome/Firefox extension | `requestAccess()` | `signMessage()` / `signTransaction()` |
| **Albedo** | Web (intent popup) | `publicKey()` | `signMessage()` / `tx()` |
| **Hana** | Desktop extension / wallet kit | Native injection | `signMessage()` / `signTransaction()` |

---

## 🧱 Architecture

```
src/
├── adapters/
│   ├── freighter.ts     # @stellar/freighter-api integration
│   ├── albedo.ts        # @albedo-link/intent integration
│   ├── hana.ts          # Hana (native + @creit.tech kit) integration
│   └── index.ts
├── components/
│   └── ConnectModal.tsx # Accessible, responsive modal + WalletButton
├── context/
│   └── WalletContext.tsx# WalletProvider + context + useWallet
├── hooks/
│   └── useWallet.ts     # useWallet() + useWalletActions()
├── types/
│   └── index.ts         # Shared strict types
├── constants.ts         # Networks, passphrases, storage keys
├── index.tsx            # Library entry point
└── styles.css           # Tailwind directives
```

---

## 🛡️ Accessibility

- **Keyboard**: `Escape` closes the modal; focus management is keyboard-friendly.
- **ARIA**: `role="dialog"`, `aria-modal`, `aria-label` on buttons.
- **Live states**: Each wallet shows "Checking…" / "Available" / "Not detected" with a loading spinner during connection.
- **Click-outside** to dismiss.

---

## 🏗️ Tooling

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch-mode build |
| `npm run build` | Production build (CJS + ESM + types) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## 🧪 Example App

A full interactive example lives in [`/example`](./example). It renders the
library against a Vite + React + Tailwind app so you can see the modal, wallet
detection, auto-reconnect, message signing, and network switching in the
browser.

```bash
cd example
npm install
npm run dev
# open http://localhost:5173
```

> Tip: install the **Freighter** Chrome extension to test a real connection.

---

## 📄 License

MIT © Stellar Wallet Adapter contributors
