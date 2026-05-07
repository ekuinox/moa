import type { Meta, StoryObj } from "@storybook/react";

import {
  createStoryNameMap,
  storyAvailableFiscalYears,
  storyCategories,
  storyEntries,
  storyFiscalYear,
  storyFiscalYearStartMonth,
  storyMonthTabs,
  storyPartners,
} from "./accountEntryStoryFixtures";
import { LedgerPanel } from "./LedgerPanel";
import type { useAccountEntryLedger } from "./useAccountEntryLedger";

type LedgerPanelState = ReturnType<typeof useAccountEntryLedger>;

const noop = () => undefined;

const baseLedger = {
  activeRowKey: undefined,
  availableFiscalYears: storyAvailableFiscalYears,
  canEdit: true,
  categories: storyCategories,
  categoryNames: createStoryNameMap(storyCategories),
  editingRows: {},
  entriesError: undefined,
  fiscalYearStartMonth: storyFiscalYearStartMonth,
  highlightedEntryId: undefined,
  isEntriesLoading: false,
  monthTabs: storyMonthTabs,
  noticeMessage: undefined,
  partners: storyPartners,
  partnerNames: createStoryNameMap(storyPartners),
  selectedCategoryFilter: null,
  selectedFiscalYear: storyFiscalYear,
  selectedPartnerId: storyPartners[0].id,
  selectedPartnerName: storyPartners[0].name,
  selectedPeriod: "2026-05",
  title: "買掛表",
  totalAmount: 225000,
  visibleEntries: storyEntries,
  errorMessage: undefined,
  clearNotice: noop,
  deleteEntry: noop,
  finishEditingRow: noop,
  saveExisting: noop,
  saveNew: noop,
  selectCategoryFilter: noop,
  selectFiscalYear: noop,
  selectPartner: noop,
  selectPeriod: noop,
  showTodo: noop,
  startEditing: noop,
  updateRow: noop,
} satisfies LedgerPanelState;

const meta = {
  title: "Features/Account Entries/LedgerPanel",
  component: LedgerPanel,
  args: {
    ledger: baseLedger,
  },
} satisfies Meta<typeof LedgerPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editable: Story = {};

export const ReadonlyAllPartners: Story = {
  args: {
    ledger: {
      ...baseLedger,
      canEdit: false,
      selectedPartnerId: "all",
      selectedPartnerName: "すべての取引先",
    },
  },
};

export const WithNotice: Story = {
  args: {
    ledger: {
      ...baseLedger,
      noticeMessage: "保存しました。",
    },
  },
};

export const WithError: Story = {
  args: {
    ledger: {
      ...baseLedger,
      errorMessage: "摘要を入力してください。",
    },
  },
};
