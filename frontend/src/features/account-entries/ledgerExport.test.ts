import { describe, expect, it } from "vitest";

import type { AccountEntry, Category } from "../../lib/api";
import { createLedgerExportScope, serializeLedgerCsv } from "./ledgerExport";

const categories = [
  { id: "category-1", name: "仕入" },
  { id: "category-2", name: "外注費" },
] satisfies Category[];

const partnerNames = new Map([
  ["partner-1", "青木商店"],
  ["partner-2", "佐藤工業"],
]);

const entries = [
  createEntry({
    id: "entry-1",
    occurredOn: "2026-05-01",
    partnerId: "partner-1",
    categoryIds: ["category-1"],
    description: "初期仕入",
    amount: 1200,
  }),
  createEntry({
    id: "entry-2",
    occurredOn: "2026-05-08",
    partnerId: "partner-2",
    categoryIds: ["category-1", "category-2"],
    description: 'カンマ, と "引用符"',
    amount: 3400,
  }),
] satisfies AccountEntry[];

describe("ledgerExport", () => {
  it("serializes the visible all-partner table with partner column and total row", () => {
    const scope = createLedgerExportScope({
      canEdit: false,
      categories,
      fiscalYearStartMonth: 4,
      kind: "payable",
      partnerNames,
      selectedPartnerName: "すべての取引先",
      selectedPeriod: "2026-05",
      title: "買掛表",
      totalAmount: 4600,
      visibleEntries: entries,
    });

    expect(scope.columns.map((column) => column.label)).toEqual([
      "日付",
      "取引先",
      "種別",
      "摘要",
      "税込金額",
    ]);
    expect(scope.fileName).toBe("kaikake-すべての取引先-2026-5.csv");
    expect(serializeLedgerCsv(scope)).toBe(
      [
        "日付,取引先,種別,摘要,税込金額",
        "5/1,青木商店,仕入,初期仕入,1200",
        '5/8,佐藤工業,仕入 / 外注費,"カンマ, と ""引用符""",3400',
        "合計,,,,4600",
      ].join("\r\n"),
    );
  });

  it("omits the partner column when the visible table is scoped to one partner", () => {
    const scope = createLedgerExportScope({
      canEdit: true,
      categories,
      fiscalYearStartMonth: 4,
      kind: "receivable",
      partnerNames,
      selectedPartnerName: "青木商店",
      selectedPeriod: "FY2026",
      title: "売掛表",
      totalAmount: 1200,
      visibleEntries: entries.slice(0, 1).map((entry) => ({ ...entry, kind: "receivable" })),
    });

    expect(scope.columns.map((column) => column.label)).toEqual([
      "日付",
      "種別",
      "摘要",
      "税込金額",
    ]);
    expect(scope.fileName).toBe("urikake-青木商店-2026年度.csv");
    expect(serializeLedgerCsv(scope)).toBe(
      ["日付,種別,摘要,税込金額", "5/1,仕入,初期仕入,1200", "合計,,,1200"].join("\r\n"),
    );
  });
});

function createEntry(input: Partial<AccountEntry> & Pick<AccountEntry, "id">): AccountEntry {
  return {
    kind: "payable",
    occurredOn: "2026-05-01",
    partnerId: "partner-1",
    categoryIds: [],
    description: "摘要",
    amount: 0,
    ...input,
  };
}
