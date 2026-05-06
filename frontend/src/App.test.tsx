import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the payable ledger screen", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "買掛表" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("初期仕入")).toBeInTheDocument();
  });

  it("renders the receivable ledger screen", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: "売掛" }));

    expect(screen.getByRole("heading", { name: "売掛表" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("初期売上")).toBeInTheDocument();
  });

  it("renders the settings screens", async () => {
    const user = userEvent.setup();

    render(<App />);
    const appTabs = screen.getByRole("navigation", { name: "画面切り替え" });
    await user.click(within(appTabs).getByRole("button", { name: "設定" }));

    expect(screen.getByRole("heading", { name: "設定" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "取引先一覧" })).toBeInTheDocument();
    expect(await screen.findByRole("table")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "種別" }));

    expect(screen.getByRole("heading", { name: "種別一覧" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "事業年度" }));

    expect(screen.getByRole("heading", { name: "事業年度を追加" })).toBeInTheDocument();
  });

  it("asks for confirmation before deleting an account entry", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(<App />);
    await user.click(await screen.findByRole("button", { name: "青木商店" }));

    const table = await screen.findByRole("table");
    await user.click(within(table).getByRole("button", { name: "2026-05-01 の明細を削除" }));

    expect(confirm).toHaveBeenCalledWith("2026-05-01 の明細を削除しますか？");
    expect(within(table).getByText("初期仕入")).toBeInTheDocument();
  });

  it("shows row save action after editing a selected partner ledger row", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(await screen.findByRole("button", { name: "青木商店" }));

    const table = await screen.findByRole("table");
    await user.click(within(table).getByText("初期仕入"));

    const description = within(table).getByDisplayValue("初期仕入");
    await user.clear(description);
    await user.type(description, "材料仕入");

    expect(
      within(table).getByRole("button", { name: "2026-05-01 の明細を保存" }),
    ).toBeInTheDocument();
  });

  it("leaves input mode when focus moves outside the edited row", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(await screen.findByRole("button", { name: "青木商店" }));

    const table = await screen.findByRole("table");
    await user.click(within(table).getByText("初期仕入"));

    const description = within(table).getByDisplayValue("初期仕入");
    await user.clear(description);
    await user.type(description, "材料仕入");
    await user.click(screen.getAllByRole("heading", { name: /買掛表/ })[0]);

    expect(within(table).queryByDisplayValue("材料仕入")).not.toBeInTheDocument();
    expect(within(table).getByText("材料仕入")).toBeInTheDocument();
    expect(
      within(table).getByRole("button", { name: "2026-05-01 の明細を保存" }),
    ).toBeInTheDocument();
  });
});
