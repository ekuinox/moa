import type { ApiClient } from ".";
import { commands } from "./bindings";

export function createTauriApiClient(): ApiClient {
  return {
    async health() {
      return { ok: await commands.backendHealth() };
    },
  };
}
