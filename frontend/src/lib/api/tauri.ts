import type { ApiClient } from ".";
import { commands } from "./bindings.generated";

export function createTauriApiClient(): ApiClient {
  return {
    async health() {
      return { ok: await commands.backendHealth() };
    },
  };
}
