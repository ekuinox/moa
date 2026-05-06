import type { Meta, StoryObj } from "@storybook/react";

import { storyPartners } from "./accountEntryStoryFixtures";
import { LedgerPartnerRail } from "./LedgerPartnerRail";

const meta = {
  title: "Features/Account Entries/LedgerPartnerRail",
  component: LedgerPartnerRail,
  args: {
    partners: storyPartners,
    selectedPartnerId: storyPartners[0].id,
    onSelectPartner: () => undefined,
    onShowAddTodo: () => undefined,
  },
} satisfies Meta<typeof LedgerPartnerRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectedPartner: Story = {};

export const AllPartners: Story = {
  args: {
    selectedPartnerId: "all",
  },
};

export const ManyPartners: Story = {
  args: {
    partners: [
      ...storyPartners,
      ...Array.from({ length: 12 }, (_, index) => ({
        id: `partner-extra-${index + 1}`,
        name: `追加取引先 ${index + 1}`,
        kana: `ツイカトリヒキサキ${index + 1}`,
      })),
    ],
    selectedPartnerId: "partner-extra-6",
  },
};
