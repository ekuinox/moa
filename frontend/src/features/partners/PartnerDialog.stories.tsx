import type { Meta, StoryObj } from "@storybook/react";

import { PartnerDialog } from "./PartnerDialog";

const meta = {
  title: "Features/Partners/PartnerDialog",
  component: PartnerDialog,
  args: {
    isOpen: true,
    onCancel: () => undefined,
    onSave: async () => undefined,
  },
} satisfies Meta<typeof PartnerDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Add: Story = {};

export const Edit: Story = {
  args: {
    partner: {
      id: "partner-aoki",
      name: "青木商店",
      kana: "アオキショウテン",
    },
  },
};
