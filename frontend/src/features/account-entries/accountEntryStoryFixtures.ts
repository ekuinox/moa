import type { AccountEntry, Category, Partner } from "../../lib/api";
import type { AccountEntryFormState, MonthTab } from "./types";

/** Storybook で帳票コンポーネントの見た目を確認するための取引先サンプル。 */
export const storyPartners = [
  { id: "partner-1", name: "アア商事", kana: "アアショウジ" },
  { id: "partner-2", name: "サンプル工業", kana: "サンプルコウギョウ" },
  { id: "partner-3", name: "ミライ設備", kana: "ミライセツビ" },
] satisfies Partner[];

/** Storybook で帳票コンポーネントの入力候補に使う種別サンプル。 */
export const storyCategories = [
  { id: "category-1", name: "仕入" },
  { id: "category-2", name: "外注費" },
  { id: "category-3", name: "消耗品" },
] satisfies Category[];

/** Storybook で月次・年間タブの状態を確認するための期間サンプル。 */
export const storyMonthTabs = [
  { key: "annual", label: "年間" },
  { key: "2026-01", label: "1" },
  { key: "2026-02", label: "2" },
  { key: "2026-03", label: "3" },
  { key: "2026-04", label: "4" },
  { key: "2026-05", label: "5" },
  { key: "2026-06", label: "6" },
  { key: "2026-07", label: "7" },
  { key: "2026-08", label: "8" },
  { key: "2026-09", label: "9" },
  { key: "2026-10", label: "10" },
  { key: "2026-11", label: "11" },
  { key: "2026-12", label: "12" },
] satisfies MonthTab[];

/** Storybook で一覧・行編集・合計表示を確認するための明細サンプル。 */
export const storyEntries = [
  {
    id: "entry-1",
    kind: "payable",
    occurredOn: "2026-05-06",
    partnerId: "partner-1",
    categoryId: "category-1",
    description: "材料仕入",
    amount: 55000,
  },
  {
    id: "entry-2",
    kind: "payable",
    occurredOn: "2026-05-16",
    partnerId: "partner-1",
    categoryId: "category-2",
    description: "施工代",
    amount: 170000,
  },
  {
    id: "entry-3",
    kind: "payable",
    occurredOn: "2026-05-21",
    partnerId: "partner-2",
    categoryId: "category-3",
    description: "備品購入",
    amount: 10000,
  },
] satisfies AccountEntry[];

/** Storybook で編集中の行を描画するためのフォーム値サンプル。 */
export const storyEditingRow = {
  occurredOn: "2026-05-16",
  categoryId: "category-2",
  description: "施工代（調整中）",
  amount: "180000",
} satisfies AccountEntryFormState;

/** ID を表示名に変換する UI の Story で使う名前引き用 Map を作る。 */
export function createStoryNameMap(
  items: readonly { readonly id: string; readonly name: string }[],
) {
  return new Map(items.map((item) => [item.id, item.name]));
}
