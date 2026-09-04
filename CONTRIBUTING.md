# Contributing

Thanks for your interest in **stellar-wallet-adapter**! Contributions are welcome,
whether it's fixing a bug, improving accessibility, adding a test, or writing
documentation.

This project is structured to be friendly to **Drips Wave** contributors: issues are
scoped, labelled by complexity, and rewarded with points that convert to a share of
the Wave reward pool.

## Project layout

```
src/
├── adapters/          # Wallet adapters (thin wrappers over the official kit)
├── components/        # ConnectModal + WalletButton (accessible, responsive)
├── context/           # WalletProvider + context + useWallet
├── hooks/             # useWallet() + useWalletActions()
├── kit/               # Thin integration with @creit.tech/stellar-wallets-kit
├── types/             # Shared strict types
└── test/              # Vitest + Testing Library suite
```

## Getting started

```bash
npm install
npm run check        # typecheck + lint + test + build
```

## Making changes

1. Create a branch: `git checkout -b feat/your-change`
2. Make your change and add tests under `src/test/`.
3. Run `npm run check` — all four steps must pass.
4. Commit with a clear message and open a PR.

## Good first issues

Look for issues labelled `good first issue` or `drips:trivial` / `drips:medium` /
`drips:high`. Each issue states its point value.

## Commit style

We follow the [Conventional Commits](https://www.conventionalcommits.org/) convention:

- `feat: ...` — new feature
- `fix: ...` — bug fix
- `test: ...` — tests only
- `docs: ...` — documentation only

## License

By contributing you agree that your contributions are licensed under the MIT license.
