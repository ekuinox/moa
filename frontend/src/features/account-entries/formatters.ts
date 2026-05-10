import type { Category, Partner } from "../../lib/api";
import { fiscalYearKey, fiscalYearRange, parseFiscalYearKey } from "./fiscalYear";
import type { MonthTab } from "./types";

/** 台帳テーブルで表示する種別や取引先を、id から名前へ引ける Map にする。 */
export function mapById(items: readonly Partner[] | readonly Category[]) {
  return new Map(items.map((item) => [item.id, item.name]));
}

/** 台帳タブで使う YYYY-MM 形式の現在月を返す。 */
export function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

/** 指定した年度の年間タブと、年度開始月から並ぶ 12 か月タブを作る。 */
export function createMonthTabs(input: {
  readonly fiscalYear: number;
  readonly fiscalYearStartMonth: number;
}): MonthTab[] {
  const { fiscalYear, fiscalYearStartMonth } = input;
  const range = fiscalYearRange(fiscalYear, fiscalYearStartMonth);
  return [
    { key: fiscalYearKey(fiscalYear), label: "年間" },
    ...range.months.map(({ year, month }) => ({
      key: `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`,
      label: month.toString(),
    })),
  ];
}

/** 期間キーを台帳タイトル用に整形する。FYxxxx は年度表記、YYYY-MM は YYYY/MM 表記。 */
export function formatLedgerMonth(value: string, fiscalYearStartMonth: number) {
  const fiscalYear = parseFiscalYearKey(value);
  if (fiscalYear !== undefined) {
    return fiscalYearStartMonth === 1 ? `${fiscalYear}年` : `${fiscalYear}年度`;
  }
  const [year, month] = value.split("-");
  return `${year}/${(month ?? "").padStart(2, "0")}`;
}

/** ISO 日付を、読み取り表示セルで使う M/D 形式へ整形する。 */
export function formatDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number.parseInt(month ?? "", 10)}/${Number.parseInt(day ?? "", 10)}`;
}

/** 台帳表示用に円金額を整形する。 */
export function formatCurrency(value: number) {
  return `¥${value.toLocaleString("ja-JP")}`;
}
