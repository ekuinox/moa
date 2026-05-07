import type { AccountEntryKind } from "../../lib/api";

/** 明細行を編集フォームとして扱うときの文字列ベースの値。
 * react-hook-form / valibot 側が mutable な型を要求するため categoryIds は配列のまま保持する。 */
export interface AccountEntryFormState {
  occurredOn: string;
  categoryIds: string[];
  description: string;
  amount: string;
}

/** 上位の買掛/売掛タブから渡される台帳一覧の props。 */
export interface AccountEntryListProps {
  readonly kind: AccountEntryKind;
}

/** 年間と 12 か月の期間タブで使う表示モデル。 */
export interface MonthTab {
  readonly key: string;
  readonly label: string;
}
