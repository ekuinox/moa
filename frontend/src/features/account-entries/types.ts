import type { AccountEntryKind } from "../../lib/api";

/** 明細行を編集フォームとして扱うときの文字列ベースの値。 */
export interface AccountEntryFormState {
  readonly occurredOn: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: string;
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
