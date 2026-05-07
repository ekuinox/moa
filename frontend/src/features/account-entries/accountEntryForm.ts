import * as v from "valibot";

import type { AccountEntry } from "../../lib/api";
import { parseFiscalYearKey } from "./fiscalYear";
import type { AccountEntryFormState } from "./types";

/** 開いている表から決まる取引先を含めた、保存直前の明細ドラフト用 schema。 */
const accountEntryDraftSchema = v.object({
  occurredOn: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/)),
  partnerId: v.pipe(v.string(), v.nonEmpty()),
  categoryId: v.pipe(v.string(), v.nonEmpty()),
  description: v.string(),
  amount: v.pipe(v.string(), v.regex(/^\d+$/)),
});

/** テーブル内で編集できるセルを react-hook-form で扱うための schema。 */
export const accountEntryFormSchema = v.object({
  occurredOn: accountEntryDraftSchema.entries.occurredOn,
  categoryId: accountEntryDraftSchema.entries.categoryId,
  description: accountEntryDraftSchema.entries.description,
  amount: accountEntryDraftSchema.entries.amount,
});

/** 選択期間に合わせた新規入力行の初期値を作る。 */
export function createEmptyForm(
  selectedPeriod: string,
  fiscalYearStartMonth: number,
): AccountEntryFormState {
  return {
    occurredOn: createInitialOccurredOn(selectedPeriod, fiscalYearStartMonth),
    categoryId: "",
    description: "",
    amount: "0",
  };
}

/** 年度表示では年度開始月の 1 日、月表示では月初を新規行の初期日付にする。 */
function createInitialOccurredOn(selectedPeriod: string, fiscalYearStartMonth: number) {
  const fiscalYear = parseFiscalYearKey(selectedPeriod);
  if (fiscalYear !== undefined) {
    const year = fiscalYear.toString().padStart(4, "0");
    const month = fiscalYearStartMonth.toString().padStart(2, "0");
    return `${year}-${month}-01`;
  }
  return `${selectedPeriod}-01`;
}

/** 保存済み明細を、テーブルセルで扱う文字列ベースのフォーム状態へ変換する。 */
export function createFormFromEntry(entry: AccountEntry): AccountEntryFormState {
  return {
    occurredOn: entry.occurredOn,
    categoryId: entry.categoryId,
    description: entry.description,
    amount: entry.amount.toString(),
  };
}

/** watch したフォーム値の欠けを埋め、比較や保存で常に完全な形を使えるようにする。 */
export function normalizeFormValues(values: Partial<AccountEntryFormState>): AccountEntryFormState {
  return {
    occurredOn: values.occurredOn ?? "",
    categoryId: values.categoryId ?? "",
    description: values.description ?? "",
    amount: values.amount ?? "",
  };
}

/** 型変換をせず、2 つのフォーム状態が同じ入力内容かを比較する。 */
export function isSameDraft(left: AccountEntryFormState, right: AccountEntryFormState) {
  return (
    left.occurredOn === right.occurredOn &&
    left.categoryId === right.categoryId &&
    left.description === right.description &&
    left.amount === right.amount
  );
}

/** 保存済み行に、まだ保存していないテーブル上の編集があるかを判定する。 */
export function isRowDirty(draft: AccountEntryFormState, entry: AccountEntry) {
  return (
    draft.occurredOn !== entry.occurredOn ||
    draft.categoryId !== entry.categoryId ||
    draft.description !== entry.description ||
    Number.parseInt(draft.amount, 10) !== entry.amount
  );
}

/** 常に表示される新規入力行に、ユーザー入力が入っているかを判定する。 */
export function isNewRowDirty(
  draft: AccountEntryFormState,
  selectedPeriod: string,
  fiscalYearStartMonth: number,
) {
  const empty = createEmptyForm(selectedPeriod, fiscalYearStartMonth);
  return (
    draft.occurredOn !== empty.occurredOn ||
    draft.categoryId !== empty.categoryId ||
    draft.description !== empty.description ||
    draft.amount !== empty.amount
  );
}

/** フォームのドラフトを検証し、API に渡す payload の形へ正規化する。 */
export function parseDraft(draft: AccountEntryFormState, partnerId: string) {
  const parsed = v.safeParse(accountEntryDraftSchema, {
    ...draft,
    partnerId,
  });

  if (!parsed.success) {
    return undefined;
  }

  const amount = Number.parseInt(parsed.output.amount, 10);

  return {
    occurredOn: parsed.output.occurredOn,
    partnerId: parsed.output.partnerId,
    categoryId: parsed.output.categoryId,
    description: parsed.output.description.trim(),
    amount,
  };
}
