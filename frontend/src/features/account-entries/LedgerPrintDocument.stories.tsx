import type { Meta, StoryObj } from "@storybook/react";

import type { AccountEntry } from "../../lib/api";
import {
  createStoryNameMap,
  storyCategories,
  storyEntries,
  storyFiscalYearStartMonth,
  storyPartners,
} from "./accountEntryStoryFixtures";
import { LedgerPrintDocument } from "./LedgerPrintDocument";
import { createLedgerExportScope } from "./ledgerExport";

const meta: Meta<typeof LedgerPrintDocument> = {
  title: "Features/Account Entries/LedgerPrintDocument",
  component: LedgerPrintDocument,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          body {
            background: #e7ecef;
          }

          [data-print-document] {
            display: block !important;
            box-sizing: border-box;
            width: min(100%, 1120px) !important;
            min-height: 720px;
            margin: 24px auto;
            padding: 28px 34px;
            box-shadow: 0 12px 32px rgb(23 32 38 / 18%);
          }
        `}</style>
        <Story />
      </>
    ),
  ],
  args: {
    heading: "すべての取引先 買掛表 (2026/05) 仕入, 外注費",
    report: createReport(storyEntries, false),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const AllPartners: Story = {};

export const SelectedPartner: Story = {
  args: {
    heading: "アア商事 買掛表 (2026/05)",
    report: createReport(
      storyEntries.filter((entry) => entry.partnerId === storyPartners[0].id),
      true,
      storyPartners[0].name,
    ),
  },
};

export const ManyRows: Story = {
  args: {
    heading: "すべての取引先 買掛表 (2026年度)",
    report: createReport(createManyEntries(), false, "すべての取引先", "FY2026"),
  },
};

function createReport(
  entries: readonly AccountEntry[],
  canEdit: boolean,
  selectedPartnerName = "すべての取引先",
  selectedPeriod = "2026-05",
) {
  return createLedgerExportScope({
    canEdit,
    categories: storyCategories,
    fiscalYearStartMonth: storyFiscalYearStartMonth,
    kind: "payable",
    partnerNames: createStoryNameMap(storyPartners),
    selectedPartnerName,
    selectedPeriod,
    title: "買掛表",
    totalAmount: entries.reduce((total, entry) => total + entry.amount, 0),
    visibleEntries: entries,
  });
}

function createManyEntries() {
  const descriptions = ["材料仕入", "施工代", "備品購入", "追加部材", "運搬費", "加工工賃"];
  return Array.from({ length: 72 }, (_, index) => {
    const base = storyEntries[index % storyEntries.length];
    const day = (index % 24) + 1;
    const month = Math.floor(index / 6) + 4;
    const year = month > 12 ? 2027 : 2026;
    const displayMonth = month > 12 ? month - 12 : month;

    return {
      ...base,
      id: `print-story-entry-${index.toString().padStart(2, "0")}`,
      occurredOn: `${year}-${displayMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
      partnerId: storyPartners[index % storyPartners.length].id,
      description: descriptions[index % descriptions.length],
      amount: base.amount + index * 1200,
    } satisfies AccountEntry;
  });
}
