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

    const table = await screen.findByRole("table");

    expect(within(table).getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("renders the category master screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "種別" }));

    expect(screen.getByRole("heading", { name: "種別マスタ" })).toBeInTheDocument();
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("renders the fiscal year settings screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "事業年度" }));

    expect(screen.getByRole("heading", { name: "事業年度設定" })).toBeInTheDocument();
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("renders the account entry screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "明細" }));

    expect(screen.getByRole("heading", { name: "買掛・売掛明細" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("初期売上")).toBeInTheDocument();
  });

  it("asks for confirmation before deleting an account entry", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "明細" }));

    const table = await screen.findByRole("table");
    await user.click(within(table).getByRole("button", { name: "2026-05-03 の明細を削除" }));

    expect(confirm).toHaveBeenCalledWith("2026-05-03 の明細を削除しますか？");
    expect(within(table).getByText("初期売上")).toBeInTheDocument();
  });
});
