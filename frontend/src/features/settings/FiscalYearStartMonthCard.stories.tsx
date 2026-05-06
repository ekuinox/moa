import type { Meta, StoryObj } from "@storybook/react";

import { FiscalYearStartMonthCard } from "./FiscalYearStartMonthCard";

const meta = {
  title: "Features/Settings/FiscalYearStartMonthCard",
  component: FiscalYearStartMonthCard,
} satisfies Meta<typeof FiscalYearStartMonthCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
