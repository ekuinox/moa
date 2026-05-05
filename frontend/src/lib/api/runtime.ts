type ImportMetaEnvLike = Partial<Record<string, string | boolean | undefined>>;

export type ApiRuntime = "mock" | "tauri";

export function detectApiRuntime(env: ImportMetaEnvLike = import.meta.env): ApiRuntime {
  return env.TAURI_ENV_PLATFORM ? "tauri" : "mock";
}
