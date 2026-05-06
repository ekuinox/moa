import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { type AccountEntryKind, apiClient } from "../../lib/api";
import { createMonthTabs, currentYearMonth, mapById } from "./formatters";
import { createActiveRowPointerDownHandler, createLedgerActions } from "./ledgerActions";
import { calculateTotalAmount, createVisibleEntries } from "./ledgerState";
import type { AccountEntryFormState } from "./types";

/** 台帳のデータ取得、表示範囲、インライン編集ドラフト、保存/削除をまとめて制御する。 */
export function useAccountEntryLedger(kind: AccountEntryKind) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth());
  const [editingRows, setEditingRows] = useState<Record<string, AccountEntryFormState>>({});
  const [activeRowKey, setActiveRowKey] = useState<string | undefined>();
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const {
    data: entries = [],
    error: entriesError,
    isLoading: isEntriesLoading,
    mutate,
  } = useSWR("account-entries", () => apiClient.accountEntries.list());
  const { data: partners = [] } = useSWR("partners", () => apiClient.partners.list());
  const { data: categories = [] } = useSWR("categories", () => apiClient.categories.list());

  const partnerNames = mapById(partners);
  const categoryNames = mapById(categories);
  const title = kind === "payable" ? "買掛表" : "売掛表";
  const canEdit = selectedPartnerId !== "all";
  const monthTabs = createMonthTabs(selectedMonth);
  const visibleEntries = createVisibleEntries(entries, kind, selectedMonth, selectedPartnerId);
  const totalAmount = calculateTotalAmount(visibleEntries);
  const selectedPartnerName =
    selectedPartnerId === "all" ? "すべての取引先" : partnerNames.get(selectedPartnerId);
  const actions = useMemo(
    () =>
      createLedgerActions({
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
      }),
    [activeRowKey, canEdit, editingRows, kind, mutate, selectedMonth, selectedPartnerId],
  );

  useEffect(() => {
    if (!activeRowKey) {
      return;
    }

    const handlePointerDown = createActiveRowPointerDownHandler({
      activeRowKey,
      entries,
      finishEditingRow: actions.finishEditingRow,
      setActiveRowKey,
    });
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [actions.finishEditingRow, activeRowKey, entries]);

  useEffect(() => {
    if (!highlightedEntryId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedEntryId(undefined);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedEntryId]);

  return {
    activeRowKey,
    canEdit,
    categories,
    categoryNames,
    editingRows,
    entriesError,
    isEntriesLoading,
    monthTabs,
    noticeMessage,
    partners,
    partnerNames,
    selectedMonth,
    selectedPartnerId,
    selectedPartnerName,
    title,
    totalAmount,
    visibleEntries,
    errorMessage,
    highlightedEntryId,
    clearNotice: actions.clearNotice,
    deleteEntry: actions.deleteEntry,
    finishEditingRow: actions.finishEditingRow,
    saveExisting: actions.saveExisting,
    saveNew: actions.saveNew,
    selectMonth: actions.selectMonth,
    selectPartner: actions.selectPartner,
    showTodo: actions.showTodo,
    startEditing: actions.startEditing,
    updateRow: actions.updateRow,
  };
}
