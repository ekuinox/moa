import { Pencil, Plus, Trash2, Wand2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import useSWR from "swr";

import { AppCard } from "../../components";
import { apiClient, type FiscalYear, type FiscalYearSetting } from "../../lib/api";

/** 事業年度設定フォームの入力状態。 */
interface SettingFormState {
  /** 事業年度の開始月。 */
  readonly startMonth: number;
  /** 事業年度の期間月数。 */
  readonly durationMonths: number;
  /** 事業年度名の付け方。 */
  readonly namingRule: string;
}

/** 事業年度フォームの入力状態。 */
interface FiscalYearFormState {
  /** 編集中の事業年度 ID。未指定の場合は新規追加。 */
  readonly id?: string;
  /** 事業年度の表示名。 */
  readonly name: string;
  /** 事業年度の開始月。`YYYY-MM` 形式。 */
  readonly startMonth: string;
  /** 事業年度の終了月。`YYYY-MM` 形式。 */
  readonly endMonth: string;
}

const emptyFiscalYearForm: FiscalYearFormState = {
  name: "",
  startMonth: "",
  endMonth: "",
};

function settingToForm(setting: FiscalYearSetting): SettingFormState {
  return {
    startMonth: setting.startMonth,
    durationMonths: setting.durationMonths,
    namingRule: setting.namingRule,
  };
}

export function FiscalYearSettings() {
  const {
    data: setting,
    error: settingError,
    isLoading: isSettingLoading,
    mutate: mutateSetting,
  } = useSWR("fiscal-year-setting", () => apiClient.fiscalYears.getSetting());
  const {
    data: fiscalYears = [],
    error: fiscalYearsError,
    isLoading: isFiscalYearsLoading,
    mutate: mutateFiscalYears,
  } = useSWR("fiscal-years", () => apiClient.fiscalYears.list());

  const [settingForm, setSettingForm] = useState<SettingFormState | undefined>();
  const [settingErrorMessage, setSettingErrorMessage] = useState<string | undefined>();

  const [fiscalYearForm, setFiscalYearForm] = useState<FiscalYearFormState>(emptyFiscalYearForm);
  const [fiscalYearErrorMessage, setFiscalYearErrorMessage] = useState<string | undefined>();

  const [generateStartYear, setGenerateStartYear] = useState<number>(new Date().getFullYear());
  const [generateErrorMessage, setGenerateErrorMessage] = useState<string | undefined>();

  const currentSettingForm = settingForm ?? (setting ? settingToForm(setting) : undefined);
  const isEditingFiscalYear = Boolean(fiscalYearForm.id);

  async function handleSettingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentSettingForm) {
      return;
    }
    setSettingErrorMessage(undefined);

    try {
      await apiClient.fiscalYears.saveSetting(currentSettingForm);
      setSettingForm(undefined);
      await mutateSetting();
    } catch (error) {
      setSettingErrorMessage(
        error instanceof Error ? error.message : "事業年度設定の保存に失敗しました。",
      );
    }
  }

  async function handleFiscalYearSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFiscalYearErrorMessage(undefined);

    try {
      const fiscalYearId = fiscalYearForm.id;
      if (fiscalYearId) {
        await apiClient.fiscalYears.update({
          id: fiscalYearId,
          name: fiscalYearForm.name,
          startMonth: fiscalYearForm.startMonth,
          endMonth: fiscalYearForm.endMonth,
        });
      } else {
        await apiClient.fiscalYears.create({
          name: fiscalYearForm.name,
          startMonth: fiscalYearForm.startMonth,
          endMonth: fiscalYearForm.endMonth,
        });
      }
      setFiscalYearForm(emptyFiscalYearForm);
      await mutateFiscalYears();
    } catch (error) {
      setFiscalYearErrorMessage(
        error instanceof Error ? error.message : "事業年度の保存に失敗しました。",
      );
    }
  }

  async function handleDelete(fiscalYear: FiscalYear) {
    setFiscalYearErrorMessage(undefined);
    const confirmed = window.confirm(`${fiscalYear.name}を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.fiscalYears.delete(fiscalYear.id);
      if (fiscalYearForm.id === fiscalYear.id) {
        setFiscalYearForm(emptyFiscalYearForm);
      }
      await mutateFiscalYears();
    } catch (error) {
      setFiscalYearErrorMessage(
        error instanceof Error ? error.message : "事業年度の削除に失敗しました。",
      );
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerateErrorMessage(undefined);

    try {
      await apiClient.fiscalYears.generate({ startYear: generateStartYear });
      await mutateFiscalYears();
    } catch (error) {
      setGenerateErrorMessage(
        error instanceof Error ? error.message : "事業年度の生成に失敗しました。",
      );
    }
  }

  function startEditingFiscalYear(fiscalYear: FiscalYear) {
    setFiscalYearForm({
      id: fiscalYear.id,
      name: fiscalYear.name,
      startMonth: fiscalYear.startMonth,
      endMonth: fiscalYear.endMonth,
    });
  }

  return (
    <div className="fiscal-year-grid">
      <AppCard title="基本ルール" description="事業年度の開始月と期間月数を登録します。">
        {isSettingLoading || !currentSettingForm ? (
          <p className="muted-text">読み込み中です。</p>
        ) : null}
        {settingError ? <p className="form-error">事業年度設定の読み込みに失敗しました。</p> : null}
        {currentSettingForm ? (
          <form className="fiscal-year-form" onSubmit={handleSettingSubmit}>
            <label className="field">
              <span className="field__label">開始月</span>
              <input
                type="number"
                min={1}
                max={12}
                value={currentSettingForm.startMonth}
                onChange={(event) =>
                  setSettingForm({
                    ...currentSettingForm,
                    startMonth: Number.parseInt(event.target.value, 10) || 0,
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span className="field__label">期間月数</span>
              <input
                type="number"
                min={1}
                max={120}
                value={currentSettingForm.durationMonths}
                onChange={(event) =>
                  setSettingForm({
                    ...currentSettingForm,
                    durationMonths: Number.parseInt(event.target.value, 10) || 0,
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span className="field__label">年度名の付け方</span>
              <select
                value={currentSettingForm.namingRule}
                onChange={(event) =>
                  setSettingForm({ ...currentSettingForm, namingRule: event.target.value })
                }
              >
                <option value="start_year">開始年</option>
              </select>
            </label>
            {settingErrorMessage ? <p className="form-error">{settingErrorMessage}</p> : null}
            <div className="button-row">
              <button className="primary-button" type="submit">
                <Plus size={16} aria-hidden="true" />
                保存
              </button>
              {settingForm ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setSettingForm(undefined);
                    setSettingErrorMessage(undefined);
                  }}
                >
                  <X size={16} aria-hidden="true" />
                  解除
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
      </AppCard>

      <AppCard title="事業年度を自動生成" description="基本ルールから 1 年度分を生成します。">
        <form className="fiscal-year-form" onSubmit={handleGenerate}>
          <label className="field">
            <span className="field__label">開始年</span>
            <input
              type="number"
              min={1900}
              max={9999}
              value={generateStartYear}
              onChange={(event) =>
                setGenerateStartYear(Number.parseInt(event.target.value, 10) || 0)
              }
              required
            />
          </label>
          {generateErrorMessage ? <p className="form-error">{generateErrorMessage}</p> : null}
          <div className="button-row">
            <button className="primary-button" type="submit">
              <Wand2 size={16} aria-hidden="true" />
              生成
            </button>
          </div>
        </form>
      </AppCard>

      <AppCard
        title={isEditingFiscalYear ? "事業年度を編集" : "事業年度を追加"}
        description="期間は YYYY-MM 形式で入力します。"
      >
        <form className="fiscal-year-form" onSubmit={handleFiscalYearSubmit}>
          <label className="field">
            <span className="field__label">名称</span>
            <input
              value={fiscalYearForm.name}
              onChange={(event) =>
                setFiscalYearForm({ ...fiscalYearForm, name: event.target.value })
              }
              required
            />
          </label>
          <label className="field">
            <span className="field__label">開始月 (YYYY-MM)</span>
            <input
              value={fiscalYearForm.startMonth}
              onChange={(event) =>
                setFiscalYearForm({ ...fiscalYearForm, startMonth: event.target.value })
              }
              pattern="\d{4}-\d{2}"
              placeholder="2026-04"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">終了月 (YYYY-MM)</span>
            <input
              value={fiscalYearForm.endMonth}
              onChange={(event) =>
                setFiscalYearForm({ ...fiscalYearForm, endMonth: event.target.value })
              }
              pattern="\d{4}-\d{2}"
              placeholder="2027-03"
              required
            />
          </label>
          {fiscalYearErrorMessage ? <p className="form-error">{fiscalYearErrorMessage}</p> : null}
          <div className="button-row">
            <button className="primary-button" type="submit">
              <Plus size={16} aria-hidden="true" />
              {isEditingFiscalYear ? "更新" : "追加"}
            </button>
            {isEditingFiscalYear ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setFiscalYearForm(emptyFiscalYearForm)}
              >
                <X size={16} aria-hidden="true" />
                解除
              </button>
            ) : null}
          </div>
        </form>
      </AppCard>

      <AppCard title="事業年度一覧" description="開始月の昇順で表示します。">
        {isFiscalYearsLoading ? <p className="muted-text">読み込み中です。</p> : null}
        {fiscalYearsError ? <p className="form-error">事業年度の読み込みに失敗しました。</p> : null}
        {!isFiscalYearsLoading && fiscalYears.length === 0 ? (
          <p className="muted-text">事業年度はまだ登録されていません。</p>
        ) : null}
        {fiscalYears.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>開始月</th>
                <th>終了月</th>
                <th>
                  <span className="visually-hidden">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {fiscalYears.map((fiscalYear) => (
                <tr key={fiscalYear.id}>
                  <td>{fiscalYear.name}</td>
                  <td>{fiscalYear.startMonth}</td>
                  <td>{fiscalYear.endMonth}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`${fiscalYear.name}を編集`}
                        onClick={() => startEditingFiscalYear(fiscalYear)}
                        title="編集"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        aria-label={`${fiscalYear.name}を削除`}
                        onClick={() => void handleDelete(fiscalYear)}
                        title="削除"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </AppCard>
    </div>
  );
}
