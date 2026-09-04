import React, { useEffect, useRef, useState } from "react";
import type { FC, ReactNode } from "react";
import type { ConnectModalProps, WalletAdapter } from "../types";

const truncateAddress = (address: string) => {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

export const ConnectModal: FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  isConnecting,
  connectingWalletId,
  error,
}) => {
  const [availableWallets, setAvailableWallets] = useState<
    Record<string, boolean>
  >({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const checkAvailability = async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        wallets.map(async (wallet) => {
          try {
            results[wallet.id] = await wallet.isAvailable();
          } catch {
            results[wallet.id] = false;
          }
        })
      );
      setAvailableWallets(results);
    };
    void checkAvailability();
  }, [isOpen, wallets]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-white dark:bg-[#0B082D] rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-white/10 animate-slide-up"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close wallet connection modal"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-6">
          <h2
            id="connect-modal-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Connect a Wallet
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred Stellar wallet to get started.
          </p>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet: WalletAdapter) => {
            const isAvailable = availableWallets[wallet.id];
            const isLoading = connectingWalletId === wallet.id;
            const disabled = isConnecting || isLoading;

            return (
              <button
                key={wallet.id}
                type="button"
                onClick={() => onSelectWallet(wallet.id)}
                disabled={disabled}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#0805F6] dark:hover:border-[#B0C4FF] hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden">
                    {wallet.icon ? (
                      <img
                        src={wallet.icon}
                        alt={`${wallet.name} logo`}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-[#0805F6] dark:text-[#B0C4FF]">
                        {wallet.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="text-left">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      {wallet.name}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {isAvailable === undefined
                        ? "Checking…"
                        : isAvailable
                          ? "Available"
                          : "Not detected"}
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-2">
                  {isLoading && (
                    <span
                      className="w-5 h-5 border-2 border-[#0805F6] dark:border-[#B0C4FF] border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {!isLoading && (
                    <span className="text-[#0805F6] dark:text-[#B0C4FF] opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div
            className="mt-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <p className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </p>
          </div>
        )}

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
          By connecting, you agree to connect your wallet with this application.
        </p>
      </div>
    </div>
  );
};

interface WalletButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const WalletButton: FC<WalletButtonProps> = ({
  children,
  onClick,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0805F6] hover:bg-[#0805F6]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors"
    >
      {children}
    </button>
  );
};

export { truncateAddress };
