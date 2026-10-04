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
import { NETWORK_PASSPHRASES } from "../constants";

const registeredModules = new Map<string, ModuleInterface>();
let initializedModuleIds = new Set<string>();
let initialization = Promise.resolve();

/**
 * Registers every requested module before wallet actions use the kit.
 * The kit replaces its module registry on each init call, so subsequent
 * adapters must be initialized with the complete module set.
 */
export function ensureKitInitialized(
  modules: ModuleInterface[]
): Promise<void> {
  for (const module of modules) {
    if (!registeredModules.has(module.productId)) {
      registeredModules.set(module.productId, module);
    }
  }

  const requestedIds = new Set(registeredModules.keys());
  if (
    requestedIds.size === initializedModuleIds.size &&
    [...requestedIds].every((id) => initializedModuleIds.has(id))
  ) {
    return initialization;
  }

  initialization = initialization.catch(() => undefined).then(async () => {
    const moduleIds = new Set(registeredModules.keys());
    if (
      moduleIds.size === initializedModuleIds.size &&
      [...moduleIds].every((id) => initializedModuleIds.has(id))
    ) {
      return;
    }

    // Defer the heavy import so static/SSR use does not eagerly load the kit.
    const { StellarWalletsKit } = await import(
      "@creit.tech/stellar-wallets-kit"
    );
    StellarWalletsKit.init({ modules: [...registeredModules.values()] });
    initializedModuleIds = moduleIds;
  });

  return initialization;
}

/**
 * Selects a registered module as the kit's active wallet.
 */
export function selectKitWallet(
  moduleId: string,
  network: StellarNetwork
): Promise<void> {
  return import("@creit.tech/stellar-wallets-kit").then(
    ({ StellarWalletsKit }) => {
      StellarWalletsKit.setWallet(moduleId);
      StellarWalletsKit.setNetwork(mapNetworkToKit(network));
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
