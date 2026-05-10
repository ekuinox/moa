import { Download, Printer, X } from "lucide-react";
import { useMemo } from "react";

import { Button, Text } from "../../components";

import { formatLedgerMonth } from "./formatters";
import styles from "./LedgerPanel.module.css";
import { LedgerPrintDocument } from "./LedgerPrintDocument";
import { LedgerTable } from "./LedgerTable";
import { createLedgerExportScope, downloadLedgerCsv } from "./ledgerExport";
import type { useAccountEntryLedger } from "./useAccountEntryLedger";

export interface LedgerPanelProps {
  readonly ledger: ReturnType<typeof useAccountEntryLedger>;
}

/** ステータス表示と編集テーブルを含む、中央の台帳パネルを表示する。 */
export function LedgerPanel({ ledger }: LedgerPanelProps) {
  // 画面に表示している行・列の状態を CSV と印刷用に固定し、各出力処理へ渡す。
  const exportScope = useMemo(
    () =>
      createLedgerExportScope({
        canEdit: ledger.canEdit,
        categories: ledger.categories,
        fiscalYearStartMonth: ledger.fiscalYearStartMonth,
        kind: ledger.kind,
        partnerNames: ledger.partnerNames,
        selectedPartnerName: ledger.selectedPartnerName,
        selectedPeriod: ledger.selectedPeriod,
        title: ledger.title,
        totalAmount: ledger.totalAmount,
        visibleEntries: ledger.visibleEntries,
      }),
    [
      ledger.canEdit,
      ledger.categories,
      ledger.fiscalYearStartMonth,
      ledger.kind,
      ledger.partnerNames,
      ledger.selectedPartnerName,
      ledger.selectedPeriod,
      ledger.title,
      ledger.totalAmount,
      ledger.visibleEntries,
    ],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <Text tone="eyebrow">{ledger.selectedPartnerName}</Text>
          <h2>
            {ledger.title} ({formatLedgerMonth(ledger.selectedPeriod, ledger.fiscalYearStartMonth)})
          </h2>
        </div>
        <div className={styles.headerActions}>
          <Button
            type="button"
            size="small"
            onClick={() => downloadLedgerCsv(exportScope)}
            aria-label="表示中の表を CSV 出力"
          >
            <Download size={16} aria-hidden="true" />
            CSV
          </Button>
          <Button
            type="button"
            size="small"
            onClick={() => window.print()}
            aria-label="表示中の表を印刷"
          >
            <Printer size={16} aria-hidden="true" />
            印刷
          </Button>
        </div>
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
      <LedgerPrintDocument report={exportScope} />
    </div>
  );
}
