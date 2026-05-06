import { Check, Plus, Trash2, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import useSWR from "swr";
import * as v from "valibot";

import {
  type AccountEntry,
  type AccountEntryKind,
  apiClient,
  type Category,
  type Partner,
} from "../../lib/api";

interface AccountEntryFormState {
  readonly occurredOn: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: string;
}

interface AccountEntryListProps {
  readonly kind: AccountEntryKind;
}

interface MonthTab {
  readonly key: string;
  readonly label: string;
}

const visibleMonthCount = 12;
const newRowKey = "__new__";
const accountEntryDraftSchema = v.object({
  occurredOn: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/)),
  partnerId: v.pipe(v.string(), v.nonEmpty()),
  categoryId: v.pipe(v.string(), v.nonEmpty()),
  description: v.string(),
  amount: v.pipe(v.string(), v.regex(/^\d+$/)),
});

export function AccountEntryList({ kind }: AccountEntryListProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth());
  const [editingRows, setEditingRows] = useState<Record<string, AccountEntryFormState>>({});
  const [activeRowKey, setActiveRowKey] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [noticeMessage, setNoticeMessage] = useState<string | undefined>();
  const {
    data: entries = [],
    error: entriesError,
    isLoading: isEntriesLoading,
    mutate,
  } = useSWR("account-entries", () => apiClient.accountEntries.list());
  const { data: partners = [] } = useSWR("partners", () => apiClient.partners.list());
  const { data: categories = [] } = useSWR("categories", () => apiClient.categories.list());

  const partnerNames = mapById(partners);
  const categoryNames = mapById(categories);
  const title = kind === "payable" ? "買掛表" : "売掛表";
  const canEdit = selectedPartnerId !== "all";
  const monthTabs = createMonthTabs(selectedMonth);
  const visibleEntries = entries.filter((entry) => {
    if (entry.kind !== kind) {
      return false;
    }
    if (!entry.occurredOn.startsWith(selectedMonth)) {
      return false;
    }
    return selectedPartnerId === "all" || entry.partnerId === selectedPartnerId;
  });
  const totalAmount = visibleEntries.reduce((total, entry) => total + entry.amount, 0);
  const selectedPartnerName =
    selectedPartnerId === "all" ? "すべての取引先" : partnerNames.get(selectedPartnerId);
  const newRow = editingRows[newRowKey] ?? createEmptyForm(selectedMonth);

  const finishEditingRow = useCallback((entry: AccountEntry) => {
    setActiveRowKey(undefined);
    setEditingRows((current) => {
      const draft = current[entry.id];
      if (!draft || isRowDirty(draft, entry)) {
        return current;
      }
      const next = { ...current };
      delete next[entry.id];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!activeRowKey) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest(`[data-ledger-row-key="${activeRowKey}"]`)) {
        return;
      }

      const entry = entries.find((item) => item.id === activeRowKey);
      if (entry) {
        finishEditingRow(entry);
      } else {
        setActiveRowKey(undefined);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [activeRowKey, entries, finishEditingRow]);

  function resetEditableRows() {
    setEditingRows({});
    setErrorMessage(undefined);
  }

  function startEditing(entry: AccountEntry) {
    if (!canEdit) {
      return;
    }

    setActiveRowKey(entry.id);
    setEditingRows((current) => ({
      ...current,
      [entry.id]: current[entry.id] ?? createFormFromEntry(entry),
    }));
  }

  function updateRow(rowKey: string, values: Partial<AccountEntryFormState>) {
    setEditingRows((current) => {
      const base = current[rowKey] ?? createEmptyForm(selectedMonth);
      return {
        ...current,
        [rowKey]: {
          ...base,
          ...values,
        },
      };
    });
  }

  async function saveRow(rowKey: string, entry?: AccountEntry) {
    if (!canEdit) {
      return;
    }

    setErrorMessage(undefined);

    const draft = editingRows[rowKey];
    if (!draft) {
      return;
    }

    const input = parseDraft(draft, selectedPartnerId);
    if (!input) {
      setErrorMessage("日付、種別、金額を入力してください。");
      return;
    }

    try {
      if (entry) {
        await apiClient.accountEntries.update({
          id: entry.id,
          kind,
          ...input,
        });
      } else {
        await apiClient.accountEntries.create({
          kind,
          ...input,
        });
      }

      setEditingRows((current) => {
        const next = { ...current };
        delete next[rowKey];
        return next;
      });
      setActiveRowKey(undefined);
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "明細の保存に失敗しました。");
    }
  }

  async function handleDelete(entry: AccountEntry) {
    setErrorMessage(undefined);
    const confirmed = window.confirm(`${entry.occurredOn} の明細を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.accountEntries.delete(entry.id);
      setEditingRows((current) => {
        const next = { ...current };
        delete next[entry.id];
        return next;
      });
      if (activeRowKey === entry.id) {
        setActiveRowKey(undefined);
      }
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "明細の削除に失敗しました。");
    }
  }

  function showTodo(message: string) {
    setNoticeMessage(message);
  }

  return (
    <div className="ledger-screen">
      <aside className="partner-rail" aria-label="取引先一覧">
        <div className="partner-rail__header">
          <h2>取引先</h2>
          <button
            className="small-button"
            type="button"
            onClick={() => showTodo("取引先追加モーダルは未設計です。")}
          >
            <Plus size={15} aria-hidden="true" />
            追加
          </button>
        </div>
        <div className="partner-list">
          <button
            className={
              selectedPartnerId === "all" ? "partner-list__item is-active" : "partner-list__item"
            }
            type="button"
            onClick={() => {
              setSelectedPartnerId("all");
              resetEditableRows();
            }}
          >
            すべて
          </button>
          {partners.map((partner) => (
            <button
              className={
                selectedPartnerId === partner.id
                  ? "partner-list__item is-active"
                  : "partner-list__item"
              }
              key={partner.id}
              type="button"
              onClick={() => {
                setSelectedPartnerId(partner.id);
                resetEditableRows();
              }}
            >
              {partner.name}
            </button>
          ))}
        </div>
      </aside>

      <section className="ledger-workspace" aria-label={`${title}明細`}>
        <nav className="period-tabs" aria-label="期間切替">
          {monthTabs.map((month) => (
            <button
              className={
                selectedMonth === month.key ? "period-tabs__item is-active" : "period-tabs__item"
              }
              key={month.key}
              type="button"
              onClick={() => {
                setSelectedMonth(month.key);
                resetEditableRows();
              }}
            >
              {month.label}
            </button>
          ))}
        </nav>

        <div className="ledger-panel">
          <div className="ledger-panel__header">
            <div>
              <p className="eyebrow">{selectedPartnerName}</p>
              <h2>
                {title} ({formatLedgerMonth(selectedMonth)})
              </h2>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() => showTodo("設定タブで編集する内容は未設計です。")}
            >
              設定
            </button>
          </div>

          {noticeMessage ? (
            <div className="notice-bar">
              <span>{noticeMessage}</span>
              <button
                type="button"
                onClick={() => setNoticeMessage(undefined)}
                aria-label="通知を閉じる"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {isEntriesLoading ? <p className="muted-text">読み込み中です。</p> : null}
          {entriesError ? <p className="form-error">明細の読み込みに失敗しました。</p> : null}
          {errorMessage ? <p className="form-error ledger-inline-error">{errorMessage}</p> : null}
          {!canEdit ? (
            <p className="ledger-readonly-note">取引先を選択すると、表を直接編集できます。</p>
          ) : null}

          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>日付</th>
                  {!canEdit ? <th>取引先</th> : null}
                  <th>種別</th>
                  <th>摘要</th>
                  <th>税込金額</th>
                  <th>
                    <span className="visually-hidden">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <LedgerRow
                    canEdit={canEdit}
                    categories={categories}
                    categoryName={categoryNames.get(entry.categoryId) ?? "未登録の種別"}
                    activeRowKey={activeRowKey}
                    draft={editingRows[entry.id]}
                    entry={entry}
                    key={entry.id}
                    partnerName={partnerNames.get(entry.partnerId) ?? "未登録の取引先"}
                    onDelete={() => void handleDelete(entry)}
                    onFinishEditing={() => finishEditingRow(entry)}
                    onSave={() => void saveRow(entry.id, entry)}
                    onStartEditing={() => startEditing(entry)}
                    onUpdate={(values) => updateRow(entry.id, values)}
                  />
                ))}
                {canEdit ? (
                  <EditableNewRow
                    categories={categories}
                    draft={newRow}
                    hasChanges={isNewRowDirty(newRow, selectedMonth)}
                    onSave={() => void saveRow(newRowKey)}
                    onUpdate={(values) => updateRow(newRowKey, values)}
                  />
                ) : null}
                {!canEdit && visibleEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <p className="muted-text">この条件の明細はまだ登録されていません。</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={canEdit ? 3 : 4}>合計</th>
                  <td className="amount-cell">{formatCurrency(totalAmount)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

interface LedgerRowProps {
  readonly canEdit: boolean;
  readonly categories: readonly Category[];
  readonly categoryName: string;
  readonly activeRowKey: string | undefined;
  readonly draft: AccountEntryFormState | undefined;
  readonly entry: AccountEntry;
  readonly partnerName: string;
  readonly onDelete: () => void;
  readonly onFinishEditing: () => void;
  readonly onSave: () => void;
  readonly onStartEditing: () => void;
  readonly onUpdate: (values: Partial<AccountEntryFormState>) => void;
}

function LedgerRow({
  canEdit,
  categories,
  categoryName,
  activeRowKey,
  draft,
  entry,
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
      className={isEditing ? "ledger-table__row is-editing" : "ledger-table__row"}
      data-ledger-row-key={entry.id}
      onBlur={(event) => {
        if (isEditing && !event.currentTarget.contains(event.relatedTarget)) {
          onFinishEditing();
        }
      }}
    >
      <td {...editableCellProps}>
        {isEditing ? (
          <input className="table-input" type="date" {...form.register("occurredOn")} />
        ) : (
          formatDate(rowDraft.occurredOn)
        )}
      </td>
      {!canEdit ? <td>{partnerName}</td> : null}
      <td {...editableCellProps}>
        {isEditing ? (
          <select className="table-input" {...form.register("categoryId")}>
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
          <input className="table-input" {...form.register("description")} />
        ) : (
          rowDraft.description
        )}
      </td>
      <td className="amount-cell" {...editableCellProps}>
        {isEditing ? (
          <input
            className="table-input table-input--amount"
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
          <div className="table-actions">
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

interface EditableNewRowProps {
  readonly categories: readonly Category[];
  readonly draft: AccountEntryFormState;
  readonly hasChanges: boolean;
  readonly onSave: () => void;
  readonly onUpdate: (values: Partial<AccountEntryFormState>) => void;
}

function EditableNewRow({ categories, draft, hasChanges, onSave, onUpdate }: EditableNewRowProps) {
  const form = useForm<AccountEntryFormState>({
    values: draft,
  });
  const watchedOccurredOn = useWatch({ control: form.control, name: "occurredOn" });
  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const watchedDescription = useWatch({ control: form.control, name: "description" });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });

  useEffect(() => {
    const watchedValues = normalizeFormValues({
      occurredOn: watchedOccurredOn,
      categoryId: watchedCategoryId,
      description: watchedDescription,
      amount: watchedAmount,
    });

    if (!isSameDraft(watchedValues, draft)) {
      onUpdate(watchedValues);
    }
  }, [draft, onUpdate, watchedAmount, watchedCategoryId, watchedDescription, watchedOccurredOn]);

  return (
    <tr className="ledger-table__row ledger-table__new-row">
      <td>
        <input className="table-input" type="date" {...form.register("occurredOn")} />
      </td>
      <td>
        <select className="table-input" {...form.register("categoryId")}>
          <option value="">選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input className="table-input" {...form.register("description")} />
      </td>
      <td className="amount-cell">
        <input
          className="table-input table-input--amount"
          min={0}
          type="number"
          {...form.register("amount")}
        />
      </td>
      <td>
        {hasChanges ? (
          <button
            className="primary-button table-save-button"
            type="button"
            onClick={onSave}
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

function mapById(items: readonly Partner[] | readonly Category[]) {
  return new Map(items.map((item) => [item.id, item.name]));
}

function createEmptyForm(selectedMonth: string): AccountEntryFormState {
  return {
    occurredOn: `${selectedMonth}-01`,
    categoryId: "",
    description: "",
    amount: "0",
  };
}

function createFormFromEntry(entry: AccountEntry): AccountEntryFormState {
  return {
    occurredOn: entry.occurredOn,
    categoryId: entry.categoryId,
    description: entry.description,
    amount: entry.amount.toString(),
  };
}

function normalizeFormValues(values: Partial<AccountEntryFormState>): AccountEntryFormState {
  return {
    occurredOn: values.occurredOn ?? "",
    categoryId: values.categoryId ?? "",
    description: values.description ?? "",
    amount: values.amount ?? "",
  };
}

function isSameDraft(left: AccountEntryFormState, right: AccountEntryFormState) {
  return (
    left.occurredOn === right.occurredOn &&
    left.categoryId === right.categoryId &&
    left.description === right.description &&
    left.amount === right.amount
  );
}

function isRowDirty(draft: AccountEntryFormState, entry: AccountEntry) {
  return (
    draft.occurredOn !== entry.occurredOn ||
    draft.categoryId !== entry.categoryId ||
    draft.description !== entry.description ||
    Number.parseInt(draft.amount, 10) !== entry.amount
  );
}

function isNewRowDirty(draft: AccountEntryFormState, selectedMonth: string) {
  const empty = createEmptyForm(selectedMonth);
  return (
    draft.occurredOn !== empty.occurredOn ||
    draft.categoryId !== empty.categoryId ||
    draft.description !== empty.description ||
    draft.amount !== empty.amount
  );
}

function parseDraft(draft: AccountEntryFormState, partnerId: string) {
  const parsed = v.safeParse(accountEntryDraftSchema, {
    ...draft,
    partnerId,
  });

  if (!parsed.success) {
    return undefined;
  }

  const amount = Number.parseInt(parsed.output.amount, 10);

  return {
    occurredOn: parsed.output.occurredOn,
    partnerId: parsed.output.partnerId,
    categoryId: parsed.output.categoryId,
    description: parsed.output.description.trim(),
    amount,
  };
}

function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

function createMonthTabs(selectedMonth: string): MonthTab[] {
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number.parseInt(yearText ?? "", 10);
  const month = Number.parseInt(monthText ?? "", 10);

  return Array.from({ length: visibleMonthCount }, (_, index) => {
    const monthNumber = index + 1;
    return {
      key: `${year.toString().padStart(4, "0")}-${monthNumber.toString().padStart(2, "0")}`,
      label: monthNumber.toString(),
    };
  }).map((item) => (item.key === selectedMonth ? { ...item, label: month.toString() } : item));
}

function formatLedgerMonth(value: string) {
  const [year, month] = value.split("-");
  return `${year}/${Number.parseInt(month ?? "", 10)}`;
}

function formatDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number.parseInt(month ?? "", 10)}/${Number.parseInt(day ?? "", 10)}`;
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("ja-JP")}`;
}
