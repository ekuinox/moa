import { Pencil, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import useSWR from "swr";

import { AppCard } from "../../components";
import { apiClient, type Category } from "../../lib/api";

/** 種別追加・編集フォームの入力状態。 */
interface CategoryFormState {
  /** 編集中の種別 ID。未指定の場合は新規追加。 */
  readonly id?: string;
  /** フォームに入力された種別名。 */
  readonly name: string;
}

const emptyForm: CategoryFormState = {
  name: "",
};

export function CategoryMaster() {
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const {
    data: categories = [],
    error,
    isLoading,
    mutate,
  } = useSWR("categories", () => apiClient.categories.list());

  const isEditing = Boolean(form.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(undefined);

    try {
      const categoryId = form.id;

      if (categoryId) {
        await apiClient.categories.update({ ...form, id: categoryId });
      } else {
        await apiClient.categories.create(form);
      }

      setForm(emptyForm);
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "種別の保存に失敗しました。");
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
      if (form.id === category.id) {
        setForm(emptyForm);
      }
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "種別の削除に失敗しました。");
    }
  }

  return (
    <div className="category-grid">
      <AppCard title={isEditing ? "種別を編集" : "種別を追加"}>
        <form className="category-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">名称</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
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

      <AppCard title="種別一覧">
        {isLoading ? <p className="muted-text">読み込み中です。</p> : null}
        {error ? <p className="form-error">種別の読み込みに失敗しました。</p> : null}
        {!isLoading && categories.length === 0 ? (
          <p className="muted-text">種別はまだ登録されていません。</p>
        ) : null}
        {categories.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>
                  <span className="visually-hidden">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`${category.name}を編集`}
                        onClick={() => setForm(category)}
                        title="編集"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        aria-label={`${category.name}を削除`}
                        onClick={() => void handleDelete(category)}
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
