# 🌠 Stellar Wallet Adapter

A **React-first wallet connection layer** for Stellar dApps that unifies
**Freighter**, **Albedo**, and **Hana** behind a single typed API — with a
drop-in, accessible connection modal.

Built with **TypeScript**, **React 18+**, and **Tailwind CSS**.

> **No reinvention.** This library deliberately sits **on top of** the official
> [`@creit.tech/stellar-wallets-kit`](https://stellarwalletskit.dev/) — the
> ecosystem-standard wallet integration — rather than re-implementing wallet
> communication. It adds what the ecosystem was missing: a **typed React layer**,
> **auto-reconnect**, an **accessible modal**, and **per-action loading state**.
> That makes it a complement to (not a duplicate of) the official toolkit.

---

## ✨ Features

- 🔌 **Three wallets, one API** — Freighter, Albedo and Hana behind a uniform
  `WalletAdapter` contract.
- 🧩 **Built on the official kit** — wallet logic delegated to
  `@creit.tech/stellar-wallets-kit`, so behaviour stays aligned with the
  ecosystem standard.
- 📦 **Drop-in `<ConnectModal />`** — responsive, keyboard-accessible, with live
  wallet detection and per-wallet loading spinners.
- 💾 **Auto-reconnect** — persists the last wallet + address in `localStorage`
  and reconnects on page load.
- 🛡️ **Graceful error handling** — rejected requests, missing extensions, and
  locked wallets are surfaced clearly (and re-thrown for callers via
  `useWalletActions`).
- 🔐 **Strict TypeScript** throughout, with injectable adapters for testing.
- 🪝 **`useWallet()` + `useWalletActions()`** custom hooks.

---

## 📦 Install

```bash
npm install stellar-wallet-adapter
```

`react` and `react-dom` (>= 18) are peer dependencies.

---

## 🚀 Quick Start

### 1. Configure Tailwind (optional)

The modal uses Tailwind classes. Add the package to your `tailwind.config`:

```js
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./node_modules/stellar-wallet-adapter/dist/**/*"],
  // ...
};
```

### 2. Wrap your app

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
        <button onClick={() => connect("freighter").catch(() => {})}>
          Connect Freighter
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StellarWalletAdapter defaultNetwork="TESTNET" autoConnect>
      <AppContent />
    </StellarWalletAdapter>
  );
}
```

### 3. (Optional) Manual setup

```tsx
import { WalletProvider, useWallet, ConnectModal } from "stellar-wallet-adapter";

function ModalBoundary() {
  const { isModalOpen, closeModal, wallets, connect, activeWallet, isConnecting, error } =
    useWallet();

  return (
    <ConnectModal
      isOpen={isModalOpen}
      onClose={closeModal}
      wallets={wallets}
      onSelectWallet={(id) => void connect(id).catch(() => {})}
      isConnecting={isConnecting}
      connectingWalletId={activeWallet?.id ?? null}
      error={error}
    />
  );
}

export default function App() {
  return (
    <WalletProvider autoConnect defaultNetwork="TESTNET">
      <ModalBoundary />
    </WalletProvider>
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
  setActiveChain,     // (chain: StellarNetwork) => void

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
    const signature = await signMessage("Hello Stellar!");
    console.log("Signature:", signature);
  } catch (e) {
    console.error("User rejected the request:", e);
  }
};
```

### Per-action loading state

```tsx
const { connect, actionLoading, actionError } = useWalletActions();

<button
  disabled={actionLoading}
  onClick={() => void connect("freighter")}
>
  {actionLoading ? "Connecting…" : "Connect"}
</button>
```

> `connect` (and `disconnect`) **re-throw** on rejection after updating state, so
> you can `try/catch` them or catch through the returned promise.

---

## 🌐 Supported Wallets

All wallets are integrated through the official Stellar Wallets Kit:

| Wallet | Type | Notes |
|--------|------|-------|
| **Freighter** | Browser extension | Native permission flow |
| **Albedo** | Web (intent popup) | No extension required |
| **Hana** | Desktop extension | Also detected via injected provider |

---

## 🏗️ Architecture

```
src/
├── adapters/          # Wallet adapters (thin wrappers over the official kit)
├── components/        # ConnectModal + WalletButton (accessible, responsive)
├── context/           # WalletProvider + WalletContext + useWallet
├── hooks/             # useWallet() + useWalletActions()
├── kit/               # Thin integration with @creit.tech/stellar-wallets-kit
├── types/             # Shared strict types
├── constants.ts       # Networks, passphrases, storage keys
├── test/              # Vitest + Testing Library suite (mock adapters)
└── index.tsx          # Library entry point
```

### Why not just use the Stellar Wallets Kit directly?

The official kit is excellent at *wallet communication* — and we lean on it for
that. What we add is the React ergonomics:

- A typed `WalletProvider` + `useWallet` context that exposes only what dApps
  need (`walletAddress`, `isConnected`, `isConnecting`, `activeChain`, `signer`).
- Auto-reconnect and connection-state management out of the box.
- An **accessible, keyboard-friendly modal** with live wallet availability.
- Per-action loading/error state via `useWalletActions`.

---

## 🛡️ Accessibility

- **Keyboard**: `Escape` closes the modal; focus is managed.
- **ARIA**: `role="dialog"`, `aria-modal`, `aria-label` on interactive elements.
- **Live states**: each wallet shows "Checking…" / "Available" / "Not detected".
- **Click-outside** to dismiss.

---

## 🧪 Tests

The suite uses [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
with **mock wallet adapters**, so no real wallets are required:

```bash
npm run test
```

Coverage: provider connect/disconnect/auto-reconnect/error handling, modal
rendering/availability/accessibility, and hook loading/error state.

---

## 🧪 Example App

A live interactive example lives in [`/example`](./example):

```bash
cd example
npm install
npm run dev      # open http://localhost:5173
```

Install the **Freighter** extension to test a real connection.

---

## 🌊 Drips Wave

This repository participates in the **Stellar Wave Program**. Contributions
(issues, PRs) earn points that convert to a share of the Wave reward pool. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to get started, or browse
[open issues](https://github.com/OlaBakare/stellar-wallet-adapter/issues).

---

## 🤝 Contributing

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines. All
contributions are welcome — and the repo runs CI (typecheck + lint + test +
build) on every PR.

---

## 📄 License

MIT © OlaBakare
