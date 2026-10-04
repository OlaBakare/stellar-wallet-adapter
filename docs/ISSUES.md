# Contributor-ready issue drafts

These are draft issue descriptions for maintainers to copy into GitHub. The
suggested labels should be created in the repository if they do not already
exist.

## 1. Keep keyboard focus inside the connection dialog

**Suggested labels:** `good first issue`, `enhancement`, `accessibility`

### Problem

The wallet connection dialog can be dismissed with Escape, but keyboard focus
is not currently trapped in the dialog while it is open. Keyboard users can tab
to controls behind the modal.

### Scope

Update `ConnectModal` to remember the previously focused element, move focus
into the dialog when it opens, keep Tab / Shift+Tab navigation within the
dialog, and restore focus on close. Preserve Escape and click-outside behavior.

### Acceptance criteria

- Focus moves to a meaningful dialog control when it opens.
- Tab and Shift+Tab do not move focus behind the open dialog.
- Closing the dialog restores focus to the element that opened it when that
  element is still available.
- Add automated tests for initial focus, wrap-around, and focus restoration.
- Existing modal tests and `npm run check` pass.

## 2. Add deterministic wallet icon fallback behavior

**Suggested labels:** `good first issue`, `enhancement`, `accessibility`

### Problem

Wallet brand image URLs may be unavailable offline or may change. The modal
currently handles image loading in the component but has no explicit
user-facing fallback for a failed image.

### Scope

Provide a neutral, accessible fallback when a wallet icon fails to load.
Preserve the wallet name as the button's accessible name and avoid adding
wallet-specific tracking or external asset dependencies.

### Acceptance criteria

- A failed icon does not leave a broken-image indicator.
- The wallet remains selectable and its accessible name is unchanged.
- Component tests cover both successful image rendering and an image error.
- Existing modal tests and `npm run check` pass.

## 3. Handle browser storage being unavailable

**Suggested labels:** `enhancement`, `good first issue`

### Problem

Private browsing settings, browser policy, or an embedded webview can make
`localStorage` throw. A storage exception should not make a successful wallet
connection appear to have failed.

### Scope

Isolate persistence operations from wallet connection state. When persistence
is unavailable, keep the live connection usable, surface a clear non-fatal
message, and avoid silently presenting persistence as successful.

### Acceptance criteria

- Connection and disconnection continue to update in-memory state if storage
  access throws.
- The provider reports that reconnection persistence could not be saved.
- Tests cover throwing reads, writes, and removal without needing a real
  browser wallet.
- No exception or browser storage detail is lost from diagnostic UI.

## 4. Report wallet/network mismatch before signing

**Suggested labels:** `enhancement`

### Problem

The selected application network determines the passphrase supplied for
signing, but applications would benefit from an explicit way to inspect the
connected wallet's current network before starting a transaction flow.

### Scope

Define how the provider can expose or validate a wallet's reported network
against the selected `activeChain`. Keep transaction submission and RPC
configuration out of scope.

### Acceptance criteria

- The API clearly distinguishes the application-selected network from the
  wallet-reported network.
- Mismatch and unavailable-network states are represented without treating a
  connected wallet as disconnected.
- Tests cover matching, mismatching, and unavailable network reports.
- Document any new public types and compatibility implications.

## 5. Document safe Testnet transaction signing

**Suggested labels:** `documentation`, `good first issue`

### Problem

The README shows the signing method but does not yet walk a dApp developer
through creating a test transaction, signing its XDR, and submitting it using
the Stellar SDK.

### Scope

Add a tutorial that uses a disposable Testnet account, states clearly that
secret-key handling and transaction submission belong to the application,
and handles user rejection in UI code.

### Acceptance criteria

- The guide identifies required packages and Testnet setup.
- The sample passes the selected Stellar network correctly and never logs
  secrets.
- It distinguishes signing from submitting and warns users to review wallet
  prompts.
- Documentation links and sample API names match the current public exports.
