import styles from "./AccountEntryList.module.css";
import { LedgerPanel } from "./LedgerPanel";
import { LedgerPartnerRail } from "./LedgerPartnerRail";
import { LedgerPeriodTabs } from "./LedgerPeriodTabs";
import type { AccountEntryListProps } from "./types";
import { useAccountEntryLedger } from "./useAccountEntryLedger";

/** 買掛/売掛の台帳画面を、制御 hook が返す表示モデルから組み立てる。 */
export function AccountEntryList({ kind }: AccountEntryListProps) {
  const ledger = useAccountEntryLedger(kind);

  return (
    <div className={styles.screen}>
      <LedgerPartnerRail
        partners={ledger.partners}
        selectedPartnerId={ledger.selectedPartnerId}
        onSelectPartner={ledger.selectPartner}
        onShowAddTodo={() => ledger.showTodo("取引先追加モーダルは未設計です。")}
      />

      <section className={styles.workspace} aria-label={`${ledger.title}明細`}>
        <LedgerPeriodTabs
          monthTabs={ledger.monthTabs}
          selectedMonth={ledger.selectedMonth}
          onSelectMonth={ledger.selectMonth}
        />
        <LedgerPanel ledger={ledger} />
      </section>
    </div>
  );
}
