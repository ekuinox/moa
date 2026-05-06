import type { Meta, StoryObj } from "@storybook/react";

import {
  createStoryNameMap,
  storyCategories,
  storyEditingRow,
  storyEntries,
  storyPartners,
} from "./accountEntryStoryFixtures";
import { LedgerTable } from "./LedgerTable";

const meta = {
  title: "Features/Account Entries/LedgerTable",
  component: LedgerTable,
  args: {
    activeRowKey: undefined,
    canEdit: true,
    categories: storyCategories,
    categoryNames: createStoryNameMap(storyCategories),
    editingRows: {},
    highlightedEntryId: undefined,
    partnerNames: createStoryNameMap(storyPartners),
    selectedMonth: "2026-05",
    totalAmount: 225000,
    visibleEntries: storyEntries,
    onDeleteEntry: () => undefined,
    onFinishEditing: () => undefined,
    onSaveExisting: () => undefined,
    onSaveNew: () => undefined,
    onStartEditing: () => undefined,
    onUpdateRow: () => undefined,
  },
} satisfies Meta<typeof LedgerTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editable: Story = {};

export const ReadonlyAllPartners: Story = {
  args: {
    canEdit: false,
  },
};

export const EditingRow: Story = {
  args: {
    activeRowKey: storyEntries[1].id,
    editingRows: {
      [storyEntries[1].id]: storyEditingRow,
    },
  },
};

export const HighlightedNewEntry: Story = {
  args: {
    highlightedEntryId: storyEntries[2].id,
  },
};

export const EmptyReadonly: Story = {
  args: {
    canEdit: false,
    totalAmount: 0,
    visibleEntries: [],
  },
};
