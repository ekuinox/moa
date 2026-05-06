import { Pencil, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import useSWR from "swr";

import { AppCard } from "../../components";
import {
  type AccountEntry,
  type AccountEntryKind,
  apiClient,
  type Category,
  type Partner,
} from "../../lib/api";

interface AccountEntryFormState {
  readonly id?: string;
  readonly kind: AccountEntryKind;
  readonly occurredOn: string;
  readonly partnerId: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
}

const emptyForm: AccountEntryFormState = {
  kind: "payable",
  occurredOn: new Date().toISOString().slice(0, 10),
  partnerId: "",
  categoryId: "",
  description: "",
  amount: 0,
};

export function AccountEntryList() {
  const [form, setForm] = useState<AccountEntryFormState>(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const {
    data: entries = [],
    error: entriesError,
    isLoading: isEntriesLoading,
    mutate,
  } = useSWR("account-entries", () => apiClient.accountEntries.list());
  const { data: partners = [] } = useSWR("partners", () => apiClient.partners.list());
  const { data: categories = [] } = useSWR("categories", () => apiClient.categories.list());

  const isEditing = Boolean(form.id);
  const partnerNames = mapById(partners);
  const categoryNames = mapById(categories);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(undefined);

    try {
      const entryId = form.id;
      if (entryId) {
        await apiClient.accountEntries.update({ ...form, id: entryId });
      } else {
        await apiClient.accountEntries.create(form);
      }

      setForm(emptyForm);
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
      if (form.id === entry.id) {
        setForm(emptyForm);
      }
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "明細の削除に失敗しました。");
    }
  }

  function startEditing(entry: AccountEntry) {
    setForm({
      id: entry.id,
      kind: entry.kind,
      occurredOn: entry.occurredOn,
      partnerId: entry.partnerId,
      categoryId: entry.categoryId,
      description: entry.description,
      amount: entry.amount,
    });
  }

  return (
    <div className="account-entry-grid">
      <AppCard title={isEditing ? "明細を編集" : "明細を追加"}>
        <form className="account-entry-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">区分</span>
            <select
              value={form.kind}
              onChange={(event) =>
                setForm({ ...form, kind: event.target.value as AccountEntryKind })
              }
            >
              <option value="payable">買掛</option>
              <option value="receivable">売掛</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">発生日</span>
            <input
              type="date"
              value={form.occurredOn}
              onChange={(event) => setForm({ ...form, occurredOn: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">取引先</span>
            <select
              value={form.partnerId}
              onChange={(event) => setForm({ ...form, partnerId: event.target.value })}
              required
            >
              <option value="">選択してください</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">種別</span>
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
              required
            >
              <option value="">選択してください</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">摘要</span>
            <input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">金額</span>
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: Number.parseInt(event.target.value, 10) || 0 })
              }
              required
            />
          </label>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <div className="button-row">
            <button className="primary-button" type="submit">
              <Plus size={16} aria-hidden="true" />
              {isEditing ? "更新" : "追加"}
            </button>
            {isEditing ? (
              <button className="secondary-button" type="button" onClick={() => setForm(emptyForm)}>
                <X size={16} aria-hidden="true" />
                解除
              </button>
            ) : null}
          </div>
        </form>
      </AppCard>

      <AppCard title="明細一覧">
        {isEntriesLoading ? <p className="muted-text">読み込み中です。</p> : null}
        {entriesError ? <p className="form-error">明細の読み込みに失敗しました。</p> : null}
        {!isEntriesLoading && entries.length === 0 ? (
          <p className="muted-text">明細はまだ登録されていません。</p>
        ) : null}
        {entries.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>発生日</th>
                <th>区分</th>
                <th>取引先</th>
                <th>種別</th>
                <th>摘要</th>
                <th>金額</th>
                <th>
                  <span className="visually-hidden">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.occurredOn}</td>
                  <td>{entry.kind === "payable" ? "買掛" : "売掛"}</td>
                  <td>{partnerNames.get(entry.partnerId) ?? "未登録の取引先"}</td>
                  <td>{categoryNames.get(entry.categoryId) ?? "未登録の種別"}</td>
                  <td>{entry.description}</td>
                  <td>{entry.amount.toLocaleString("ja-JP")}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`${entry.occurredOn} の明細を編集`}
                        onClick={() => startEditing(entry)}
                        title="編集"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        aria-label={`${entry.occurredOn} の明細を削除`}
                        onClick={() => void handleDelete(entry)}
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

function mapById(items: readonly Partner[] | readonly Category[]) {
  return new Map(items.map((item) => [item.id, item.name]));
}
