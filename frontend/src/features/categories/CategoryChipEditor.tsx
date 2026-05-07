import { Check, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";

import { Text } from "../../components";
import { apiClient, type Category } from "../../lib/api";
import styles from "./CategoryChipEditor.module.css";

/**
 * 種別マスタを横並びチップで一覧・編集する。
 *
 * - 既存チップ: クリックで編集モードへ切り替え。Enter で保存、Escape / blur で破棄。
 * - 末尾の入力チップ: 種別を新規追加する。Enter または ✓ ボタンで確定。
 * - 各チップの × は確認ダイアログを挟んだ上で削除する。
 */
export function CategoryChipEditor() {
  const {
    data: categories = [],
    error,
    isLoading,
    mutate,
  } = useSWR("categories", () => apiClient.categories.list());
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editingValue, setEditingValue] = useState("");
  const [adderValue, setAdderValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const editingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      editingInputRef.current?.select();
    }
  }, [editingId]);

  /** 指定したチップを編集モードに切り替える。 */
  function startEditing(category: Category) {
    setErrorMessage(undefined);
    setEditingId(category.id);
    setEditingValue(category.name);
  }

  /** 編集を破棄して表示モードに戻す。 */
  function cancelEditing() {
    setEditingId(undefined);
    setEditingValue("");
  }

  /** 編集中の値を確定する。空白のみまたは未変更ならキャンセル扱いにする。 */
  async function commitEditing(category: Category) {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === category.name) {
      cancelEditing();
      return;
    }

    try {
      await apiClient.categories.update({ id: category.id, name: trimmed });
      cancelEditing();
      await mutate();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "種別の更新に失敗しました。");
    }
  }

  /** 削除確認ダイアログを表示し、承認されたチップを削除する。 */
  async function handleDelete(category: Category) {
    setErrorMessage(undefined);
    const confirmed = window.confirm(`${category.name}を削除しますか？`);
    if (!confirmed) {
      return;
    }
    try {
      await apiClient.categories.delete(category.id);
      if (editingId === category.id) {
        cancelEditing();
      }
      await mutate();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "種別の削除に失敗しました。");
    }
  }

  /** 末尾の入力チップに入力されている値で種別を新規作成する。 */
  async function commitAdder() {
    const trimmed = adderValue.trim();
    if (!trimmed) {
      setAdderValue("");
      return;
    }

    try {
      await apiClient.categories.create({ name: trimmed });
      setAdderValue("");
      await mutate();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "種別の追加に失敗しました。");
    }
  }

  /** 編集中の input でのキー入力を処理する。Enter は確定、Escape は破棄。 */
  function handleEditingKeyDown(event: KeyboardEvent<HTMLInputElement>, category: Category) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitEditing(category);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  /** 追加 input でのキー入力を処理する。Enter は確定、Escape は値クリアして blur する。 */
  function handleAdderKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitAdder();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setAdderValue("");
      event.currentTarget.blur();
    }
  }

  return (
    <div>
      {isLoading ? <p className={styles.muted}>読み込み中です。</p> : null}
      {error ? <Text tone="error">種別の読み込みに失敗しました。</Text> : null}

      <div className={styles.list}>
        {categories.map((category) => {
          const isEditing = editingId === category.id;
          return (
            <div className={styles.chip} key={category.id}>
              {isEditing ? (
                <input
                  ref={editingInputRef}
                  className={styles.chipNameInput}
                  value={editingValue}
                  onChange={(event) => setEditingValue(event.target.value)}
                  onKeyDown={(event) => handleEditingKeyDown(event, category)}
                  onBlur={cancelEditing}
                  aria-label={`${category.name}を編集`}
                />
              ) : (
                <button
                  className={styles.chipName}
                  type="button"
                  onClick={() => startEditing(category)}
                  title="クリックで編集"
                >
                  {category.name}
                </button>
              )}
              <button
                className={styles.chipDelete}
                type="button"
                onClick={() => void handleDelete(category)}
                aria-label={`${category.name}を削除`}
                title="削除"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
        <div className={`${styles.chip} ${styles.adderChip}`}>
          <input
            className={styles.chipNameInput}
            value={adderValue}
            onChange={(event) => setAdderValue(event.target.value)}
            onKeyDown={handleAdderKeyDown}
            onBlur={() => setAdderValue("")}
            placeholder="種別を追加"
            aria-label="種別を追加"
          />
          <button
            className={styles.chipConfirm}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void commitAdder()}
            aria-label="種別を登録"
            title="登録"
          >
            <Check size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {errorMessage ? (
        <Text tone="error" className={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </div>
  );
}
