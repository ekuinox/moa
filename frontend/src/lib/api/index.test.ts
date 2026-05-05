import { afterEach, describe, expect, it, vi } from "vitest";

import { createApiClient } from ".";
import { detectApiRuntime } from "./runtime";

vi.mock("./bindings.generated", () => ({
  commands: {
    backendHealth: vi.fn(async () => true),
    createCategory: vi.fn(async (input) => ({ id: "tauri-category", ...input })),
    createPartner: vi.fn(async (input) => ({ id: "tauri-partner", ...input })),
    deleteCategory: vi.fn(async () => undefined),
    deletePartner: vi.fn(async () => undefined),
    listCategories: vi.fn(async () => []),
    listPartners: vi.fn(async () => []),
    updateCategory: vi.fn(async (input) => input),
    updatePartner: vi.fn(async (input) => input),
  },
}));

describe("detectApiRuntime", () => {
  const originalTauriInternals = Reflect.get(window, "__TAURI_INTERNALS__");

  afterEach(() => {
    if (originalTauriInternals) {
      Reflect.set(window, "__TAURI_INTERNALS__", originalTauriInternals);
    } else {
      Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
    }
  });

  it("uses mock mode when Tauri environment variables are absent", () => {
    expect(detectApiRuntime({})).toBe("mock");
  });

  it("uses Tauri mode when Tauri environment variables are present", () => {
    expect(detectApiRuntime({ TAURI_ENV_PLATFORM: "windows" })).toBe("tauri");
  });

  it("uses Tauri mode when Tauri runtime globals are present", () => {
    Reflect.set(window, "__TAURI_INTERNALS__", {});

    expect(detectApiRuntime({})).toBe("tauri");
  });
});

describe("createApiClient", () => {
  it("creates a mock client for Vite dev standalone mode", async () => {
    const client = createApiClient({ runtime: "mock" });

    await expect(client.health()).resolves.toEqual({ ok: true });
    await expect(client.partners.list()).resolves.toHaveLength(2);
  });

  it("creates a Tauri binding client for Tauri runtime", async () => {
    const client = createApiClient({ runtime: "tauri" });

    await expect(client.health()).resolves.toEqual({ ok: true });
    await expect(client.partners.create({ name: "取引先", kana: "とりひきさき" })).resolves.toEqual(
      {
        id: "tauri-partner",
        name: "取引先",
        kana: "とりひきさき",
      },
    );
    await expect(client.categories.create({ name: "材料費" })).resolves.toEqual({
      id: "tauri-category",
      name: "材料費",
    });
  });
});
