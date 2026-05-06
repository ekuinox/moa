import { describe, expect, it } from "vitest";

import type { AccountEntry } from "../../lib/api";
import {
  calculateTotalAmount,
  closeUnchangedEditingRow,
  createVisibleEntries,
  openEditingRow,
  removeEditingRow,
  updateEditingRow,
} from "./ledgerState";
import type { AccountEntryFormState } from "./types";

const entries: AccountEntry[] = [
  createEntry({
    id: "old-payable",
    kind: "payable",
    occurredOn: "2026-05-01",
    partnerId: "partner-a",
    amount: 1000,
  }),
  createEntry({
    id: "new-payable",
    kind: "payable",
    occurredOn: "2026-05-20",
    partnerId: "partner-a",
    amount: 2500,
  }),
  createEntry({
    id: "other-partner",
    kind: "payable",
    occurredOn: "2026-05-05",
    partnerId: "partner-b",
    amount: 3000,
  }),
  createEntry({
    id: "receivable",
    kind: "receivable",
    occurredOn: "2026-05-10",
    partnerId: "partner-a",
    amount: 4000,
  }),
  createEntry({
    id: "other-month",
    kind: "payable",
    occurredOn: "2026-04-30",
    partnerId: "partner-a",
    amount: 5000,
  }),
];

describe("ledgerState", () => {
  it("表示対象の明細を月・種別・取引先で絞り込み、日付昇順に並べる", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "2026-05", "partner-a");

    expect(visibleEntries.map((entry) => entry.id)).toEqual(["old-payable", "new-payable"]);
  });

  it("すべての取引先では取引先で絞り込まず、日付昇順に並べる", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "2026-05", "all");

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "old-payable",
      "other-partner",
      "new-payable",
    ]);
  });

  it("年間選択時は同じ年の明細を通して表示する", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "2026", "partner-a");

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "other-month",
      "old-payable",
      "new-payable",
    ]);
  });

  it("表示対象明細の合計金額を計算する", () => {
    expect(calculateTotalAmount(entries.slice(0, 2))).toBe(3500);
  });

  it("編集開始時に保存済み明細からドラフトを作る", () => {
    const editingRows = openEditingRow({}, entries[0]);

    expect(editingRows[entries[0].id]).toEqual({
      occurredOn: "2026-05-01",
      categoryId: "category-a",
      description: "old-payable",
      amount: "1000",
    });
  });

  it("セル更新時に既存ドラフトへ部分更新を反映する", () => {
    const current: Record<string, AccountEntryFormState> = {
      row: {
        occurredOn: "2026-05-01",
        categoryId: "category-a",
        description: "before",
        amount: "1000",
      },
    };

    const next = updateEditingRow(current, "row", { description: "after" }, "2026-05");

    expect(next.row).toEqual({
      occurredOn: "2026-05-01",
      categoryId: "category-a",
      description: "after",
      amount: "1000",
    });
  });

  it("保存や削除が終わった行のドラフトを取り除く", () => {
    const next = removeEditingRow(
      {
        keep: {
          occurredOn: "2026-05-01",
          categoryId: "category-a",
          description: "keep",
          amount: "1000",
        },
        remove: {
          occurredOn: "2026-05-02",
          categoryId: "category-a",
          description: "remove",
          amount: "2000",
        },
      },
      "remove",
    );

    expect(Object.keys(next)).toEqual(["keep"]);
  });

  it("未変更の行はフォーカス解除時にドラフトを破棄する", () => {
    const entry = entries[0];
    const current = openEditingRow({}, entry);

    expect(closeUnchangedEditingRow(current, entry)).toEqual({});
  });

  it("変更済みの行はフォーカス解除後も保存待ちドラフトとして残す", () => {
    const entry = entries[0];
    const current = updateEditingRow(
      openEditingRow({}, entry),
      entry.id,
      { amount: "2000" },
      "2026-05",
    );

    expect(closeUnchangedEditingRow(current, entry)).toEqual(current);
  });
});

function createEntry(input: Partial<AccountEntry> & Pick<AccountEntry, "id">): AccountEntry {
  return {
    kind: "payable",
    occurredOn: "2026-05-01",
    partnerId: "partner-a",
    categoryId: "category-a",
    description: input.id,
    amount: 1000,
    ...input,
  };
}
