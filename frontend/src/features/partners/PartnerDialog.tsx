import { Trash2, X } from "lucide-react";
import { type SubmitEvent, useEffect, useRef, useState } from "react";

import type { Partner } from "../../lib/api";
import styles from "./PartnerDialog.module.css";

/** 取引先追加・編集モーダルから保存側へ渡す入力値。 */
export interface PartnerDialogInput {
  /** 編集対象の取引先 ID。未指定の場合は新規登録として扱う。 */
  readonly id?: string;
  /** 入力された取引先名。 */
  readonly name: string;
  /** 入力された読み仮名。 */
  readonly kana: string;
}

export interface PartnerDialogProps {
  /** モーダルを開いているかどうか。 */
  readonly isOpen: boolean;
  /** 編集する取引先。未指定の場合は追加モードにする。 */
  readonly partner?: Partner;
  /** 保存せずに閉じるときの処理。 */
  readonly onCancel: () => void;
  /** 入力値を保存する処理。 */
  readonly onSave: (input: PartnerDialogInput) => Promise<void>;
  /** 編集中の取引先を削除する処理。未指定の場合は削除ボタンを表示しない。 */
  readonly onDelete?: (partner: Partner) => Promise<void>;
}

/** 取引先の名前と読み仮名を追加・編集するモーダル。 */
export function PartnerDialog({ isOpen, partner, onCancel, onSave, onDelete }: PartnerDialogProps) {
  const [form, setForm] = useState<PartnerDialogInput>(() => createInitialForm(partner));
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(partner);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createInitialForm(partner));
    setErrorMessage(undefined);
    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [isOpen, partner]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(undefined);

    const input = {
      id: partner?.id,
      name: form.name.trim(),
      kana: form.kana.trim(),
    };

    if (!isValidKana(input.kana)) {
      setErrorMessage("読み仮名はカタカナ、半角英数字のみ入力できます。");
      return;
    }

    try {
      await onSave(input);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "取引先の保存に失敗しました。");
    }
  }

  async function handleDelete() {
    if (!partner || !onDelete) {
      return;
    }

    setErrorMessage(undefined);

    try {
      await onDelete(partner);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "取引先の削除に失敗しました。");
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-dialog-title"
      >
        <header className={styles.header}>
          <h2 id="partner-dialog-title">{isEditing ? "取引先を編集" : "取引先を追加"}</h2>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="閉じる">
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">名前</span>
            <input
              ref={firstInputRef}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">読み仮名</span>
            <input
              value={form.kana}
              onChange={(event) => setForm({ ...form, kana: event.target.value })}
              required
            />
          </label>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <div className={styles.actions}>
            {isEditing && onDelete ? (
              <button className="danger-button" type="button" onClick={() => void handleDelete()}>
                <Trash2 size={16} aria-hidden="true" />
                削除
              </button>
            ) : null}
            <button className="primary-button" type="submit">
              {isEditing ? "確定" : "登録"}
            </button>
            <button className="secondary-button" type="button" onClick={onCancel}>
              取消
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/** 編集対象から初期入力値を作る。 */
function createInitialForm(partner?: Partner): PartnerDialogInput {
  return {
    id: partner?.id,
    name: partner?.name ?? "",
    kana: partner?.kana ?? "",
  };
}

/** 読み仮名として許可するカタカナ・半角英数字だけで構成されているかを確認する。 */
function isValidKana(kana: string) {
  return /^[ァ-ヶーA-Za-z0-9ｦ-ﾟ]+$/.test(kana);
}
