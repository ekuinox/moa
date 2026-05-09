import type { AccountEntry, AccountEntryKind, Category } from "../../lib/api";
import { formatCurrency, formatDate, formatLedgerMonth } from "./formatters";

export interface LedgerExportColumn {
  readonly key: "occurredOn" | "partner" | "categories" | "description" | "amount";
  readonly label: string;
}

export interface LedgerExportRow {
  readonly occurredOn: string;
  readonly partner: string | undefined;
  readonly categories: string;
  readonly description: string;
  readonly amount: string;
}

export interface LedgerExportScope {
  readonly columns: readonly LedgerExportColumn[];
  readonly fileName: string;
  readonly kind: AccountEntryKind;
  readonly partnerLabel: string;
  readonly periodLabel: string;
  readonly rows: readonly LedgerExportRow[];
  readonly title: string;
  readonly totalAmount: string;
}

export interface CreateLedgerExportScopeInput {
  readonly canEdit: boolean;
  readonly categories: readonly Category[];
  readonly fiscalYearStartMonth: number;
  readonly kind: AccountEntryKind;
  readonly partnerNames: ReadonlyMap<string, string>;
  readonly selectedPartnerName: string | undefined;
  readonly selectedPeriod: string;
  readonly title: string;
  readonly totalAmount: number;
  readonly visibleEntries: readonly AccountEntry[];
}

const BASE_COLUMNS = [
  { key: "occurredOn", label: "日付" },
  { key: "categories", label: "種別" },
  { key: "description", label: "摘要" },
  { key: "amount", label: "税込金額" },
] satisfies readonly LedgerExportColumn[];
const PARTNER_COLUMN = { key: "partner", label: "取引先" } satisfies LedgerExportColumn;

/** 表示中の台帳を CSV/印刷へ渡すための、期間差し替え可能なスナップショットにする。 */
export function createLedgerExportScope({
  canEdit,
  categories,
  fiscalYearStartMonth,
  kind,
  partnerNames,
  selectedPartnerName,
  selectedPeriod,
  title,
  totalAmount,
  visibleEntries,
}: CreateLedgerExportScopeInput): LedgerExportScope {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const columns = canEdit
    ? BASE_COLUMNS
    : [BASE_COLUMNS[0], PARTNER_COLUMN, BASE_COLUMNS[1], BASE_COLUMNS[2], BASE_COLUMNS[3]];
  const periodLabel = formatLedgerMonth(selectedPeriod, fiscalYearStartMonth);
  const partnerLabel = selectedPartnerName ?? "未選択";

  return {
    columns,
    fileName: createLedgerCsvFileName({ kind, partnerLabel, periodLabel }),
    kind,
    partnerLabel,
    periodLabel,
    rows: visibleEntries.map((entry) => ({
      occurredOn: formatDate(entry.occurredOn),
      partner: canEdit ? undefined : (partnerNames.get(entry.partnerId) ?? "未登録の取引先"),
      categories: formatCategoryNames(entry.categoryIds, categoryNames),
      description: entry.description,
      amount: formatCurrency(entry.amount),
    })),
    title,
    totalAmount: formatCurrency(totalAmount),
  };
}

export function serializeLedgerCsv(scope: LedgerExportScope) {
  const header = scope.columns.map((column) => column.label);
  const body = scope.rows.map((row) => scope.columns.map((column) => row[column.key] ?? ""));
  const totalRow = scope.columns.map((column, index) => {
    if (index === 0) {
      return "合計";
    }
    return column.key === "amount" ? scope.totalAmount : "";
  });

  return [header, ...body, totalRow].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export async function downloadLedgerCsv(scope: LedgerExportScope) {
  if (!isTauriRuntime()) {
    window.alert("CSV 出力は Tauri アプリで起動した場合のみ利用できます。");
    return;
  }

  const [{ save }, { writeTextFile }] = await Promise.all([
    import("@tauri-apps/plugin-dialog"),
    import("@tauri-apps/plugin-fs"),
  ]);
  const path = await save({
    defaultPath: scope.fileName,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });

  if (!path) {
    return;
  }

  await writeTextFile(path, serializeLedgerCsv(scope));
}

export function printLedger() {
  window.print();
}

function createLedgerCsvFileName({
  kind,
  partnerLabel,
  periodLabel,
}: {
  readonly kind: AccountEntryKind;
  readonly partnerLabel: string;
  readonly periodLabel: string;
}) {
  const kindLabel = kind === "payable" ? "kaikake" : "urikake";
  const safePartner = partnerLabel.replace(/[\\/:*?"<>|]/g, "_");
  const safePeriod = periodLabel.replace(/[\\/:*?"<>|]/g, "-");
  return `${kindLabel}-${safePartner}-${safePeriod}.csv`;
}

function formatCategoryNames(
  categoryIds: readonly string[],
  categoryNames: ReadonlyMap<string, string>,
) {
  return categoryIds.map((id) => categoryNames.get(id) ?? "(削除済み)").join(" / ");
}

function escapeCsvCell(value: string) {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }
  return `"${value.replaceAll('"', '""')}"`;
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
