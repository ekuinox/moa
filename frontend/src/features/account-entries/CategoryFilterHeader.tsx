import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { useId, useMemo, useState } from "react";

import type { Category } from "../../lib/api";
import styles from "./CategoryFilterHeader.module.css";
import { UNCATEGORIZED_FILTER_KEY } from "./ledgerState";

export interface CategoryFilterHeaderProps {
  /** 一覧表示用の全種別。 */
  readonly categories: readonly Category[];
  /** 現在のフィルタ状態。null は「未適用（全件表示）」を意味する。 */
  readonly value: ReadonlySet<string> | null;
  /** フィルタが変わった時のコールバック。null を渡すとフィルタ未適用に戻る。 */
  readonly onChange: (next: ReadonlySet<string> | null) => void;
}

/**
 * 種別カラムのヘッダ。クリックで Popover を開き、複数選択 + 未分類フィルタを切り替える。
 * フィルタ適用中はヘッダにアクセントを付け、内容を要約表示する。
 */
export function CategoryFilterHeader({ categories, value, onChange }: CategoryFilterHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const labelId = useId();
  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name, "ja")),
    [categories],
  );

  const triggerLabel = (() => {
    if (value === null || value.size === 0) {
      return "種別";
    }
    if (value.size === 1) {
      const onlyId = [...value][0];
      if (onlyId === UNCATEGORIZED_FILTER_KEY) {
        return "種別: (未分類)";
      }
      const category = categories.find((item) => item.id === onlyId);
      return `種別: ${category?.name ?? "(削除済み)"}`;
    }
    return `種別 (${value.size})`;
  })();

  const isActive = value !== null;

  function toggle(key: string) {
    const current = new Set(value ?? []);
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    if (current.size === 0) {
      onChange(null);
    } else {
      onChange(current);
    }
  }

  function clearFilter() {
    onChange(null);
    setIsOpen(false);
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={isActive ? `${styles.trigger} ${styles.triggerActive}` : styles.trigger}
          aria-label="種別で絞り込む"
        >
          <span>{triggerLabel}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          sideOffset={6}
          align="start"
          collisionPadding={8}
        >
          <div className={styles.headerRow}>
            <p className={styles.popoverTitle} id={labelId}>
              種別で絞り込む
            </p>
            {isActive ? (
              <button type="button" className={styles.clearButton} onClick={clearFilter}>
                すべて表示
              </button>
            ) : null}
          </div>
          <ul className={styles.list} aria-labelledby={labelId}>
            <li>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={value?.has(UNCATEGORIZED_FILTER_KEY) ?? false}
                  onChange={() => toggle(UNCATEGORIZED_FILTER_KEY)}
                />
                <span className={styles.uncategorized}>(未分類)</span>
              </label>
            </li>
            {sortedCategories.map((category) => (
              <li key={category.id}>
                <label className={styles.option}>
                  <input
                    type="checkbox"
                    checked={value?.has(category.id) ?? false}
                    onChange={() => toggle(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
