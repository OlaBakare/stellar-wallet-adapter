/**
 * Thin integration with the official `@creit.tech/stellar-wallets-kit`.
 *
 * Rather than re-implementing per-wallet communication, we delegate to the
 * ecosystem-standard kit (which supports Freighter, Albedo and Hana natively)
 * and layer our React context, accessible modal, auto-reconnect and typed
 * hooks on top. This keeps the library a complement to — not a duplicate of —
 * the official toolkit.
 */
import type {
  ModuleInterface,
  Networks,
} from "@creit.tech/stellar-wallets-kit/types";
import type { StellarNetwork } from "../types";
import { NETWORK_PASSPHRASES, DEFAULT_NETWORK } from "../constants";

let initialized = false;

/**
 * Registers the given kit modules once. Subsequent calls are no-ops.
 */
export function ensureKitInitialized(modules: ModuleInterface[]): void {
  if (initialized) return;
  // Defer the heavy import so the library can be used for SSR/static sites
  // without eagerly loading the kit until a wallet action is performed.
  void import("@creit.tech/stellar-wallets-kit").then(({ StellarWalletsKit }) => {
    StellarWalletsKit.init({ modules });
    initialized = true;
  });
}

/**
 * Selects a registered module as the kit's active wallet.
 */
export function selectKitWallet(moduleId: string): Promise<void> {
  return import("@creit.tech/stellar-wallets-kit").then(
    ({ StellarWalletsKit }) => {
      StellarWalletsKit.setWallet(moduleId);
      StellarWalletsKit.setNetwork(mapNetworkToKit(DEFAULT_NETWORK));
    }
  );
}

export function mapNetworkToKit(network: StellarNetwork): Networks {
  return NETWORK_PASSPHRASES[network] as Networks;
}

export async function kitGetAddress(): Promise<string> {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  const { address } = await StellarWalletsKit.fetchAddress();
  return address;
}

export async function kitSignTransaction(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase,
  });
  return signedTxXdr;
}

export async function kitSignMessage(
  message: string,
  address: string,
  networkPassphrase: string
): Promise<string> {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  const { signedMessage } = await StellarWalletsKit.signMessage(message, {
    address,
    networkPassphrase,
  });
  return signedMessage ?? "";
}

export async function kitGetNetwork(): Promise<{
  network: string;
  networkPassphrase: string;
}> {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  return StellarWalletsKit.getNetwork();
}

export async function kitDisconnect(): Promise<void> {
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
  await StellarWalletsKit.disconnect();
}
