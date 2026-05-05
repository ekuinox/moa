import type { Meta, StoryObj } from "@storybook/react";

import { PartnerMaster } from "./PartnerMaster";

const meta = {
  title: "Features/Partners/PartnerMaster",
  component: PartnerMaster,
} satisfies Meta<typeof PartnerMaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
