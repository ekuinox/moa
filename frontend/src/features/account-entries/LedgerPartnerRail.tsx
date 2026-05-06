import { Plus } from "lucide-react";

import type { Partner } from "../../lib/api";
import styles from "./LedgerPartnerRail.module.css";

export interface LedgerPartnerRailProps {
  readonly partners: readonly Partner[];
  readonly selectedPartnerId: string;
  readonly onSelectPartner: (partnerId: string) => void;
  readonly onShowAddTodo: () => void;
}

/** 編集対象の表を決める、左側の取引先セレクターを表示する。 */
export function LedgerPartnerRail({
  partners,
  selectedPartnerId,
  onSelectPartner,
  onShowAddTodo,
}: LedgerPartnerRailProps) {
  return (
    <aside className={styles.partnerRail} aria-label="取引先一覧">
      <div className={styles.partnerRailHeader}>
        <h2>取引先</h2>
        <button className="small-button" type="button" onClick={onShowAddTodo}>
          <Plus size={15} aria-hidden="true" />
          追加
        </button>
      </div>
      <div className={styles.partnerList}>
        <button
          className={
            selectedPartnerId === "all"
              ? `${styles.partnerItem} ${styles.partnerItemActive}`
              : styles.partnerItem
          }
          type="button"
          onClick={() => onSelectPartner("all")}
        >
          すべて
        </button>
        {partners.map((partner) => (
          <button
            className={
              selectedPartnerId === partner.id
                ? `${styles.partnerItem} ${styles.partnerItemActive}`
                : styles.partnerItem
            }
            key={partner.id}
            type="button"
            onClick={() => onSelectPartner(partner.id)}
          >
            {partner.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
