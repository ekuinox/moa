import { createMockApiClient } from "../mock-api";
import { type ApiRuntime, detectApiRuntime } from "./runtime";
import { createTauriApiClient } from "./tauri";

export interface ApiClient {
  readonly health: () => Promise<HealthStatus>;
  readonly partners: PartnerApiClient;
}

export interface HealthStatus {
  readonly ok: boolean;
}

export interface Partner {
  readonly id: string;
  readonly name: string;
  readonly kana: string;
}

export interface CreatePartnerInput {
  readonly name: string;
  readonly kana: string;
}

export interface UpdatePartnerInput {
  readonly id: string;
  readonly name: string;
  readonly kana: string;
}

export interface PartnerApiClient {
  readonly list: () => Promise<Partner[]>;
  readonly create: (input: CreatePartnerInput) => Promise<Partner>;
  readonly update: (input: UpdatePartnerInput) => Promise<Partner>;
  readonly delete: (id: string) => Promise<void>;
}

export interface CreateApiClientOptions {
  readonly runtime?: ApiRuntime;
}

export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  const runtime = options.runtime ?? detectApiRuntime();

  if (runtime === "tauri") {
    return createTauriApiClient();
  }

  return createMockApiClient();
}

export const apiClient = createApiClient();
