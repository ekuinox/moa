import type { AccountEntry, AccountEntryKind, Category } from "../../lib/api";
import { commands } from "../../lib/api/bindings.generated";
import { formatDate, formatLedgerMonth } from "./formatters";

/** CSV に出す列の定義。key は LedgerExportRow の値を取り出すために使い、配列順が CSV の列順になる。 */
export interface LedgerExportColumn {
  /** CSV 行オブジェクト上のフィールド名。列の並び替えや取引先列の有無をここで吸収する。 */
  readonly key: "occurredOn" | "partner" | "categories" | "description" | "amount";
  /** CSV ヘッダーとして出力する表示名。 */
  readonly label: string;
}

/** 表示中の明細 1 行を CSV 向けに整形した値。画面表示用の React 部品には依存させない。 */
export interface LedgerExportRow {
  /** 画面の読み取り表示と同じ M/D 形式の日付。 */
  readonly occurredOn: string;
  /** すべての取引先表示のときだけ出力する取引先名。取引先を選択中の表では列ごと省略する。 */
  readonly partner: string | undefined;
  /** 複数種別を CSV 1 セルに収めるため、表示名を区切って連結した値。 */
  readonly categories: string;
  /** 摘要はユーザー入力値をそのまま CSV エスケープして出力する。 */
  readonly description: string;
  /** 表計算で数値として扱えるよう、通貨記号や桁区切りを含めない整数文字列。 */
  readonly amount: string;
}

/** CSV 出力に必要な列、行、ファイル名、見出しをまとめたスナップショット。 */
export interface LedgerExportScope {
  /** 出力する列定義。取引先列の有無など「表示中の表」の形をここに閉じ込める。 */
  readonly columns: readonly LedgerExportColumn[];
  /** Tauri 保存ダイアログの既定ファイル名。 */
  readonly fileName: string;
  /** 買掛/売掛の種別。ファイル名や将来の帳票種別判定に使う。 */
  readonly kind: AccountEntryKind;
  /** 選択中の取引先表示名。ファイル名や将来のプレビュー見出しで使う。 */
  readonly partnerLabel: string;
  /** 選択中期間の表示名。ファイル名や将来のプレビュー見出しで使う。 */
  readonly periodLabel: string;
  /** CSV に出す明細行。createLedgerExportScope に渡された visibleEntries と同じ順序を保つ。 */
  readonly rows: readonly LedgerExportRow[];
  /** 買掛表/売掛表などの帳票タイトル。将来の帳票プレビューでも再利用できるよう保持する。 */
  readonly title: string;
  /** 合計行の金額。明細の amount と同じく数値リテラルとして出力する。 */
  readonly totalAmount: string;
}

/** 現在の台帳表示状態から CSV 用スナップショットを作るための入力。 */
export interface CreateLedgerExportScopeInput {
  /** 取引先が選択され編集可能な表かどうか。false のとき CSV に取引先列を出す。 */
  readonly canEdit: boolean;
  /** 種別 ID を表示名へ変換するための候補一覧。 */
  readonly categories: readonly Category[];
  /** 年間タブの表示名を作るための年度開始月。 */
  readonly fiscalYearStartMonth: number;
  /** 買掛/売掛の種別。ファイル名の prefix に使う。 */
  readonly kind: AccountEntryKind;
  /** 取引先 ID を表示名へ変換するための Map。すべての取引先表示の CSV で使う。 */
  readonly partnerNames: ReadonlyMap<string, string>;
  /** 画面で選択中の取引先名。未選択時の防御として undefined を許容する。 */
  readonly selectedPartnerName: string | undefined;
  /** YYYY-MM または FYxxxx の期間キー。CSV ファイル名の期間表示へ変換する。 */
  readonly selectedPeriod: string;
  /** 画面タイトル。CSV には直接出さないが、出力スナップショットの文脈として保持する。 */
  readonly title: string;
  /** 表示中明細の合計金額。CSV の合計行に使う。 */
  readonly totalAmount: number;
  /** 画面側で絞り込み済みの明細。今後、別期間指定 UI から別の行セットを渡せる入口にする。 */
  readonly visibleEntries: readonly AccountEntry[];
}

/** 取引先列を持たない、取引先選択中の台帳と同じ基本 CSV 列。 */
const BASE_COLUMNS = [
  { key: "occurredOn", label: "日付" },
  { key: "categories", label: "種別" },
  { key: "description", label: "摘要" },
  { key: "amount", label: "税込金額" },
] satisfies readonly LedgerExportColumn[];
/** すべての取引先表示でだけ BASE_COLUMNS に差し込む列。 */
const PARTNER_COLUMN = { key: "partner", label: "取引先" } satisfies LedgerExportColumn;

/** 表示中の台帳を CSV へ渡すための、期間差し替え可能なスナップショットにする。 */
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
      amount: entry.amount.toString(),
    })),
    title,
    totalAmount: totalAmount.toString(),
  };
}

/** LedgerExportScope を CSV 文字列へ変換する。値の引用符処理はこの関数に集約する。 */
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

/** Tauri アプリでは保存ダイアログを開いて CSV を書き出し、Vite 単体では利用不可を通知する。 */
export async function downloadLedgerCsv(scope: LedgerExportScope) {
  if (!isTauriRuntime()) {
    window.alert("CSV 出力は Tauri アプリで起動した場合のみ利用できます。");
    return;
  }

  await commands.exportLedgerCsv(scope.fileName, serializeLedgerCsv(scope));
}

/** 保存ダイアログの既定名として使えるよう、帳票種別・取引先・期間から安全な CSV 名を作る。 */
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

/** 種別 ID 配列を CSV 1 セルに入れる表示名へ変換する。削除済み ID も分かるように残す。 */
function formatCategoryNames(
  categoryIds: readonly string[],
  categoryNames: ReadonlyMap<string, string>,
) {
  return categoryIds.map((id) => categoryNames.get(id) ?? "(削除済み)").join(" / ");
}

/** カンマや改行を含むセルだけを CSV の規則に従って引用する。数値文字列は引用しない。 */
function escapeCsvCell(value: string) {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }
  return `"${value.replaceAll('"', '""')}"`;
}

/** Vite dev / Storybook では Tauri command が呼べないため、保存処理の分岐に使う。 */
function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
