import type { ApiClient } from "../api";

export function createMockApiClient(): ApiClient {
  return {
    async health() {
      return { ok: true };
    },
  };
}
