import { valibotResolver } from "@hookform/resolvers/valibot";
import { Check, Plus, Trash2 } from "lucide-react";
import { type KeyboardEvent, memo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { AccountEntry, Category } from "../../lib/api";
import {
  accountEntryFormSchema,
  createEmptyForm,
  createFormFromEntry,
  isNewRowDirty,
  isRowDirty,
  isSameDraft,
  normalizeFormValues,
} from "./accountEntryForm";
import { formatCurrency, formatDate } from "./formatters";
import styles from "./LedgerRows.module.css";
import type { AccountEntryFormState } from "./types";

export interface LedgerRowProps {
  readonly canEdit: boolean;
  readonly categories: readonly Category[];
  readonly categoryName: string;
  readonly activeRowKey: string | undefined;
  readonly draft: AccountEntryFormState | undefined;
  readonly entry: AccountEntry;
  readonly isHighlighted: boolean;
  readonly partnerName: string;
  readonly onDelete: () => void;
  readonly onFinishEditing: () => void;
  readonly onSave: () => void;
  readonly onStartEditing: () => void;
  readonly onUpdate: (values: Partial<AccountEntryFormState>) => void;
}

/** 保存済みの明細 1 行を表示し、必要に応じてセルを直接編集モードへ切り替える。 */
export function LedgerRow({
  canEdit,
  categories,
  categoryName,
  activeRowKey,
  draft,
  entry,
  isHighlighted,
  partnerName,
  onDelete,
  onFinishEditing,
  onSave,
  onStartEditing,
  onUpdate,
}: LedgerRowProps) {
  const rowDraft = draft ?? createFormFromEntry(entry);
  const isEditing = activeRowKey === entry.id;
  const isDirty = Boolean(draft) && isRowDirty(rowDraft, entry);
  const form = useForm<AccountEntryFormState>({
    resolver: valibotResolver(accountEntryFormSchema),
    values: rowDraft,
  });
  const watchedOccurredOn = useWatch({ control: form.control, name: "occurredOn" });
  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const watchedDescription = useWatch({ control: form.control, name: "description" });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const editableCellProps =
    canEdit && !isEditing
      ? ({
          role: "button",
          tabIndex: 0,
          onClick: onStartEditing,
          onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onStartEditing();
            }
          },
        } as const)
      : {};

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const watchedValues = normalizeFormValues({
      occurredOn: watchedOccurredOn,
      categoryId: watchedCategoryId,
      description: watchedDescription,
      amount: watchedAmount,
    });

    if (!isSameDraft(watchedValues, rowDraft)) {
      onUpdate(watchedValues);
    }
  }, [
    isEditing,
    onUpdate,
    rowDraft,
    watchedAmount,
    watchedCategoryId,
    watchedDescription,
    watchedOccurredOn,
  ]);

  return (
    <tr
      className={[
        styles.row,
        isEditing ? styles.editing : undefined,
        isHighlighted ? styles.highlighted : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ledger-row-key={entry.id}
      onBlur={(event) => {
        if (isEditing && !event.currentTarget.contains(event.relatedTarget)) {
          onFinishEditing();
        }
      }}
    >
      <td {...editableCellProps}>
        {isEditing ? (
          <input className={styles.tableInput} type="date" {...form.register("occurredOn")} />
        ) : (
          formatDate(rowDraft.occurredOn)
        )}
      </td>
      {!canEdit ? <td>{partnerName}</td> : null}
      <td {...editableCellProps}>
        {isEditing ? (
          <select className={styles.tableInput} {...form.register("categoryId")}>
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        ) : draft ? (
          categories.find((category) => category.id === rowDraft.categoryId)?.name
        ) : (
          categoryName
        )}
      </td>
      <td {...editableCellProps}>
        {isEditing ? (
          <input className={styles.tableInput} {...form.register("description")} />
        ) : (
          rowDraft.description
        )}
      </td>
      <td className={styles.amountCell} {...editableCellProps}>
        {isEditing ? (
          <input
            className={`${styles.tableInput} ${styles.amountInput}`}
            min={0}
            type="number"
            {...form.register("amount")}
          />
        ) : (
          formatCurrency(Number.parseInt(rowDraft.amount, 10) || 0)
        )}
      </td>
      <td>
        {canEdit ? (
          <div className={styles.tableActions}>
            {isDirty ? (
              <button
                className="primary-icon-button"
                type="button"
                aria-label={`${entry.occurredOn} の明細を保存`}
                onClick={onSave}
                title="保存"
              >
                <Check size={16} aria-hidden="true" />
              </button>
            ) : null}
            <button
              className="icon-button icon-button--danger"
              type="button"
              aria-label={`${entry.occurredOn} の明細を削除`}
              onClick={onDelete}
              title="削除"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

export interface EditableNewRowProps {
  readonly categories: readonly Category[];
  readonly selectedMonth: string;
  readonly onSave: (draft: AccountEntryFormState) => void;
}

/** 選択中の取引先のまま新規明細を追加するための、末尾の空行を表示する。 */
export function EditableNewRow({ categories, selectedMonth, onSave }: EditableNewRowProps) {
  const form = useForm<AccountEntryFormState>({
    resolver: valibotResolver(accountEntryFormSchema),
    defaultValues: createEmptyForm(selectedMonth),
  });
  const watchedOccurredOn = useWatch({ control: form.control, name: "occurredOn" });
  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const watchedDescription = useWatch({ control: form.control, name: "description" });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const draft = normalizeFormValues({
    occurredOn: watchedOccurredOn,
    categoryId: watchedCategoryId,
    description: watchedDescription,
    amount: watchedAmount,
  });
  const hasChanges = isNewRowDirty(draft, selectedMonth);

  useEffect(() => {
    form.reset(createEmptyForm(selectedMonth));
  }, [form, selectedMonth]);

  return (
    <tr className={`${styles.row} ${styles.newRow}`}>
      <td>
        <input className={styles.tableInput} type="date" {...form.register("occurredOn")} />
      </td>
      <td>
        <select className={styles.tableInput} {...form.register("categoryId")}>
          <option value="">選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input className={styles.tableInput} {...form.register("description")} />
      </td>
      <td className={styles.amountCell}>
        <input
          className={`${styles.tableInput} ${styles.amountInput}`}
          min={0}
          type="number"
          {...form.register("amount")}
        />
      </td>
      <td>
        {hasChanges ? (
          <button
            className={`primary-button ${styles.saveButton}`}
            type="button"
            onClick={() => onSave(draft)}
            aria-label="新しい明細を追加"
          >
            <Plus size={16} aria-hidden="true" />
            追加
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export interface LedgerTotalRowProps {
  readonly canEdit: boolean;
  readonly totalAmount: number;
}

/** 固定表示される合計行を表示し、入力中の値だけが変わる再描画を抑える。 */
export const LedgerTotalRow = memo(function LedgerTotalRow({
  canEdit,
  totalAmount,
}: LedgerTotalRowProps) {
  return (
    <tfoot>
      <tr>
        <th colSpan={canEdit ? 3 : 4}>合計</th>
        <td className={styles.amountCell}>{formatCurrency(totalAmount)}</td>
        <td />
      </tr>
    </tfoot>
  );
});
