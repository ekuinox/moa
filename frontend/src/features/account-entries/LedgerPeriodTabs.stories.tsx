import type { Meta, StoryObj } from "@storybook/react";

import {
  storyAvailableFiscalYears,
  storyFiscalYear,
  storyFiscalYearStartMonth,
  storyMonthTabs,
} from "./accountEntryStoryFixtures";
import { createMonthTabs } from "./formatters";
import { LedgerPeriodTabs } from "./LedgerPeriodTabs";

const meta = {
  title: "Features/Account Entries/LedgerPeriodTabs",
  component: LedgerPeriodTabs,
  args: {
    monthTabs: storyMonthTabs,
    selectedPeriod: "2026-05",
    availableFiscalYears: storyAvailableFiscalYears,
    selectedFiscalYear: storyFiscalYear,
    fiscalYearStartMonth: storyFiscalYearStartMonth,
    onSelectPeriod: () => undefined,
    onSelectFiscalYear: () => undefined,
  },
} satisfies Meta<typeof LedgerPeriodTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Monthly: Story = {};

export const Annual: Story = {
  args: {
    selectedPeriod: "FY2026",
  },
};

export const MonthlyCalendarYear: Story = {
  args: {
    monthTabs: createMonthTabs({ fiscalYear: 2026, fiscalYearStartMonth: 1 }),
    selectedPeriod: "2026-05",
    fiscalYearStartMonth: 1,
  },
};

export const PreviousFiscalYear: Story = {
  args: {
    selectedFiscalYear: 2024,
    monthTabs: createMonthTabs({ fiscalYear: 2024, fiscalYearStartMonth: 4 }),
    selectedPeriod: "FY2024",
  },
};
