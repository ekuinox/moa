import type { Category, Partner } from "../../lib/api";
import type { MonthTab } from "./types";

const visibleMonthCount = 12;

/** 台帳テーブルで表示する種別や取引先を、id から名前へ引ける Map にする。 */
export function mapById(items: readonly Partner[] | readonly Category[]) {
  return new Map(items.map((item) => [item.id, item.name]));
}

/** 台帳タブで使う YYYY-MM 形式の現在月を返す。 */
export function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

/** 選択期間を含む年の、年間と 12 か月固定タブを作る。 */
export function createMonthTabs(selectedMonth: string): MonthTab[] {
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const month = Number.parseInt(monthText ?? "", 10);

  const yearKey = year.toString().padStart(4, "0");
  return [
    { key: yearKey, label: "年間" },
    ...Array.from({ length: visibleMonthCount }, (_, index) => {
      const monthNumber = index + 1;
      return {
        key: `${yearKey}-${monthNumber.toString().padStart(2, "0")}`,
        label: monthNumber.toString(),
      };
    }).map((item) => (item.key === selectedMonth ? { ...item, label: month.toString() } : item)),
  ];
}

/** YYYY または YYYY-MM の期間キーを台帳タイトル用に整形する。 */
export function formatLedgerMonth(value: string) {
  if (/^\d{4}$/.test(value)) {
    return `${value}年`;
  }
  const [year, month] = value.split("-");
  return `${year}/${Number.parseInt(month ?? "", 10)}`;
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
