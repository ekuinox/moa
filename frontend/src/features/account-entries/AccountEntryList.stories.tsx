import type { Meta, StoryObj } from "@storybook/react";

import { AccountEntryList } from "./AccountEntryList";

const meta = {
  title: "Features/AccountEntryList",
  component: AccountEntryList,
} satisfies Meta<typeof AccountEntryList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
