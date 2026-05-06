import type { AccountEntry, AccountEntryKind } from "../../lib/api";
import { createEmptyForm, createFormFromEntry, isRowDirty } from "./accountEntryForm";
import type { AccountEntryFormState } from "./types";

/** 明細一覧を現在の台帳表示範囲へ絞り込み、古い日付が上に来る順で並べる。 */
export function createVisibleEntries(
  entries: readonly AccountEntry[],
  kind: AccountEntryKind,
  selectedPeriod: string,
  selectedPartnerId: string,
) {
  return [...entries]
    .filter((entry) => {
      if (entry.kind !== kind) {
        return false;
      }
      if (!entry.occurredOn.startsWith(selectedPeriod)) {
        return false;
      }
      return selectedPartnerId === "all" || entry.partnerId === selectedPartnerId;
    })
    .sort((left, right) => left.occurredOn.localeCompare(right.occurredOn));
}

/** 明細一覧の合計金額を計算する。 */
export function calculateTotalAmount(entries: readonly AccountEntry[]) {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

/** 指定行を編集開始できるように、保存済み明細からドラフトを用意する。 */
export function openEditingRow(
  editingRows: Readonly<Record<string, AccountEntryFormState>>,
  entry: AccountEntry,
) {
  return {
    ...editingRows,
    [entry.id]: editingRows[entry.id] ?? createFormFromEntry(entry),
  };
}

/** 編集中の行ドラフトへ、セルから届いた部分更新を反映する。 */
export function updateEditingRow(
  editingRows: Readonly<Record<string, AccountEntryFormState>>,
  rowKey: string,
  values: Partial<AccountEntryFormState>,
  selectedMonth: string,
) {
  const base = editingRows[rowKey] ?? createEmptyForm(selectedMonth);
  return {
    ...editingRows,
    [rowKey]: {
      ...base,
      ...values,
    },
  };
}

/** 保存や削除が終わった行を、編集ドラフト一覧から取り除く。 */
export function removeEditingRow(
  editingRows: Readonly<Record<string, AccountEntryFormState>>,
  rowKey: string,
) {
  const next = { ...editingRows };
  delete next[rowKey];
  return next;
}

/** 未変更の行だけ編集ドラフトを破棄し、変更済み行は保存ボタン表示のため残す。 */
export function closeUnchangedEditingRow(
  editingRows: Readonly<Record<string, AccountEntryFormState>>,
  entry: AccountEntry,
) {
  const draft = editingRows[entry.id];
  if (!draft || isRowDirty(draft, entry)) {
    return editingRows;
  }
  return removeEditingRow(editingRows, entry.id);
}
