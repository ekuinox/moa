import type { AccountEntry, AccountEntryKind } from "../../lib/api";
import { createEmptyForm, createFormFromEntry, isRowDirty } from "./accountEntryForm";
import { fiscalYearRange, parseFiscalYearKey } from "./fiscalYear";
import type { AccountEntryFormState } from "./types";

/** 「種別未設定」の行をフィルタで指定するための擬似キー。実際の category ID と衝突しないよう接頭辞を付ける。 */
export const UNCATEGORIZED_FILTER_KEY = "__moa_uncategorized__";

/** 明細一覧を現在の台帳表示範囲へ絞り込み、古い日付が上に来る順で並べる。 */
export function createVisibleEntries(
  entries: readonly AccountEntry[],
  kind: AccountEntryKind,
  selectedPeriod: string,
  selectedPartnerId: string,
  fiscalYearStartMonth: number,
  selectedCategoryFilter: ReadonlySet<string> | null,
) {
  const matchesPeriod = createPeriodMatcher(selectedPeriod, fiscalYearStartMonth);
  return [...entries]
    .filter((entry) => {
      if (entry.kind !== kind) {
        return false;
      }
      if (!matchesPeriod(entry.occurredOn)) {
        return false;
      }
      if (selectedPartnerId !== "all" && entry.partnerId !== selectedPartnerId) {
        return false;
      }
      return matchesCategoryFilter(entry, selectedCategoryFilter);
    })
    .sort((left, right) => left.occurredOn.localeCompare(right.occurredOn));
}

/** 種別フィルタの一致判定。null は「フィルタ未適用」を意味し全件通す。 */
function matchesCategoryFilter(
  entry: AccountEntry,
  selectedCategoryFilter: ReadonlySet<string> | null,
) {
  if (selectedCategoryFilter === null) {
    return true;
  }
  if (entry.categoryIds.length === 0) {
    return selectedCategoryFilter.has(UNCATEGORIZED_FILTER_KEY);
  }
  return entry.categoryIds.some((id) => selectedCategoryFilter.has(id));
}

/** 期間キーが FY なら年度範囲、月なら従来通りの前方一致で判定する関数を返す。 */
function createPeriodMatcher(
  selectedPeriod: string,
  fiscalYearStartMonth: number,
): (occurredOn: string) => boolean {
  const fiscalYear = parseFiscalYearKey(selectedPeriod);
  if (fiscalYear !== undefined) {
    const range = fiscalYearRange(fiscalYear, fiscalYearStartMonth);
    return (occurredOn) =>
      occurredOn >= range.startIsoDate && occurredOn < range.endIsoDateExclusive;
  }
  return (occurredOn) => occurredOn.startsWith(selectedPeriod);
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
  selectedPeriod: string,
  fiscalYearStartMonth: number,
) {
  const base = editingRows[rowKey] ?? createEmptyForm(selectedPeriod, fiscalYearStartMonth);
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
