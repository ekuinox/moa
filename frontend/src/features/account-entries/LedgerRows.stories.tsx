import type { Meta, StoryObj } from "@storybook/react";

import { storyCategories, storyEditingRow, storyEntries } from "./accountEntryStoryFixtures";
import { EditableNewRow, LedgerRow, LedgerTotalRow } from "./LedgerRows";
import tableStyles from "./LedgerTable.module.css";

const rowMeta = {
  title: "Features/Account Entries/LedgerRows/LedgerRow",
  component: LedgerRow,
  render: (args) => (
    <table className={tableStyles.table}>
      <tbody>
        <LedgerRow {...args} />
      </tbody>
    </table>
  ),
  args: {
    activeRowKey: undefined,
    canEdit: true,
    categories: storyCategories,
    categoryName: "仕入",
    draft: undefined,
    entry: storyEntries[0],
    isHighlighted: false,
    partnerName: "アア商事",
    onDelete: () => undefined,
    onFinishEditing: () => undefined,
    onSave: () => undefined,
    onStartEditing: () => undefined,
    onUpdate: () => undefined,
  },
} satisfies Meta<typeof LedgerRow>;

export default rowMeta;

type LedgerRowStory = StoryObj<typeof rowMeta>;

export const DisplayRow: LedgerRowStory = {};

export const EditingRow: LedgerRowStory = {
  args: {
    activeRowKey: storyEntries[1].id,
    draft: storyEditingRow,
    entry: storyEntries[1],
  },
};

export const ReadonlyRow: LedgerRowStory = {
  args: {
    canEdit: false,
  },
};

export const HighlightedRow: LedgerRowStory = {
  args: {
    entry: storyEntries[2],
    isHighlighted: true,
  },
};

type EditableNewRowStory = StoryObj<typeof EditableNewRow>;

export const NewRow: EditableNewRowStory = {
  render: (args) => (
    <table className={tableStyles.table}>
      <tbody>
        <EditableNewRow {...args} />
      </tbody>
    </table>
  ),
  args: {
    categories: storyCategories,
    selectedPeriod: "2026-05",
    fiscalYearStartMonth: 4,
    onSave: () => undefined,
  },
};

type LedgerTotalRowStory = StoryObj<typeof LedgerTotalRow>;

export const TotalRow: LedgerTotalRowStory = {
  render: (args) => (
    <table className={tableStyles.table}>
      <LedgerTotalRow {...args} />
    </table>
  ),
  args: {
    canEdit: true,
    totalAmount: 225000,
  },
};
