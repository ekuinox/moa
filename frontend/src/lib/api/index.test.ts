import { describe, expect, it, vi } from "vitest";

import { createApiClient } from ".";
import { detectApiRuntime } from "./runtime";

vi.mock("./bindings.generated", () => ({
  commands: {
    backendHealth: vi.fn(async () => true),
  },
}));

describe("detectApiRuntime", () => {
  it("uses mock mode when Tauri environment variables are absent", () => {
    expect(detectApiRuntime({ DEV: true })).toBe("mock");
  });

  it("uses Tauri mode when Tauri environment variables are present", () => {
    expect(detectApiRuntime({ DEV: true, TAURI_ENV_PLATFORM: "windows" })).toBe("tauri");
  });
});

describe("createApiClient", () => {
  it("creates a mock client for Vite dev standalone mode", async () => {
    const client = createApiClient({ runtime: "mock" });

    await expect(client.health()).resolves.toEqual({ ok: true });
  });

  it("creates a Tauri binding client for Tauri runtime", async () => {
    const client = createApiClient({ runtime: "tauri" });

    await expect(client.health()).resolves.toEqual({ ok: true });
  });
});
