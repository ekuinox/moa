export type ApiRuntime = "mock" | "tauri";

export function detectApiRuntime(
  env: Pick<ImportMetaEnv, "TAURI_ENV_PLATFORM"> = import.meta.env,
): ApiRuntime {
  return env.TAURI_ENV_PLATFORM ? "tauri" : "mock";
}
