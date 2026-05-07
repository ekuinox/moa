import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import { type AccountEntryKind, apiClient } from "../../lib/api";
import { fiscalYearOf, listAvailableFiscalYears } from "./fiscalYear";
import { createMonthTabs, currentYearMonth, mapById } from "./formatters";
import { createActiveRowPointerDownHandler, createLedgerActions } from "./ledgerActions";
import { calculateTotalAmount, createVisibleEntries } from "./ledgerState";
import type { AccountEntryFormState } from "./types";

const DEFAULT_FISCAL_YEAR_START_MONTH = 4;

/** 台帳のデータ取得、表示範囲、インライン編集ドラフト、保存/削除をまとめて制御する。 */
export function useAccountEntryLedger(kind: AccountEntryKind) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState(currentYearMonth());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    fiscalYearOf(currentYearMonth(), DEFAULT_FISCAL_YEAR_START_MONTH),
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ReadonlySet<string> | null>(
    null,
  );
  const [editingRows, setEditingRows] = useState<Record<string, AccountEntryFormState>>({});
  const [activeRowKey, setActiveRowKey] = useState<string | undefined>();
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const fiscalYearInitializedRef = useRef(false);
  const {
    data: entries = [],
    error: entriesError,
    isLoading: isEntriesLoading,
    mutate,
  } = useSWR("account-entries", () => apiClient.accountEntries.list());
  const { data: partners = [] } = useSWR("partners", () => apiClient.partners.list());
  const { data: categories = [] } = useSWR("categories", () => apiClient.categories.list());
  const { data: settings } = useSWR("settings", () => apiClient.settings.get());

  const fiscalYearStartMonth = settings?.fiscalYearStartMonth ?? DEFAULT_FISCAL_YEAR_START_MONTH;
  const partnerNames = mapById(partners);
  const categoryNames = mapById(categories);
  const title = kind === "payable" ? "買掛表" : "売掛表";
  const canEdit = selectedPartnerId !== "all";
  const monthTabs = createMonthTabs({ fiscalYear: selectedFiscalYear, fiscalYearStartMonth });
  const availableFiscalYears = listAvailableFiscalYears(entries, fiscalYearStartMonth);
  const visibleEntries = createVisibleEntries(
    entries,
    kind,
    selectedPeriod,
    selectedPartnerId,
    fiscalYearStartMonth,
    selectedCategoryFilter,
  );
  const totalAmount = calculateTotalAmount(visibleEntries);
  const selectedPartnerName =
    selectedPartnerId === "all" ? "すべての取引先" : partnerNames.get(selectedPartnerId);
  const actions = useMemo(
    () =>
      createLedgerActions({
        activeRowKey,
        canEdit,
        editingRows,
        fiscalYearStartMonth,
        kind,
        mutate,
        selectedPartnerId,
        selectedPeriod,
        setActiveRowKey,
        setEditingRows,
        setErrorMessage,
        setHighlightedEntryId,
        setNoticeMessage,
        setSelectedCategoryFilter,
        setSelectedFiscalYear,
        setSelectedPartnerId,
        setSelectedPeriod,
      }),
    [
      activeRowKey,
      canEdit,
      editingRows,
      fiscalYearStartMonth,
      kind,
      mutate,
      selectedPartnerId,
      selectedPeriod,
    ],
  );

  useEffect(() => {
    if (fiscalYearInitializedRef.current) {
      return;
    }
    if (settings === undefined) {
      return;
    }
    setSelectedFiscalYear(fiscalYearOf(selectedPeriod, settings.fiscalYearStartMonth));
    fiscalYearInitializedRef.current = true;
  }, [selectedPeriod, settings]);

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
    availableFiscalYears,
    canEdit,
    categories,
    categoryNames,
    editingRows,
    entriesError,
    fiscalYearStartMonth,
    isEntriesLoading,
    monthTabs,
    noticeMessage,
    partners,
    partnerNames,
    selectedCategoryFilter,
    selectedFiscalYear,
    selectedPartnerId,
    selectedPartnerName,
    selectedPeriod,
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
    selectCategoryFilter: actions.selectCategoryFilter,
    selectFiscalYear: actions.selectFiscalYear,
    selectPartner: actions.selectPartner,
    selectPeriod: actions.selectPeriod,
    showTodo: actions.showTodo,
    startEditing: actions.startEditing,
    updateRow: actions.updateRow,
  };
}
