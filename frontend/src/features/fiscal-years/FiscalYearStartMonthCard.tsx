import { type KeyboardEvent, useEffect, useState } from "react";
import useSWR from "swr";

import { apiClient } from "../../lib/api";
import styles from "./FiscalYearStartMonthCard.module.css";

const MIN_MONTH = 1;
const MAX_MONTH = 12;

export function FiscalYearStartMonthCard() {
  const {
    data: setting,
    error,
    isLoading,
    mutate,
  } = useSWR("fiscal-year-setting", () => apiClient.fiscalYears.getSetting());
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (setting) {
      setDraft(String(setting.startMonth));
    }
  }, [setting]);

  function revertDraft() {
    if (setting) {
      setDraft(String(setting.startMonth));
    }
    setErrorMessage(undefined);
  }

  async function commitDraft() {
    if (!setting) {
      return;
    }
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed) || parsed < MIN_MONTH || parsed > MAX_MONTH) {
      setErrorMessage(`開始月は ${MIN_MONTH} から ${MAX_MONTH} の範囲で入力してください。`);
      revertDraft();
      return;
    }
    if (parsed === setting.startMonth) {
      setErrorMessage(undefined);
      return;
    }

    try {
      await apiClient.fiscalYears.saveSetting({
        startMonth: parsed,
        durationMonths: setting.durationMonths,
        namingRule: setting.namingRule,
      });
      setErrorMessage(undefined);
      await mutate();
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : "事業年度設定の保存に失敗しました。",
      );
      revertDraft();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitDraft();
    } else if (event.key === "Escape") {
      event.preventDefault();
      revertDraft();
      event.currentTarget.blur();
    }
  }

  return (
    <div>
      {isLoading || !setting ? <p className={styles.muted}>読み込み中です。</p> : null}
      {error ? <p className="form-error">事業年度設定の読み込みに失敗しました。</p> : null}

      {setting ? (
        <div className={styles.row}>
          <span className={styles.label}>開始月</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={MIN_MONTH}
            max={MAX_MONTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={revertDraft}
            aria-label="事業年度の開始月"
          />
          <span className={styles.suffix}>月</span>
        </div>
      ) : null}

      {errorMessage ? <p className={`form-error ${styles.error}`}>{errorMessage}</p> : null}
    </div>
  );
}
