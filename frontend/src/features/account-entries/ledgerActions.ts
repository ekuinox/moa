import type { Dispatch, SetStateAction } from "react";

import { type AccountEntry, type AccountEntryKind, apiClient } from "../../lib/api";
import { parseDraft } from "./accountEntryForm";
import {
  closeUnchangedEditingRow,
  openEditingRow,
  removeEditingRow,
  updateEditingRow,
} from "./ledgerState";
import type { AccountEntryFormState } from "./types";

const newRowKey = "__new__";

type EditingRowsSetter = Dispatch<SetStateAction<Record<string, AccountEntryFormState>>>;

interface LedgerActionParams {
  readonly activeRowKey: string | undefined;
  readonly canEdit: boolean;
  readonly editingRows: Readonly<Record<string, AccountEntryFormState>>;
  readonly kind: AccountEntryKind;
  readonly mutate: () => Promise<unknown>;
  readonly selectedMonth: string;
  readonly selectedPartnerId: string;
  readonly setActiveRowKey: Dispatch<SetStateAction<string | undefined>>;
  readonly setEditingRows: EditingRowsSetter;
  readonly setErrorMessage: Dispatch<SetStateAction<string | undefined>>;
  readonly setHighlightedEntryId: Dispatch<SetStateAction<string | undefined>>;
  readonly setNoticeMessage: Dispatch<SetStateAction<string | undefined>>;
  readonly setSelectedMonth: Dispatch<SetStateAction<string>>;
  readonly setSelectedPartnerId: Dispatch<SetStateAction<string>>;
}

interface ActiveRowPointerDownParams {
  readonly activeRowKey: string;
  readonly entries: readonly AccountEntry[];
  readonly finishEditingRow: (entry: AccountEntry) => void;
  readonly setActiveRowKey: Dispatch<SetStateAction<string | undefined>>;
}

/** 台帳 hook から渡された state と setter を使い、画面操作用の関数群を作る。 */
export function createLedgerActions({
  activeRowKey,
  canEdit,
  editingRows,
  kind,
  mutate,
  selectedMonth,
  selectedPartnerId,
  setActiveRowKey,
  setEditingRows,
  setErrorMessage,
  setHighlightedEntryId,
  setNoticeMessage,
  setSelectedMonth,
  setSelectedPartnerId,
}: LedgerActionParams) {
  /** 表示範囲を変えたあとに、一時的な編集状態を消す。 */
  function resetEditableRows() {
    setEditingRows({});
    setErrorMessage(undefined);
  }

  /** 開いている表が取引先を決めるため、取引先選択時はドラフトをリセットする。 */
  function selectPartner(partnerId: string) {
    setSelectedPartnerId(partnerId);
    resetEditableRows();
  }

  /** 月を切り替え、前の期間に紐づいていたドラフトを破棄する。 */
  function selectMonth(month: string) {
    setSelectedMonth(month);
    resetEditableRows();
  }

  /** 保存済み行をインライン編集状態にする。 */
  function startEditing(entry: AccountEntry) {
    if (!canEdit) {
      return;
    }

    setActiveRowKey(entry.id);
    setEditingRows((current) => openEditingRow(current, entry));
  }

  /** 編集中の保存済み行のドラフトを保持する。 */
  function updateRow(rowKey: string, values: Partial<AccountEntryFormState>) {
    setEditingRows((current) => updateEditingRow(current, rowKey, values, selectedMonth));
  }

  /** 保存済み行のドラフトを保存する。 */
  function saveExisting(entry: AccountEntry) {
    void saveRow(entry.id, entry);
  }

  /** 末尾の空行ドラフトを新規明細として保存する。 */
  function saveNew(draft: AccountEntryFormState) {
    void saveRow(newRowKey, undefined, draft);
  }

  /** 保存済み行または新規行のドラフトを保存する。 */
  async function saveRow(
    rowKey: string,
    entry?: AccountEntry,
    draftOverride?: AccountEntryFormState,
  ) {
    if (!canEdit) {
      return;
    }

    setErrorMessage(undefined);

    const draft = draftOverride ?? editingRows[rowKey];
    if (!draft) {
      return;
    }

    const input = parseDraft(draft, selectedPartnerId);
    if (!input) {
      setErrorMessage("日付、種別、金額を入力してください。");
      return;
    }

    try {
      if (entry) {
        await apiClient.accountEntries.update({
          id: entry.id,
          kind,
          ...input,
        });
      } else {
        const createdEntry = await apiClient.accountEntries.create({
          kind,
          ...input,
        });
        setHighlightedEntryId(createdEntry.id);
      }

      setEditingRows((current) => removeEditingRow(current, rowKey));
      setActiveRowKey(undefined);
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "明細の保存に失敗しました。");
    }
  }

  /** ユーザー確認後、保存済み行を削除する。 */
  async function deleteEntry(entry: AccountEntry) {
    setErrorMessage(undefined);
    const confirmed = window.confirm(`${entry.occurredOn} の明細を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.accountEntries.delete(entry.id);
      setEditingRows((current) => removeEditingRow(current, entry.id));
      if (activeRowKey === entry.id) {
        setActiveRowKey(undefined);
      }
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "明細の削除に失敗しました。");
    }
  }

  /** 保存済み行の編集終了時、未変更ならドラフトを消し、変更済みなら保存待ちとして残す。 */
  function finishEditingRow(entry: AccountEntry) {
    setActiveRowKey(undefined);
    setEditingRows((current) => closeUnchangedEditingRow(current, entry));
  }

  /** まだ設計していない領域向けの一時メッセージを表示する。 */
  function showTodo(message: string) {
    setNoticeMessage(message);
  }

  /** 一時通知バーを閉じる。 */
  function clearNotice() {
    setNoticeMessage(undefined);
  }

  return {
    clearNotice,
    deleteEntry: (entry: AccountEntry) => void deleteEntry(entry),
    finishEditingRow,
    saveExisting,
    saveNew,
    selectMonth,
    selectPartner,
    showTodo,
    startEditing,
    updateRow,
  };
}

/** アクティブ行の外側クリックを、編集終了処理へ変換するイベントハンドラーを作る。 */
export function createActiveRowPointerDownHandler({
  activeRowKey,
  entries,
  finishEditingRow,
  setActiveRowKey,
}: ActiveRowPointerDownParams) {
  return (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(`[data-ledger-row-key="${activeRowKey}"]`)) {
      return;
    }

    const entry = entries.find((item) => item.id === activeRowKey);
    if (entry) {
      finishEditingRow(entry);
    } else {
      setActiveRowKey(undefined);
    }
  };
}
