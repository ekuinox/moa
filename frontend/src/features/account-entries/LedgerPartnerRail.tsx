import { Pencil, Plus } from "lucide-react";

import { Button } from "../../components";
import type { Partner } from "../../lib/api";
import styles from "./LedgerPartnerRail.module.css";

export interface LedgerPartnerRailProps {
  readonly partners: readonly Partner[];
  readonly selectedPartnerId: string;
  readonly onSelectPartner: (partnerId: string) => void;
  readonly onAddPartner: () => void;
  readonly onEditPartner: (partner: Partner) => void;
}

/** 編集対象の表を決める、左側の取引先セレクターを表示する。 */
export function LedgerPartnerRail({
  partners,
  selectedPartnerId,
  onSelectPartner,
  onAddPartner,
  onEditPartner,
}: LedgerPartnerRailProps) {
  return (
    <aside className={styles.partnerRail} aria-label="取引先一覧">
      <div className={styles.partnerRailHeader}>
        <h2>取引先</h2>
        <Button size="small" type="button" onClick={onAddPartner}>
          <Plus size={15} aria-hidden="true" />
          追加
        </Button>
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
        {partners.map((partner) => {
          const partnerItemClassName =
            selectedPartnerId === partner.id
              ? `${styles.partnerItem} ${styles.partnerItemActive}`
              : styles.partnerItem;

          return (
            <div className={styles.partnerRow} key={partner.id}>
              <button
                className={partnerItemClassName}
                type="button"
                onClick={() => onSelectPartner(partner.id)}
              >
                {partner.name}
              </button>
              <button
                className={styles.partnerEditButton}
                type="button"
                aria-label={`${partner.name}を編集`}
                title="編集"
                onClick={() => onEditPartner(partner)}
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
