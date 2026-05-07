import { X } from "lucide-react";
import { formatLedgerMonth } from "./formatters";
import styles from "./LedgerPanel.module.css";
import { LedgerTable } from "./LedgerTable";
import type { useAccountEntryLedger } from "./useAccountEntryLedger";

export interface LedgerPanelProps {
  readonly ledger: ReturnType<typeof useAccountEntryLedger>;
}

/** ステータス表示と編集テーブルを含む、中央の台帳パネルを表示する。 */
export function LedgerPanel({ ledger }: LedgerPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className="eyebrow">{ledger.selectedPartnerName}</p>
          <h2>
            {ledger.title} ({formatLedgerMonth(ledger.selectedPeriod, ledger.fiscalYearStartMonth)})
          </h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => ledger.showTodo("設定タブで編集する内容は未設計です。")}
        >
          設定
        </button>
      </div>

      {ledger.noticeMessage ? (
        <div className={styles.noticeBar}>
          <span>{ledger.noticeMessage}</span>
          <button type="button" onClick={ledger.clearNotice} aria-label="通知を閉じる">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {ledger.isEntriesLoading ? <p className="muted-text">読み込み中です。</p> : null}
      {ledger.entriesError ? <p className="form-error">明細の読み込みに失敗しました。</p> : null}
      {ledger.errorMessage ? (
        <p className={`form-error ${styles.inlineError}`}>{ledger.errorMessage}</p>
      ) : null}
      <LedgerTable
        activeRowKey={ledger.activeRowKey}
        canEdit={ledger.canEdit}
        categories={ledger.categories}
        categoryNames={ledger.categoryNames}
        editingRows={ledger.editingRows}
        fiscalYearStartMonth={ledger.fiscalYearStartMonth}
        highlightedEntryId={ledger.highlightedEntryId}
        partnerNames={ledger.partnerNames}
        selectedPeriod={ledger.selectedPeriod}
        totalAmount={ledger.totalAmount}
        visibleEntries={ledger.visibleEntries}
        onDeleteEntry={ledger.deleteEntry}
        onFinishEditing={ledger.finishEditingRow}
        onSaveExisting={ledger.saveExisting}
        onSaveNew={ledger.saveNew}
        onStartEditing={ledger.startEditing}
        onUpdateRow={ledger.updateRow}
      />
    </div>
  );
}
