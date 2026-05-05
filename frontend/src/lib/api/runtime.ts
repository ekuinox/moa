export type ApiRuntime = "mock" | "tauri";

export function detectApiRuntime(
  env: Pick<ImportMetaEnv, "TAURI_ENV_PLATFORM"> = import.meta.env,
): ApiRuntime {
  return env.TAURI_ENV_PLATFORM || isTauriWindow() ? "tauri" : "mock";
}

function isTauriWindow() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
