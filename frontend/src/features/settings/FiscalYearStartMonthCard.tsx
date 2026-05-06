import { Check } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";
import useSWR from "swr";

import { apiClient } from "../../lib/api";
import styles from "./FiscalYearStartMonthCard.module.css";

const MIN_MONTH = 1;
const MAX_MONTH = 12;

export function FiscalYearStartMonthCard() {
  const {
    data: settings,
    error,
    isLoading,
    mutate,
  } = useSWR("settings", () => apiClient.settings.get());
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (settings) {
      setDraft(String(settings.fiscalYearStartMonth));
    }
  }, [settings]);

  function revertDraft() {
    if (settings) {
      setDraft(String(settings.fiscalYearStartMonth));
    }
    setErrorMessage(undefined);
  }

  async function commitDraft() {
    if (!settings) {
      return;
    }
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed) || parsed < MIN_MONTH || parsed > MAX_MONTH) {
      setErrorMessage(`開始月は ${MIN_MONTH} から ${MAX_MONTH} の範囲で入力してください。`);
      revertDraft();
      return;
    }
    if (parsed === settings.fiscalYearStartMonth) {
      setErrorMessage(undefined);
      return;
    }

    try {
      await apiClient.settings.save({ fiscalYearStartMonth: parsed });
      setErrorMessage(undefined);
      await mutate();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "設定の保存に失敗しました。");
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
      {isLoading || !settings ? <p className={styles.muted}>読み込み中です。</p> : null}
      {error ? <p className="form-error">設定の読み込みに失敗しました。</p> : null}

      {settings ? (
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
          <button
            className={styles.confirm}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void commitDraft()}
            aria-label="開始月を保存"
            title="保存"
          >
            <Check size={14} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {errorMessage ? <p className={`form-error ${styles.error}`}>{errorMessage}</p> : null}
    </div>
  );
}
