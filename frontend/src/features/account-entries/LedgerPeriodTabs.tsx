import { formatLedgerMonth } from "./formatters";
import styles from "./LedgerPeriodTabs.module.css";
import type { MonthTab } from "./types";

export interface LedgerPeriodTabsProps {
  readonly monthTabs: readonly MonthTab[];
  readonly selectedPeriod: string;
  readonly availableFiscalYears: readonly number[];
  readonly selectedFiscalYear: number;
  readonly fiscalYearStartMonth: number;
  readonly onSelectPeriod: (key: string) => void;
  readonly onSelectFiscalYear: (fiscalYear: number) => void;
}

/** 台帳テーブル上部に年度プルダウンと年間/月の期間選択タブを表示する。 */
export function LedgerPeriodTabs({
  monthTabs,
  selectedPeriod,
  availableFiscalYears,
  selectedFiscalYear,
  fiscalYearStartMonth,
  onSelectPeriod,
  onSelectFiscalYear,
}: LedgerPeriodTabsProps) {
  return (
    <div className={styles.periodNav}>
      <select
        className={styles.fiscalYearSelect}
        aria-label="年度切替"
        value={selectedFiscalYear}
        onChange={(event) => {
          onSelectFiscalYear(Number(event.target.value));
          event.currentTarget.blur();
        }}
      >
        {availableFiscalYears.map((fiscalYear) => (
          <option key={fiscalYear} value={fiscalYear}>
            {formatLedgerMonth(`FY${fiscalYear.toString().padStart(4, "0")}`, fiscalYearStartMonth)}
          </option>
        ))}
      </select>
      <nav className={styles.periodTabs} aria-label="期間切替">
        {monthTabs.map((month) => (
          <button
            className={
              selectedPeriod === month.key
                ? `${styles.periodTabItem} ${styles.periodTabItemActive}`
                : styles.periodTabItem
            }
            key={month.key}
            type="button"
            onClick={() => onSelectPeriod(month.key)}
          >
            {month.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
