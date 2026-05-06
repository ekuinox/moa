import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

import { AppCard } from "../../components";
import { apiClient, type Partner } from "../../lib/api";
import { PartnerDialog, type PartnerDialogInput } from "./PartnerDialog";
import styles from "./PartnerMaster.module.css";

/** 取引先マスタの一覧と編集操作を表示する。 */
export function PartnerMaster() {
  const [editingPartner, setEditingPartner] = useState<Partner | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const {
    data: partners = [],
    error,
    isLoading,
    mutate,
  } = useSWR("partners", () => apiClient.partners.list());

  async function handleSave(input: PartnerDialogInput) {
    if (!input.id) {
      return;
    }

    await apiClient.partners.update({
      id: input.id,
      name: input.name,
      kana: input.kana,
    });
    setEditingPartner(undefined);
    await mutate();
  }

  async function handleDelete(partner: Partner) {
    setErrorMessage(undefined);

    const confirmed = window.confirm(`${partner.name}を削除しますか？`);
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.partners.delete(partner.id);
      await mutate();
      setEditingPartner(undefined);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "取引先の削除に失敗しました。");
    }
  }

  return (
    <div className={styles.layout}>
      <AppCard title="取引先一覧" description="読み仮名順で表示します。">
        {isLoading ? <p className="muted-text">読み込み中です。</p> : null}
        {error ? <p className="form-error">取引先の読み込みに失敗しました。</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
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
                        onClick={() => setEditingPartner(partner)}
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

      <PartnerDialog
        isOpen={Boolean(editingPartner)}
        partner={editingPartner}
        onCancel={() => setEditingPartner(undefined)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
