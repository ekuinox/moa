/** 年度キーの先頭につける接頭辞。月キー（YYYY-MM）と区別するために使う。 */
export const FISCAL_YEAR_PREFIX = "FY";

/** ISO 日付（YYYY-MM-DD or YYYY-MM）と年度開始月から、その日が属する年度を返す。 */
export function fiscalYearOf(isoDate: string, fiscalYearStartMonth: number): number {
  const [yearText, monthText] = isoDate.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const month = Number.parseInt(monthText ?? "", 10);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  return month >= fiscalYearStartMonth ? year : year - 1;
}

/** 年度番号を「FYxxxx」形式のキーへ変換する。 */
export function fiscalYearKey(fiscalYear: number): string {
  return `${FISCAL_YEAR_PREFIX}${fiscalYear.toString().padStart(4, "0")}`;
}

/** 「FYxxxx」形式のキーから年度番号を取り出す。形式が違う場合は undefined。 */
export function parseFiscalYearKey(key: string): number | undefined {
  const match = /^FY(\d{4})$/.exec(key);
  if (!match) {
    return undefined;
  }
  return Number.parseInt(match[1] ?? "", 10);
}

/** キーが「FYxxxx」形式かを判定する。 */
export function isFiscalYearKey(key: string): boolean {
  return /^FY\d{4}$/.test(key);
}

/** 年度の範囲情報。月一覧、開始日、翌年度開始日（範囲フィルタ用に exclusive）を持つ。 */
export interface FiscalYearRange {
  readonly startIsoDate: string;
  readonly endIsoDateExclusive: string;
  readonly months: readonly { readonly year: number; readonly month: number }[];
}

/** 年度番号と年度開始月から、その年度に属する 12 ヶ月と境界日を返す。 */
export function fiscalYearRange(fiscalYear: number, fiscalYearStartMonth: number): FiscalYearRange {
  const months: { year: number; month: number }[] = [];
  for (let i = 0; i < 12; i += 1) {
    const offset = fiscalYearStartMonth - 1 + i;
    const year = fiscalYear + Math.floor(offset / 12);
    const month = (offset % 12) + 1;
    months.push({ year, month });
  }
  return {
    startIsoDate: formatYearMonthDay(fiscalYear, fiscalYearStartMonth, 1),
    endIsoDateExclusive: formatYearMonthDay(fiscalYear + 1, fiscalYearStartMonth, 1),
    months,
  };
}

function formatYearMonthDay(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/** プルダウンに並べる年度の一覧。エントリが属する年度に当日の年度を加えて重複排除し、降順で返す。 */
export function listAvailableFiscalYears(
  entries: readonly { readonly occurredOn: string }[],
  fiscalYearStartMonth: number,
  today: Date = new Date(),
): readonly number[] {
  const todayIso = todayLocalIsoDate(today);
  const set = new Set<number>([fiscalYearOf(todayIso, fiscalYearStartMonth)]);
  for (const entry of entries) {
    set.add(fiscalYearOf(entry.occurredOn, fiscalYearStartMonth));
  }
  return [...set].sort((left, right) => right - left);
}

function todayLocalIsoDate(today: Date): string {
  return formatYearMonthDay(today.getFullYear(), today.getMonth() + 1, today.getDate());
}
