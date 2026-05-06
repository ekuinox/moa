import styles from "./LedgerPeriodTabs.module.css";
import type { MonthTab } from "./types";

export interface LedgerPeriodTabsProps {
  readonly monthTabs: readonly MonthTab[];
  readonly selectedMonth: string;
  readonly onSelectMonth: (month: string) => void;
}

/** 台帳テーブル上部に年間と月の期間選択タブを表示する。 */
export function LedgerPeriodTabs({
  monthTabs,
  selectedMonth,
  onSelectMonth,
}: LedgerPeriodTabsProps) {
  return (
    <nav className={styles.periodTabs} aria-label="期間切替">
      {monthTabs.map((month) => (
        <button
          className={
            selectedMonth === month.key
              ? `${styles.periodTabItem} ${styles.periodTabItemActive}`
              : styles.periodTabItem
          }
          key={month.key}
          type="button"
          onClick={() => onSelectMonth(month.key)}
        >
          {month.label}
        </button>
      ))}
    </nav>
  );
}
