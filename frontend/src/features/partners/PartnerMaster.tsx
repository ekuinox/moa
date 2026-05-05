import { Pencil, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import useSWR from "swr";

import { AppCard } from "../../components";
import { apiClient, type Partner } from "../../lib/api";

interface PartnerFormState {
  readonly id?: string;
  readonly name: string;
  readonly kana: string;
}

const emptyForm: PartnerFormState = {
  name: "",
  kana: "",
};

export function PartnerMaster() {
  const [form, setForm] = useState<PartnerFormState>(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const {
    data: partners = [],
    error,
    isLoading,
    mutate,
  } = useSWR("partners", () => apiClient.partners.list());

  const isEditing = Boolean(form.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(undefined);

    try {
      const partnerId = form.id;

      if (partnerId) {
        await apiClient.partners.update({ ...form, id: partnerId });
      } else {
        await apiClient.partners.create(form);
      }

      setForm(emptyForm);
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "取引先の保存に失敗しました。");
    }
  }

  async function handleDelete(partner: Partner) {
    setErrorMessage(undefined);

    const confirmed = window.confirm(`${partner.name}を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.partners.delete(partner.id);
      if (form.id === partner.id) {
        setForm(emptyForm);
      }
      await mutate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "取引先の削除に失敗しました。");
    }
  }

  return (
    <main className="app-shell">
      <div className="app-layout">
        <header className="page-header">
          <p className="eyebrow">moa</p>
          <h1>取引先マスタ</h1>
        </header>

        <div className="partner-grid">
          <AppCard
            title={isEditing ? "取引先を編集" : "取引先を追加"}
            description="名称と読み仮名を登録します。"
          >
            <form className="partner-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field__label">名称</span>
                <input
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
              <div className="button-row">
                <button className="primary-button" type="submit">
                  <Plus size={16} aria-hidden="true" />
                  {isEditing ? "更新" : "追加"}
                </button>
                {isEditing ? (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setForm(emptyForm)}
                  >
                    <X size={16} aria-hidden="true" />
                    解除
                  </button>
                ) : null}
              </div>
            </form>
          </AppCard>

          <AppCard title="取引先一覧" description="読み仮名順で表示します。">
            {isLoading ? <p className="muted-text">読み込み中です。</p> : null}
            {error ? <p className="form-error">取引先の読み込みに失敗しました。</p> : null}
            {!isLoading && partners.length === 0 ? (
              <p className="muted-text">取引先はまだ登録されていません。</p>
            ) : null}
            {partners.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>読み仮名</th>
                    <th>
                      <span className="visually-hidden">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id}>
                      <td>{partner.name}</td>
                      <td>{partner.kana}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`${partner.name}を編集`}
                            onClick={() => setForm(partner)}
                            title="編集"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            className="icon-button icon-button--danger"
                            type="button"
                            aria-label={`${partner.name}を削除`}
                            onClick={() => void handleDelete(partner)}
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
      </div>
    </main>
  );
}
