import * as Popover from "@radix-ui/react-popover";
import { Plus, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import type { Category } from "../../lib/api";
import styles from "./CategoryCellEditor.module.css";

export interface CategoryCellEditorProps {
  /** 一覧表示用の全種別。 */
  readonly categories: readonly Category[];
  /** この明細に紐付く種別 ID。 */
  readonly value: readonly string[];
  /** Popover での選択操作で値が変わった時のコールバック。 */
  readonly onChange: (next: readonly string[]) => void;
  /** Popover を開けないモード（保存中など）。 */
  readonly disabled?: boolean;
}

/** セル内に直接表示するチップの最大数。これを超えた分は「+N」バッジに集約する。 */
const MAX_VISIBLE_CHIPS = 1;

/**
 * テーブルセル内で複数の種別をチップ表示し、Popover から複数選択できるエディタ。
 * 行高を維持するため可視チップ数を制限し、超過分は「+N」バッジで表す（クリックで Popover）。
 */
export function CategoryCellEditor({
  categories,
  value,
  onChange,
  disabled = false,
}: CategoryCellEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const labelId = useId();
  const selectedSet = useMemo(() => new Set(value), [value]);
  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name, "ja")),
    [categories],
  );

  const visibleIds = value.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = Math.max(0, value.length - MAX_VISIBLE_CHIPS);
  const overflowLabel = hiddenCount > 0 ? `他 ${hiddenCount} 件を表示` : undefined;

  function toggle(categoryId: string) {
    if (selectedSet.has(categoryId)) {
      onChange(value.filter((id) => id !== categoryId));
    } else {
      onChange([...value, categoryId]);
    }
  }

  function removeChip(categoryId: string) {
    onChange(value.filter((id) => id !== categoryId));
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Anchor className={styles.wrapper}>
        <div className={styles.chips}>
          {visibleIds.map((id) => {
            const category = categories.find((item) => item.id === id);
            const label = category?.name ?? "(削除済み)";
            return (
              <span className={styles.chip} key={id}>
                <span className={styles.chipLabel}>{label}</span>
                {disabled ? null : (
                  <button
                    type="button"
                    className={styles.chipRemove}
                    onClick={() => removeChip(id)}
                    aria-label={`${label} を外す`}
                    title="外す"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </span>
            );
          })}
          {hiddenCount > 0 ? (
            <Popover.Trigger asChild>
              <button
                type="button"
                className={styles.overflowBadge}
                aria-label={overflowLabel}
                title={overflowLabel}
              >
                +{hiddenCount}
              </button>
            </Popover.Trigger>
          ) : null}
        </div>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={styles.addButton}
            disabled={disabled}
            aria-label="種別を追加"
            title="種別を追加"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </Popover.Trigger>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          sideOffset={6}
          align="start"
          collisionPadding={8}
        >
          <p className={styles.popoverTitle} id={labelId}>
            種別を選択
          </p>
          {sortedCategories.length === 0 ? (
            <p className={styles.empty}>登録された種別がありません。</p>
          ) : (
            <ul className={styles.list} aria-labelledby={labelId}>
              {sortedCategories.map((category) => {
                const checked = selectedSet.has(category.id);
                return (
                  <li key={category.id}>
                    <label className={styles.option}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
