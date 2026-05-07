import { X } from "lucide-react";

import { Button, Text } from "../../components";

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
          <Text tone="eyebrow">{ledger.selectedPartnerName}</Text>
          <h2>
            {ledger.title} ({formatLedgerMonth(ledger.selectedPeriod, ledger.fiscalYearStartMonth)})
          </h2>
        </div>
        <Button
          type="button"
          onClick={() => ledger.showTodo("設定タブで編集する内容は未設計です。")}
        >
          設定
        </Button>
      </div>

      {ledger.noticeMessage ? (
        <div className={styles.noticeBar}>
          <span>{ledger.noticeMessage}</span>
          <button type="button" onClick={ledger.clearNotice} aria-label="通知を閉じる">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {ledger.isEntriesLoading ? <Text>読み込み中です。</Text> : null}
      {ledger.entriesError ? <Text tone="error">明細の読み込みに失敗しました。</Text> : null}
      {ledger.errorMessage ? (
        <Text tone="error" className={styles.inlineError}>
          {ledger.errorMessage}
        </Text>
      ) : null}
      <LedgerTable
        activeRowKey={ledger.activeRowKey}
        canEdit={ledger.canEdit}
        categories={ledger.categories}
        editingRows={ledger.editingRows}
        fiscalYearStartMonth={ledger.fiscalYearStartMonth}
        highlightedEntryId={ledger.highlightedEntryId}
        partnerNames={ledger.partnerNames}
        selectedCategoryFilter={ledger.selectedCategoryFilter}
        selectedPeriod={ledger.selectedPeriod}
        totalAmount={ledger.totalAmount}
        visibleEntries={ledger.visibleEntries}
        onDeleteEntry={ledger.deleteEntry}
        onFinishEditing={ledger.finishEditingRow}
        onSaveExisting={ledger.saveExisting}
        onSaveNew={ledger.saveNew}
        onSelectCategoryFilter={ledger.selectCategoryFilter}
        onStartEditing={ledger.startEditing}
        onUpdateRow={ledger.updateRow}
      />
    </div>
  );
}
