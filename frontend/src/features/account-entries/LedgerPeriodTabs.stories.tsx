import type { Meta, StoryObj } from "@storybook/react";

import { storyMonthTabs } from "./accountEntryStoryFixtures";
import { LedgerPeriodTabs } from "./LedgerPeriodTabs";

const meta = {
  title: "Features/Account Entries/LedgerPeriodTabs",
  component: LedgerPeriodTabs,
  args: {
    monthTabs: storyMonthTabs,
    selectedMonth: "2026-05",
    onSelectMonth: () => undefined,
  },
} satisfies Meta<typeof LedgerPeriodTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Monthly: Story = {};

export const Annual: Story = {
  args: {
    selectedMonth: "annual",
  },
};
