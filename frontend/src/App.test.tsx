import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the partner master screen", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "取引先マスタ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();

    const table = await screen.findByRole("table");

    expect(within(table).getByText("青木商店")).toBeInTheDocument();
  });
});
