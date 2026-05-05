import { createMockApiClient } from "../mock-api";
import { createTauriApiClient } from "./tauri";

export type ApiClient = {
  readonly health: () => Promise<HealthStatus>;
};

export type HealthStatus = {
  readonly ok: boolean;
};

export function createApiClient(): ApiClient {
  if (import.meta.env.DEV) {
    return createMockApiClient();
  }

  return createTauriApiClient();
}
