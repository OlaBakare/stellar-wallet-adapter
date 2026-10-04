# Contributing

Thank you for considering a contribution to Stellar Wallet Adapter. Issues,
bug fixes, accessibility improvements, tests, and documentation are welcome.
Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Local setup

Requirements: Node.js 22 or 24 and npm.

```sh
git clone https://github.com/OlaBakare/stellar-wallet-adapter.git
cd stellar-wallet-adapter
npm ci
npm run check
```

The example app can be run separately:

```sh
cp example/.env.example example/.env
cd example
npm install
npm run dev
```

The example network setting is non-secret and can be `TESTNET`, `PUBLIC`, or
`FUTURENET`. A browser wallet is required to exercise live wallet flows. Unit
tests use injected adapters and do not require a wallet or network account.

## Branches and changes

Create a focused branch from `main`:

```sh
git switch -c feat/short-description
```

Use `fix/`, `docs/`, `test/`, or `chore/` prefixes where appropriate. Keep pull
requests focused, explain the user impact and implementation, link related
issues, and call out any API or behavior changes. Do not include secrets,
wallet seed phrases, or real account credentials in code, commits, screenshots,
or test fixtures.

## Tests and quality checks

Add or update tests in `src/test/` for behavior changes. Prefer assertions
against observable state and outcomes; avoid relying only on implementation
details. Run the complete project check before opening a pull request:

```sh
npm run check
```

This runs TypeScript type checking, ESLint, Vitest, and the distributable build.
If you cannot run a check, explain why in the pull request. CI must pass before
merge.

## Pull request standards

- Use a clear title, preferably following Conventional Commits (for example,
  `fix: respect selected network when signing messages`).
- Describe the problem, the change, and how it was verified.
- Add regression tests for bug fixes and tests for new behavior.
- Update user-facing documentation when the public API or usage changes.
- Keep generated output, local environment files, dependencies, and unrelated
  formatting out of the diff.
- Be responsive to review feedback and keep the change rebased or otherwise
  conflict-free with `main`.

## Reporting bugs and proposing features

Use the GitHub issue templates for bug reports and feature requests. Search
existing issues first, include a minimal reproduction where possible, and never
publish credentials or wallet secrets. See [docs/ISSUES.md](docs/ISSUES.md) for
additional issue drafts that maintainers can publish.

## Commit style and license

Conventional Commit prefixes are encouraged: `feat:`, `fix:`, `docs:`,
`test:`, `refactor:`, and `chore:`. Contributions are distributed under the
project's [MIT License](LICENSE).
