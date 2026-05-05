import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the partner master screen", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "取引先マスタ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("青木商店")).toBeInTheDocument();
  });

  it("asks for confirmation before deleting a partner", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(<App />);

    const table = await screen.findByRole("table");
    await user.click(within(table).getByRole("button", { name: "青木商店を削除" }));

    expect(confirm).toHaveBeenCalledWith("青木商店を削除しますか？");
    expect(within(table).getByText("青木商店")).toBeInTheDocument();
  });

  it("renders the category master screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "種別" }));

    expect(screen.getByRole("heading", { name: "種別マスタ" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("材料費")).toBeInTheDocument();
  });

  it("renders the fiscal year settings screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "事業年度" }));

    expect(screen.getByRole("heading", { name: "事業年度設定" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("2026年度")).toBeInTheDocument();
  });
});
