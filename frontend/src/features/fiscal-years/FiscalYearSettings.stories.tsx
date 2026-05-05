import type { Meta, StoryObj } from "@storybook/react";

import { FiscalYearSettings } from "./FiscalYearSettings";

const meta = {
  title: "Features/FiscalYears/FiscalYearSettings",
  component: FiscalYearSettings,
} satisfies Meta<typeof FiscalYearSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
