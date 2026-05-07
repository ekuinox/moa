import { afterEach, describe, expect, it, vi } from "vitest";

import type { Category, Partner } from "../../lib/api";
import {
  createMonthTabs,
  currentYearMonth,
  formatCurrency,
  formatDate,
  formatLedgerMonth,
  mapById,
} from "./formatters";

describe("formatters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("取引先や種別を id から名前へ引ける Map にする", () => {
    const partners: Partner[] = [
      { id: "partner-a", name: "青木商店", kana: "あおきしょうてん" },
      { id: "partner-b", name: "佐藤工務店", kana: "さとうこうむてん" },
    ];
    const categories: Category[] = [
      { id: "category-a", name: "仕入" },
      { id: "category-b", name: "外注費" },
    ];

    expect(mapById(partners).get("partner-a")).toBe("青木商店");
    expect(mapById(categories).get("category-b")).toBe("外注費");
  });

  it("現在月を YYYY-MM 形式で返す", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T12:00:00+09:00"));

    expect(currentYearMonth()).toBe("2026-05");
  });

  it("年度開始月が 4 のときは年間タブと 4 月始まりの 12 か月タブを作る", () => {
    const tabs = createMonthTabs({ fiscalYear: 2026, fiscalYearStartMonth: 4 });

    expect(tabs).toHaveLength(13);
    expect(tabs[0]).toEqual({ key: "FY2026", label: "年間" });
    expect(tabs[1]).toEqual({ key: "2026-04", label: "4" });
    expect(tabs[9]).toEqual({ key: "2026-12", label: "12" });
    expect(tabs[10]).toEqual({ key: "2027-01", label: "1" });
    expect(tabs[12]).toEqual({ key: "2027-03", label: "3" });
  });

  it("年度開始月が 1 のときは暦年と一致する 12 か月タブを作る", () => {
    const tabs = createMonthTabs({ fiscalYear: 2026, fiscalYearStartMonth: 1 });

    expect(tabs).toHaveLength(13);
    expect(tabs[0]).toEqual({ key: "FY2026", label: "年間" });
    expect(tabs[1]).toEqual({ key: "2026-01", label: "1" });
    expect(tabs[12]).toEqual({ key: "2026-12", label: "12" });
  });

  it("FY キーは年度開始月に応じて年度・年表記を切り替える", () => {
    expect(formatLedgerMonth("FY2026", 4)).toBe("2026年度");
    expect(formatLedgerMonth("FY2026", 1)).toBe("2026年");
  });

  it("月キーは年度開始月に関わらず YYYY/M 形式に整形する", () => {
    expect(formatLedgerMonth("2026-05", 4)).toBe("2026/5");
    expect(formatLedgerMonth("2027-02", 4)).toBe("2027/2");
    expect(formatLedgerMonth("2026-11", 1)).toBe("2026/11");
  });

  it("ISO 日付を読み取りセル用の M/D 形式へ整形する", () => {
    expect(formatDate("2026-05-06")).toBe("5/6");
    expect(formatDate("2026-12-31")).toBe("12/31");
  });

  it("円金額を台帳表示用に整形する", () => {
    expect(formatCurrency(0)).toBe("¥0");
    expect(formatCurrency(1234567)).toBe("¥1,234,567");
  });
});
