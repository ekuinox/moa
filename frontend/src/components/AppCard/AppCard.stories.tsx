import type { Meta, StoryObj } from "@storybook/react";

import { AppCard } from "./AppCard";

const meta = {
  title: "Components/AppCard",
  component: AppCard,
} satisfies Meta<typeof AppCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "取引先",
    description: "読み仮名順で表示します。",
    children: <p>青木商店</p>,
  },
};
