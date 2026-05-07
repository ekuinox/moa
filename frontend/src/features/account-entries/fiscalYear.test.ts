import { describe, expect, it } from "vitest";

import {
  FISCAL_YEAR_PREFIX,
  fiscalYearKey,
  fiscalYearOf,
  fiscalYearRange,
  isFiscalYearKey,
  listAvailableFiscalYears,
  parseFiscalYearKey,
} from "./fiscalYear";

describe("fiscalYearOf", () => {
  it("年度開始月以降の日付は当該暦年と同じ年度になる", () => {
    expect(fiscalYearOf("2026-04-01", 4)).toBe(2026);
    expect(fiscalYearOf("2026-05-06", 4)).toBe(2026);
    expect(fiscalYearOf("2026-12-31", 4)).toBe(2026);
  });

  it("年度開始月より前の日付は前年の年度になる", () => {
    expect(fiscalYearOf("2026-03-31", 4)).toBe(2025);
    expect(fiscalYearOf("2027-02-15", 4)).toBe(2026);
  });

  it("年度開始月が 1 月のときは暦年と一致する", () => {
    expect(fiscalYearOf("2026-01-01", 1)).toBe(2026);
    expect(fiscalYearOf("2026-12-31", 1)).toBe(2026);
  });

  it("YYYY-MM 形式でも年度を計算できる", () => {
    expect(fiscalYearOf("2026-05", 4)).toBe(2026);
    expect(fiscalYearOf("2026-03", 4)).toBe(2025);
  });

  it("不正な ISO 日付は例外を投げる", () => {
    expect(() => fiscalYearOf("not-a-date", 4)).toThrow();
  });
});

describe("fiscalYearKey / parseFiscalYearKey / isFiscalYearKey", () => {
  it("年度番号を FYxxxx 形式のキーに変換する", () => {
    expect(fiscalYearKey(2026)).toBe("FY2026");
    expect(fiscalYearKey(99)).toBe("FY0099");
  });

  it("FY 接頭辞は FISCAL_YEAR_PREFIX と一致する", () => {
    expect(FISCAL_YEAR_PREFIX).toBe("FY");
  });

  it("FYxxxx 形式のキーから年度番号を取り出す", () => {
    expect(parseFiscalYearKey("FY2026")).toBe(2026);
  });

  it("FYxxxx 形式以外は undefined を返す", () => {
    expect(parseFiscalYearKey("2026")).toBeUndefined();
    expect(parseFiscalYearKey("2026-05")).toBeUndefined();
    expect(parseFiscalYearKey("FY26")).toBeUndefined();
  });

  it("isFiscalYearKey は FYxxxx 形式のみ true", () => {
    expect(isFiscalYearKey("FY2026")).toBe(true);
    expect(isFiscalYearKey("2026-05")).toBe(false);
    expect(isFiscalYearKey("2026")).toBe(false);
  });
});

describe("fiscalYearRange", () => {
  it("年度開始月が 4 のときは 4 月始まりで翌年 3 月まで並ぶ", () => {
    const range = fiscalYearRange(2026, 4);
    expect(range.months).toEqual([
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
      { year: 2026, month: 7 },
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
      { year: 2027, month: 2 },
      { year: 2027, month: 3 },
    ]);
    expect(range.startIsoDate).toBe("2026-04-01");
    expect(range.endIsoDateExclusive).toBe("2027-04-01");
  });

  it("年度開始月が 1 のときは暦年と一致する", () => {
    const range = fiscalYearRange(2026, 1);
    expect(range.months[0]).toEqual({ year: 2026, month: 1 });
    expect(range.months[11]).toEqual({ year: 2026, month: 12 });
    expect(range.startIsoDate).toBe("2026-01-01");
    expect(range.endIsoDateExclusive).toBe("2027-01-01");
  });

  it("年度開始月が 12 のときは 12 月始まりで翌年 11 月まで並ぶ", () => {
    const range = fiscalYearRange(2026, 12);
    expect(range.months[0]).toEqual({ year: 2026, month: 12 });
    expect(range.months[1]).toEqual({ year: 2027, month: 1 });
    expect(range.months[11]).toEqual({ year: 2027, month: 11 });
    expect(range.startIsoDate).toBe("2026-12-01");
    expect(range.endIsoDateExclusive).toBe("2027-12-01");
  });
});

describe("listAvailableFiscalYears", () => {
  const today = new Date(2026, 4, 6); // 2026-05-06 (local)

  it("エントリが空でも当日の年度は必ず含む", () => {
    expect(listAvailableFiscalYears([], 4, today)).toEqual([2026]);
  });

  it("エントリが属する年度と当日の年度を重複排除して降順で返す", () => {
    const entries = [
      { occurredOn: "2024-08-10" },
      { occurredOn: "2025-12-31" },
      { occurredOn: "2026-03-15" }, // FY2025
      { occurredOn: "2026-04-01" }, // FY2026
    ];
    expect(listAvailableFiscalYears(entries, 4, today)).toEqual([2026, 2025, 2024]);
  });

  it("年度開始月が 1 のときは暦年単位で集約する", () => {
    const entries = [
      { occurredOn: "2024-12-31" },
      { occurredOn: "2025-01-01" },
      { occurredOn: "2026-05-06" },
    ];
    expect(listAvailableFiscalYears(entries, 1, today)).toEqual([2026, 2025, 2024]);
  });
});
