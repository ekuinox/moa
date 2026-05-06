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

  it("選択月を含む年の年間タブと 12 か月タブを作る", () => {
    const tabs = createMonthTabs("2026-05");

    expect(tabs).toHaveLength(13);
    expect(tabs[0]).toEqual({ key: "2026", label: "年間" });
    expect(tabs[1]).toEqual({ key: "2026-01", label: "1" });
    expect(tabs[5]).toEqual({ key: "2026-05", label: "5" });
    expect(tabs[12]).toEqual({ key: "2026-12", label: "12" });
  });

  it("期間キーを台帳タイトル用に整形する", () => {
    expect(formatLedgerMonth("2026")).toBe("2026年");
    expect(formatLedgerMonth("2026-05")).toBe("2026/5");
    expect(formatLedgerMonth("2026-11")).toBe("2026/11");
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
