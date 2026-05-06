import type { Meta, StoryObj } from "@storybook/react";

import { SettingsTab } from "./SettingsTab";

const meta = {
  title: "Features/Settings/SettingsTab",
  component: SettingsTab,
} satisfies Meta<typeof SettingsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
