import type { Meta, StoryObj } from "@storybook/react";

import { CategoryMaster } from "./CategoryMaster";

const meta = {
  title: "Features/Categories/CategoryMaster",
  component: CategoryMaster,
} satisfies Meta<typeof CategoryMaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
