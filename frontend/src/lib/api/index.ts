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
  /** 事業年度設定と事業年度を操作する API。 */
  readonly fiscalYears: FiscalYearApiClient;
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

/** 事業年度を生成・解釈するための基本ルール。 */
export interface FiscalYearSetting {
  /** 事業年度の開始月。 */
  readonly startMonth: number;
  /** 事業年度の期間月数。 */
  readonly durationMonths: number;
  /** 事業年度名の付け方。 */
  readonly namingRule: string;
}

/** 事業年度設定を保存するときの入力値。 */
export interface SaveFiscalYearSettingInput {
  /** 事業年度の開始月。 */
  readonly startMonth: number;
  /** 事業年度の期間月数。 */
  readonly durationMonths: number;
  /** 事業年度名の付け方。 */
  readonly namingRule: string;
}

/** 実際に利用する事業年度期間。 */
export interface FiscalYear {
  /** 事業年度を識別する ID。 */
  readonly id: string;
  /** 事業年度の表示名。 */
  readonly name: string;
  /** 事業年度の開始月。`YYYY-MM` 形式。 */
  readonly startMonth: string;
  /** 事業年度の終了月。`YYYY-MM` 形式。 */
  readonly endMonth: string;
}

/** 事業年度を新規作成するときの入力値。 */
export interface CreateFiscalYearInput {
  /** 事業年度の表示名。 */
  readonly name: string;
  /** 事業年度の開始月。`YYYY-MM` 形式。 */
  readonly startMonth: string;
  /** 事業年度の終了月。`YYYY-MM` 形式。 */
  readonly endMonth: string;
}

/** 事業年度を更新するときの入力値。 */
export interface UpdateFiscalYearInput {
  /** 更新対象の事業年度 ID。 */
  readonly id: string;
  /** 更新後の事業年度の表示名。 */
  readonly name: string;
  /** 更新後の事業年度の開始月。`YYYY-MM` 形式。 */
  readonly startMonth: string;
  /** 更新後の事業年度の終了月。`YYYY-MM` 形式。 */
  readonly endMonth: string;
}

/** 基本ルールから事業年度を自動生成するときの入力値。 */
export interface GenerateFiscalYearInput {
  /** 生成する事業年度の開始年。 */
  readonly startYear: number;
}

/** 事業年度設定と事業年度操作の API。 */
export interface FiscalYearApiClient {
  /** 事業年度設定を取得する。未保存なら既定値を返す。 */
  readonly getSetting: () => Promise<FiscalYearSetting>;
  /** 事業年度設定を保存する。 */
  readonly saveSetting: (input: SaveFiscalYearSettingInput) => Promise<FiscalYearSetting>;
  /** 事業年度を期間順で一覧取得する。 */
  readonly list: () => Promise<FiscalYear[]>;
  /** 事業年度を作成する。 */
  readonly create: (input: CreateFiscalYearInput) => Promise<FiscalYear>;
  /** 既存の事業年度を更新する。 */
  readonly update: (input: UpdateFiscalYearInput) => Promise<FiscalYear>;
  /** 指定した ID の事業年度を削除する。 */
  readonly delete: (id: string) => Promise<void>;
  /** 設定の基本ルールから事業年度を自動生成する。 */
  readonly generate: (input: GenerateFiscalYearInput) => Promise<FiscalYear>;
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
