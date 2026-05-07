import { describe, expect, it } from "vitest";

import type { AccountEntry } from "../../lib/api";
import {
  calculateTotalAmount,
  closeUnchangedEditingRow,
  createVisibleEntries,
  openEditingRow,
  removeEditingRow,
  UNCATEGORIZED_FILTER_KEY,
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
    categoryIds: ["category-a"],
  }),
  createEntry({
    id: "new-payable",
    kind: "payable",
    occurredOn: "2026-05-20",
    partnerId: "partner-a",
    amount: 2500,
    categoryIds: ["category-b"],
  }),
  createEntry({
    id: "other-partner",
    kind: "payable",
    occurredOn: "2026-05-05",
    partnerId: "partner-b",
    amount: 3000,
    categoryIds: ["category-a", "category-b"],
  }),
  createEntry({
    id: "receivable",
    kind: "receivable",
    occurredOn: "2026-05-10",
    partnerId: "partner-a",
    amount: 4000,
    categoryIds: ["category-a"],
  }),
  createEntry({
    id: "previous-fy-march",
    kind: "payable",
    occurredOn: "2026-03-31",
    partnerId: "partner-a",
    amount: 5000,
    categoryIds: ["category-a"],
  }),
  createEntry({
    id: "next-fy-april",
    kind: "payable",
    occurredOn: "2027-04-01",
    partnerId: "partner-a",
    amount: 6000,
    categoryIds: ["category-a"],
  }),
  createEntry({
    id: "uncategorized",
    kind: "payable",
    occurredOn: "2026-05-15",
    partnerId: "partner-a",
    amount: 700,
    categoryIds: [],
  }),
];

describe("ledgerState", () => {
  it("表示対象の明細を月・取引先で絞り込み、日付昇順に並べる", () => {
    const visibleEntries = createVisibleEntries(
      entries,
      "payable",
      "2026-05",
      "partner-a",
      4,
      null,
    );

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "old-payable",
      "uncategorized",
      "new-payable",
    ]);
  });

  it("すべての取引先では取引先で絞り込まず、日付昇順に並べる", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "2026-05", "all", 4, null);

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "old-payable",
      "other-partner",
      "uncategorized",
      "new-payable",
    ]);
  });

  it("年度開始月 4 で FY2026 を選んだら 2026-04 〜 2027-03 の明細だけを返す", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "FY2026", "partner-a", 4, null);

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "old-payable",
      "uncategorized",
      "new-payable",
    ]);
  });

  it("年度開始月 1 で FY2026 を選んだら暦年 2026 全期間を返す", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "FY2026", "partner-a", 1, null);

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "previous-fy-march",
      "old-payable",
      "uncategorized",
      "new-payable",
    ]);
  });

  it("年度開始月 4 で FY2025 を選ぶと 3 月の明細が含まれる", () => {
    const visibleEntries = createVisibleEntries(entries, "payable", "FY2025", "partner-a", 4, null);

    expect(visibleEntries.map((entry) => entry.id)).toEqual(["previous-fy-march"]);
  });

  it("種別フィルタで category-a を選ぶと、category-a を含む行のみ表示される (OR)", () => {
    const visibleEntries = createVisibleEntries(
      entries,
      "payable",
      "2026-05",
      "all",
      4,
      new Set(["category-a"]),
    );

    expect(visibleEntries.map((entry) => entry.id)).toEqual(["old-payable", "other-partner"]);
  });

  it("種別フィルタで複数選択すると、いずれかを含む行を OR で返す", () => {
    const visibleEntries = createVisibleEntries(
      entries,
      "payable",
      "2026-05",
      "all",
      4,
      new Set(["category-a", "category-b"]),
    );

    expect(visibleEntries.map((entry) => entry.id)).toEqual([
      "old-payable",
      "other-partner",
      "new-payable",
    ]);
  });

  it("種別フィルタで未分類だけを選ぶと、種別 0 個の行のみ表示される", () => {
    const visibleEntries = createVisibleEntries(
      entries,
      "payable",
      "2026-05",
      "all",
      4,
      new Set([UNCATEGORIZED_FILTER_KEY]),
    );

    expect(visibleEntries.map((entry) => entry.id)).toEqual(["uncategorized"]);
  });

  it("表示対象明細の合計金額を計算する", () => {
    expect(calculateTotalAmount(entries.slice(0, 2))).toBe(3500);
  });

  it("編集開始時に保存済み明細からドラフトを作る", () => {
    const editingRows = openEditingRow({}, entries[0]);

    expect(editingRows[entries[0].id]).toEqual({
      occurredOn: "2026-05-01",
      categoryIds: ["category-a"],
      description: "old-payable",
      amount: "1000",
    });
  });

  it("セル更新時に既存ドラフトへ部分更新を反映する", () => {
    const current: Record<string, AccountEntryFormState> = {
      row: {
        occurredOn: "2026-05-01",
        categoryIds: ["category-a"],
        description: "before",
        amount: "1000",
      },
    };

    const next = updateEditingRow(current, "row", { description: "after" }, "2026-05", 4);

    expect(next.row).toEqual({
      occurredOn: "2026-05-01",
      categoryIds: ["category-a"],
      description: "after",
      amount: "1000",
    });
  });

  it("保存や削除が終わった行のドラフトを取り除く", () => {
    const next = removeEditingRow(
      {
        keep: {
          occurredOn: "2026-05-01",
          categoryIds: ["category-a"],
          description: "keep",
          amount: "1000",
        },
        remove: {
          occurredOn: "2026-05-02",
          categoryIds: ["category-a"],
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
      4,
    );

    expect(closeUnchangedEditingRow(current, entry)).toEqual(current);
  });
});

function createEntry(input: Partial<AccountEntry> & Pick<AccountEntry, "id">): AccountEntry {
  return {
    kind: "payable",
    occurredOn: "2026-05-01",
    partnerId: "partner-a",
    categoryIds: ["category-a"],
    description: input.id,
    amount: 1000,
    ...input,
  };
}
