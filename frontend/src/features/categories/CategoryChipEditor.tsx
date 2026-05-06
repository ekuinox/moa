import { Check, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";

import { apiClient, type Category } from "../../lib/api";
import styles from "./CategoryChipEditor.module.css";

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

  function startEditing(category: Category) {
    setErrorMessage(undefined);
    setEditingId(category.id);
    setEditingValue(category.name);
  }

  function cancelEditing() {
    setEditingId(undefined);
    setEditingValue("");
  }

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

  function handleEditingKeyDown(event: KeyboardEvent<HTMLInputElement>, category: Category) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitEditing(category);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

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
      {error ? <p className="form-error">種別の読み込みに失敗しました。</p> : null}

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

      {errorMessage ? <p className={`form-error ${styles.error}`}>{errorMessage}</p> : null}
    </div>
  );
}
