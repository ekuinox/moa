import { createMockApiClient } from "../mock-api";
import { type ApiRuntime, detectApiRuntime } from "./runtime";
import { createTauriApiClient } from "./tauri";

/** アプリ全体が利用する API クライアント。 */
export interface ApiClient {
  /** バックエンドと疎通できるか確認する。 */
  readonly health: () => Promise<HealthStatus>;
  /** 取引先マスタを操作する API。 */
  readonly partners: PartnerApiClient;
  /** 種別マスタを操作する API。 */
  readonly categories: CategoryApiClient;
  /** アプリ全体の設定を操作する API。 */
  readonly settings: SettingsApiClient;
  readonly accountEntries: AccountEntryApiClient;
}

/** バックエンド疎通確認の結果。 */
export interface HealthStatus {
  /** 疎通できた場合は true。 */
  readonly ok: boolean;
}

/** 取引先マスタに登録された取引先。 */
export interface Partner {
  /** 取引先を識別する ID。 */
  readonly id: string;
  /** 取引先の表示名。 */
  readonly name: string;
  /** 取引先の読み仮名。 */
  readonly kana: string;
}

/** 取引先を新規作成するときの入力値。 */
export interface CreatePartnerInput {
  /** 取引先の表示名。 */
  readonly name: string;
  /** 取引先の読み仮名。 */
  readonly kana: string;
}

/** 取引先を更新するときの入力値。 */
export interface UpdatePartnerInput {
  /** 更新対象の取引先 ID。 */
  readonly id: string;
  /** 更新後の取引先の表示名。 */
  readonly name: string;
  /** 更新後の取引先の読み仮名。 */
  readonly kana: string;
}

/** 取引先マスタ操作の API。 */
export interface PartnerApiClient {
  /** 取引先を読み仮名順で一覧取得する。 */
  readonly list: () => Promise<Partner[]>;
  /** 取引先を作成する。 */
  readonly create: (input: CreatePartnerInput) => Promise<Partner>;
  /** 既存の取引先を更新する。 */
  readonly update: (input: UpdatePartnerInput) => Promise<Partner>;
  /** 指定した ID の取引先を削除する。 */
  readonly delete: (id: string) => Promise<void>;
}

/** 買掛・売掛明細に付与する種別。 */
export interface Category {
  /** 種別を識別する ID。 */
  readonly id: string;
  /** 種別の表示名。 */
  readonly name: string;
}

/** 種別を新規作成するときの入力値。 */
export interface CreateCategoryInput {
  /** 種別の表示名。 */
  readonly name: string;
}

/** 種別を更新するときの入力値。 */
export interface UpdateCategoryInput {
  /** 更新対象の種別 ID。 */
  readonly id: string;
  /** 更新後の種別の表示名。 */
  readonly name: string;
}

/** 種別マスタ操作の API。 */
export interface CategoryApiClient {
  /** 種別を名称順で一覧取得する。 */
  readonly list: () => Promise<Category[]>;
  /** 種別を作成する。 */
  readonly create: (input: CreateCategoryInput) => Promise<Category>;
  /** 既存の種別を更新する。 */
  readonly update: (input: UpdateCategoryInput) => Promise<Category>;
  /** 指定した ID の種別を削除する。 */
  readonly delete: (id: string) => Promise<void>;
}

/** アプリ全体に対する設定。 */
export interface Settings {
  /** 事業年度の開始月。 */
  readonly fiscalYearStartMonth: number;
}

/** 設定を保存するときの入力値。 */
export interface SaveSettingsInput {
  /** 事業年度の開始月。 */
  readonly fiscalYearStartMonth: number;
}

/** アプリ全体の設定を操作する API。 */
export interface SettingsApiClient {
  /** 設定を取得する。 */
  readonly get: () => Promise<Settings>;
  /** 設定を保存する。 */
  readonly save: (input: SaveSettingsInput) => Promise<Settings>;
}

export type AccountEntryKind = "payable" | "receivable";

export interface AccountEntry {
  readonly id: string;
  readonly kind: AccountEntryKind;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
}

export interface CreateAccountEntryInput {
  readonly kind: AccountEntryKind;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
}

export interface UpdateAccountEntryInput {
  readonly id: string;
  readonly kind: AccountEntryKind;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
}

export interface AccountEntryApiClient {
  readonly list: () => Promise<AccountEntry[]>;
  readonly create: (input: CreateAccountEntryInput) => Promise<AccountEntry>;
  readonly update: (input: UpdateAccountEntryInput) => Promise<AccountEntry>;
  readonly delete: (id: string) => Promise<void>;
}

/** API クライアント生成時のオプション。 */
export interface CreateApiClientOptions {
  /** 明示的に利用する runtime。未指定時は実行環境から判定する。 */
  readonly runtime?: ApiRuntime;
}

export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  const runtime = options.runtime ?? detectApiRuntime();

  if (runtime === "tauri") {
    return createTauriApiClient();
  }

  return createMockApiClient();
}

export const apiClient = createApiClient();
