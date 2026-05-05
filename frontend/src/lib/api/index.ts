import { createMockApiClient } from "../mock-api";
import { type ApiRuntime, detectApiRuntime } from "./runtime";
import { createTauriApiClient } from "./tauri";

export type ApiClient = {
  readonly health: () => Promise<HealthStatus>;
};

export type HealthStatus = {
  readonly ok: boolean;
};

export type CreateApiClientOptions = {
  readonly runtime?: ApiRuntime;
};

export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  const runtime = options.runtime ?? detectApiRuntime();

  if (runtime === "tauri") {
    return createTauriApiClient();
  }

  return createMockApiClient();
}

export const apiClient = createApiClient();
