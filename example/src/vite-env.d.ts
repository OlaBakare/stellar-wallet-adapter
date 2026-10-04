declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
