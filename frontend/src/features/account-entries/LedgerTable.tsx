import { useEffect, useRef } from "react";

import type { AccountEntry, Category } from "../../lib/api";
import { CategoryFilterHeader } from "./CategoryFilterHeader";
import { EditableNewRow, LedgerRow, LedgerTotalRow } from "./LedgerRows";
import styles from "./LedgerTable.module.css";
import type { AccountEntryFormState } from "./types";

export interface LedgerTableProps {
  readonly activeRowKey: string | undefined;
  readonly canEdit: boolean;
  readonly categories: readonly Category[];
  readonly editingRows: Readonly<Record<string, AccountEntryFormState>>;
  readonly fiscalYearStartMonth: number;
  readonly highlightedEntryId: string | undefined;
  readonly partnerNames: ReadonlyMap<string, string>;
  readonly selectedCategoryFilter: ReadonlySet<string> | null;
  readonly selectedPeriod: string;
  readonly totalAmount: number;
  readonly visibleEntries: readonly AccountEntry[];
  readonly onDeleteEntry: (entry: AccountEntry) => void;
  readonly onFinishEditing: (entry: AccountEntry) => void;
  readonly onSaveExisting: (entry: AccountEntry) => void;
  readonly onSaveNew: (draft: AccountEntryFormState) => void;
  readonly onSelectCategoryFilter: (next: ReadonlySet<string> | null) => void;
  readonly onStartEditing: (entry: AccountEntry) => void;
  readonly onUpdateRow: (rowKey: string, values: Partial<AccountEntryFormState>) => void;
}

/** 台帳テーブルの枠組みを表示し、行ごとの編集処理は行コンポーネントへ委譲する。 */
export function LedgerTable({
  activeRowKey,
  canEdit,
  categories,
  editingRows,
  fiscalYearStartMonth,
  highlightedEntryId,
  partnerNames,
  selectedCategoryFilter,
  selectedPeriod,
  totalAmount,
  visibleEntries,
  onDeleteEntry,
  onFinishEditing,
  onSaveExisting,
  onSaveNew,
  onSelectCategoryFilter,
  onStartEditing,
  onUpdateRow,
}: LedgerTableProps) {
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const visibleEntryCount = visibleEntries.length;

  useEffect(() => {
    if (!highlightedEntryId || visibleEntryCount === 0) {
      return;
    }

    const tableWrap = tableWrapRef.current;
    if (!tableWrap) {
      return;
    }

    const highlightedRow = Array.from(
      tableWrap.querySelectorAll<HTMLTableRowElement>("[data-ledger-row-key]"),
    ).find((row) => row.dataset.ledgerRowKey === highlightedEntryId);

    if (!highlightedRow) {
      return;
    }

    const headerHeight = tableWrap.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const scrollTop = Math.max(highlightedRow.offsetTop - headerHeight, 0);

    tableWrap.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, [highlightedEntryId, visibleEntryCount]);

  return (
    <div className={styles.tableWrap} ref={tableWrapRef}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.dateCol} />
          {!canEdit ? <col className={styles.partnerCol} /> : null}
          <col className={styles.categoryCol} />
          <col />
          <col className={styles.amountCol} />
          <col className={styles.actionCol} />
        </colgroup>
        <thead>
          <tr>
            <th>日付</th>
            {!canEdit ? <th>取引先</th> : null}
            <th>
              <CategoryFilterHeader
                categories={categories}
                value={selectedCategoryFilter}
                onChange={onSelectCategoryFilter}
              />
            </th>
            <th>摘要</th>
            <th>税込金額</th>
            <th>
              <span className="visually-hidden">操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleEntries.map((entry) => (
            <LedgerRow
              canEdit={canEdit}
              categories={categories}
              activeRowKey={activeRowKey}
              draft={editingRows[entry.id]}
              entry={entry}
              isHighlighted={highlightedEntryId === entry.id}
              key={entry.id}
              partnerName={partnerNames.get(entry.partnerId) ?? "未登録の取引先"}
              onDelete={() => onDeleteEntry(entry)}
              onFinishEditing={() => onFinishEditing(entry)}
              onSave={() => onSaveExisting(entry)}
              onStartEditing={() => onStartEditing(entry)}
              onUpdate={(values) => onUpdateRow(entry.id, values)}
            />
          ))}
          {canEdit ? (
            <EditableNewRow
              categories={categories}
              selectedPeriod={selectedPeriod}
              fiscalYearStartMonth={fiscalYearStartMonth}
              onSave={onSaveNew}
            />
          ) : null}
          {!canEdit && visibleEntries.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <p className="muted-text">この条件の明細はまだ登録されていません。</p>
              </td>
            </tr>
          ) : null}
        </tbody>
        <LedgerTotalRow canEdit={canEdit} totalAmount={totalAmount} />
      </table>
    </div>
  );
}
