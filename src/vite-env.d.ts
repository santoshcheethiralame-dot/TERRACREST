/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When set, the app talks to the real FastAPI backend; otherwise it runs on the in-memory seed. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
