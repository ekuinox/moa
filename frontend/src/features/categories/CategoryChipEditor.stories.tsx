import type { Meta, StoryObj } from "@storybook/react";

import { CategoryChipEditor } from "./CategoryChipEditor";

const meta = {
  title: "Features/Categories/CategoryChipEditor",
  component: CategoryChipEditor,
} satisfies Meta<typeof CategoryChipEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
